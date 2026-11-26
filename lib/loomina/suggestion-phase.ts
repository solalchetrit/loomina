import { isPhase, type Phase } from './phases';

/**
 * À quelle période de la vie appartient un souvenir soufflé ?
 *
 * Demande de Solal (26/11/2026) : « si j'offre le livre à ma grand-mère et
 * que je veux connaître sa rencontre avec mon grand-père, il ne faut pas lui
 * poser la question au premier appel, mais lors de la phase correspondante ».
 *
 * Avant : chaque sujet suggéré (espace auteur, espace famille, photo, proche
 * ajouté) était posé au premier appel, puis en priorité à chaque appel.
 * Maintenant : à l'enregistrement, un petit modèle range le sujet dans une
 * des quatre phases du livre. Le sujet attend que le livre arrive à cette
 * phase (ou l'ait dépassée) avant d'être proposé à la voix. Au premier appel,
 * seuls les sujets de la vue d'ensemble passent.
 *
 * Le rangement vit dans `project_metadata.suggestion_phases`
 * ({ texte en minuscules: phase }). Un sujet sans rangement (modèle en panne,
 * sujet ancien) n'est pas bloqué : la voix le reçoit avec la consigne de
 * n'en parler que s'il touche la période en cours ou une période déjà racontée.
 */

export const SUGGESTION_PHASES_KEY = 'suggestion_phases';

export const keyOf = (topic: string) => topic.trim().toLowerCase();

/** Le rangement déjà connu de chaque sujet. */
export function readSuggestionPhases(meta: Record<string, unknown> | null | undefined): Record<string, Phase> {
    const raw = meta?.[SUGGESTION_PHASES_KEY];
    const out: Record<string, Phase> = {};
    if (raw && typeof raw === 'object') {
        for (const [k, v] of Object.entries(raw as Record<string, unknown>)) if (isPhase(v)) out[k] = v;
    }
    return out;
}

/**
 * Range un sujet et renvoie le `project_metadata` à écrire. Ne garde que les
 * sujets encore en attente, pour que la table ne grossisse pas.
 */
export function withSuggestionPhase(
    meta: Record<string, unknown> | null | undefined,
    topic: string,
    phase: Phase | null,
    pending: string[]
): Record<string, unknown> {
    const keep = new Set(pending.map(keyOf));
    const known = Object.fromEntries(Object.entries(readSuggestionPhases(meta)).filter(([k]) => keep.has(k)));
    if (phase) known[keyOf(topic)] = phase;
    return { ...(meta ?? {}), [SUGGESTION_PHASES_KEY]: known };
}

/**
 * Les sujets que la voix peut aborder à cet appel, et ceux qui attendent leur
 * période. Premier appel : seulement la vue d'ensemble (phase 1). Ensuite :
 * tout sujet dont la période est la période en cours ou une période passée.
 */
export function suggestionsForCall(
    suggestions: string[],
    meta: Record<string, unknown> | null | undefined,
    phaseNow: Phase,
    first: boolean
): { now: string[]; unsure: string[]; later: number } {
    const phases = readSuggestionPhases(meta);
    const now: string[] = [];
    const unsure: string[] = [];
    let later = 0;
    for (const t of suggestions) {
        const p = phases[keyOf(t)];
        if (!p) {
            if (first) later++;
            else unsure.push(t);
        } else if (first ? p === 1 : p <= phaseNow) now.push(t);
        else later++;
    }
    return { now, unsure, later };
}
