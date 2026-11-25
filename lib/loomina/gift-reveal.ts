/**
 * Livre offert : prévenir la personne qui va raconter, sans gâcher la
 * surprise (demande de Solal, 25/11/2026).
 *
 * À la commande, rien ne part vers elle. Celui qui offre choisit dans son
 * espace famille :
 *   · « Prévenir maintenant » → SMS de bienvenue tout de suite ;
 *   · une date (Noël, un anniversaire…) → le SMS part ce jour-là à 10 h
 *     (heure de Paris), et celui qui offre reçoit l'e-mail « c'est le jour J ».
 * Si la personne a déjà appelé Loomina avant la date, rien ne part : elle sait.
 *
 * Tout tient dans `project_metadata.gift_reveal` : { date?: 'AAAA-MM-JJ',
 * sent_at?: ISO, skipped?: true }. Le passage programmé est fait par le
 * rattrapage (app/api/jobs/process, toutes les 5 minutes).
 */
import { db } from './db';
import { sendSms } from './sms';
import { sendEmail, teamContacts } from './notify';
import { parisNow } from './schedule';
import { readGiver } from './giver';
import { annonceCadeauSms, jourJEmail } from '../emails/messages/cadeau';

export interface GiftReveal {
    date: string | null;
    sentAt: string | null;
    skipped: boolean;
}

/** L'heure d'envoi, le jour J (heure de Paris), et la dernière heure de rattrapage. */
const REVEAL_FROM = 10 * 60;
const REVEAL_UNTIL = 21 * 60;

export function readReveal(meta: Record<string, unknown> | null | undefined): GiftReveal {
    const r = (meta?.gift_reveal ?? {}) as Record<string, unknown>;
    const date = typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null;
    return { date, sentAt: typeof r.sent_at === 'string' ? r.sent_at : null, skipped: r.skipped === true };
}

/** Une date choisie par celui qui offre : de demain à un an. Renvoie null si elle ne va pas. */
export function validRevealDate(v: unknown, now = new Date()): string | null {
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const today = parisNow(now).ymd;
    const max = parisNow(new Date(now.getTime() + 366 * 86_400_000)).ymd;
    return v > today && v <= max ? v : null;
}

/** Le jour J est arrivé, à l'heure d'envoi ? */
export function revealDue(reveal: GiftReveal, now = new Date()): boolean {
    if (!reveal.date || reveal.sentAt || reveal.skipped) return false;
    const p = parisNow(now);
    if (reveal.date > p.ymd) return false;
    // Une date passée (serveur arrêté…) part au prochain passage dans la plage d'envoi.
    return p.minutes >= REVEAL_FROM && p.minutes < REVEAL_UNTIL;
}

type Project = { id: string; user_id: string; project_metadata: Record<string, unknown> | null };

/** Envoie le SMS de bienvenue à la personne qui va raconter. Vrai si parti. */
async function sendAnnouncement(project: Project): Promise<boolean> {
    const { data: profile } = await db().from('profiles').select('first_name, phone_number, politeness_preference').eq('id', project.user_id).maybeSingle();
    const phone = (profile?.phone_number as string | null) ?? null;
    if (!phone) return false;
    const giver = readGiver(project.project_metadata);
    return sendSms(
        phone,
        annonceCadeauSms({ narratorFirstName: (profile?.first_name as string | null) ?? null, giverFirstName: giver?.firstName ?? null, tu: profile?.politeness_preference === 'tu' })
    );
}

/**
 * Prévient tout de suite (bouton « Prévenir maintenant »). Le message n'est
 * réservé qu'une fois : deux clics n'envoient qu'un SMS.
 */
export async function revealNow(project: Project): Promise<boolean> {
    const meta = project.project_metadata ?? {};
    if (readReveal(meta).sentAt) return true;
    const sentAt = new Date().toISOString();
    const { data: claimed } = await db()
        .from('projects')
        .update({ project_metadata: { ...meta, gift_reveal: { ...readRevealRaw(meta), sent_at: sentAt } } })
        .eq('id', project.id)
        .is('project_metadata->gift_reveal->>sent_at', null)
        .select('id');
    if (!claimed?.length) return true;
    return sendAnnouncement(project);
}

function readRevealRaw(meta: Record<string, unknown>): Record<string, unknown> {
    return meta.gift_reveal && typeof meta.gift_reveal === 'object' ? (meta.gift_reveal as Record<string, unknown>) : {};
}

/** Le passage programmé : les jours J arrivés. */
export async function sweepGiftReveals(now = new Date()): Promise<number> {
    const { data, error } = await db()
        .from('projects')
        .select('id, user_id, project_metadata')
        .not('project_metadata->gift_reveal->>date', 'is', null)
        .is('project_metadata->gift_reveal->>sent_at', null)
        .limit(100);
    if (error) throw new Error(`lecture des jours J : ${error.message}`);
    let sent = 0;
    for (const project of (data ?? []) as Project[]) {
        const meta = project.project_metadata ?? {};
        if (meta.is_gift !== true || !revealDue(readReveal(meta), now)) continue;
        // Déjà appelé Loomina : la surprise est faite, rien ne part.
        const { count } = await db().from('interviews').select('id', { count: 'exact', head: true }).eq('project_id', project.id);
        const skipped = (count ?? 0) > 0;
        const { data: claimed } = await db()
            .from('projects')
            .update({ project_metadata: { ...meta, gift_reveal: { ...readRevealRaw(meta), sent_at: new Date().toISOString(), ...(skipped ? { skipped: true } : {}) } } })
            .eq('id', project.id)
            .is('project_metadata->gift_reveal->>sent_at', null)
            .select('id');
        if (!claimed?.length || skipped) continue;
        if (await sendAnnouncement(project)) sent++;
        // Celui qui offre : c'est le jour J.
        const email = typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
        if (email) {
            const { data: profile } = await db().from('profiles').select('first_name').eq('id', project.user_id).maybeSingle();
            const giver = readGiver(meta);
            const mail = jourJEmail({ giverFirstName: giver?.firstName ?? null, narrator: (profile?.first_name as string | null) ?? null });
            await sendEmail({ to: email, subject: mail.subject, text: mail.text, html: mail.html, replyTo: teamContacts().email, loginPhone: giver?.phone ?? null }).catch(() => false);
        }
    }
    return sent;
}
