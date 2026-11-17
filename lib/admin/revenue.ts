/**
 * Le chiffre d'affaires réel, lu dans Stripe (demande de Solal, 17/11/2026).
 *
 * Avant : commandes × prix affiché, sans les codes promo ni les
 * remboursements. Ici : ce que Stripe a réellement encaissé pour les
 * commandes de Loomina, et ce qui a été remboursé.
 */

import { stripe } from '@/lib/stripe';

export interface Revenue {
    /** Commandes payées retrouvées dans Stripe. */
    orders: number;
    /** En euros. */
    collected: number;
    refunded: number;
    net: number;
    /** Somme des réductions (codes promo). */
    discounts: number;
}

/**
 * `sessionIds` : les paiements liés à un livre dans la base. On ne compte
 * que ceux-là : le compte Stripe peut servir à autre chose.
 */
export async function realRevenue(sessionIds: string[]): Promise<Revenue | null> {
    const wanted = new Set(sessionIds.filter(Boolean));
    if (!wanted.size) return { orders: 0, collected: 0, refunded: 0, net: 0, discounts: 0 };
    try {
        const out: Revenue = { orders: 0, collected: 0, refunded: 0, net: 0, discounts: 0 };
        const intents = new Set<string>();
        // Les sessions de paiement, page par page (100 au plus par page).
        for await (const s of stripe().checkout.sessions.list({ limit: 100 })) {
            if (!wanted.has(s.id) || s.payment_status !== 'paid') continue;
            out.orders += 1;
            out.collected += (s.amount_total ?? 0) / 100;
            out.discounts += (s.total_details?.amount_discount ?? 0) / 100;
            const intent = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id;
            if (intent) intents.add(intent);
            if (out.orders >= wanted.size) break;
        }
        for await (const r of stripe().refunds.list({ limit: 100 })) {
            const intent = typeof r.payment_intent === 'string' ? r.payment_intent : r.payment_intent?.id;
            if (intent && intents.has(intent) && r.status !== 'failed' && r.status !== 'canceled') out.refunded += (r.amount ?? 0) / 100;
        }
        out.net = out.collected - out.refunded;
        return out;
    } catch (err) {
        console.warn('[admin] chiffre d’affaires Stripe illisible :', err instanceof Error ? err.message : String(err));
        return null;
    }
}
