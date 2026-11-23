/**
 * Le récit de la démonstration téléphonique.
 *
 * 1. Un appelant inconnu fait la démo de cinq minutes (DEMO_SYSTEM).
 * 2. Le serveur vocal envoie le transcript au webhook, comme pour un
 *    entretien, marqué `demo` (jamais d'audio).
 * 3. Ici : l'Écrivain, avec ses règles habituelles, en tire un récit.
 * 4. Un SMS part : « Ça y est, votre récit est écrit. Pour le découvrir,
 *    suivez ce lien. » Le lien mène à /recit/<token>.
 * 5. Sur cette page, la personne donne son e-mail et reçoit son récit mis
 *    en page comme dans le livre, en PDF (recit-pdf.ts).
 *
 * Rien n'est lié à un profil client. Les lignes sont effacées au bout de
 * 30 jours (purgeOldDemoStories, appelée à chaque nouvelle démo).
 */

import crypto from 'node:crypto';
import OpenAI from 'openai';
import { db, findProfileByPhone } from './db';
import { isOptedOut, optOutLine, optOutHeaders } from './optout';
import { sendSms } from './sms';
import { brandEmailHtml, sendEmail } from './notify';
import { promptText, refreshPrompts } from './prompt-store';
import { WRITER_SYSTEM, WRITER_MODEL, WRITER_REASONING_EFFORT, WRITER_MAX_TOKENS, countWords } from './writer';
import { tokenUsage } from './usage';
import type { TokenUsage } from './usage';

/**
 * `demo_stories.usage` : { voice, writer } depuis le 20/11/2026. Avant, la
 * colonne ne portait que les jetons de l'Écrivain, à plat.
 */
export function demoUsage(raw: unknown): { voice?: TokenUsage; writer?: TokenUsage } {
    if (!raw || typeof raw !== 'object') return {};
    const u = raw as Record<string, unknown>;
    if (typeof u.model === 'string') return { writer: u as unknown as TokenUsage };
    return { voice: (u.voice as TokenUsage) ?? undefined, writer: (u.writer as TokenUsage) ?? undefined };
}
import { buildRecitPdf } from './recit-pdf';
import { SITE } from '../../config/site';
import { DEMO_PROMO } from '../../config/offer';
import { stripe } from '../stripe';

/** Durée de conservation d'un récit de démonstration. */
export const DEMO_STORY_DAYS = 30;
/** Au plus trois envois par e-mail pour un même lien. */
const MAX_EMAILS = 3;

