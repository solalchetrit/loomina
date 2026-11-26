/**
 * Les messages autour des appels (demande de Solal, 25/11/2026) :
 *
 * 1. LA VEILLE — un e-mail en fin de journée (18 h à 21 h, heure de Paris)
 *    quand Loomina appelle l'auteur le lendemain (rendez-vous de la semaine ou
 *    appel à date unique). Une fois par créneau (`last_eve_slot`). Le SMS une
 *    demi-heure avant reste envoyé par le serveur vocal.
 * 2. APRÈS L'APPEL — l'e-mail « ton récit est écrit », avec le début du
 *    récit et Mémo (lib/loomina/pipeline.ts), en plus du SMS.
 * 3. APPEL MANQUÉ — Loomina a appelé à l'heure prévue, personne n'a décroché
 *    (ou un répondeur) : un SMS avec le numéro en clair et un e-mail avec le
 *    bouton « Appeler ». Le serveur vocal prévient le site
 *    (app/api/jobs/appel-manque). Une fois par créneau (`last_missed_slot`).
 *
 * L'e-mail ne part que si l'adresse du compte est celle de l'auteur (pas pour
 * un livre offert, dont l'adresse est celle de celui qui offre), et jamais à
 * une adresse désinscrite.
 */
import { db } from './db';
import { sendSms } from './sms';
import { sendEmail, authorOwnEmail, teamContacts } from './notify';
import { addDays, normalizeSchedule, parseCallOnce, parisNow } from './schedule';
import { memoAge } from '../emails/memo';
import { appelManqueEmail, appelManqueSms, extraitRecit, recitPretEmail, veilleAppelEmail } from '../emails/messages/appels';

type Meta = Record<string, unknown>;
type Profile = { first_name: string | null; politeness_preference?: string | null; phone_number?: string | null; email?: string | null };

const EVE_FROM = 18 * 60;
const EVE_UNTIL = 21 * 60;

/** Le jour de la semaine (1 = lundi … 7 = dimanche) d'une date « AAAA-MM-JJ ». */
function weekday(ymd: string): number {
    const d = new Date(`${ymd}T12:00:00Z`).getUTCDay();
    return d === 0 ? 7 : d;
}

/** Le créneau « AAAA-MM-JJ HH:MM » de demain (heure de Paris), ou null. */
export function tomorrowSlot(meta: Meta, now = new Date()): string | null {
    const tomorrow = addDays(parisNow(now).ymd, 1);
    const s = normalizeSchedule(meta.call_schedule);
    if (s.active && s.days.includes(weekday(tomorrow))) return `${tomorrow} ${s.time}`;
    const once = parseCallOnce(meta.call_once);
    if (once && once.date === tomorrow) return `${once.date} ${once.time}`;
    return null;
}

/** L'e-mail de la veille est-il dû maintenant ? Renvoie le créneau, ou null. */
export function dueEve(meta: Meta, now = new Date()): string | null {
    const p = parisNow(now);
    if (p.minutes < EVE_FROM || p.minutes >= EVE_UNTIL) return null;
    const slot = tomorrowSlot(meta, now);
    if (!slot || meta.last_eve_slot === slot) return null;
    return slot;
}

/** Un e-mail « en plus » à l'auteur : adresse à lui, pas désinscrite. Avec sa ligne de désinscription. */
async function authorMailbox(profile: Profile, meta: Meta): Promise<{ to: string; optOut: string | null; headers: Record<string, string> } | null> {
    const to = authorOwnEmail(profile, meta);
    if (!to) return null;
    const { isOptedOut, optOutLine, optOutHeaders } = await import('./optout');
    if (await isOptedOut(to)) return null;
    return { to, optOut: optOutLine(to), headers: optOutHeaders(to) };
}

