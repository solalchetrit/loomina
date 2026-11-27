/** Mises en forme de l'admin : dates à l'heure de Paris, durées, statuts en français. */

export function fmtDate(v: unknown, withTime = true): string {
    if (!v) return '—';
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(d);
}

export function fmtDuration(seconds: unknown): string {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s <= 0) return '—';
    const m = Math.floor(s / 60);
    const r = Math.round(s % 60);
    return m ? `${m} min${r ? ` ${r} s` : ''}` : `${r} s`;
}

/** Un numéro lisible : +33612345678 → 06 12 34 56 78 (les autres pays restent tels quels). */
export function fmtPhone(v: unknown): string {
    const raw = typeof v === 'string' ? v.trim() : '';
    if (!raw) return 'numéro masqué';
    const fr = raw.replace(/\s/g, '').match(/^(?:\+33|0033|0)([1-9]\d{8})$/);
    return fr ? `0${fr[1]}`.replace(/(\d{2})(?=\d)/g, '$1 ') : raw;
}

export function fmtNumber(n: unknown): string {
    return new Intl.NumberFormat('fr-FR').format(Number(n) || 0);
}

/** Statut d'un entretien (interviews.processing_status). */
export const INTERVIEW_STATUS: Record<string, { label: string; tone: Tone }> = {
    processed: { label: 'Traité', tone: 'ok' },
    pending: { label: 'En cours de traitement', tone: 'wait' },
    too_short: { label: 'Trop court', tone: 'muted' },
    failed: { label: 'Échec', tone: 'bad' },
};

/** Statut d'un événement d'appel (call_events.status). */
export const EVENT_STATUS: Record<string, { label: string; tone: Tone }> = {
    done: { label: 'Traité', tone: 'ok' },
    pending: { label: 'En attente', tone: 'wait' },
    processing: { label: 'En cours', tone: 'wait' },
    failed: { label: 'Échec', tone: 'bad' },
    skipped: { label: 'Ignoré', tone: 'muted' },
};

export const PROJECT_STATUS: Record<string, { label: string; tone: Tone }> = {
    active: { label: 'En cours', tone: 'ok' },
    paused: { label: 'En pause', tone: 'wait' },
    completed: { label: 'Terminé', tone: 'muted' },
};

export const EDITION_STATUS: Record<string, { label: string; tone: Tone }> = {
    planning: { label: 'Plan en cours', tone: 'wait' },
    writing: { label: 'Écriture en cours', tone: 'wait' },
    ready: { label: 'Prêt', tone: 'ok' },
    failed: { label: 'Échec', tone: 'bad' },
};

export type Tone = 'ok' | 'wait' | 'bad' | 'muted';
