/**
 * Rendez-vous d'appel réguliers : l'auteur choisit des jours et une heure,
 * et Loomina l'appelle tout seul. Gardé dans
 * `projects.project_metadata.call_schedule`, lu par le serveur vocal qui
 * passe les appels (voice/src/scheduler.ts, branche du serveur vocal).
 * L'heure est celle de Paris.
 */

export interface CallSchedule {
    active: boolean;
    /** 1 = lundi … 7 = dimanche */
    days: number[];
    /** « HH:MM », heure de Paris */
    time: string;
}

export const DEFAULT_SCHEDULE: CallSchedule = { active: false, days: [], time: '15:00' };

export function normalizeSchedule(v: unknown): CallSchedule {
    const raw = (v ?? {}) as Record<string, unknown>;
    const days = Array.isArray(raw.days)
        ? [...new Set(raw.days.map(Number).filter((d) => Number.isInteger(d) && d >= 1 && d <= 7))].sort()
        : [];
    const time = typeof raw.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(raw.time) ? raw.time : DEFAULT_SCHEDULE.time;
    // Pas d'appel entre 21 h et 9 h : on ne réveille personne.
    const hour = Number(time.slice(0, 2));
    const safeTime = hour < 9 ? '09:00' : hour >= 21 ? '20:00' : time;
    return { active: raw.active === true && days.length > 0, days, time: safeTime };
}

const DAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** « le mardi et le vendredi à 15 h » */
export function describeSchedule(s: CallSchedule): string | null {
    if (!s.active || !s.days.length) return null;
    const names = s.days.map((d) => DAY_NAMES[d - 1]);
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
    const [h, m] = s.time.split(':');
    return `chaque ${list} à ${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
}
