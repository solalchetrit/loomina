/**
 * L'écoute d'un appel (demande de Solal, 24/11/2026, après le premier appel
 * de Patricia : « apprends à écouter les audios de l'appel, compare au
 * transcript, vois ce qui cloche »).
 *
 * Trois passes, sur l'enregistrement en deux pistes (une voix par piste) :
 *  1. Le minutage, mesuré sur le son lui-même (gratuit) : qui parle quand,
 *     les fois où Loomina a parlé pendant une pause du narrateur et s'est
 *     fait couper, la longueur des pauses du narrateur au milieu de ses
 *     phrases, le temps de réponse de Loomina.
 *  2. La réécoute : la piste du narrateur, seule et sans les silences, est
 *     retranscrite par un second modèle (gpt-4o-transcribe), plus soigneux
 *     que la transcription du direct.
 *  3. La comparaison : une IA lit le transcript du direct, la réécoute et le
 *     minutage, et dit ce qui cloche (mots mal compris, fausses suppositions,
 *     règles de conversation non tenues, conseils).
 *
 * Le rapport est rangé dans `call_reviews` et affiché sur la fiche client.
 * Coût : environ 0,006 $ par minute de parole du narrateur, plus la comparaison.
 */

import OpenAI from 'openai';
import { db } from '@/lib/loomina/db';
import { VOICE_SPEAK } from '@/lib/loomina/voice-prompt';
import { tokenUsage } from '@/lib/loomina/usage';
import type { TokenUsage } from '@/lib/loomina/usage';
import { tokensCostUsd } from '@/lib/admin/costs';
import { twilioRecording, isRecordingSid } from '@/lib/admin/recording';

export const ECOUTE_MODEL = process.env.LOOMINA_ECOUTE_MODEL?.trim() || 'gpt-5.5';
export const TRANSCRIBE_MODEL = 'gpt-4o-transcribe';
/** Prix de gpt-4o-transcribe, par minute d'audio envoyée (tarif public, 24/11/2026). */
export const TRANSCRIBE_USD_PER_MINUTE = 0.006;

/* ───────────────────────────── Le son ───────────────────────────── */

export interface Pcm {
    rate: number;
    channels: Int16Array[];
}

/** Lit un WAV PCM 16 bits (le format des enregistrements Twilio). */
export function parseWav(buf: Uint8Array): Pcm {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const tag = (o: number) => String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
    if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('fichier WAV illisible');
    let o = 12;
    let rate = 8000;
    let count = 1;
    let bits = 16;
    let format = 1;
    while (o + 8 <= buf.byteLength) {
        const id = tag(o);
        const size = view.getUint32(o + 4, true);
        const body = o + 8;
        if (id === 'fmt ') {
            format = view.getUint16(body, true);
            count = view.getUint16(body + 2, true);
            rate = view.getUint32(body + 4, true);
            bits = view.getUint16(body + 14, true);
        } else if (id === 'data') {
            const end = Math.min(buf.byteLength, body + size);
            const channels = Array.from({ length: count }, () => new Int16Array(Math.floor((end - body) / (count * 2))));
            if (format === 1 && bits === 16) {
                let i = 0;
                for (let p = body; p + count * 2 <= end; p += count * 2, i++) for (let c = 0; c < count; c++) channels[c][i] = view.getInt16(p + c * 2, true);
            } else if (format === 7 && bits === 8) {
                // µ-law
                const ulaw = (u: number) => {
                    u = ~u & 0xff;
                    const t = (((u & 0x0f) << 3) + 0x84) << ((u & 0x70) >> 4);
                    return u & 0x80 ? 0x84 - t : t - 0x84;
                };
                for (let c = 0; c < count; c++) channels[c] = new Int16Array(Math.floor((end - body) / count));
                let i = 0;
                for (let p = body; p + count <= end; p += count, i++) for (let c = 0; c < count; c++) channels[c][i] = ulaw(buf[p + c]);
            } else throw new Error(`format audio non pris en charge (${format}/${bits} bits)`);
            return { rate, channels };
        }
        o = body + size + (size % 2);
    }
    throw new Error('WAV sans données');
}

