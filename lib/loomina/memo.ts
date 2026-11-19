/**
 * Mémo, l'éléphant de l'espace auteur : ce qu'il fait et ce qu'il dit selon
 * l'avancée réelle du livre (Solal, 19/11/2026 : « inclure son fonctionnement
 * par code en fonction du stade du user »).
 *
 * Rien n'est inventé : son âge vient de l'étape du livre tenue par le Directeur,
 * le compte de souvenirs vient des sujets du plan (weave), et son humeur vient
 * des appels réellement passés. Jamais de points, de niveaux ni de série perdue.
 */
import type { Phase } from './phases';
import type { Weave } from './weave';

export type MemoAge = 1 | 2 | 3 | 4 | 5;

/** Les cinq âges de Mémo : un par étape du livre, le dernier quand le récit est complet. */
export const MEMO_AGES: { age: MemoAge; name: string; stage: string; text: string; then: string; event: string; meaning: string }[] = [
    { age: 1, name: 'Tout petit', stage: 'Faire connaissance', text: 'Mémo est tout petit. Vous lui dites d’où vous venez.', then: 'se lève', event: 'Voici Mémo', meaning: 'Un éléphant n’oublie rien. Mémo retient chaque souvenir que vous racontez, et chaque souvenir le fait grandir, jusqu’à votre livre.' },
    { age: 2, name: 'Premiers pas', stage: 'Les racines', text: 'Il se lève : vos parents, votre enfance, l’école.', then: 'prend la plume', event: 'Mémo fait ses premiers pas', meaning: 'Vous avez fait connaissance. Il vous suit maintenant vers vos racines : vos parents, la maison d’enfance, l’école.' },
    { age: 3, name: 'La plume', stage: 'La vie adulte', text: 'Il prend la plume : votre métier, vos amours, vos enfants.', then: 'met ses lunettes', event: 'Mémo prend la plume', meaning: 'Vos racines sont racontées. Il écrit à présent votre vie adulte : votre métier, vos amours, vos enfants.' },
    { age: 4, name: 'Les lunettes', stage: 'Ce que vous transmettez', text: 'Il met ses lunettes et relit : vos valeurs, vos messages.', then: 'reçoit votre livre', event: 'Mémo met ses lunettes', meaning: 'Votre vie est racontée. Il relit tout avec vous : ce que vous avez appris, ce que vous voulez transmettre.' },
    { age: 5, name: 'Le livre', stage: 'Votre livre', text: 'Votre récit est complet. Mémo vous tend votre livre.', then: '', event: 'Mémo vous tend votre livre', meaning: 'Votre récit est complet. Tout ce que vous lui avez confié tient maintenant dans un livre.' },
];

/** Au-delà de ce délai sans appel, Mémo dit simplement qu'il attend la suite. */
export const MEMO_WAITING_DAYS = 14;
/** Un appel de moins de deux jours : Mémo vient de retenir un récit. */
export const MEMO_FRESH_HOURS = 48;

export interface MemoState {
    age: MemoAge;
    /**
     * asleep : aucun appel encore, il dort.    fresh : un appel tout récent, il saute de joie.
     * waiting : pas d'appel depuis longtemps.  steady : le cours normal.    done : le récit est complet.
     */
    mood: 'asleep' | 'fresh' | 'waiting' | 'steady' | 'done';
    /** La phrase principale. */
    headline: string;
    /** Une ligne de contexte sous la phrase, ou null. */
    note: string | null;
    /** Souvenirs racontés / à raconter dans l'étape en cours (0 / 0 quand le récit est complet). */
    told: number;
    total: number;
    /** Avancée sur le chemin des cinq âges, de 0 à 1. */
    path: number;
}

const DAY = 24 * 3600 * 1000;

export function memoState(input: {
    phase: Phase;
    completed: boolean;
    weave: Pick<Weave, 'rows'>;
    /** Les appels, le plus récent en premier ou non : seule la date compte. */
    calls: { date: string }[];
    scheduleText?: string | null;
    /** Le titre du dernier récit, pour que Mémo dise ce qu'il vient de retenir. */
    lastTitle?: string | null;
    now?: Date;
}): MemoState {
    const now = (input.now ?? new Date()).getTime();
    if (input.completed) {
        return { age: 5, mood: 'done', headline: 'Votre récit est complet. Mémo garde votre livre jusqu’à l’impression.', note: null, told: 0, total: 0, path: 1 };
    }
    const age = input.phase as MemoAge;
    const stage = input.weave.rows.filter((r) => r.phase === input.phase);
    const told = stage.filter((r) => r.state === 'woven').length;
    const total = stage.length;
    const left = Math.max(1, total - told);
    const path = (age - 1 + (total ? told / total : 0)) / 4;
    const base = { age, told, total, path };

    const last = input.calls.reduce((m, c) => Math.max(m, new Date(c.date).getTime() || 0), 0);
    if (!last) {
        return {
            ...base,
            mood: 'asleep',
            headline: 'Mémo attend votre première histoire.',
            note: input.scheduleText ? `Premier appel ${input.scheduleText} : il se réveillera.` : 'Il se réveillera à votre premier appel.',
        };
    }
    const headline = `Encore ${left} souvenir${left > 1 ? 's' : ''} et Mémo ${MEMO_AGES[age - 1].then}.`;
    const since = now - last;
    if (since < MEMO_FRESH_HOURS * 3600 * 1000) {
        return { ...base, mood: 'fresh', headline, note: input.lastTitle ? `Mémo vient de retenir « ${input.lastTitle} ».` : 'Mémo a retenu votre dernier récit.' };
    }
    if (since > MEMO_WAITING_DAYS * DAY) {
        return {
            ...base,
            mood: 'waiting',
            headline,
            note: input.scheduleText ? `Mémo attend la suite : prochain appel ${input.scheduleText}.` : 'Mémo attend la suite. Appelez quand vous voulez.',
        };
    }
    return { ...base, mood: 'steady', headline, note: input.scheduleText ? `Prochain appel ${input.scheduleText}.` : null };
}
