/**
 * Les codes promo créés depuis l'admin (Solal, 26/11/2026) : un code par
 * situation (un proche, un partenaire, un test du parcours), difficile à
 * deviner, avec son nombre d'utilisations et sa date de fin.
 *
 * Tout vit dans Stripe : chaque code a son propre coupon, marqué
 * `source: admin`. Rien n'est gardé chez Loomina.
 */
import { randomInt } from 'node:crypto';
import { stripe } from '@/lib/stripe';

/** Sans 0/O, 1/I/L : un code qu'on peut dicter au téléphone sans se tromper. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const chunk = (n: number) => Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

/** « LOOM-7KQ2M-X9RTA », ou « NOEL-7KQ2M-X9RTA » avec un mot choisi. */
export function newPromoCode(word = ''): string {
    const prefix = word.toUpperCase().normalize('NFD').replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'LOOM';
    return `${prefix}-${chunk(5)}-${chunk(5)}`;
}

export type PromoInput = { note: string; word: string; kind: 'percent' | 'amount'; value: number; uses: number; days: number };

/** Lit le formulaire de l'admin et refuse ce qui n'a pas de sens. */
export function parsePromoForm(form: FormData): PromoInput | string {
    const note = String(form.get('note') ?? '').trim().slice(0, 120);
    const word = String(form.get('mot') ?? '').trim();
    const kind = form.get('type') === 'amount' ? 'amount' : 'percent';
    const value = Math.floor(Number(form.get('valeur')));
    const uses = Math.floor(Number(form.get('utilisations')));
    const days = Math.floor(Number(form.get('jours') || 0));
    if (!note) return 'Indiquez pour qui ou pour quoi est ce code.';
    if (!Number.isFinite(value) || value < 1) return 'Indiquez la réduction.';
    if (kind === 'percent' && value > 100) return 'Une réduction en pourcentage va de 1 à 100.';
    if (kind === 'amount' && value > 1000) return 'Une réduction en euros va de 1 à 1 000.';
    if (!Number.isFinite(uses) || uses < 1 || uses > 1000) return 'Le nombre d’utilisations va de 1 à 1 000.';
    if (!Number.isFinite(days) || days < 0 || days > 365) return 'La durée va de 1 à 365 jours (vide : sans date de fin).';
    return { note, word, kind, value, uses, days };
}

export async function createPromo(input: PromoInput): Promise<string> {
    const label = input.kind === 'percent' ? `-${input.value} %` : `-${input.value} €`;
    const coupon = await stripe().coupons.create({
        ...(input.kind === 'percent' ? { percent_off: input.value } : { amount_off: input.value * 100, currency: 'eur' }),
        duration: 'once',
        name: `${input.note} (${label})`.slice(0, 40),
        metadata: { source: 'admin', note: input.note },
    });
    const code = newPromoCode(input.word);
    await stripe().promotionCodes.create({
        promotion: { type: 'coupon', coupon: coupon.id },
        code,
        max_redemptions: input.uses,
        ...(input.days ? { expires_at: Math.floor(Date.now() / 1000) + input.days * 86_400 } : {}),
        metadata: { source: 'admin', note: input.note },
    });
    return code;
}

export type PromoRow = { id: string; code: string; note: string; discount: string; used: number; max: number | null; expires: Date | null; active: boolean; created: Date; fromAdmin: boolean };

/** Les codes connus de Stripe, les plus récents d'abord (hors codes personnels de la démo). */
export async function listPromos(): Promise<PromoRow[]> {
    const list = await stripe().promotionCodes.list({ limit: 100, expand: ['data.promotion.coupon'] });
    const now = Date.now() / 1000;
    return list.data
        .filter((p) => p.metadata?.source !== 'demo')
        .map((p) => {
            const c = p.promotion?.coupon;
            const coupon = c && typeof c !== 'string' ? c : null;
            const discount = coupon?.percent_off ? `-${coupon.percent_off} %` : coupon?.amount_off ? `-${coupon.amount_off / 100} €` : '—';
            const full = p.max_redemptions != null && p.times_redeemed >= p.max_redemptions;
            const over = p.expires_at != null && p.expires_at < now;
            return {
                id: p.id,
                code: p.code,
                note: p.metadata?.note || coupon?.name || '',
                discount,
                used: p.times_redeemed,
                max: p.max_redemptions,
                expires: p.expires_at ? new Date(p.expires_at * 1000) : null,
                active: p.active && !full && !over && coupon?.valid !== false,
                created: new Date(p.created * 1000),
                fromAdmin: p.metadata?.source === 'admin',
            };
        });
}

/** Coupe un code : plus personne ne peut s'en servir. */
export async function stopPromo(id: string): Promise<string> {
    if (!/^promo_[A-Za-z0-9]+$/.test(id)) throw new Error('Code inconnu.');
    const p = await stripe().promotionCodes.update(id, { active: false });
    return p.code;
}
