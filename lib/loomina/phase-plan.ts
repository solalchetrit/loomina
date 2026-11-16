/**
 * Ce qui fait avancer un livre d'une phase à la suivante.
 *
 * RÈGLE (Solal, 16/11/2026) : on change de phase selon la quantité
 * d'information reçue sur la phase en cours, jamais selon un nombre
 * d'appels, et seulement après l'avoir demandé à la personne.
 *
 * Chaque phase a une liste de sujets. Après chaque appel, le Directeur dit
 * lesquels sont couverts ; un sujet coché le reste. Quand tous le sont, le
 * code note que la question est à poser (`check: 'to_ask'`). Au début de
 * l'appel suivant, Loomina demande : « on ajoute quelque chose, ou on passe
 * à la suite ? ». La réponse, lue par le Directeur, décide.
 *
 * Avant : un pourcentage estimé par le modèle à chaque appel, sans mémoire
 * du précédent. Sur un livre simulé de huit appels, il a fait 62, 82, 68,
 * 86, 80, 92, 88, 88 % : le projet n'a jamais quitté la phase 1.
 *
 * L'état vit dans `projects.project_metadata.phase_state`.
 */

import type { Phase } from './phases';
import { isFinalPhase, isPhase } from './phases';

export interface Axis {
    key: string;
    label: string;
}

export const PHASE_AXES: Record<Phase, Axis[]> = {
    1: [
        { key: 'identite', label: 'Le nom et la naissance (année ou date, lieu)' },
        { key: 'famille', label: 'Les parents et la fratrie, au moins nommés' },
        { key: 'lieux', label: 'Les lieux où la personne a vécu' },
        { key: 'etapes', label: 'Les grandes étapes de la vie adulte, au moins nommées : métier, vie de famille' },
    ],
    2: [
        { key: 'maison', label: "La maison et les lieux de l'enfance" },
        { key: 'proches', label: 'Les parents, grands-parents, frères et sœurs : un geste, une phrase, une habitude' },
        { key: 'ecole', label: "L'école, les jeux, les fêtes, les premières fois" },
        { key: 'figures', label: 'Les personnes qui ont compté dans la jeunesse (un instituteur, un voisin, un ami)' },
        { key: 'depart', label: "L'adolescence et le moment où l'on quitte la maison" },
    ],
    3: [
        { key: 'metier', label: 'Le métier' },
        { key: 'couple', label: 'La rencontre, le couple, les enfants' },
        { key: 'lieux_adulte', label: 'Les lieux de vie adulte, les maisons, les déménagements' },
        { key: 'passions', label: 'Les passions, les voyages' },
        { key: 'epreuves', label: "Les épreuves traversées (couvert aussi si la personne a dit ne pas vouloir en parler, ou qu'il n'y en a pas eu)" },
    ],
    4: [
        { key: 'lecons', label: 'Ce que la vie lui a appris, ce que la personne referait ou non' },
        { key: 'valeurs', label: 'Les valeurs à transmettre' },
        { key: 'messages', label: "Les messages aux proches (couvert aussi si la personne ne souhaite pas en laisser)" },
        { key: 'aujourdhui', label: "La vie d'aujourd'hui" },
        { key: 'fin', label: 'Comment la personne aimerait que le livre se termine' },
    ],
};

/** Quand un sujet est-il couvert ? Injecté dans le prompt du Directeur. */
export const AXIS_RULE: Record<Phase, string> = {
    1: "Un sujet est couvert dès que le fait est connu (dit dans cet appel ou déjà en mémoire). Aucune anecdote n'est nécessaire : la phase 1 est une vue d'ensemble.",
    2: "Un sujet est couvert quand le narrateur a raconté dessus au moins une scène concrète (un lieu, des gens, ce qu'on se disait), dans cet appel ou d'après la mémoire. Un fait simplement nommé ne suffit pas.",
    3: "Un sujet est couvert quand le narrateur a raconté dessus au moins une scène concrète, dans cet appel ou d'après la mémoire. Un fait simplement nommé ne suffit pas.",
    4: "Un sujet est couvert quand le narrateur s'est réellement exprimé dessus, avec ses mots.",
};

