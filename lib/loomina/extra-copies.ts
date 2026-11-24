import type Stripe from 'stripe';
import { EXTRA_COPY, OFFER } from '@/config/offer';

/**
 * Les exemplaires en plus du livre de l'auteur (Solal, 24/11/2026).
 * Commandés à la commande du livre ou plus tard depuis l'espace famille.
 * Chaque achat est noté dans project_metadata.extra_copies : l'équipe les
 * imprime et les envoie avec le livre de l'auteur.
 */

export interface ExtraCopiesOrder {
    copies: number;
    /** Prix unitaire payé, en euros (le prix peut changer ensuite). */
    unit_price: number;
    source: 'commande' | 'famille';
    stripe_session_id: string;
    at: string;
    /** Espace famille : qui a commandé. */
    by?: { first_name: string | null; phone: string } | null;
    /** Espace famille : l'adresse où envoyer ces exemplaires (sinon, avec le livre de l'auteur). */
    shipping?: string | null;
}

/** La ligne Stripe des exemplaires en plus. */
export function extraCopiesLineItem(copies: number): Stripe.Checkout.SessionCreateParams.LineItem {
    return {
        price_data: {
            currency: 'eur',
            product_data: {
                name: 'Exemplaire en plus du livre',
                description: `Le même livre imprimé (${OFFER.format}), envoyé avec celui de l’auteur.`,
            },
            unit_amount: EXTRA_COPY.price * 100,
        },
        quantity: copies,
    };
}

export function extraCopiesOrders(meta: unknown): ExtraCopiesOrder[] {
    const list = meta && typeof meta === 'object' ? (meta as Record<string, unknown>).extra_copies : null;
    if (!Array.isArray(list)) return [];
    return list.filter((o): o is ExtraCopiesOrder => !!o && typeof o === 'object' && typeof (o as ExtraCopiesOrder).copies === 'number');
}

/** Le nombre total d'exemplaires en plus à imprimer pour ce livre. */
export function totalExtraCopies(meta: unknown): number {
    return extraCopiesOrders(meta).reduce((sum, o) => sum + o.copies, 0);
}
