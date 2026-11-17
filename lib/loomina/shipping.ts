/**
 * L'adresse où envoyer le livre relié.
 *
 * Demandée dans l'espace auteur une fois le livre terminé (choix de Solal,
 * 17/11/2026 : pas à la commande). Gardée dans
 * `projects.project_metadata.shipping`.
 */

export interface Shipping {
    name: string;
    line1: string;
    line2: string | null;
    postalCode: string;
    city: string;
    at: string;
}

const clean = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Renvoie l'adresse propre, ou le message d'erreur à montrer à l'auteur. */
export function parseShipping(body: Record<string, unknown>): Shipping | string {
    const name = clean(body.name, 120);
    const line1 = clean(body.line1, 160);
    const line2 = clean(body.line2, 160);
    const postalCode = clean(body.postalCode, 10).replace(/\s/g, '');
    const city = clean(body.city, 100);
    if (!name || !line1 || !city) return 'Merci d’indiquer le nom, l’adresse et la ville.';
    // Livraison en France métropolitaine (voir config/offer.ts).
    if (!/^\d{5}$/.test(postalCode)) return 'Le code postal doit compter cinq chiffres.';
    return { name, line1, line2: line2 || null, postalCode, city, at: new Date().toISOString() };
}

export function readShipping(meta: Record<string, unknown> | null | undefined): Shipping | null {
    const s = meta?.shipping as Partial<Shipping> | undefined;
    if (!s || typeof s !== 'object' || typeof s.line1 !== 'string' || typeof s.city !== 'string') return null;
    return { name: s.name ?? '', line1: s.line1, line2: s.line2 ?? null, postalCode: s.postalCode ?? '', city: s.city, at: s.at ?? '' };
}

export const shippingLines = (s: Shipping): string[] => [s.name, s.line1, ...(s.line2 ? [s.line2] : []), `${s.postalCode} ${s.city}`];