/** La phase telle que Loomina la nomme au téléphone. */
export function spokenPhase(phase: Phase, tu: boolean): string {
    const p = tu ? 'ta' : 'votre';
    const t = tu ? 'tu veux' : 'vous voulez';
    return {
        1: `les grandes lignes de ${p} vie`,
        2: `${tu ? 'ton' : 'votre'} enfance et ${p} jeunesse`,
        3: `${p} vie d'adulte`,
        4: `ce que ${t} transmettre`,
    }[phase];
}

export interface PhaseState {
    phase: Phase;
    /** Clés des sujets couverts dans la phase en cours. */
    covered: string[];
    /**
     * `to_ask` : tous les sujets sont couverts, Loomina doit demander à la
     *            personne si elle veut ajouter quelque chose ou passer à la suite.
     * `wait`   : la personne vient de dire qu'elle voulait ajouter ; on ne
     *            repose pas la question à l'appel d'après.
     */
    check: 'to_ask' | 'wait' | null;
}

export type PhaseAnswer = 'advance' | 'stay' | 'none';

const validKeys = (phase: Phase, keys: unknown): string[] => {
    const known = new Set(PHASE_AXES[phase].map((a) => a.key));
    return Array.isArray(keys) ? [...new Set(keys.map(String).filter((k) => known.has(k)))] : [];
};

/** L'état de la phase en cours ; vide si rien n'est enregistré ou s'il date d'une autre phase. */
export function readPhaseState(metadata: Record<string, unknown> | null | undefined, phase: Phase): PhaseState {
    const raw = (metadata?.phase_state ?? null) as Record<string, unknown> | null;
    if (!raw || !isPhase(raw.phase) || raw.phase !== phase) return { phase, covered: [], check: null };
    return {
        phase,
        covered: validKeys(phase, raw.covered),
        check: raw.check === 'to_ask' || raw.check === 'wait' ? raw.check : null,
    };
}

export function coverage(phase: Phase, covered: string[]): number {
    const total = PHASE_AXES[phase].length;
    return Math.round((100 * validKeys(phase, covered).length) / total);
}

export interface PhaseStep {
    /** État à enregistrer (celui de la phase suivante si on avance). */
    state: PhaseState;
    nextPhase: Phase;
    /** Part des sujets couverts dans la phase qui sera en cours après cet appel. */
    progress: number;
    /** La personne a confirmé que le livre est complet (phase 4). */
    completed: boolean;
}

/**
 * Applique un appel à l'état de la phase. Décidé par le CODE : le modèle
 * ne fournit que les sujets couverts et la réponse de la personne.
 */
export function stepPhase(before: PhaseState, coveredNow: unknown, answer: PhaseAnswer): PhaseStep {
    const phase = before.phase;
    const covered = [...new Set([...before.covered, ...validKeys(phase, coveredNow)])];
    const complete = covered.length === PHASE_AXES[phase].length;
    const stay = (check: PhaseState['check']): PhaseStep => ({
        state: { phase, covered, check },
        nextPhase: phase,
        progress: coverage(phase, covered),
        completed: false,
    });

    if (before.check === 'to_ask') {
        if (answer === 'advance') {
            if (isFinalPhase(phase)) return { ...stay(null), completed: true };
            const next = (phase + 1) as Phase;
            return { state: { phase: next, covered: [], check: null }, nextPhase: next, progress: 0, completed: false };
        }
        // « J'ai encore des choses à dire » : on reste, et on ne repose pas
        // la question à l'appel d'après. Sans réponse, elle reste à poser.
        return stay(answer === 'stay' ? 'wait' : 'to_ask');
    }
    return stay(complete ? 'to_ask' : null);
}
