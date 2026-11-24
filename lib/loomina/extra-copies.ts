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
 * Le paiement d'exemplaires en plus, depuis l'espace auteur ou l'espace
 * famille. Comme la commande (app/api/checkout) : paiement intégré au site
 * (Stripe ui_mode « custom », dessiné par components/order/Payment.tsx),
 * sans page Stripe (Solal, 24/11/2026). Sans clé publiable, page Stripe externe.
 * L'adresse, quand il en faut une, est demandée par le site lui-même.
 * Le webhook note les exemplaires sur le livre une fois payés
 * (app/api/webhook/stripe, metadata.kind = extra_copies).
 */
export async function createExtraCopiesCheckout(params: {
    origin: string;
    projectId: string;
    copies: number;
    source: 'auteur' | 'famille';
    byPhone: string;
    byFirstName: string | null;
    email: string;
    /** Où envoyer ces exemplaires ; absent : avec le livre de l'auteur. */
    shipping: string | null;
}): Promise<{ clientSecret: string; publishableKey: string } | { url: string }> {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.trim() || '';
    const embedded = publishableKey.startsWith('pk_');
    const back = `${params.origin}/dashboard?exemplaires=merci`;
    const session = await stripe().checkout.sessions.create({
        ...(embedded ? { ui_mode: 'custom' as const, return_url: back } : { success_url: back, cancel_url: `${params.origin}/dashboard` }),
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [extraCopiesLineItem(params.copies)],
        allow_promotion_codes: true,
        customer_email: params.email,
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
            shipping: (params.shipping ?? '').slice(0, 490),
        },
    });
    if (embedded && session.client_secret) return { clientSecret: session.client_secret, publishableKey };
    return { url: session.url ?? '' };
}

/** Une adresse e-mail plausible, ou null. */
export function cleanEmail(raw: unknown): string | null {
    const v = typeof raw === 'string' ? raw.trim().slice(0, 200) : '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : null;
}
