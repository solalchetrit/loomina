/**
 * Les paniers abandonnés : une commande commencée et jamais payée.
 *
 * Demande de Solal (23/11/2026) : plus de SMS, trois e-mails sur la semaine.
 *   1. quand la page de paiement expire (deux heures après), par le webhook Stripe ;
 *   2. deux jours après ;
 *   3. cinq jours après, le dernier.
 * Rien si la personne a commandé depuis, si elle est en train de payer, ou si
 * elle a demandé à ne plus recevoir ces rappels. Plusieurs paniers d'une même
 * adresse dans la semaine ne font qu'une suite de trois e-mails.
 *
 * L'état est gardé dans Stripe, sur la dernière session de la personne
 * (metadata.relances = nombre d'e-mails envoyés, metadata.relance_at).
 * Avant le 23/11/2026, une seule relance partait (metadata.relance_sent) et son
 * e-mail promettait de ne pas réécrire : ces paniers-là ne reçoivent plus rien.
 */

import type Stripe from 'stripe';
import { stripe } from '../stripe';
import { db } from './db';
import { notifyAbandonedCart } from './notify';
import type { CartStep } from './notify';
import { isOptedOut } from './optout';

const DAY = 86_400_000;
/** Jours après l'expiration de la page de paiement, pour chacun des trois e-mails. */
export const CART_RELANCE_DAYS = [0, 2, 5] as const;
/** Au-delà, la suite est finie (ou manquée) : on ne relance plus. */
const WINDOW_DAYS = 8;
/** Deux e-mails jamais à moins de ce délai (serveur arrêté puis repris, par exemple). */
const MIN_GAP_MS = 20 * 3600_000;

export interface CartSession {
    id: string;
    /** En secondes, comme Stripe. */
    created: number;
    expires_at: number;
    status: 'open' | 'complete' | 'expired' | null;
    metadata: Record<string, string>;
    recoveryUrl?: string | null;
}

function asCart(s: Stripe.Checkout.Session): CartSession {
    return {
        id: s.id,
        created: s.created,
        expires_at: s.expires_at,
        status: s.status,
        metadata: (s.metadata ?? {}) as Record<string, string>,
        recoveryUrl: s.after_expiration?.recovery?.url ?? null,
    };
}

/** L'adresse d'une session, en minuscules, ou null. */
export function cartEmail(s: CartSession): string | null {
    return s.metadata.email?.trim().toLowerCase() || null;
}

/**
 * Le prochain e-mail dû pour les paniers d'une même adresse, ou null.
 * `group` : les sessions expirées de cette adresse (hors changement de moyen
 * de paiement). `firstDelayMs` : délai avant le premier e-mail (0 pour le
 * webhook, plus pour le rattrapage, qui laisse passer le webhook d'abord).
 */
export function cartStepDue(group: CartSession[], now: number, firstDelayMs = 0): CartStep | null {
    const carts = group.filter((s) => s.status === 'expired' && s.metadata.superseded !== 'true');
    if (!carts.length) return null;
    if (carts.some((s) => s.metadata.relance_sent === 'true' && !s.metadata.relances)) return null;
    const sent = Math.max(0, ...carts.map((s) => Number(s.metadata.relances) || 0));
    if (sent >= CART_RELANCE_DAYS.length) return null;
    const anchor = Math.min(...carts.map((s) => s.expires_at * 1000));
    if (now - anchor > WINDOW_DAYS * DAY) return null;
    const last = Math.max(0, ...carts.map((s) => Date.parse(s.metadata.relance_at ?? '') || 0));
    if (last && now - last < MIN_GAP_MS) return null;
    const due = anchor + CART_RELANCE_DAYS[sent] * DAY + (sent === 0 ? firstDelayMs : 0);
    return now >= due ? ((sent + 1) as CartStep) : null;
}

/** Les sessions Stripe créées depuis `days` jours (toutes, payées ou non). */
async function recentSessions(days: number, now: number): Promise<CartSession[]> {
    const out: CartSession[] = [];
    for await (const s of stripe().checkout.sessions.list({ created: { gte: Math.floor((now - days * DAY) / 1000) }, limit: 100 })) {
        out.push(asCart(s));
        if (out.length >= 1000) break;
    }
    return out;
}

/** Heure de Paris (0-23). */
function parisHour(now: number): number {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(new Date(now)));
}

/**
 * Envoie les relances dues. `only` : une seule adresse (webhook d'expiration,
 * premier e-mail tout de suite). Sans `only` : le rattrapage, appelé toutes
 * les 5 minutes par /api/jobs/process, entre 9 h et 20 h (heure de Paris).
 * Ne lève pas.
 */
export async function relanceAbandonedCarts(opts: { only?: string; session?: Stripe.Checkout.Session; now?: number } = {}): Promise<{ sent: number; results: string[] }> {
    const now = opts.now ?? Date.now();
    const results: string[] = [];
    try {
        if (!opts.only) {
            const h = parisHour(now);
            if (h < 9 || h >= 20) return { sent: 0, results };
        }
        let sessions = await recentSessions(WINDOW_DAYS + 1, now);
        // La session du webhook, telle que Stripe vient de l'envoyer (la liste peut avoir un temps de retard).
        if (opts.session) sessions = [asCart(opts.session), ...sessions.filter((s) => s.id !== opts.session!.id)];
        const byEmail = new Map<string, CartSession[]>();
        for (const s of sessions) {
            const email = cartEmail(s);
            if (!email) continue;
            if (opts.only && email !== opts.only.trim().toLowerCase()) continue;
            byEmail.set(email, [...(byEmail.get(email) ?? []), s]);
        }

        for (const [email, group] of byEmail) {
            // Payé, ou en train de payer : rien.
            if (group.some((s) => s.status === 'complete' || s.status === 'open')) continue;
            const step = cartStepDue(group, now, opts.only ? 0 : 30 * 60_000);
            if (!step) continue;
            const latest = group
                .filter((s) => s.status === 'expired' && s.metadata.superseded !== 'true')
                .sort((a, b) => b.created - a.created)[0];
            const meta = latest.metadata;
            const typed = meta.email.trim();
            // A-t-elle commandé autrement (autre adresse de session, commande faite à la main) ?
            const { data: paid } = await db().from('projects').select('id').eq('project_metadata->>buyer_email', typed).limit(1);
            if (paid?.length) continue;
            if (await isOptedOut(email)) {
                results.push(`${latest.id}: désinscrit`);
                continue;
            }
            // Marqué AVANT l'envoi : un rejeu ne relance pas deux fois.
            await stripe().checkout.sessions.update(latest.id, { metadata: { ...meta, relances: String(step), relance_at: new Date(now).toISOString() } });
            const isGift = meta.isGift === 'true' || meta.isGift === '1';
            const ok = await notifyAbandonedCart(
                {
                    email: typed,
                    firstName: (isGift ? meta.giverFirstName : meta.firstName)?.trim() || null,
                    isGift,
                    narratorFirstName: meta.firstName?.trim() || null,
                    recoveryUrl: latest.recoveryUrl ?? null,
                },
                step
            );
            results.push(`${latest.id}: relance ${step}${ok ? '' : ' (e-mail refusé)'}`);
            if (ok) console.log(`[panier] relance ${step} envoyée (${latest.id})`);
        }
    } catch (err) {
        console.error('[panier] relances impossibles :', err instanceof Error ? err.message : String(err));
    }
    return { sent: results.filter((r) => /relance \d$/.test(r)).length, results };
}