/** Encode une piste en WAV PCM 16 bits mono. */
export function encodeWav(samples: Int16Array, rate: number): Uint8Array {
    const out = new Uint8Array(44 + samples.length * 2);
    const v = new DataView(out.buffer);
    const put = (o: number, s: string) => [...s].forEach((ch, i) => (out[o + i] = ch.charCodeAt(0)));
    put(0, 'RIFF');
    v.setUint32(4, 36 + samples.length * 2, true);
    put(8, 'WAVE');
    put(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    put(36, 'data');
    v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, samples[i], true);
    return out;
}

export interface Segment {
    /** En secondes depuis le début de l'enregistrement. */
    start: number;
    end: number;
}

const FRAME_S = 0.02;

/**
 * Les moments où une piste contient de la voix : énergie par tranche de
 * 20 ms, au-dessus du bruit de fond de la piste. Les trous de moins de
 * 300 ms sont recollés, les bruits de moins de 200 ms ignorés.
 */
export function speechSegments(samples: Int16Array, rate: number): Segment[] {
    const frame = Math.max(1, Math.round(rate * FRAME_S));
    const n = Math.floor(samples.length / frame);
    const level = new Float32Array(n);
    for (let f = 0; f < n; f++) {
        let sum = 0;
        for (let i = f * frame; i < (f + 1) * frame; i++) sum += samples[i] * samples[i];
        level[f] = 10 * Math.log10(sum / frame / (32768 * 32768) + 1e-12);
    }
    const sorted = Float32Array.from(level).sort();
    const floor = sorted[Math.floor(n * 0.1)] ?? -90;
    const threshold = Math.max(floor + 12, -55);
    const raw: Segment[] = [];
    let open = -1;
    for (let f = 0; f <= n; f++) {
        const on = f < n && level[f] > threshold;
        if (on && open < 0) open = f;
        if (!on && open >= 0) {
            raw.push({ start: open * FRAME_S, end: f * FRAME_S });
            open = -1;
        }
    }
    return mergeSegments(raw, 0.3).filter((s) => s.end - s.start >= 0.2);
}

export function mergeSegments(segs: Segment[], maxGap: number): Segment[] {
    const out: Segment[] = [];
    for (const s of segs) {
        const last = out[out.length - 1];
        if (last && s.start - last.end <= maxGap) last.end = Math.max(last.end, s.end);
        else out.push({ ...s });
    }
    return out;
}

const total = (segs: Segment[]) => segs.reduce((s, x) => s + (x.end - x.start), 0);

