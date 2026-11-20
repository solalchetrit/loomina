/**
 * Ce qui arrive au livre une fois terminé (demande de Solal, 20/11/2026).
 *
 * Avant : l'auteur terminait, puis plus rien jusqu'au colis. Désormais le
 * livre passe par cinq étapes, que l'équipe fait avancer depuis l'admin
 * (page « Livres » et page de relecture). Le client voit l'étape dans son
 * espace, et il est prévenu par SMS et par e-mail à chaque étape (une fois).
 *
 *   terminé  → l'auteur a dit que son livre est complet (projects.status)
 *   relu     → l'équipe l'a relu : la version complète est à lire en ligne
 *   imprimé  → envoyé à l'imprimeur
 *   expédié  → parti, avec son numéro de suivi
 *   reçu     → arrivé (noté par l'équipe, sans message au client)
 *
 * Tout tient dans `projects.project_metadata` : reviewed_at (déjà utilisé
 * avant), printed_at, shipped_at, delivered_at, tracking, et
 * fulfillment_notified (les étapes déjà annoncées au client).
 */

export type BookStage = 'writing' | 'completed' | 'reviewed' | 'printing' | 'shipped' | 'delivered';

/** Les étapes que l'équipe fait avancer, dans l'ordre. */
export const TEAM_STEPS = ['reviewed', 'printing', 'shipped', 'delivered'] as const;
export type TeamStep = (typeof TEAM_STEPS)[number];

export const STEP_KEY: Record<TeamStep, string> = {
    reviewed: 'reviewed_at',
    printing: 'printed_at',
    shipped: 'shipped_at',
    delivered: 'delivered_at',
};

export interface Tracking {
    number: string;
    url: string;
}

export interface Fulfillment {
    stage: BookStage;
    completed: boolean;
    reviewedAt: string | null;
    printedAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    tracking: Tracking | null;
}

type Meta = Record<string, unknown> | null | undefined;

const at = (meta: Meta, key: string): string | null => (typeof meta?.[key] === 'string' ? (meta[key] as string) : null);

export function readTracking(meta: Meta): Tracking | null {
    const t = meta?.tracking as Partial<Tracking> | undefined;
    if (!t || typeof t.number !== 'string' || !t.number.trim()) return null;
    return { number: t.number, url: typeof t.url === 'string' && t.url ? t.url : trackingUrl(t.number) };
}

/** Lien de suivi par défaut : La Poste (Colissimo et Lettre suivie). */
export function trackingUrl(number: string): string {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(number.replace(/\s+/g, ''))}`;
}

/** Nettoie un numéro et un lien saisis dans l'admin. Renvoie null si le numéro manque. */
export function parseTracking(numberRaw: unknown, urlRaw: unknown): Tracking | null {
    const number = typeof numberRaw === 'string' ? numberRaw.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    if (!number) return null;
    const url = typeof urlRaw === 'string' ? urlRaw.trim().slice(0, 300) : '';
    return { number, url: /^https:\/\/\S+$/.test(url) ? url : trackingUrl(number) };
}

export function readFulfillment(status: string | null | undefined, meta: Meta): Fulfillment {
    const completed = status === 'completed';
    const f = {
        completed,
        reviewedAt: at(meta, 'reviewed_at'),
        printedAt: at(meta, 'printed_at'),
        shippedAt: at(meta, 'shipped_at'),
        deliveredAt: at(meta, 'delivered_at'),
        tracking: readTracking(meta),
    };
    const stage: BookStage = !completed
        ? 'writing'
        : f.deliveredAt
          ? 'delivered'
          : f.shippedAt
            ? 'shipped'
            : f.printedAt
              ? 'printing'
              : f.reviewedAt
                ? 'reviewed'
                : 'completed';
    return { stage, ...f };
}

/** L'étape suivante que l'équipe peut franchir, ou null. */
export function nextTeamStep(stage: BookStage): TeamStep | null {
    switch (stage) {
        case 'completed':
            return 'reviewed';
        case 'reviewed':
            return 'printing';
        case 'printing':
            return 'shipped';
        case 'shipped':
            return 'delivered';
        default:
            return null;
    }
}

/** L'étape d'avant (pour « annuler la dernière étape »). */
export function previousTeamStep(stage: BookStage): TeamStep | null {
    return stage === 'reviewed' || stage === 'printing' || stage === 'shipped' || stage === 'delivered' ? stage : null;
}

/** Libellés de l'admin. */
export const STAGE_ADMIN: Record<BookStage, { label: string; action?: string; tone: 'ok' | 'wait' | 'bad' | 'muted' }> = {
    writing: { label: 'En cours d’écriture', tone: 'muted' },
    completed: { label: 'À relire', action: 'J’ai relu ce livre', tone: 'wait' },
    reviewed: { label: 'Relu, à imprimer', action: 'Envoyé à l’imprimeur', tone: 'wait' },
    printing: { label: 'À l’impression', action: 'Livre expédié', tone: 'wait' },
    shipped: { label: 'Expédié', action: 'Livre reçu', tone: 'ok' },
    delivered: { label: 'Reçu', tone: 'ok' },
};

/** Les étapes telles que le client les voit, dans son espace. */
export const CLIENT_STEPS: Array<{ stage: Exclude<BookStage, 'writing'>; label: string }> = [
    { stage: 'completed', label: 'Terminé' },
    { stage: 'reviewed', label: 'Relu' },
    { stage: 'printing', label: 'À l’impression' },
    { stage: 'shipped', label: 'Expédié' },
    { stage: 'delivered', label: 'Reçu' },
];

export const STAGE_ORDER: BookStage[] = ['writing', 'completed', 'reviewed', 'printing', 'shipped', 'delivered'];

/** La phrase d'état, pour l'auteur (vous) ou la famille (prénom). */
export function stageSentence(f: Fulfillment, who: { firstName?: string | null; family?: boolean } = {}): string {
    const name = who.firstName?.trim() || 'votre proche';
    const sonVotre = who.family ? `le livre de ${name}` : 'votre livre';
    const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    switch (f.stage) {
        case 'completed':
            return `${Cap(sonVotre)} est terminé. Notre équipe le relit en entier avant l’impression.`;
        case 'reviewed':
            return `${Cap(sonVotre)} est relu. Sa version complète est à lire ici, avant son départ à l’impression.`;
        case 'printing':
            return `${Cap(sonVotre)} est à l’impression. Nous vous prévenons dès qu’il part.`;
        case 'shipped':
            return `${Cap(sonVotre)} est parti${f.tracking ? ` : suivez le colis avec le numéro ${f.tracking.number}` : ''}.`;
        case 'delivered':
            return `${Cap(sonVotre)} est arrivé. Bonne lecture.`;
        default:
            return '';
    }
}