const HOST = SITE.url.replace(/^https?:\/\//, '').replace(/^www\./, '');

export interface DemoStory {
    id: string;
    token: string;
    phone: string;
    status: 'pending' | 'written' | 'unusable' | 'refused' | 'failed';
    first_name: string | null;
    title: string | null;
    content: string | null;
    email: string | null;
    email_count: number;
    promo_code: string | null;
    /** Fin de validité du code (depuis le 23/11/2026). */
    promo_expires_at?: string | null;
    created_at: string;
}

/** Le lien envoyé par SMS. */
export function demoStoryUrl(token: string): string {
    return `https://${HOST}/recit/${token}`;
}

/** Le texte du SMS, tel que Solal l'a écrit. */
export function demoSmsText(token: string): string {
    return `Ça y est, votre récit est écrit. Pour le découvrir, suivez ce lien : ${demoStoryUrl(token)}`;
}

export function isExpired(createdAt: string): boolean {
    return Date.now() - new Date(createdAt).getTime() > DEMO_STORY_DAYS * 86_400_000;
}

/** Efface les récits de plus de 30 jours. Ne lève jamais. */
export async function purgeOldDemoStories(): Promise<void> {
    const limit = new Date(Date.now() - DEMO_STORY_DAYS * 86_400_000).toISOString();
    // D'abord le son chez Twilio : la ligne effacée, on ne saurait plus le retrouver.
    const { data: old } = await db().from('demo_stories').select('recording_sid').lt('created_at', limit).not('recording_sid', 'is', null);
    for (const row of old ?? []) await deleteTwilioRecording(row.recording_sid as string);
    const { error } = await db().from('demo_stories').delete().lt('created_at', limit);
    if (error) console.warn('[demo] purge des anciens récits :', error.message);
}

/**
 * Archive le transcript d'une démo. Renvoie null si l'appel est déjà connu
 * (rapport renvoyé deux fois par le serveur vocal).
 */
export async function recordDemoCall(params: {
    callId: string;
    phone: string;
    transcript: string;
    durationSeconds: number | null;
    recordingSid?: string | null;
    /** 'no_sms' : démo gardée seulement pour son enregistrement (fixe, numéro masqué). */
    status?: 'pending' | 'no_sms';
    /** Jetons de l'IA de la conversation, pour le coût de la démo (onglet Coûts de l'admin). */
    voiceUsage?: TokenUsage | null;
}): Promise<string | null> {
    const { data, error } = await db()
        .from('demo_stories')
        .insert({
            call_id: params.callId,
            token: crypto.randomBytes(16).toString('base64url'),
            phone: params.phone,
            transcript: params.transcript,
            duration_seconds: params.durationSeconds,
            recording_sid: params.recordingSid ?? null,
            status: params.status ?? 'pending',
            usage: params.voiceUsage ? { voice: params.voiceUsage } : null,
        })
        .select('id')
        .single();
    if (error) {
        if (error.code === '23505') return null;
        throw new Error(`demo_stories : ${error.message}`);
    }
    return data.id as string;
}

let client: OpenAI | null = null;
function openai(): OpenAI {
    if (client) return client;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY manquante');
    client = new OpenAI({ apiKey, timeout: 180_000, maxRetries: 1 });
    return client;
}

const DEMO_NOTE = `# CET APPEL EST UNE DÉMONSTRATION
Le narrateur découvre Loumina et a fait un essai de cinq minutes. Écris le récit de ce qu'il a raconté, comme un chapitre de son livre. Toutes tes règles s'appliquent, en premier lieu : zéro invention. Ce qui parle de la démonstration, du SMS, du prix ou de Loumina n'entre jamais dans le récit.
Ne résume pas (demande de Solal, 20/11/2026 : le récit d'Ethan tenait en cinq phrases sèches). Reprends TOUT ce qu'il a confié, chaque détail, chaque parole rapportée, chaque sensation, chaque précision ou correction qu'il a apportée, dans l'ordre de la scène et avec ses mots. Raconte la scène comme une scène (le décor, qui était là, ce qui s'est passé, ce qu'il a ressenti), en reliant les éléments avec fluidité, sans rien ajouter qu'il n'ait dit. Un mot manifestement mal transcrit et jamais confirmé est laissé de côté.

Ce récit est souvent le premier texte que la personne lit d'elle : il doit donner envie d'écrire tout le livre. Un essai est court, alors tire tout ce qu'il contient, sans rien inventer :
- Fais-en une vraie scène qui se lit d'une traite : le décor, les personnes, le moment lui-même dans l'ordre où il s'est passé, ce qui a suivi, ce que le narrateur en garde.
- Utilise tout ce que le narrateur a confirmé, y compris en répondant « oui », « non » ou un seul mot à une question de Loumina (« Dans un appartement. » répond à « un appartement ou une maison ? »).
- Si, à la fin, le narrateur dit quelle image il garde (même par « celui que je t'ai raconté »), termine le récit là-dessus, avec ses mots.
- Garde ses expressions et sa manière de parler : elles font la voix du récit.
- Un détail isolé qui casse la scène (un plat cité en une phrase) va à la fin, en une phrase, ou n'entre pas.

Ajoute deux champs à l'objet JSON :
- "first_name" : le prénom que le narrateur a donné, avec son orthographe la plus probable, ou null. S'il en a donné plusieurs ou a plaisanté, prends celui qu'il a confirmé à Loomina ; si aucun n'a été confirmé, null ;
- "sms_refused" : true si le narrateur a dit qu'il ne voulait pas recevoir de SMS ou de récit, sinon false.`;

/** Écrit le récit d'une démo. */
export async function writeDemoStory(transcript: string) {
    await refreshPrompts();
    const completion = await openai().chat.completions.create({
        model: WRITER_MODEL,
        max_completion_tokens: WRITER_MAX_TOKENS,
        reasoning_effort: WRITER_REASONING_EFFORT,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: promptText('ecrivain', WRITER_SYSTEM) },
            {
                role: 'user',
                content: `${DEMO_NOTE}\n\n# STYLE DEMANDÉ\nChaleureux et vivant, sans emphase.\n\n# TRANSCRIPT DE L'APPEL — SOURCE UNIQUE DES FAITS\n${transcript}`,
            },
        ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Écrivain (démo) : réponse vide');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const content = typeof parsed.chapter_content === 'string' ? parsed.chapter_content.trim() : '';
    const title = typeof parsed.chapter_title === 'string' ? parsed.chapter_title.trim() : '';
    const firstName = typeof parsed.first_name === 'string' && parsed.first_name.trim() ? parsed.first_name.trim().slice(0, 60) : null;
    const unusable = !content || title === 'Attente' || content.startsWith('(Pas de contenu exploitable') || countWords(content) < 40;
    return {
        title: (title || 'Un souvenir').slice(0, 160),
        content,
        firstName,
        smsRefused: parsed.sms_refused === true,
        unusable,
        usage: tokenUsage(WRITER_MODEL, completion.usage),
    };
}

/** Écrit le récit d'une démo archivée, puis envoie le SMS. Ne lève jamais. */
export async function processDemoStory(id: string): Promise<string> {
    const { data: row, error } = await db().from('demo_stories').select('id, token, phone, transcript, status, usage').eq('id', id).single();
    if (error || !row) return `introuvable (${error?.message ?? 'aucune ligne'})`;
    if (row.status !== 'pending') return `déjà traité (${row.status})`;
    try {
        const story = await writeDemoStory(row.transcript as string);
        const status = story.smsRefused ? 'refused' : story.unusable ? 'unusable' : 'written';
        await db()
            .from('demo_stories')
            .update({ status, title: story.title, content: story.content, first_name: story.firstName, usage: { ...demoUsage(row.usage), writer: story.usage ?? undefined } })
            .eq('id', id);
        if (status !== 'written') return status;
        const sent = await sendSms(row.phone as string, demoSmsText(row.token as string));
        if (sent) await db().from('demo_stories').update({ sms_sent_at: new Date().toISOString() }).eq('id', id);
        return sent ? 'written, SMS envoyé' : 'written, SMS en échec';
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await db().from('demo_stories').update({ status: 'failed', error: message.slice(0, 500) }).eq('id', id);
        return `échec : ${message}`;
    }
}

export async function getDemoStory(token: string): Promise<DemoStory | null> {
    if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return null;
    const { data } = await db()
        .from('demo_stories')
        .select('id, token, phone, status, first_name, title, content, email, email_count, promo_code, promo_expires_at, created_at')
        .eq('token', token)
        .maybeSingle();
    return (data as DemoStory | null) ?? null;
}

/** Le début du récit, pour la page du lien : ses premiers paragraphes, sans intertitres ni balises. */
export function storyTeaser(content: string, count = 1): string[] {
    return content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p && !p.startsWith('#') && !/^\*\*[^*]+\*\*$/.test(p))
        .slice(0, count)
        .map((p) => p.replace(/\*\*|__|\*/g, '').replace(/\s+/g, ' '));
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Le code promo personnel de l'e-mail : une utilisation, valable
 * DEMO_PROMO.days jours. Renvoie null si Stripe refuse (le reste de
 * l'e-mail part quand même, avec le bouton sans réduction).
 */
async function demoPromoCode(story: DemoStory): Promise<{ code: string; expires: Date } | null> {
    // Déjà créé (second envoi du récit) : sa vraie date de fin, pas 14 jours de plus.
    if (story.promo_code) {
        const known = story.promo_expires_at ? new Date(story.promo_expires_at) : await promoExpiry(story.id, story.promo_code);
        return { code: story.promo_code, expires: known ?? new Date(Date.now() + DEMO_PROMO.days * 86_400_000) };
    }
    const expires = new Date(Date.now() + DEMO_PROMO.days * 86_400_000);
    const code = `RECIT${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    try {
        await stripe().promotionCodes.create({
            promotion: { type: 'coupon', coupon: DEMO_PROMO.couponId },
            code,
            max_redemptions: 1,
            expires_at: Math.floor(expires.getTime() / 1000),
            metadata: { source: 'demo', demo_story: story.id },
        });
        await db().from('demo_stories').update({ promo_code: code, promo_expires_at: expires.toISOString() }).eq('id', story.id);
        return { code, expires };
    } catch (err) {
        console.warn('[demo] code promo non créé :', err instanceof Error ? err.message : String(err));
        return null;
    }
}

/** Le code tel que Stripe le connaît : sa date de fin, s'il est encore actif, s'il a servi. */
async function readPromo(code: string): Promise<{ expires: Date | null; active: boolean; used: boolean } | null> {
    const found = (await stripe().promotionCodes.list({ code, limit: 1 })).data[0];
    if (!found) return null;
    return { expires: found.expires_at ? new Date(found.expires_at * 1000) : null, active: found.active, used: (found.times_redeemed ?? 0) > 0 };
}

/** Date de fin d'un code créé avant le 23/11/2026, lue chez Stripe puis gardée. */
async function promoExpiry(storyId: string, code: string): Promise<Date | null> {
    try {
        const promo = await readPromo(code);
        if (!promo?.expires) return null;
        await db().from('demo_stories').update({ promo_expires_at: promo.expires.toISOString() }).eq('id', storyId);
        return promo.expires;
    } catch (err) {
        console.warn('[demo] date du code introuvable :', err instanceof Error ? err.message : String(err));
        return null;
    }
}

/** « 1er décembre », « 3 décembre », avec des espaces insécables. */
export function frenchDay(d: Date): string {
    return d
        .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
        .replace(/^1 /, '1er ')
        .replace(/ /g, '\u00a0');
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Le texte et la mise en page de l'e-mail du récit. */
export function demoEmail(params: { firstName: string | null; title: string; promo: { code: string; expires: Date } | null }) {
    const hello = params.firstName ? `Bonjour ${params.firstName},` : 'Bonjour,';
    const orderUrl = `https://${HOST}/order${params.promo ? `?code=${params.promo.code}` : ''}`;
    // « 1er décembre », pas « 1 décembre ».
    const until = params.promo ? frenchDay(params.promo.expires) : '';
    const intro = [
        hello,
        `Voici votre récit, « ${params.title} », écrit par Loomina à partir de notre conversation au téléphone. Il est en pièce jointe, mis en page comme il le serait dans votre livre.`,
        `Ce n’était qu’un moment de votre vie. Imaginez-les tous réunis, appel après appel, dans un livre à garder et à transmettre.`,
    ];
    // Demande de Solal : un simple bouton, la réduction en pourcentage, jamais le prix réduit.
    const promoLine = params.promo ? `Votre réduction de ${DEMO_PROMO.percentOff}\u00a0% est déjà appliquée sur ce lien, jusqu’au ${until}.` : null;
    const button = 'Écrire mon livre';
    const outro = ['Pour nous poser une question, répondez simplement à cet e\u2011mail.', 'À très bientôt,\nLoomina'];

    const text = [...intro, ...(promoLine ? [promoLine] : []), `${button} : ${orderUrl}`, ...outro].join('\n\n');
    const p = (t: string) => `<p style="margin:0 0 16px">${esc(t).replace(/\n/g, '<br>')}</p>`;
    const html = brandEmailHtml(
        intro.map(p).join('') +
        (promoLine ? p(promoLine) : '') +
        `<p style="margin:8px 0 28px"><a href="${esc(orderUrl)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#161616;color:#ffffff;font-weight:800;text-decoration:none">${esc(button)}</a></p>` +
        outro.map(p).join('')
    );
    return { text, html, orderUrl };
}

/** Envoie le récit en PDF à l'adresse donnée sur la page du lien. */
export async function emailDemoStory(story: DemoStory, email: string): Promise<'sent' | 'limit' | 'failed'> {
    if (story.email_count >= MAX_EMAILS) return 'limit';
    const pdf = await buildRecitPdf({ title: story.title ?? 'Un souvenir', author: story.first_name, content: story.content ?? '', date: new Date(story.created_at), seed: story.token });
    const promo = await demoPromoCode(story);
    const { text, html } = demoEmail({ firstName: story.first_name, title: story.title ?? 'Un souvenir', promo });
    const ok = await sendEmail({
        to: email,
        subject: `Votre récit : ${story.title}`,
        text,
        html,
        attachments: [{ filename: `${fileName(story.title ?? 'recit')}.pdf`, content: Buffer.from(pdf), contentType: 'application/pdf' }],
    });
    await db()
        .from('demo_stories')
        .update({ email, email_count: story.email_count + 1, ...(ok ? { emailed_at: new Date().toISOString() } : {}) })
        .eq('id', story.id);
    return ok ? 'sent' : 'failed';
}

function fileName(title: string): string {
    const base = title.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    return `Loomina - ${base || 'recit'}`;
}

/**
 * Délai minimal, depuis l'appel, avant chaque nouvel essai d'un récit en échec.
 * Cinq essais en douze heures : de quoi laisser le temps de recharger les
 * crédits OpenAI, sans réécrire en boucle un transcript qui ne passe pas.
 */
export const DEMO_RETRY_AFTER_MIN = [5, 30, 120, 360, 720];
/** Au-delà, un SMS « votre récit est écrit » n'a plus de sens : on n'essaie plus. */
const DEMO_RETRY_WINDOW_H = 24;
/** Un récit encore « pending » après ce délai : le traitement d'après l'appel a été interrompu. */
const DEMO_STUCK_MIN = 10;

/** Le nombre d'essais déjà faits, lu dans `error` (« essai 2 : … »). */
export function demoAttempts(error: string | null | undefined): number {
    const m = /^essai (\d+) :/.exec(error ?? '');
    return m ? Number(m[1]) : error ? 1 : 0;
}

/** Ce récit en échec peut-il être retenté maintenant ? */
export function demoRetryDue(row: { error: string | null; created_at: string }, now = Date.now()): boolean {
    const done = demoAttempts(row.error);
    if (done >= DEMO_RETRY_AFTER_MIN.length) return false;
    const ageMin = (now - new Date(row.created_at).getTime()) / 60_000;
    return ageMin >= DEMO_RETRY_AFTER_MIN[done] && ageMin <= DEMO_RETRY_WINDOW_H * 60;
}

/**
 * Le rattrapage des démos, appelé par /api/jobs/process (toutes les 5 minutes
 * par le serveur vocal) :
 *  - un récit en échec (OpenAI à sec, coupure) est réécrit, avec un délai croissant ;
 *  - un récit resté « pending » (traitement interrompu) est repris ;
 *  - un récit écrit dont le SMS n'est pas parti : le SMS est renvoyé une fois.
 * Chaque ligne est d'abord réservée par une mise à jour conditionnelle, pour
 * qu'un double passage (serveur vocal et cron Vercel) n'envoie jamais deux SMS.
 * Ne lève jamais.
 */
export async function sweepDemoStories(limit = 5): Promise<{ retried: number; sms: number; results: string[] }> {
    const out = { retried: 0, sms: 0, results: [] as string[] };
    try {
        const since = new Date(Date.now() - DEMO_RETRY_WINDOW_H * 3_600_000).toISOString();
        const stuckBefore = new Date(Date.now() - DEMO_STUCK_MIN * 60_000).toISOString();
        const { data, error } = await db()
            .from('demo_stories')
            .select('id, token, phone, status, error, sms_sent_at, created_at')
            .gte('created_at', since)
            .or(`status.eq.failed,and(status.eq.pending,created_at.lt."${stuckBefore}"),and(status.eq.written,sms_sent_at.is.null)`)
            .order('created_at', { ascending: true })
            .limit(20);
        if (error) throw new Error(error.message);

        for (const row of data ?? []) {
            if (out.retried + out.sms >= limit) break;
            const id = row.id as string;
            const err = (row.error as string | null) ?? null;

            if (row.status === 'written') {
                // SMS jamais parti : un seul renvoi, marqué dans `error`.
                if (err === 'sms renvoyé') continue;
                let smsClaim = db().from('demo_stories').update({ error: 'sms renvoyé' }).eq('id', id).is('sms_sent_at', null);
                smsClaim = err === null ? smsClaim.is('error', null) : smsClaim.eq('error', err);
                const { data: claimed } = await smsClaim.select('id');
                if (!claimed?.length) continue;
                const sent = await sendSms(row.phone as string, demoSmsText(row.token as string));
                if (sent) await db().from('demo_stories').update({ sms_sent_at: new Date().toISOString() }).eq('id', id);
                out.sms++;
                out.results.push(`${id} : SMS ${sent ? 'renvoyé' : 'toujours en échec'}`);
                continue;
            }

            if (row.status === 'failed' && !demoRetryDue({ error: err, created_at: row.created_at as string })) continue;
            const attempt = demoAttempts(err) + 1;
            // Réservation : repasse en « pending » seulement si personne ne l'a pris entre-temps.
            let claim = db().from('demo_stories').update({ status: 'pending', error: `essai ${attempt} : reprise` }).eq('id', id).eq('status', row.status as string);
            claim = err === null ? claim.is('error', null) : claim.eq('error', err);
            const { data: claimed } = await claim.select('id');
            if (!claimed?.length) continue;

            const outcome = await processDemoStory(id);
            if (outcome.startsWith('échec : ')) {
                await db().from('demo_stories').update({ error: `essai ${attempt} : ${outcome.slice(8)}`.slice(0, 500) }).eq('id', id);
            }
            out.retried++;
            out.results.push(`${id} : essai ${attempt}, ${outcome}`);
        }
    } catch (err) {
        console.error('[demo] rattrapage :', err instanceof Error ? err.message : String(err));
    }
    return out;
}

/** Efface un enregistrement chez Twilio. Ne lève jamais. */
export async function deleteTwilioRecording(recordingSid: string): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || !/^RE[0-9a-f]{32}$/i.test(recordingSid)) return;
    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Recordings/${recordingSid}.json`, {
            method: 'DELETE',
            headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
        });
        if (!res.ok && res.status !== 404) console.warn(`[demo] effacement de l’enregistrement ${recordingSid} : HTTP ${res.status}`);
    } catch (err) {
        console.warn(`[demo] effacement de l’enregistrement ${recordingSid} :`, err instanceof Error ? err.message : String(err));
    }
}

// ------------------------------------------------------------
// Démo sans commande : rappel avant la fin de la réduction
// (demande de Solal, 23/11/2026)
// ------------------------------------------------------------

/** Le rappel part deux jours avant la fin du code. */
export const DEMO_REMINDER_BEFORE_H = 48;

/** Ce récit attend-il son rappel ? (code connu, e-mail laissé, pas encore rappelé, fin dans moins de 48 h mais plus de 3 h) */
export function demoReminderDue(row: { email: string | null; promo_code: string | null; promo_expires_at: string | null; promo_reminded_at: string | null }, now = Date.now()): boolean {
    if (!row.email || !row.promo_code || !row.promo_expires_at || row.promo_reminded_at) return false;
    const left = Date.parse(row.promo_expires_at) - now;
    return left <= DEMO_REMINDER_BEFORE_H * 3600_000 && left > 3 * 3600_000;
}

/** L'e-mail du rappel : la date de fin, le bouton avec la réduction appliquée, le lien du récit s'il vit encore. */
export function demoReminderEmail(params: { firstName: string | null; title: string; code: string; expires: Date; storyUrl: string | null; optOut: string | null }) {
    const hello = params.firstName ? `Bonjour ${params.firstName},` : 'Bonjour,';
    const until = frenchDay(params.expires);
    const orderUrl = `https://${HOST}/order?code=${params.code}`;
    const subject = `Votre réduction de ${DEMO_PROMO.percentOff} % se termine le ${until}`;
    const intro = [
        hello,
        `Il y a quelques jours, vous avez raconté à Loomina « ${params.title} ». Votre réduction de ${DEMO_PROMO.percentOff} % pour écrire votre livre se termine le ${until}.`,
        `Elle est déjà appliquée sur ce lien :`,
    ];
    const button = 'Écrire mon livre';
    const outro = [
        ...(params.storyUrl ? [`Votre récit est toujours à lire ici : ${params.storyUrl}`] : []),
        'Pour nous poser une question, répondez simplement à cet e‑mail.',
        'À très bientôt,\nLoomina',
    ];
    const text = [...intro, `${button} : ${orderUrl}`, ...outro, ...(params.optOut ? [params.optOut] : [])].join('\n\n');
    const p = (t: string) => `<p style="margin:0 0 16px">${esc(t).replace(/\n/g, '<br>')}</p>`;
    const html = brandEmailHtml(
        intro.map(p).join('') +
            `<p style="margin:8px 0 28px"><a href="${esc(orderUrl)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#161616;color:#ffffff;font-weight:800;text-decoration:none">${esc(button)}</a></p>` +
            outro.map(p).join('') +
            (params.optOut ? `<p style="margin:24px 0 0;font-size:13px;color:#6b6b6b">${esc(params.optOut)}</p>` : '')
    );
    return { subject, text, html, orderUrl };
}

function parisHour(now: number): number {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(new Date(now)));
}

