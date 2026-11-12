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
 * 2. RATTRAPAGE — toutes les 5 minutes, demande au site de retraiter les
 *    appels dont le traitement (Directeur, Écrivain) a échoué. Sur Vercel
 *    Hobby, le cron du site ne passe qu'une fois par jour, à 3 h.
 */

import twilio from 'twilio';
import { db } from '../../lib/loomina/db';
import { normalizeSchedule } from '../../lib/loomina/schedule';
import { config } from './config.ts';

/** Fenêtre après l'heure prévue pendant laquelle l'appel part encore (serveur redémarré…). */
const WINDOW_MINUTES = 10;

/** Jour (1 = lundi … 7 = dimanche) et minute de la journée, heure de Paris. */
export function parisNow(date = new Date()): { day: number; minutes: number; ymd: string } {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Paris',
            weekday: 'short',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
            .formatToParts(date)
            .map((p) => [p.type, p.value])
    );
    const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday) + 1;
    return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), ymd: `${parts.year}-${parts.month}-${parts.day}` };
}

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

async function placeScheduledCalls(isBusy: (phone: string) => boolean): Promise<void> {
    const { data, error } = await db()
        .from('projects')
        .select('id, user_id, status, project_metadata')
        .eq('project_metadata->call_schedule->>active', 'true')
        .neq('status', 'completed')
        .limit(500);
    if (error) throw new Error(`lecture des rendez-vous : ${error.message}`);

    for (const project of data ?? []) {
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        const slot = dueSlot(meta.call_schedule);
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
    if (!config.cronSecret) return;
    const res = await fetch(`${config.nextBaseUrl}/api/jobs/process`, {
        headers: { Authorization: `Bearer ${config.cronSecret}` },
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
        }, 60_000);
        console.info('[rendez-vous] actif (chaque minute, heure de Paris)');
    }
    if (config.cronSecret) {
        setInterval(() => {
            catchUp().catch((err) => console.error('[rattrapage]', err instanceof Error ? err.message : err));
        }, 5 * 60_000);
        console.info('[rattrapage] actif (toutes les 5 min)');
    } else {
        console.info('[rattrapage] CRON_SECRET absente : seul le cron quotidien du site rattrape les appels');
    }
}