function percentile(values: number[], p: number): number | null {
    if (!values.length) return null;
    const s = [...values].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

const round1 = (n: number | null) => (n == null ? null : Math.round(n * 10) / 10);

export interface Overlap {
    /** Moment de l'appel, en secondes. */
    at: number;
    /** Silence du narrateur avant que Loomina parle, en secondes. */
    pause: number;
    /** Combien de temps les deux voix se sont chevauchées. */
    overlap: number;
}

export interface Timing {
    callSeconds: number;
    narratorSeconds: number;
    loominaSeconds: number;
    /** Part de parole du narrateur (objectif du prompt : les trois quarts). */
    narratorShare: number;
    /** Loomina a parlé pendant une pause, et le narrateur a repris par-dessus. */
    cuts: Overlap[];
    /** Le narrateur a coupé Loomina en pleine phrase (Loomina ne s'était pas lancée dans un silence). */
    bargeIns: number;
    /** Pauses du narrateur au milieu de ses propres phrases (il a repris sans que Loomina parle). */
    narratorPauses: { count: number; median: number | null; p90: number | null; max: number | null };
    /** Temps que Loomina laisse avant de répondre quand tout se passe bien. */
    loominaWait: { median: number | null; p90: number | null };
    /** Le délai qui aurait évité 90 % des coupures observées. */
    suggestedWait: number | null;
}

/**
 * Le minutage de l'appel, à partir des moments de parole de chaque voix.
 * Une « réplique » de Loomina = ses passages de voix séparés de moins d'1,2 s.
 */
export function measureTiming(narrator: Segment[], loomina: Segment[], callSeconds: number): Timing {
    const bot = mergeSegments(loomina, 1.2);
    const cuts: Overlap[] = [];
    const waits: number[] = [];
    let bargeIns = 0;
    for (const b of bot) {
        const before = narrator.filter((u) => u.start < b.start);
        const last = before[before.length - 1];
        if (!last) continue;
        const talking = last.end > b.start;
        const pause = talking ? 0 : b.start - last.end;
        // Le narrateur reprend pendant la réplique de Loomina (au moins 300 ms avant sa fin).
        const resumed = narrator.find((u) => u.start > b.start && u.start < b.end - 0.3);
        if (resumed && pause < 4) {
            const overlap = Math.min(b.end, resumed.end) - resumed.start;
            cuts.push({ at: round1(b.start) ?? 0, pause: round1(pause) ?? 0, overlap: round1(overlap) ?? 0 });
        } else if (!talking && pause < 6) waits.push(pause);
    }
    // Le narrateur qui démarre alors que Loomina parle déjà depuis plus d'une seconde, hors coupures déjà comptées.
    for (const u of narrator) {
        const b = bot.find((x) => x.start + 1 < u.start && u.start < x.end - 0.3);
        if (b && !cuts.some((c) => Math.abs(c.at - b.start) < 0.05)) bargeIns += 1;
    }
    // Pauses internes du narrateur : deux passages de voix consécutifs sans réplique de Loomina entre les deux.
    const pauses: number[] = [];
    for (let i = 1; i < narrator.length; i++) {
        const gapStart = narrator[i - 1].end;
        const gapEnd = narrator[i].start;
        const gap = gapEnd - gapStart;
        if (gap < 0.3 || gap > 8) continue;
        if (bot.some((b) => b.start < gapEnd && b.end > gapStart)) continue;
        pauses.push(gap);
    }
    const p90 = percentile(pauses, 0.9);
    const cutPauses = cuts.map((c) => c.pause).sort((a, b) => a - b);
    const suggested = cutPauses.length ? cutPauses[Math.min(cutPauses.length - 1, Math.floor(cutPauses.length * 0.9))] + 0.3 : p90;
    const narratorSeconds = total(narrator);
    const loominaSeconds = total(loomina);
    return {
        callSeconds: Math.round(callSeconds),
        narratorSeconds: Math.round(narratorSeconds),
        loominaSeconds: Math.round(loominaSeconds),
        narratorShare: narratorSeconds + loominaSeconds > 0 ? Math.round((narratorSeconds / (narratorSeconds + loominaSeconds)) * 100) / 100 : 0,
        cuts,
        bargeIns,
        narratorPauses: { count: pauses.length, median: round1(percentile(pauses, 0.5)), p90: round1(p90), max: round1(pauses.length ? Math.max(...pauses) : null) },
        loominaWait: { median: round1(percentile(waits, 0.5)), p90: round1(percentile(waits, 0.9)) },
        suggestedWait: round1(suggested),
    };
}

/**
 * Quelle piste est Loomina ? Celle qui parle en premier (le bonjour de
 * Loomina ne peut pas être coupé) et dont le temps de parole colle le mieux
 * à la longueur de ses répliques dans le transcript.
 */
export function pickLoominaChannel(segs: Segment[][], botChars: number, userChars: number): number {
    if (segs.length < 2) return 0;
    const share = (i: number) => total(segs[i]) / Math.max(0.001, total(segs[0]) + total(segs[1]));
    const expected = botChars / Math.max(1, botChars + userChars);
    const scoreFor = (i: number) => {
        let score = -Math.abs(share(i) - expected);
        const first = segs[i][0]?.start ?? Infinity;
        const other = segs[1 - i][0]?.start ?? Infinity;
        if (first < other) score += 0.15;
        return score;
    };
    return scoreFor(0) >= scoreFor(1) ? 0 : 1;
}

/** La piste du narrateur sans ses silences (passages de voix + 0,25 s de marge, séparés par 0,6 s de blanc). */
export function compactSpeech(samples: Int16Array, rate: number, segs: Segment[]): Int16Array {
    const pad = Math.round(rate * 0.25);
    const gap = Math.round(rate * 0.6);
    const parts: Int16Array[] = [];
    for (const s of mergeSegments(segs, 1.5)) {
        const a = Math.max(0, Math.floor(s.start * rate) - pad);
        const b = Math.min(samples.length, Math.ceil(s.end * rate) + pad);
        parts.push(samples.subarray(a, b), new Int16Array(gap));
    }
    const out = new Int16Array(parts.reduce((s, p) => s + p.length, 0));
    let o = 0;
    for (const p of parts) {
        out.set(p, o);
        o += p.length;
    }
    return out;
}

/* ───────────────────────────── La réécoute ───────────────────────────── */

let client: OpenAI | null = null;
const openai = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: 120_000 }));

