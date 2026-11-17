/**
 * Le rappel par SMS avant un rendez-vous d'appel : quand il est dû, et ce
 * qu'il dit. Sans dépendance, pour être testé sans lancer le serveur vocal
 * (voice/src/scheduler.ts s'en sert chaque minute).
 */

import { normalizeSchedule } from './schedule';

/** Fenêtre pendant laquelle un envoi prévu part encore (serveur redémarré…). */
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

/** Le SMS de rappel part entre 30 et 20 minutes avant l'heure prévue. */
const REMINDER_MINUTES = 30;

/** Le créneau dont le rappel est dû maintenant, ou null. */
export function dueReminder(schedule: unknown, now = new Date()): string | null {
    const s = normalizeSchedule(schedule);
    if (!s.active) return null;
    const p = parisNow(now);
    if (!s.days.includes(p.day)) return null;
    const [h, m] = s.time.split(':').map(Number);
    const start = h * 60 + m;
    if (p.minutes < start - REMINDER_MINUTES || p.minutes >= start - REMINDER_MINUTES + WINDOW_MINUTES) return null;
    return `${p.ymd} ${s.time}`;
}

export function reminderText(firstName: string | null, tu: boolean, time: string): string {
    const [h, m] = time.split(':');
    const at = `${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
    const hello = firstName ? `Bonjour ${firstName}` : 'Bonjour';
    return tu
        ? `${hello}, c'est Loomina. Je t'appelle tout à l'heure, à ${at}, pour continuer ton livre. Si ce n'est pas le bon moment, ne décroche pas : tu pourras me rappeler quand tu veux.`
        : `${hello}, c'est Loomina. Je vous appelle tout à l'heure, à ${at}, pour continuer votre livre. Si ce n'est pas le bon moment, ne décrochez pas : vous pourrez me rappeler quand vous voulez.`;
}

