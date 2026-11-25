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

/* ------------------------------------------------------------------ */
/* Appel à date unique (demande de Solal, 25/11/2026) : « ce lundi à   */
/* 10 h, Loomina m'appelle ». Surtout pour le premier appel, mais       */
/* possible à tout moment. Gardé à part, dans                           */
/* `project_metadata.call_once`, pour ne jamais toucher aux rendez-vous */
/* de la semaine. Le serveur vocal le passe comme un rendez-vous, avec  */
/* le même SMS une demi-heure avant (voice/src/scheduler.ts).           */
/* ------------------------------------------------------------------ */

export interface CallOnce {
    /** « AAAA-MM-JJ », jour de Paris */
    date: string;
    /** « HH:MM », heure de Paris */
    time: string;
}

/** Jusqu'où on peut prévoir un appel unique. */
export const CALL_ONCE_MAX_DAYS = 60;

/** Jour (1 = lundi … 7 = dimanche) et minute de la journée, heure de Paris. */
export function parisNow(date = new Date()): { day: number; minutes: number; ymd: string; hm: string } {
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
    const hour = parts.hour === '24' ? '00' : parts.hour;
    return { day, minutes: Number(hour) * 60 + Number(parts.minute), ymd: `${parts.year}-${parts.month}-${parts.day}`, hm: `${hour}:${parts.minute}` };
}

const DAY_MS = 86_400_000;

/** Le jour « AAAA-MM-JJ » décalé de n jours (calcul à midi UTC : pas de changement d'heure). */
export function addDays(ymd: string, n: number): string {
    return new Date(new Date(`${ymd}T12:00:00Z`).getTime() + n * DAY_MS).toISOString().slice(0, 10);
}

/** Lit un appel unique, sans regarder s'il est passé. */
export function parseCallOnce(v: unknown): CallOnce | null {
    const raw = (v ?? null) as Record<string, unknown> | null;
    if (!raw || typeof raw !== 'object') return null;
    const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
    if (!date || Number.isNaN(new Date(`${date}T12:00:00Z`).getTime()) || addDays(date, 0) !== date) return null;
    if (typeof raw.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(raw.time)) return null;
    // Pas d'appel entre 21 h et 9 h, comme pour les rendez-vous de la semaine.
    const hour = Number(raw.time.slice(0, 2));
    const time = hour < 9 ? '09:00' : hour >= 21 ? '20:00' : raw.time;
    return { date, time };
}

/** L'appel unique s'il est encore à venir (et pas plus loin que 60 jours), sinon null. */
export function upcomingCallOnce(v: unknown, now = new Date()): CallOnce | null {
    const c = parseCallOnce(v);
    if (!c) return null;
    const p = parisNow(now);
    if (`${c.date} ${c.time}` <= `${p.ymd} ${p.hm}`) return null;
    if (c.date > addDays(p.ymd, CALL_ONCE_MAX_DAYS)) return null;
    return c;
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function hourText(time: string): string {
    const [h, m] = time.split(':');
    return `${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
}

/** « aujourd'hui », « demain » ou « le lundi 1er décembre ». */
export function dayText(ymd: string, now = new Date()): string {
    const today = parisNow(now).ymd;
    if (ymd === today) return 'aujourd’hui';
    if (ymd === addDays(today, 1)) return 'demain';
    const d = new Date(`${ymd}T12:00:00Z`);
    const n = d.getUTCDate();
    return `le ${DAY_NAMES[(d.getUTCDay() + 6) % 7]} ${n === 1 ? '1er' : n} ${MONTHS[d.getUTCMonth()]}`;
}

/** « le lundi 1er décembre à 10 h », ou null s'il n'y a pas d'appel unique à venir. */
export function describeCallOnce(v: unknown, now = new Date()): string | null {
    const c = upcomingCallOnce(v, now);
    return c ? `${dayText(c.date, now)} à ${hourText(c.time)}` : null;
}

/**
 * Le texte des prochains appels prévus, pour l'espace auteur et l'espace famille :
 * « le lundi 1er décembre à 10 h, puis chaque mardi à 15 h ».
 */
export function describeCalls(schedule: CallSchedule, once: unknown, now = new Date()): string | null {
    const weekly = describeSchedule(schedule);
    const single = describeCallOnce(once, now);
    if (single && weekly) return `${single}, puis ${weekly}`;
    return single ?? weekly;
}

/** Les jours qu'on peut choisir pour un appel unique : aujourd'hui et les 13 suivants. */
export function callOnceDays(now = new Date(), count = 14): { date: string; label: string }[] {
    const today = parisNow(now).ymd;
    return Array.from({ length: count }, (_, i) => {
        const date = addDays(today, i);
        const t = dayText(date, now).replace(/^le /, '');
        return { date, label: t.charAt(0).toUpperCase() + t.slice(1) };
    });
}
