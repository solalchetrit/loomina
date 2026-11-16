/**
 * Durée d'appel souhaitée : choisie par l'offreur à la commande ou par
 * l'auteur dans son espace. Gardée dans
 * `projects.project_metadata.call_minutes`, lue par le serveur vocal.
 *
 * Règle voulue par Solal (16/11/2026) : avant la durée visée, Loomina ne
 * propose jamais d'arrêter. Une fois la durée atteinte, elle continue
 * tant que le sujet en cours a encore à donner, et ne propose de terminer
 * qu'au moment où la personne laisse entendre qu'il n'y a plus grand-chose
 * à dire sur ce sujet. Seules exceptions : la fatigue, ou une demande
 * d'arrêter.
 */

export const CALL_MINUTES_OPTIONS = [15, 20, 30, 45] as const;
export const DEFAULT_CALL_MINUTES = 20;

/** Marge laissée après la durée visée pour finir le sujet en cours. */
const OVERTIME_MINUTES = 20;

export function normalizeCallMinutes(v: unknown): number {
    const n = Number(v);
    return (CALL_MINUTES_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_CALL_MINUTES;
}

/** Plafond dur de l'appel : la durée visée plus de quoi clore le sujet. */
export function hardLimitSeconds(targetMinutes: number, floorSeconds: number): number {
    return Math.max(floorSeconds, (targetMinutes + OVERTIME_MINUTES) * 60);
}

/**
 * Note glissée au modèle à chaque réplique : il ne voit pas l'heure.
 * Avant : « après une vingtaine d'échanges, propose d'arrêter » donnait un
 * appel de 4 minutes avec des réponses courtes.
 */
export function timeNote(elapsedSeconds: number, targetMinutes: number): string {
    const elapsed = Math.floor(elapsedSeconds / 60);
    const head = `# TEMPS DE L'APPEL\n${elapsed} min écoulées sur environ ${targetMinutes} min souhaitées.`;
    if (elapsed < targetMinutes) {
        return `${head}
La durée souhaitée n'est pas atteinte : ne propose pas d'arrêter et n'annonce pas la fin. Si le souvenir en cours est épuisé (« je ne sais plus », « pas vraiment », réponses très courtes), ne creuse pas davantage : passe à un autre souvenir ou à un autre sujet de la phase.
Exception : si la personne semble fatiguée ou demande à arrêter, respecte-le tout de suite.`;
    }
    return `${head}
La durée souhaitée est atteinte. N'ouvre plus de nouveau sujet, mais continue le sujet en cours tant qu'il a encore à donner. Dès que la personne laisse entendre qu'il n'y a plus grand-chose à raconter sur ce sujet, propose-lui gentiment d'arrêter là pour aujourd'hui, en une phrase, et attends sa réponse. Si elle veut continuer, continue.`;
}
