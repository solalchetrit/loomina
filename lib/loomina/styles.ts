/**
 * Les quatre tons d'écriture proposés dans l'espace auteur (Réglages), et ce
 * que chacun veut dire pour l'Écrivain du récit et pour celui du livre.
 *
 * Avant le 20/11/2026, seul le nom du ton était envoyé, sans explication, et
 * l'écriture du livre imposait en plus « sobre, chaleureux ». La commande
 * mettait « Naturel », qui n'est pas un des quatre choix : on le lit comme
 * « Naturel et sobre ».
 */

export const WRITING_STYLES = ['Naturel et sobre', 'Chaleureux et vivant', 'Littéraire et soigné', 'Simple, comme je parle'] as const;
export const DEFAULT_WRITING_STYLE = 'Naturel et sobre';

const GUIDES: Record<(typeof WRITING_STYLES)[number], string> = {
    'Naturel et sobre':
        "Un français écrit, clair et direct, comme un bon livre de souvenirs. Phrases simples et de longueurs variées, peu d'adjectifs, aucune emphase. Les expressions de la personne qui ont du caractère sont gardées ; le parler familier ou relâché (« comme un ouf », « très chill », « trop bien ») est transposé en français écrit courant, sauf entre guillemets quand c'est une phrase rapportée.",
    'Chaleureux et vivant':
        "Un français écrit, vivant et proche. Plus de rythme, de l'humour quand la personne en a, ses expressions gardées plus souvent, les gens et leurs mots bien présents. Toujours sans emphase ni sentiment ajouté : la chaleur vient des faits et des paroles, jamais d'adjectifs.",
    'Littéraire et soigné':
        "Un français écrit soigné, comme un récit publié. Phrases construites, transitions travaillées, vocabulaire précis et juste, ouvertures et fins de paragraphe qui se tiennent. Le parler oral est entièrement transposé à l'écrit, sauf les phrases rapportées entre guillemets. Toujours sans lyrisme, sans grands mots, et sans rien ajouter aux faits.",
    'Simple, comme je parle':
        "Au plus près de la façon de parler de la personne : ses mots, ses tournures, son vocabulaire, même familier. On retire seulement les hésitations, les reprises et les « euh », et on remet les phrases dans l'ordre pour qu'elles se lisent bien.",
};

/** Le ton enregistré, ramené à l'un des quatre (« Naturel » ou vide = le défaut). */
export function normalizeStyle(style: string | null | undefined): string {
    const s = style?.trim();
    if (!s || s.toLowerCase() === 'naturel') return DEFAULT_WRITING_STYLE;
    return s;
}

/** Le bloc « style » donné aux Écrivains : le nom du ton et ce qu'il veut dire. */
export function styleGuide(style: string | null | undefined): string {
    const s = normalizeStyle(style);
    const guide = GUIDES[s as (typeof WRITING_STYLES)[number]];
    return guide ? `« ${s} » : ${guide}` : `« ${s} » (demandé par la personne). Applique-le sans rien inventer.`;
}
