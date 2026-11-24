import type Stripe from 'stripe';
import { EXTRA_COPY, OFFER } from '@/config/offer';
import { stripe } from '@/lib/stripe';

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
    /** Où ils ont été commandés : avec le livre, depuis l'espace auteur ou l'espace famille. */
    source: 'commande' | 'auteur' | 'famille';
    stripe_session_id: string;
    at: string;
    /** Espaces auteur et famille : qui a commandé. */
    by?: { first_name: string | null; phone: string } | null;
    /** L'adresse où envoyer ces exemplaires, si elle a été demandée (sinon, avec le livre de l'auteur). */
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

/**
 * La page de paiement Stripe d'exemplaires en plus, depuis l'espace auteur ou
 * l'espace famille. Le webhook les note sur le livre une fois payés
 * (app/api/webhook/stripe, metadata.kind = extra_copies).
 * `askAddress` : Stripe demande où les envoyer (un proche, ou un livre déjà parti).
 */
export async function createExtraCopiesCheckout(params: {
    origin: string;
    projectId: string;
    copies: number;
    source: 'auteur' | 'famille';
    byPhone: string;
    byFirstName: string | null;
    askAddress: boolean;
}): Promise<string | null> {
    const session = await stripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [extraCopiesLineItem(params.copies)],
        ...(params.askAddress ? { shipping_address_collection: { allowed_countries: ['FR'] } } : {}),
        allow_promotion_codes: true,
        success_url: `${params.origin}/dashboard?exemplaires=merci`,
        cancel_url: `${params.origin}/dashboard`,
        expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
        // Pas de metadata.email : ce n'est pas une commande de livre, aucune relance de panier.
        metadata: {
            kind: 'extra_copies',
            source: params.source,
            projectId: params.projectId,
            copies: String(params.copies),
            unitPrice: String(EXTRA_COPY.price),
            byPhone: params.byPhone,
            byFirstName: params.byFirstName ?? '',
        },
    });
    return session.url;
}
