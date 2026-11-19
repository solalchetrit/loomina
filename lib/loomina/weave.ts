/**
 * La toile du livre : la progression de l'espace auteur, montrée comme une
 * toile de lin qui se tisse sur un métier (Solal, 19/11/2026 : une
 * « gamification visuelle » qui donne envie de finir le livre et qui porte
 * la marque). Loomina vient de « loom », le métier à tisser, et le livre est
 * habillé de toile : chaque sujet raconté ajoute un rang à la toile qui
 * couvrira le livre.
 *
 * Rien n'est inventé ici : les rangs sont les sujets du plan du livre
 * (PHASE_AXES), leur état vient de l'état de phase tenu par le Directeur,
 * et les fils d'or sont des gestes réellement faits (un appel, une photo…).
 */
import type { Phase } from './phases';
import { PHASES } from './phases';
import { PHASE_AXES, type PhaseState } from './phase-plan';

/** Le nom de chaque sujet, tel qu'on le dit à l'auteur (les libellés de PHASE_AXES parlent au Directeur). */
const ROW_LABELS: Record<string, string> = {
    identite: 'Votre naissance',
    famille: 'Votre famille',
    lieux: 'Vos lieux de vie',
    etapes: 'Votre parcours',
    heritage: 'L’histoire de votre famille',
    maison: 'La maison d’enfance',
    proches: 'Ceux de la maison',
    quotidien: 'Les jours d’enfance',
    ecole: 'L’école',
    figures: 'Ceux qui ont compté',
    depart: 'L’adolescence et le départ',
    metier: 'Vos journées, votre métier',
    couple: 'Les amours',
    enfants: 'Les enfants',
    lieux_adulte: 'Vos maisons',
    amis: 'Les amitiés',
    passions: 'Passions et voyages',
    convictions: 'Vos convictions',
    epreuves: 'Les épreuves',
    retraite: 'Le changement de rythme',
    personnalite: 'Votre caractère',
    lecons: 'Ce que la vie vous a appris',
    valeurs: 'Vos valeurs',
    monde: 'Le monde qui change',
    descendance: 'Les plus jeunes',
    messages: 'Vos messages',
    aujourdhui: 'Aujourd’hui et demain',
    fin: 'Le mot de la fin',
};

export const WEAVE_STAGES: Record<Phase, string> = {
    1: 'Faire connaissance',
    2: 'Les racines',
    3: 'La vie adulte',
    4: 'Ce que vous transmettez',
};

export interface WeaveRow {
    key: string;
    label: string;
    phase: Phase;
    /** woven : raconté. next : le prochain rang. open : à venir. */
    state: 'woven' | 'next' | 'open';
}

export interface GoldThread {
    key: string;
    label: string;
    /** Ce qu'il faut faire pour l'obtenir, ou ce qui l'a valu. */
    hint: string;
    earned: boolean;
}

export interface Weave {
    rows: WeaveRow[];
    /** Rangs tissés / rangs en tout, sans les sujets qui ne concernent pas la personne. */
    woven: number;
    total: number;
    gold: GoldThread[];
}

/** Une page imprimée compte environ 250 mots. */
const WORDS_PER_PAGE = 250;

export function buildWeave(input: {
    phase: Phase;
    completed: boolean;
    state: Pick<PhaseState, 'covered' | 'skipped'>;
    calls: number;
    words: number;
    photos: number;
    hasTitle: boolean;
    hasSchedule: boolean;
}): Weave {
    const rows: WeaveRow[] = [];
    let nextGiven = false;
    for (const phase of PHASES) {
        for (const axis of PHASE_AXES[phase]) {
            const past = input.completed || phase < input.phase;
            if (phase === input.phase && !input.completed && input.state.skipped.includes(axis.key)) continue;
            let state: WeaveRow['state'] = past || (phase === input.phase && input.state.covered.includes(axis.key)) ? 'woven' : 'open';
            if (state === 'open' && !nextGiven) {
                state = 'next';
                nextGiven = true;
            }
            rows.push({ key: axis.key, label: ROW_LABELS[axis.key] ?? axis.label, phase, state });
        }
    }
    const pages = Math.round(input.words / WORDS_PER_PAGE);
    const gold: GoldThread[] = [
        { key: 'premier-appel', label: 'Le premier appel', hint: 'Le jour où tout a commencé.', earned: input.calls >= 1 },
        { key: 'rendez-vous', label: 'Le rendez-vous', hint: 'Choisissez un jour et une heure : Loomina vous appelle.', earned: input.hasSchedule },
        { key: 'photo', label: 'La première photo', hint: 'Ajoutez une photo à votre livre.', earned: input.photos >= 1 },
        { key: 'titre', label: 'Le titre', hint: 'Donnez un titre à votre livre.', earned: input.hasTitle },
        { key: 'cinq-appels', label: 'Cinq appels', hint: 'Votre cinquième appel avec Loomina.', earned: input.calls >= 5 },
        { key: 'cinquante', label: 'Cinquante pages', hint: 'Votre récit atteint cinquante pages.', earned: pages >= 50 },
        { key: 'cent', label: 'Cent pages', hint: 'Votre récit atteint cent pages.', earned: pages >= 100 },
        { key: 'fin', label: 'Le dernier rang', hint: 'Votre récit est complet.', earned: input.completed },
    ];
    return { rows, woven: rows.filter((r) => r.state === 'woven').length, total: rows.length, gold };
}
