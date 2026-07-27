/**
 * Les phases — source de vérité unique.
 *
 * Avant : `current_phase` était du texte libre généré par GPT
 * (`lower(next_phase)`), comparé ailleurs à "Vue d'Ensemble" capitalisé.
 * Les deux ne se rencontraient jamais, et le client restait bloqué
 * en phase 1 pour toujours, en silence.
 *
 * Maintenant : un entier de 1 à 4. Le seul endroit du code où l'on
 * traduit entre un entier et un libellé, c'est ici.
 */

export type Phase = 1 | 2 | 3 | 4;

export const PHASES: readonly Phase[] = [1, 2, 3, 4] as const;

export const FIRST_PHASE: Phase = 1;
export const LAST_PHASE: Phase = 4;

/** Clé utilisée dans la table `system_prompts`. */
export const PHASE_KEYS: Record<Phase, string> = {
    1: 'vue_ensemble',
    2: 'construction',
    3: 'accomplissements',
    4: 'messages',
};

/** Libellé affiché à l'utilisateur (site, emails, dashboard). */
export const PHASE_LABELS: Record<Phase, string> = {
    1: "Vue d'ensemble",
    2: 'Construction',
    3: 'Accomplissements',
    4: 'Messages',
};

/** Ce que la phase cherche à obtenir — injecté dans le prompt du Directeur. */
export const PHASE_GOALS: Record<Phase, string> = {
    1: "Établir la confiance, poser le cadre du projet, recueillir l'identité (nom, naissance, lieux) et esquisser une timeline de vie grossière.",
    2: "Explorer l'enfance, les racines familiales, les lieux d'origine, les figures marquantes de la jeunesse.",
    3: "Explorer la vie adulte : carrière, réalisations, passions, rencontres décisives, épreuves surmontées.",
    4: "Recueillir l'héritage moral : messages aux proches, valeurs transmises, regard rétrospectif sur la vie. C'est la phase de clôture du livre.",
};

export function isPhase(value: unknown): value is Phase {
    return value === 1 || value === 2 || value === 3 || value === 4;
}

/**
 * Convertit n'importe quelle valeur héritée en `Phase`.
 *
 * Tolère : entiers, chaînes numériques, libellés français avec ou sans
 * accents, apostrophes droites ou typographiques, underscores, casse
 * quelconque. Retombe sur la phase 1 plutôt que de lever une exception :
 * un client au téléphone ne doit jamais s'interrompre à cause d'une
 * valeur inattendue en base.
 */
export function toPhase(value: unknown, fallback: Phase = FIRST_PHASE): Phase {
    if (isPhase(value)) return value;

    if (typeof value === 'number' && Number.isInteger(value)) {
        return isPhase(value) ? value : fallback;
    }

    if (typeof value !== 'string') return fallback;

    const raw = value.trim();
    if (raw === '') return fallback;

    const asNumber = Number(raw);
    if (Number.isInteger(asNumber) && isPhase(asNumber)) return asNumber;

    // Normalisation : minuscules, accents retirés, apostrophes et
    // séparateurs remplacés par des espaces, espaces multiples réduits.
    const n = raw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')       // accents combinants
        .replace(/[\u0027\u2018\u2019_-]/g, ' ') // apostrophes et separateurs
        .replace(/\s+/g, ' ')
        .trim();

    if (n.includes('vue d ensemble') || n.includes('vue ensemble') || n.includes('overview')) return 1;
    if (n.includes('construction') || n.includes('enfance')) return 2;
    if (n.includes('accomplissement') || n.includes('carriere')) return 3;
    if (n.includes('message') || n.includes('heritage')) return 4;

    // Make écrivait `lower("Completed")` dans `current_phase` en fin de
    // phase 4 : un projet terminé reste sur la dernière phase.
    if (n.includes('complet') || n.includes('termine') || n.includes('fini')) return LAST_PHASE;

    return fallback;
}

export function phaseKey(phase: Phase): string {
    return PHASE_KEYS[phase];
}

export function isFinalPhase(phase: Phase): boolean {
    return phase >= LAST_PHASE;
}

/**
 * Phase suivante selon la progression mesurée par le Directeur.
 *
 * Règle unique et centralisée : on n'avance que si la phase courante
 * est jugée complète à 100 %. Auparavant chacun des quatre modules Make
 * portait sa propre variante de cette règle, et elles avaient divergé.
 */
export function nextPhase(current: Phase, progressPercentage: number): Phase {
    if (progressPercentage < 100) return current;
    if (isFinalPhase(current)) return current;
    return (current + 1) as Phase;
}
