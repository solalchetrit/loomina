/**
 * Un appel simulé de bout en bout.
 *
 * Le simulateur tient la place de Twilio ConversationRelay : il appelle
 * `/twilio/voice`, ouvre le WebSocket `/relay`, envoie ce que « dit » le
 * narrateur sous forme de texte (comme le ferait la transcription) et
 * reçoit les phrases de Loomina. Tout ce qui est derrière est le vrai code.
 */

import './env';
import crypto from 'node:crypto';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, VOICE_URL, FAKE_TWILIO_TOKEN, LOOMINA_NUMBER, SPEED, SILENCE_SECONDS } from './env';
import { narratorSays } from './narrateur';
import type { Persona, Line } from './narrateur';

const require = createRequire(path.join(ROOT, 'voice', 'package.json'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require('ws') as typeof import('ws').WebSocket;

/** Signature Twilio : HMAC-SHA1 de l'URL suivie des paramètres triés. */
function sign(url: string, params: Record<string, string>): string {
    const data = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
    return crypto.createHmac('sha1', FAKE_TWILIO_TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
}

async function postForm(pathname: string, params: Record<string, string>): Promise<string> {
    const url = `${VOICE_URL}${pathname}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-twilio-signature': sign(url, params) },
        body: new URLSearchParams(params),
    });
    return res.text();
}

const unescapeXml = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Temps de parole simulé : ~60 ms par caractère, accéléré. */
const speakMs = (text: string) => Math.round((text.length * 60) / SPEED);

export interface Behaviour {
    /** Le narrateur raccroche sans prévenir après ce nombre de répliques. */
    coupureApres?: number;
    /** À ces répliques (numérotées à partir de 1), le narrateur coupe la parole à Loomina. */
    interromptAux?: number[];
    /** À cette réplique, le narrateur se tait : on attend la relance puis la fin. */
    silenceA?: number;
    /** Nombre maximal de répliques du narrateur (sécurité). */
    maxRepliques?: number;
}

export interface Turn {
    role: 'loomina' | 'narrateur';
    text: string;
    /** Loomina : délai entre la fin de la phrase du narrateur et le premier mot. */
    firstTokenMs?: number;
    totalMs?: number;
    /** Loomina : réplique coupée par le narrateur. */
    interrupted?: boolean;
    /** Loomina : phrase dite d'elle-même (relance de silence, durée maximale). */
    unprompted?: boolean;
}

export interface CallResult {
    callSid: string;
    phone: string;
    turns: Turn[];
    endedBy: 'loomina' | 'narrateur' | 'coupure' | 'silence' | 'refus';
    seconds: number;
    twiml: string;
}

export async function simulateCall(params: {
    phone: string;
    persona: Persona;
    behaviour?: Behaviour;
    callNumber?: number;
    log?: (line: string) => void;
}): Promise<CallResult> {
    const b = params.behaviour ?? {};
    const max = b.maxRepliques ?? 28;
    const callSid = `CAbanc${crypto.randomBytes(13).toString('hex')}`;
    const t0 = Date.now();
    const turns: Turn[] = [];

    const twiml = await postForm('/twilio/voice', { CallSid: callSid, From: params.phone, To: LOOMINA_NUMBER, Direction: 'inbound', CallStatus: 'ringing' });
    const greeting = unescapeXml(/welcomeGreeting="([^"]*)"/.exec(twiml)?.[1] ?? '');
    if (!twiml.includes('<ConversationRelay')) {
        return { callSid, phone: params.phone, turns, endedBy: 'refus', seconds: 0, twiml };
    }
    turns.push({ role: 'loomina', text: greeting });

    const wsUrl = VOICE_URL.replace(/^http/, 'ws') + '/relay';
    const ws = new WebSocket(wsUrl, { headers: { 'x-twilio-signature': sign(wsUrl, {}) } });

    // État de la réplique de Loomina en cours de réception.
    let buffer = '';
    let firstAt: number | null = null;
    let ended = false;
    let closed = false;
    let onDone: ((text: string) => void) | null = null;
    let onFirst: (() => void) | null = null;
    /** Phrases complètes arrivées sans qu'on les attende (relance de silence…). */
    const unprompted: string[] = [];

    ws.on('message', (raw: Buffer) => {
        const msg = JSON.parse(raw.toString()) as { type: string; token?: string; last?: boolean };
        if (msg.type === 'text') {
            if (msg.token && firstAt === null) { firstAt = Date.now(); onFirst?.(); }
            buffer += msg.token ?? '';
            if (msg.last) {
                const text = buffer.trim();
                buffer = '';
                if (onDone) { const f = onDone; onDone = null; f(text); }
                else if (text) unprompted.push(text);
            }
        } else if (msg.type === 'end') {
            ended = true;
            if (onDone) { const f = onDone; onDone = null; f(buffer.trim()); }
        }
    });
    ws.on('close', () => { closed = true; if (onDone) { const f = onDone; onDone = null; f(buffer.trim()); } });
    await new Promise<void>((resolve, reject) => { ws.on('open', () => resolve()); ws.on('error', reject); });
    ws.send(JSON.stringify({ type: 'setup', callSid, customParameters: { callSid }, from: params.phone, to: LOOMINA_NUMBER }));

    const waitEnd = async (ms: number) => { const until = Date.now() + ms; while (!ended && !closed && Date.now() < until) await sleep(100); return ended || closed; };
    const flushUnprompted = () => { for (const text of unprompted.splice(0)) turns.push({ role: 'loomina', text, unprompted: true }); };
    const history = (): Line[] => turns.map((t) => ({ role: t.role, text: t.text }));

    let endedBy: CallResult['endedBy'] = 'narrateur';
    // Le temps que Twilio lise la salutation.
    await sleep(speakMs(greeting));

    for (let n = 1; n <= max; n++) {
        flushUnprompted();
        if (ended || closed) { endedBy = 'loomina'; break; }

        if (b.silenceA === n) {
            // Le narrateur ne dit plus rien : relance, puis au revoir de Loomina.
            await waitEnd((SILENCE_SECONDS * 2 + 20) * 1000);
            flushUnprompted();
            endedBy = 'silence';
            break;
        }

        const said = await narratorSays(params.persona, history(), params.callNumber ?? 1);
        if (ended || closed) { flushUnprompted(); endedBy = 'loomina'; break; }
        if (said.hangup) {
            // Si Loomina vient de clore l'appel, c'est elle qui coupe, quelques
            // secondes après sa dernière phrase. Sinon le narrateur dit sa
            // dernière phrase et raccroche sans attendre la réponse.
            const last = turns[turns.length - 1];
            const byLoomina = await waitEnd(Math.min(12_000, 1500 + (last?.text.length ?? 0) * 60) + 1500);
            if (byLoomina) { endedBy = 'loomina'; break; }
            if (said.text) {
                turns.push({ role: 'narrateur', text: said.text });
                ws.send(JSON.stringify({ type: 'prompt', voicePrompt: said.text, lang: 'fr-FR', last: true }));
                await sleep(700);
            }
            endedBy = 'narrateur';
            break;
        }
        if (!said.text) continue;

        await sleep(speakMs(said.text));
        turns.push({ role: 'narrateur', text: said.text });
        params.log?.(`  ${params.persona.prenom} : ${said.text.slice(0, 90)}`);

        buffer = '';
        firstAt = null;
        const sentAt = Date.now();
        const interrupt = b.interromptAux?.includes(n);
        const reply = new Promise<string>((resolve) => { onDone = resolve; });
        const first = new Promise<void>((resolve) => { onFirst = resolve; });
        ws.send(JSON.stringify({ type: 'prompt', voicePrompt: said.text, lang: 'fr-FR', last: true }));

        if (interrupt) {
            // Le narrateur coupe Loomina après ses premiers mots et enchaîne.
            await Promise.race([first, sleep(10_000)]);
            await sleep(400);
            const heard = buffer.trim();
            onDone = null;
            onFirst = null;
            ws.send(JSON.stringify({ type: 'interrupt', utteranceUntilInterrupt: heard, durationUntilInterruptMs: 400 }));
            turns.push({ role: 'loomina', text: heard, firstTokenMs: firstAt ? firstAt - sentAt : undefined, interrupted: true });
            continue;
        }

        const text = await Promise.race([reply, sleep(30_000).then(() => '')]);
        onFirst = null;
        const doneAt = Date.now();
        if (text) {
            turns.push({ role: 'loomina', text, firstTokenMs: firstAt ? firstAt - sentAt : undefined, totalMs: doneAt - sentAt });
            params.log?.(`  Loomina : ${text.slice(0, 90)}`);
            await sleep(speakMs(text));
        }

        if (b.coupureApres === n) { endedBy = 'coupure'; break; }
    }

    // Raccroché : Twilio ferme le WebSocket puis appelle l'action.
    if (!closed) ws.close();
    await sleep(200);
    await postForm('/twilio/action', { CallSid: callSid, SessionStatus: ended ? 'ended' : 'completed', CallStatus: 'completed' }).catch(() => '');
    flushUnprompted();

    return { callSid, phone: params.phone, turns, endedBy, seconds: Math.round((Date.now() - t0) / 1000), twiml };
}

/** Même mise en forme que le transcript du serveur vocal. */
export function renderTurns(turns: Turn[], narratorName: string): string {
    return turns.map((t) => `**${t.role === 'loomina' ? 'Loomina' : narratorName}** : ${t.text}${t.interrupted ? ' *(coupé)*' : ''}`).join('\n\n');
}