/** Retranscrit la piste (découpée en morceaux de 8 minutes au plus). Rend le texte et les minutes facturées. */
async function transcribe(samples: Int16Array, rate: number, prompt: string): Promise<{ text: string; minutes: number }> {
    const chunk = rate * 60 * 8;
    const texts: string[] = [];
    for (let a = 0; a < samples.length; a += chunk) {
        const part = samples.subarray(a, Math.min(samples.length, a + chunk));
        const file = new File([encodeWav(part, rate) as unknown as BlobPart], `piste-${a / chunk + 1}.wav`, { type: 'audio/wav' });
        const res = await openai().audio.transcriptions.create({ model: TRANSCRIBE_MODEL, file, language: 'fr', prompt, response_format: 'json' });
        texts.push(res.text.trim());
    }
    return { text: texts.join('\n'), minutes: samples.length / rate / 60 };
}

/* ───────────────────────────── La comparaison ───────────────────────────── */

export interface Turn {
    role: 'bot' | 'user';
    message: string;
    time: number;
}

export interface Mishearing {
    entendu: string;
    dit: string;
    /** Le récit a-t-il gardé l'erreur ? */
    consequence: string;
}

export interface Finding {
    moment: string;
    quoi: string;
    pourquoi: string;
}

export interface ReviewReport {
    at: string;
    verdict: string;
    timing: Timing;
    mal_entendus: Mishearing[];
    erreurs_loomina: Finding[];
    regles: Array<{ regle: string; exemples: string[]; fois: number }>;
    conseils: string[];
    reecoute: string;
    cost: { transcribeUsd: number; compareUsd: number; totalUsd: number; minutes: number };
    usage?: TokenUsage;
    loominaChannel: number;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function liveTranscript(turns: Turn[], name: string): string {
    const t0 = turns[0]?.time ?? 0;
    return turns
        .filter((t) => t.message.trim())
        .map((t) => `[${mmss((t.time - t0) / 1000)}] ${t.role === 'bot' ? 'Loomina' : name} : ${t.message.trim()}`)
        .join('\n');
}

const REVIEW_SYSTEM = `Tu es l'ingénieur qualité de Loomina, un biographe au téléphone : une voix d'IA appelle une personne âgée, l'écoute raconter sa vie, puis un Écrivain tire un récit écrit de la conversation.

On te donne, pour UN appel :
1. LE TRANSCRIPT DU DIRECT : ce que la transcription en direct a compris du narrateur, et ce que Loomina a dit. Loomina n'a entendu que cela. Une réplique de Loomina qui s'arrête au milieu d'un mot a été coupée par le narrateur.
2. LA RÉÉCOUTE : la voix du narrateur seule, retranscrite après coup par un modèle plus soigneux. Elle peut aussi se tromper, mais elle est en général plus juste sur les noms propres et les mots rares.
3. LE MINUTAGE mesuré sur le son.
4. LES RÈGLES DE CONVERSATION que Loomina doit suivre.
5. LE RÉCIT écrit après l'appel, s'il existe.

Dis ce qui cloche, concrètement, en français simple, pour le fondateur qui n'est pas technicien. Réponds en JSON :
{
  "verdict": "2 à 3 phrases : comment s'est passé l'appel et le défaut principal",
  "mal_entendus": [{ "entendu": "ce que le direct a compris", "dit": "ce que la personne a vraiment dit (d'après la réécoute et le sens)", "consequence": "ce que ça a changé : Loomina a rebondi dessus, le récit a gardé l'erreur, ou sans effet" }],
  "erreurs_loomina": [{ "moment": "m:ss", "quoi": "ce que Loomina a fait", "pourquoi": "pourquoi c'est un problème" }],
  "regles": [{ "regle": "la règle non tenue, en quelques mots", "exemples": ["citations exactes de Loomina"], "fois": 0 }],
  "conseils": ["changements précis à faire (prompt, réglage d'écoute, mots à donner à la transcription), du plus utile au moins utile, 5 au plus"]
}

Pour "mal_entendus" : seulement les vraies différences de sens (noms, lieux, chiffres, mots qui changent le souvenir), pas les hésitations ni la ponctuation. Au plus 15, les plus importants d'abord.
Pour "erreurs_loomina" : fausses suppositions, questions déjà posées, questions sur un détail mal compris, phrases coupées qui ont perdu le fil, réponses à côté. Au plus 10.
Pour "regles" : compte chaque formule interdite que Loomina a dite (tu/vous compris).
N'invente rien : si la réécoute et le direct disent la même chose, ce n'est pas un mal-entendu.`;

async function compare(params: { live: string; reecoute: string; timing: Timing; rules: string; story: string | null; name: string }): Promise<{ out: Record<string, unknown>; usage?: TokenUsage }> {
    const t = params.timing;
    const timing = [
        `Durée : ${mmss(t.callSeconds)}. ${params.name} a parlé ${Math.round(t.narratorShare * 100)} % du temps de parole.`,
        `Loomina a parlé pendant une pause de ${params.name} et s'est fait couper : ${t.cuts.length} fois (pauses de ${t.cuts.map((c) => `${c.pause} s à ${mmss(c.at)}`).join(', ') || 'aucune'}).`,
        `${params.name} a coupé Loomina en pleine phrase : ${t.bargeIns} fois.`,
        `Pauses de ${params.name} au milieu de ses phrases : médiane ${t.narratorPauses.median ?? '?'} s, 90 % sous ${t.narratorPauses.p90 ?? '?'} s, plus longue ${t.narratorPauses.max ?? '?'} s.`,
        `Loomina attend avant de répondre : médiane ${t.loominaWait.median ?? '?'} s.`,
    ].join('\n');
    const user = [
        `# 1. TRANSCRIPT DU DIRECT\n${params.live}`,
        `# 2. RÉÉCOUTE (voix de ${params.name} seule)\n${params.reecoute}`,
        `# 3. MINUTAGE\n${timing}`,
        `# 4. RÈGLES DE CONVERSATION\n${params.rules}`,
        params.story ? `# 5. RÉCIT ÉCRIT APRÈS L'APPEL\n${params.story.slice(0, 20000)}` : '# 5. RÉCIT : pas encore écrit',
    ].join('\n\n');
    const reasoning = ECOUTE_MODEL.startsWith('gpt-5');
    const completion = await openai().chat.completions.create({
        model: ECOUTE_MODEL,
        ...(reasoning ? { reasoning_effort: 'low' as const } : {}),
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: REVIEW_SYSTEM },
            { role: 'user', content: user },
        ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('comparaison : réponse vide');
    return { out: JSON.parse(raw) as Record<string, unknown>, usage: tokenUsage(ECOUTE_MODEL, completion.usage) };
}

/* ───────────────────────────── Le tout ───────────────────────────── */

const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Les noms propres du récit, pour aider la réécoute (« Bab El Oued », « Casbah »…). */
function properNouns(text: string | null): string[] {
    if (!text) return [];
    const found = new Map<string, number>();
    for (const m of text.matchAll(/(?<![.!?]\s)(?<!^)\b([A-ZÉÈÀÂÎÔÛÇ][a-zà-ÿ'’-]+(?:\s(?:El|el|de|du|la|le|des|[A-ZÉÈ][a-zà-ÿ'’-]+))*)/gm)) {
        const w = m[1].trim();
        if (w.length < 3) continue;
        found.set(w, (found.get(w) ?? 0) + 1);
    }
    return [...found.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w]) => w);
}

