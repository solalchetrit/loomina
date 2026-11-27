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
    {
        age: 1,
        name: 'Présentation',
        stage: 'Faire connaissance',
        text: 'Mémo est tout petit. Vous faites connaissance : qui vous êtes, d’où vous venez.',
        then: 'grandit',
        event: 'Voici Mémo',
        meaning: 'Mémo n’oublie rien. Il retient chaque souvenir que vous racontez. À chaque souvenir, il grandit, et votre livre avance.',
    },
    {
        age: 2,
        name: 'Racines',
        stage: 'Les racines',
        text: 'Mémo grandit. Vous racontez vos racines : vos parents, votre enfance, l’école.',
        then: 'grandit',
        event: 'Mémo a grandi',
        meaning: 'Vous avez fait connaissance. Prochaine étape, vos racines : vos parents, votre enfance, l’école.',
    },
    {
        age: 3,
        name: 'Vie adulte',
        stage: 'La vie adulte',
        text: 'Mémo grandit encore. Vous racontez votre vie adulte : votre métier, vos amours, vos enfants.',
        then: 'grandit',
        event: 'Mémo a grandi',
        meaning: 'Vos racines sont racontées. Prochaine étape, votre vie adulte : votre métier, vos amours, vos enfants.',
    },
    {
        age: 4,
        name: 'Transmission',
        stage: 'Ce que vous transmettez',
        text: 'Mémo est presque grand. Vous dites ce que vous voulez transmettre : vos valeurs, vos messages.',
        then: 'reçoit votre livre',
        event: 'Mémo a encore grandi',
        meaning: 'Votre vie est racontée. Dernière étape, ce que vous voulez transmettre : vos valeurs, vos messages.',
    },
    {
        age: 5,
        name: 'Le livre',
        stage: 'Votre livre',
        text: 'Votre récit est complet. Mémo tient votre livre.',
        then: '',
        event: 'Mémo tient votre livre',
        meaning: 'Votre récit est complet. Votre livre est prêt à être imprimé.',
    },
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
    /**
     * Espace famille (20/11/2026) : le prénom de la personne qui raconte. Mémo
     * parle alors d'elle à la troisième personne, à celle qui a offert le livre.
     */
    narrator?: string | null;
    now?: Date;
}): MemoState {
    const now = (input.now ?? new Date()).getTime();
    const family = input.narrator !== undefined;
    const who = input.narrator?.trim() || 'votre proche';
    if (input.completed) {
        const headline = family ? `Le récit de ${who} est complet. Mémo tient son livre.` : 'Votre récit est complet. Mémo tient votre livre.';
        return { age: 5, mood: 'done', headline, note: null, told: 0, total: 0, path: 1 };
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
            headline: family ? `Mémo dort. Il se réveillera au premier appel de ${who}.` : 'Mémo dort. Il se réveillera à votre premier appel.',
            note: input.scheduleText ? `Premier appel ${input.scheduleText}.` : family ? `${who} peut appeler quand bon lui semble.` : 'Appelez quand vous voulez.',
        };
    }
    // Ce qui attend l'auteur au bout de l'étape : Mémo grandit, ou le récit est complet
    // (Solal, 26/11/2026 : plus de « prend la plume » ni de « met ses lunettes »).
    const reward = age === 4 ? (family ? `le récit de ${who} est complet` : 'votre récit est complet') : `Mémo ${MEMO_AGES[age - 1].then}`;
    const headline = `Encore ${left} souvenir${left > 1 ? 's' : ''} et ${reward}.`;
    const since = now - last;
    if (since < MEMO_FRESH_HOURS * 3600 * 1000) {
        return { ...base, mood: 'fresh', headline, note: input.lastTitle ? `Mémo vient de retenir « ${input.lastTitle} ».` : family ? `Mémo a retenu le dernier récit de ${who}.` : 'Mémo a retenu votre dernier récit.' };
    }
    if (since > MEMO_WAITING_DAYS * DAY) {
        return {
            ...base,
            mood: 'waiting',
            headline,
            note: input.scheduleText
                ? `Mémo attend la suite. Prochain appel ${input.scheduleText}.`
                : family
                  ? `Mémo attend la suite. Un souvenir à souffler pourrait donner envie à ${who} de rappeler.`
                  : 'Mémo attend la suite. Appelez quand vous voulez.',
        };
    }
    return { ...base, mood: 'steady', headline, note: input.scheduleText ? `Prochain appel ${input.scheduleText}.` : null };
}