/** Le passage programmé : les e-mails de la veille. */
export async function sweepCallEves(now = new Date()): Promise<number> {
    const p = parisNow(now);
    if (p.minutes < EVE_FROM || p.minutes >= EVE_UNTIL) return 0;
    const [weekly, once] = await Promise.all([
        db().from('projects').select('id, user_id, status, phase, project_metadata').eq('project_metadata->call_schedule->>active', 'true').neq('status', 'completed').limit(500),
        db().from('projects').select('id, user_id, status, phase, project_metadata').not('project_metadata->call_once', 'is', null).neq('status', 'completed').limit(500),
    ]);
    if (weekly.error) throw new Error(`lecture des rendez-vous (veille) : ${weekly.error.message}`);
    const byId = new Map<string, { id: string; user_id: string; phase: number | null; project_metadata: Meta | null }>();
    for (const row of [...(weekly.data ?? []), ...(once.data ?? [])]) byId.set(row.id as string, row as never);

    let sent = 0;
    for (const project of byId.values()) {
        const meta = project.project_metadata ?? {};
        if (meta.test === true) continue;
        const slot = dueEve(meta, now);
        if (!slot) continue;
        const { data: profile } = await db().from('profiles').select('first_name, politeness_preference, phone_number, email').eq('id', project.user_id).maybeSingle();
        if (!profile) continue;
        const box = await authorMailbox(profile as Profile, meta);
        // Noté même sans e-mail : on ne relit pas ce livre à chaque passage de la soirée.
        const { data: claimed } = await db()
            .from('projects')
            .update({ project_metadata: { ...meta, last_eve_slot: slot } })
            .eq('id', project.id)
            .or(`project_metadata->>last_eve_slot.is.null,project_metadata->>last_eve_slot.neq."${slot}"`)
            .select('id');
        if (!claimed?.length || !box) continue;
        const mail = veilleAppelEmail({ firstName: (profile.first_name as string | null) ?? null, tu: profile.politeness_preference === 'tu', time: slot.slice(11), age: memoAge(project.phase), optOut: box.optOut });
        const ok = await sendEmail({ to: box.to, subject: mail.subject, text: mail.text, html: mail.html, replyTo: teamContacts().email, headers: box.headers, loginPhone: (profile.phone_number as string | null) ?? null });
        if (ok) sent++;
    }
    return sent;
}

/** Après l'appel : l'e-mail « ton récit est écrit ». Ne lève jamais. */
export async function notifyRecitPret(params: { profile: Profile; projectMetadata: Meta | null; title: string; markdown: string | null; phase: number | null }): Promise<void> {
    try {
        const meta = params.projectMetadata ?? {};
        const box = await authorMailbox(params.profile, meta);
        if (!box) return;
        const mail = recitPretEmail({
            firstName: params.profile.first_name,
            tu: params.profile.politeness_preference === 'tu',
            title: params.title,
            extrait: extraitRecit(params.markdown),
            age: memoAge(params.phase),
            optOut: box.optOut,
        });
        await sendEmail({ to: box.to, subject: mail.subject, text: mail.text, html: mail.html, replyTo: teamContacts().email, headers: box.headers, loginPhone: params.profile.phone_number ?? null });
    } catch (err) {
        console.warn('[récit] e-mail non envoyé :', err instanceof Error ? err.message : String(err));
    }
}

/**
 * Appel programmé sans réponse : SMS (numéro en clair) et e-mail (bouton
 * « Appeler »). Une fois par créneau. Renvoie ce qui est parti.
 */
export async function notifyMissedCall(phone: string): Promise<{ sms: boolean; email: boolean; reason?: string }> {
    const { data: profile } = await db().from('profiles').select('id, first_name, politeness_preference, phone_number, email').eq('phone_number', phone).maybeSingle();
    if (!profile) return { sms: false, email: false, reason: 'inconnu' };
    const { data: project } = await db()
        .from('projects')
        .select('id, phase, status, project_metadata')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (!project) return { sms: false, email: false, reason: 'pas de livre en cours' };
    const meta = (project.project_metadata ?? {}) as Meta;
    const slot = typeof meta.last_scheduled_slot === 'string' ? meta.last_scheduled_slot : null;
    if (!slot) return { sms: false, email: false, reason: 'pas de rendez-vous' };
    if (meta.last_missed_slot === slot) return { sms: false, email: false, reason: 'déjà prévenu' };
    const { data: claimed } = await db()
        .from('projects')
        .update({ project_metadata: { ...meta, last_missed_slot: slot } })
        .eq('id', project.id)
        .or(`project_metadata->>last_missed_slot.is.null,project_metadata->>last_missed_slot.neq."${slot}"`)
        .select('id');
    if (!claimed?.length) return { sms: false, email: false, reason: 'déjà prévenu' };

    const tu = profile.politeness_preference === 'tu';
    const first = (profile.first_name as string | null) ?? null;
    const sms = await sendSms(phone, appelManqueSms(first, tu));
    let email = false;
    const box = await authorMailbox(profile as Profile, meta);
    if (box) {
        const mail = appelManqueEmail({ firstName: first, tu, age: memoAge(project.phase as number | null), optOut: box.optOut });
        email = await sendEmail({ to: box.to, subject: mail.subject, text: mail.text, html: mail.html, replyTo: teamContacts().email, headers: box.headers, loginPhone: phone });
    }
    return { sms, email };
}
