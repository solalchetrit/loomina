/**
 * Deux minuteurs qui tournent avec le serveur vocal, toujours allumé :
 *
 * 1. RENDEZ-VOUS — chaque minute, les livres dont l'auteur a choisi des
 *    jours et une heure dans l'espace auteur (`project_metadata.call_schedule`,
 *    heure de Paris). À l'heure dite, Loomina appelle le numéro du narrateur,
 *    exactement comme le bouton « Me faire appeler ». Un seul essai par
 *    créneau : le créneau est noté AVANT l'appel (`last_scheduled_slot`), si
 *    bien qu'un redémarrage ou deux serveurs ne rappellent jamais deux fois.
 *
 * 1 bis. RAPPEL — une demi-heure avant un rendez-vous, un SMS prévient le
 *    narrateur que Loomina va l'appeler (demande de Solal, 17/11/2026).
 *    Désactivable : `project_metadata.sms_reminder === false`.
 *
 * 1 ter. APPEL À DATE UNIQUE — l'auteur peut aussi choisir un seul jour et
 *    une heure (`project_metadata.call_once`, demande de Solal, 25/11/2026),
 *    surtout pour son premier appel. Il passe par le même chemin que les
 *    rendez-vous : même SMS une demi-heure avant, même créneau noté avant
 *    l'appel (`last_scheduled_slot`), donc jamais deux appels si l'appel
 *    unique tombe à la même heure qu'un rendez-vous de la semaine.
 *
 * 2. RATTRAPAGE — toutes les 5 minutes, demande au site de retraiter les
 *    appels dont le traitement (Directeur, Écrivain) a échoué. Sur Vercel
 *    Hobby, le cron du site ne passe qu'une fois par jour, à 3 h.
 */

import twilio from 'twilio';
import { db } from '../../lib/loomina/db';
import { normalizeSchedule } from '../../lib/loomina/schedule';
import { sendSms } from '../../lib/loomina/sms';
import { parisNow, dueReminder, dueOnceSlot, dueOnceReminder, reminderText } from '../../lib/loomina/reminder';

export { parisNow };
import { config } from './config.ts';

/** Fenêtre après l'heure prévue pendant laquelle l'appel part encore (serveur redémarré…). */
const WINDOW_MINUTES = 10;

/** Le créneau dû maintenant, ou null. Ex. « 2026-11-17 15:00 ». */
export function dueSlot(schedule: unknown, now = new Date()): string | null {
    const s = normalizeSchedule(schedule);
    if (!s.active) return null;
    const p = parisNow(now);
    if (!s.days.includes(p.day)) return null;
    const [h, m] = s.time.split(':').map(Number);
    const start = h * 60 + m;
    if (p.minutes < start || p.minutes >= start + WINDOW_MINUTES) return null;
    return `${p.ymd} ${s.time}`;
}

type ProjectRow = { id: string; user_id: string; status: string | null; project_metadata: unknown };

/** Les livres qui ont un rendez-vous de la semaine ou un appel à date unique. */
async function projectsWithCalls(what: string): Promise<ProjectRow[]> {
    const [weekly, once] = await Promise.all([
        db()
            .from('projects')
            .select('id, user_id, status, project_metadata')
            .eq('project_metadata->call_schedule->>active', 'true')
            .neq('status', 'completed')
            .limit(500),
        db()
            .from('projects')
            .select('id, user_id, status, project_metadata')
            .not('project_metadata->call_once', 'is', null)
            .neq('status', 'completed')
            .limit(500),
    ]);
    if (weekly.error) throw new Error(`lecture des rendez-vous (${what}) : ${weekly.error.message}`);
    // Un souci sur les appels uniques ne doit jamais bloquer les rendez-vous de la semaine.
    if (once.error) console.error(`[rendez-vous] lecture des appels uniques (${what}) :`, once.error.message);
    const byId = new Map<string, ProjectRow>();
    for (const p of [...(weekly.data ?? []), ...(once.data ?? [])] as ProjectRow[]) byId.set(p.id, p);
    return [...byId.values()];
}

/** Le créneau dû maintenant : rendez-vous de la semaine d'abord, sinon appel unique. */
function dueCallSlot(meta: Record<string, unknown>, now = new Date()): string | null {
    return dueSlot(meta.call_schedule, now) ?? dueOnceSlot(meta.call_once, now);
}