/** Lance (ou relance) l'écoute d'un appel. Rend l'identifiant du rapport, ou une raison. */
export async function beginReview(interviewId: string): Promise<{ ok: true } | { ok: false; message: string }> {
    const { data: running } = await db().from('call_reviews').select('status, updated_at').eq('interview_id', interviewId).maybeSingle();
    if (running?.status === 'running' && Date.now() - new Date(String(running.updated_at)).getTime() < 5 * 60_000) {
        return { ok: false, message: 'L’écoute de cet appel est déjà en cours.' };
    }
    const { error } = await db()
        .from('call_reviews')
        .upsert({ interview_id: interviewId, status: 'running', error: null, updated_at: new Date().toISOString() }, { onConflict: 'interview_id' });
    if (error) return { ok: false, message: `Écoute impossible : ${error.message}` };
    return { ok: true };
}

/** L'écoute complète. Ne lève jamais : l'échec est rangé dans le rapport. */
export async function runReview(interviewId: string): Promise<void> {
    const fail = async (message: string) => {
        console.error(`[écoute] ${interviewId} : ${message}`);
        await db().from('call_reviews').update({ status: 'failed', error: message, updated_at: new Date().toISOString() }).eq('interview_id', interviewId);
    };
    try {
        const { data: interview } = await db().from('interviews').select('id, project_id, call_event_id, duration_seconds').eq('id', interviewId).maybeSingle();
        if (!interview?.call_event_id) return fail('appel sans rapport de fin d’appel');
        const { data: event } = await db()
            .from('call_events')
            .select('rec:payload->message->call->metadata->>recordingSid, turns:payload->message->artifact->messages')
            .eq('id', interview.call_event_id)
            .maybeSingle();
        const recordingSid = (event as { rec?: string } | null)?.rec;
        const turns = arr<Turn>((event as { turns?: unknown } | null)?.turns);
        if (!isRecordingSid(recordingSid)) return fail('cet appel n’a pas été enregistré');

        const { data: project } = await db().from('projects').select('user_id').eq('id', interview.project_id).maybeSingle();
        const { data: profile } = project?.user_id ? await db().from('profiles').select('first_name').eq('id', project.user_id).maybeSingle() : { data: null };
        const name = (profile?.first_name as string | null)?.trim() || 'le narrateur';
        const { data: chapter } = await db().from('chapters').select('content_markdown').eq('latest_interview_id', interviewId).order('version', { ascending: false }).limit(1).maybeSingle();
        const story = (chapter?.content_markdown as string | null) ?? null;

        const wav = await twilioRecording(recordingSid, 'wav');
        if (!wav) return fail('enregistrement introuvable chez Twilio');
        const pcm = parseWav(wav);
        if (pcm.channels.length < 2) return fail('enregistrement sur une seule piste : impossible de séparer les deux voix');
        const segs = pcm.channels.map((c) => speechSegments(c, pcm.rate));
        const botChars = turns.filter((t) => t.role === 'bot').reduce((s, t) => s + t.message.length, 0);
        const userChars = turns.filter((t) => t.role === 'user').reduce((s, t) => s + t.message.length, 0);
        const bot = pickLoominaChannel(segs, botChars, userChars);
        const user = 1 - bot;
        const timing = measureTiming(segs[user], segs[bot], pcm.channels[0].length / pcm.rate);

        const hints = ['Loomina', name, ...properNouns(story)].filter((v, i, a) => a.indexOf(v) === i);
        const compact = compactSpeech(pcm.channels[user], pcm.rate, segs[user]);
        const heard = await transcribe(compact, pcm.rate, `${name} raconte ses souvenirs au téléphone, en français. Noms qui peuvent revenir : ${hints.join(', ')}.`);

        const rules = VOICE_SPEAK.replaceAll('{{first_name}}', name);
        const { out, usage } = await compare({ live: liveTranscript(turns, name), reecoute: heard.text, timing, rules, story, name });

        const transcribeUsd = heard.minutes * TRANSCRIBE_USD_PER_MINUTE;
        const compareUsd = usage ? tokensCostUsd(usage) : 0;
        const report: ReviewReport = {
            at: new Date().toISOString(),
            verdict: typeof out.verdict === 'string' ? out.verdict : '',
            timing,
            mal_entendus: arr<Mishearing>(out.mal_entendus),
            erreurs_loomina: arr<Finding>(out.erreurs_loomina),
            regles: arr<{ regle: string; exemples: string[]; fois: number }>(out.regles),
            conseils: arr<string>(out.conseils).filter((c) => typeof c === 'string'),
            reecoute: heard.text,
            cost: { transcribeUsd, compareUsd, totalUsd: transcribeUsd + compareUsd, minutes: Math.round(heard.minutes * 10) / 10 },
            usage,
            loominaChannel: bot,
        };
        await db()
            .from('call_reviews')
            .update({ status: 'done', report, cost_usd: report.cost.totalUsd, error: null, updated_at: new Date().toISOString() })
            .eq('interview_id', interviewId);
        console.info(`[écoute] ${interviewId} : ${timing.cuts.length} coupure(s), ${report.mal_entendus.length} mal-entendu(s), ${report.cost.totalUsd.toFixed(3)} $`);
    } catch (err) {
        await fail(err instanceof Error ? err.message : String(err));
    }
}