/**
 * Envoie les rappels dus, entre 10 h et 19 h (heure de Paris). Une seule fois
 * par récit : la ligne est marquée avant l'envoi. Rien si la personne a
 * commandé, si son code a servi, si elle a reçu les relances de son panier
 * (elle a déjà eu nos e-mails cette semaine), ou si elle s'est désinscrite.
 * Appelé par /api/jobs/process. Ne lève pas.
 */
export async function sweepDemoReminders(now = Date.now()): Promise<{ sent: number; results: string[] }> {
    const results: string[] = [];
    try {
        const h = parisHour(now);
        if (h < 10 || h >= 19) return { sent: 0, results };

        // Codes créés avant le 23/11/2026 sans date de fin connue : lue chez Stripe, une fois.
        const { data: unknown } = await db().from('demo_stories').select('id, promo_code').not('promo_code', 'is', null).is('promo_expires_at', null).limit(5);
        for (const row of unknown ?? []) await promoExpiry(row.id as string, row.promo_code as string);

        const { data: rows, error } = await db()
            .from('demo_stories')
            .select('id, token, phone, first_name, title, email, promo_code, promo_expires_at, promo_reminded_at, created_at')
            .not('promo_code', 'is', null)
            .not('email', 'is', null)
            .is('promo_reminded_at', null)
            .lte('promo_expires_at', new Date(now + DEMO_REMINDER_BEFORE_H * 3600_000).toISOString())
            .gt('promo_expires_at', new Date(now + 3 * 3600_000).toISOString())
            .limit(10);
        if (error) throw new Error(error.message);
        const due = (rows ?? []).filter((r) => demoReminderDue(r as never, now));
        if (!due.length) return { sent: 0, results };

        // Les adresses relancées pour un panier ces dix derniers jours.
        const cartEmails = new Set<string>();
        for await (const s of stripe().checkout.sessions.list({ created: { gte: Math.floor((now - 10 * 86_400_000) / 1000) }, limit: 100 })) {
            const m = s.metadata ?? {};
            if (m.email && (m.relances || m.relance_sent === 'true' || s.status === 'complete')) cartEmails.add(m.email.trim().toLowerCase());
        }

        for (const row of due) {
            const id = row.id as string;
            const email = String(row.email).trim();
            // Marqué avant l'envoi : jamais deux rappels.
            const { data: claimed } = await db().from('demo_stories').update({ promo_reminded_at: new Date(now).toISOString() }).eq('id', id).is('promo_reminded_at', null).select('id');
            if (!claimed?.length) continue;

            const promo = await readPromo(row.promo_code as string).catch(() => null);
            if (!promo || promo.used || !promo.active) {
                results.push(`${id}: code ${promo?.used ? 'déjà utilisé' : 'inactif'}`);
                continue;
            }
            if (cartEmails.has(email.toLowerCase())) {
                results.push(`${id}: panier en cours de relance`);
                continue;
            }
            const { data: paid } = await db().from('projects').select('id').eq('project_metadata->>buyer_email', email).limit(1);
            if (paid?.length || (await findProfileByPhone(row.phone as string).catch(() => null))) {
                results.push(`${id}: déjà client`);
                continue;
            }
            if (await isOptedOut(email)) {
                results.push(`${id}: désinscrit`);
                continue;
            }
            const expires = promo.expires ?? new Date(row.promo_expires_at as string);
            const mail = demoReminderEmail({
                firstName: (row.first_name as string | null) ?? null,
                title: (row.title as string | null) ?? 'Un souvenir',
                code: row.promo_code as string,
                expires,
                storyUrl: isExpired(row.created_at as string) ? null : demoStoryUrl(row.token as string),
                optOut: optOutLine(email),
            });
            const ok = await sendEmail({ to: email, subject: mail.subject, text: mail.text, html: mail.html, headers: optOutHeaders(email) });
            results.push(`${id}: ${ok ? 'rappel envoyé' : 'e-mail refusé'}`);
        }
    } catch (err) {
        console.error('[demo] rappels de réduction :', err instanceof Error ? err.message : String(err));
    }
    return { sent: results.filter((r) => r.endsWith('rappel envoyé')).length, results };
}
