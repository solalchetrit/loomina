/**
 * Le rappel par SMS avant un rendez-vous d'appel : quand il est dû, et ce
 * qu'il dit. Sans dépendance, pour être testé sans lancer le serveur vocal
 * (voice/src/scheduler.ts s'en sert chaque minute).
 */

import { normalizeSchedule, parseCallOnce, parisNow } from './schedule';

/** Fenêtre pendant laquelle un envoi prévu part encore (serveur redémarré…). */
const WINDOW_MINUTES = 10;

export { parisNow };

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

/** Minute « AAAA-MM-JJ HH:MM » de Paris en minutes depuis 1970 (pour comparer des créneaux sur deux jours). */
function slotMinutes(ymd: string, minutes: number): number {
    return Math.round(new Date(`${ymd}T00:00:00Z`).getTime() / 60_000) + minutes;
}

/** L'appel unique (`project_metadata.call_once`) : le créneau dû maintenant, ou null. */
export function dueOnceSlot(once: unknown, now = new Date()): string | null {
    const c = parseCallOnce(once);
    if (!c) return null;
    const p = parisNow(now);
    const [h, m] = c.time.split(':').map(Number);
    const diff = slotMinutes(p.ymd, p.minutes) - slotMinutes(c.date, h * 60 + m);
    return diff >= 0 && diff < WINDOW_MINUTES ? `${c.date} ${c.time}` : null;
}

/** L'appel unique : le créneau dont le SMS de rappel est dû maintenant (30 min avant), ou null. */
export function dueOnceReminder(once: unknown, now = new Date()): string | null {
    const c = parseCallOnce(once);
    if (!c) return null;
    const p = parisNow(now);
    const [h, m] = c.time.split(':').map(Number);
    const diff = slotMinutes(p.ymd, p.minutes) - (slotMinutes(c.date, h * 60 + m) - REMINDER_MINUTES);
    return diff >= 0 && diff < WINDOW_MINUTES ? `${c.date} ${c.time}` : null;
}

export function reminderText(firstName: string | null, tu: boolean, time: string): string {
    const [h, m] = time.split(':');
    const at = `${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
    const hello = firstName ? `Bonjour ${firstName}` : 'Bonjour';
    return tu
        ? `${hello}, c'est Loomina. Je t'appelle tout à l'heure, à ${at}, pour continuer ton livre. Si ce n'est pas le bon moment, ne décroche pas : tu pourras me rappeler quand tu veux.`
        : `${hello}, c'est Loomina. Je vous appelle tout à l'heure, à ${at}, pour continuer votre livre. Si ce n'est pas le bon moment, ne décrochez pas : vous pourrez me rappeler quand vous voulez.`;
}

