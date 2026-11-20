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
    /** Le détail par paiement : montant encaissé, réduction et remboursement, en euros. */
    sessions: Map<string, { paid: number; discount: number; refunded: number; at: string }>;
}

/**
 * `sessionIds` : les paiements liés à un livre dans la base. On ne compte
 * que ceux-là : le compte Stripe peut servir à autre chose.
 */
export async function realRevenue(sessionIds: string[], range?: { start: Date; end: Date }): Promise<Revenue | null> {
    const wanted = new Set(sessionIds.filter(Boolean));
    const empty = (): Revenue => ({ orders: 0, collected: 0, refunded: 0, net: 0, discounts: 0, sessions: new Map() });
    if (!wanted.size) return empty();
    try {
        const out = empty();
        const intents = new Map<string, string>();
        let seen = 0;
        // Les sessions de paiement, page par page (100 au plus par page).
        for await (const s of stripe().checkout.sessions.list({ limit: 100 })) {
            if (!wanted.has(s.id) || s.payment_status !== 'paid') continue;
            seen += 1;
            const at = new Date(s.created * 1000);
            const inRange = !range || (at >= range.start && at < range.end);
            if (inRange) {
                const paid = (s.amount_total ?? 0) / 100;
                const discount = (s.total_details?.amount_discount ?? 0) / 100;
                out.orders += 1;
                out.collected += paid;
                out.discounts += discount;
                out.sessions.set(s.id, { paid, discount, refunded: 0, at: at.toISOString() });
                const intent = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id;
                if (intent) intents.set(intent, s.id);
            }
            if (seen >= wanted.size) break;
        }
        if (intents.size) {
            for await (const r of stripe().refunds.list({ limit: 100 })) {
                const intent = typeof r.payment_intent === 'string' ? r.payment_intent : r.payment_intent?.id;
                const sid = intent ? intents.get(intent) : undefined;
                if (!sid || r.status === 'failed' || r.status === 'canceled') continue;
                const amount = (r.amount ?? 0) / 100;
                out.refunded += amount;
                const line = out.sessions.get(sid);
                if (line) line.refunded += amount;
            }
        }
        out.net = out.collected - out.refunded;
        return out;
    } catch (err) {
        console.warn('[admin] chiffre d’affaires Stripe illisible :', err instanceof Error ? err.message : String(err));
        return null;
    }
}