async function sendReminders(): Promise<void> {
    for (const project of await projectsWithCalls('rappels')) {
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        if (meta.sms_reminder === false) continue;
        const slot = dueReminder(meta.call_schedule) ?? dueOnceReminder(meta.call_once);
        if (!slot || meta.last_reminder_slot === slot) continue;

        const { data: profile } = await db().from('profiles').select('phone_number, first_name, politeness_preference').eq('id', project.user_id).single();
        const phone = (profile?.phone_number as string | null) ?? null;
        if (!phone) continue;

        // Réservé d'abord, comme pour l'appel : jamais deux rappels pour un créneau.
        const { data: claimed, error: claimErr } = await db()
            .from('projects')
            .update({ project_metadata: { ...meta, last_reminder_slot: slot } })
            .eq('id', project.id)
            .or(`project_metadata->>last_reminder_slot.is.null,project_metadata->>last_reminder_slot.neq."${slot}"`)
            .select('id');
        if (claimErr || !claimed?.length) continue;

        const sent = await sendSms(phone, reminderText((profile?.first_name as string | null) ?? null, profile?.politeness_preference === 'tu', slot.slice(11)));
        if (sent) console.info(`[rappel] SMS envoyé pour le créneau ${slot}`);
    }
}

async function placeScheduledCalls(isBusy: (phone: string) => boolean): Promise<void> {
    for (const project of await projectsWithCalls('appels')) {
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        const slot = dueCallSlot(meta);
        if (!slot || meta.last_scheduled_slot === slot) continue;

        const { data: profile } = await db().from('profiles').select('phone_number').eq('id', project.user_id).single();
        const phone = (profile?.phone_number as string | null) ?? null;
        if (!phone) continue;
        if (isBusy(phone)) {
            console.info(`[rendez-vous] ${project.id} déjà en ligne, créneau ${slot} sauté`);
            continue;
        }

        // Le créneau est réservé d'abord, à condition qu'il ne l'ait pas déjà
        // été par un autre passage : pas de double appel.
        const { data: claimed, error: claimErr } = await db()
            .from('projects')
            .update({ project_metadata: { ...meta, last_scheduled_slot: slot } })
            .eq('id', project.id)
            .or(`project_metadata->>last_scheduled_slot.is.null,project_metadata->>last_scheduled_slot.neq."${slot}"`)
            .select('id');
        if (claimErr || !claimed?.length) continue;

        try {
            const client = twilio(config.twilio.accountSid, config.twilio.authToken);
            const call = await client.calls.create({
                to: phone,
                from: config.twilio.phoneNumber,
                url: `${config.publicUrl}/twilio/voice`,
                method: 'POST',
                // Répondeur : on raccroche plutôt que de parler à une messagerie.
                machineDetection: 'Enable',
                timeout: 40,
            });
            console.info(`[rendez-vous] appel ${call.sid} lancé pour le créneau ${slot}`);
        } catch (err) {
            console.error(`[rendez-vous] appel impossible (${slot}) :`, err instanceof Error ? err.message : err);
        }
    }
}

async function catchUp(): Promise<void> {
    // Même secret que pour le rapport de fin d'appel : rien d'autre à configurer.
    const res = await fetch(`${config.nextBaseUrl}/api/jobs/process`, {
        headers: { 'x-vapi-secret': config.webhookSecret },
    });
    if (!res.ok) {
        console.warn(`[rattrapage] le site répond ${res.status}`);
        return;
    }
    const body = (await res.json().catch(() => ({}))) as { picked?: number };
    if (body.picked) console.info(`[rattrapage] ${body.picked} appel(s) retraité(s)`);
}

export function startTimers(isBusy: (phone: string) => boolean): void {
    if (config.schedulerEnabled) {
        setInterval(() => {
            placeScheduledCalls(isBusy).catch((err) => console.error('[rendez-vous]', err instanceof Error ? err.message : err));
            sendReminders().catch((err) => console.error('[rappel]', err instanceof Error ? err.message : err));
        }, 60_000);
        console.info('[rendez-vous] actif (chaque minute, heure de Paris)');
    }
    setInterval(() => {
        catchUp().catch((err) => console.error('[rattrapage]', err instanceof Error ? err.message : err));
    }, 5 * 60_000);
    console.info('[rattrapage] actif (toutes les 5 min)');
}