/** Lance l'écoute d'un appel dans une fonction à part (elle dure une à deux minutes). Ne lève jamais. */
export async function kickReview(interviewId: string, origin: string, secret: string): Promise<void> {
    if (process.env.LOOMINA_AUTO_ECOUTE === 'off') return;
    try {
        const res = await fetch(`${origin.replace(/\/$/, '')}/api/jobs/ecoute`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-loomina-internal': secret },
            body: JSON.stringify({ interviewId }),
            signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) console.error(`[écoute] lancement refusé (${res.status}) pour ${interviewId}`);
    } catch (err) {
        console.error(`[écoute] lancement impossible pour ${interviewId} :`, err instanceof Error ? err.message : err);
    }
}

export interface ReviewRow {
    interview_id: string;
    status: 'running' | 'done' | 'failed';
    report: ReviewReport | null;
    cost_usd: number | null;
    error: string | null;
    updated_at: string;
    /** Écoute « en cours » depuis plus de 5 minutes : la fonction a été coupée, on peut relancer. */
    stale?: boolean;
}

export async function readReviews(interviewIds: string[]): Promise<Map<string, ReviewRow>> {
    const out = new Map<string, ReviewRow>();
    if (!interviewIds.length) return out;
    const { data } = await db().from('call_reviews').select('interview_id, status, report, cost_usd, error, updated_at').in('interview_id', interviewIds);
    for (const r of (data ?? []) as ReviewRow[]) out.set(r.interview_id, { ...r, stale: r.status === 'running' && Date.now() - new Date(r.updated_at).getTime() > 5 * 60_000 });
    return out;
}
