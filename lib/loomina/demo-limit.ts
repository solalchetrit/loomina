/**
 * Démonstration gratuite : une seule par numéro (demande de Solal, 25/11/2026).
 *
 * - Un numéro qui a déjà reçu son récit n'a plus de démo : Loomina le lui dit
 *   en une phrase et raccroche.
 * - Sans récit (appel coupé, trop court), on accepte jusqu'à 3 appels par
 *   numéro sur 24 heures.
 * - Au plus 100 démos par heure pour tout le monde, et 20 par jour en numéro
 *   masqué : un robot qui appelle en boucle ne vide pas le budget.
 *
 * DEMO_UNLIMITED_PHONES (Render, numéros séparés par des virgules) ouvre la
 * démo sans limite, pour les essais de l'équipe.
 *
 * Si la base ne répond pas, la démo a lieu quand même.
 */

import crypto from 'node:crypto';
import { db } from './db';
import { allow } from './rate-limit';

export const DEMO_TRIES_PER_DAY = 3;
export const DEMO_PER_HOUR_ALL = 100;
export const DEMO_HIDDEN_PER_DAY = 20;

export type DemoGate = 'ok' | 'already_done' | 'too_many_tries' | 'busy';

export function demoPhoneHash(phone: string): string {
    return crypto.createHash('sha256').update(`loomina-demo|${phone}`).digest('hex');
}

function unlimited(phone: string): boolean {
    return (process.env.DEMO_UNLIMITED_PHONES ?? '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .includes(phone);
}

/** Ce numéro a-t-il déjà reçu un récit de démonstration ? */
export async function demoAlreadyDone(phone: string): Promise<boolean> {
    const [caller, recent] = await Promise.all([
        db().from('demo_callers').select('phone_hash').eq('phone_hash', demoPhoneHash(phone)).maybeSingle(),
        db().from('demo_stories').select('id').eq('phone', phone).eq('status', 'written').limit(1),
    ]);
    if (caller.error && recent.error) throw new Error(caller.error.message);
    return Boolean(caller.data) || (recent.data?.length ?? 0) > 0;
}

/** À appeler quand un appelant inconnu arrive, avant de lancer la démo. Ne lève jamais. */
export async function demoGate(phone: string | null): Promise<DemoGate> {
    try {
        const number = (phone ?? '').trim();
        if (number && unlimited(number)) return 'ok';
        if (number && (await demoAlreadyDone(number))) return 'already_done';
        if (!(await allow('demo:all', 3600, DEMO_PER_HOUR_ALL))) return 'busy';
        if (!number) return (await allow('demo:masque', 86400, DEMO_HIDDEN_PER_DAY)) ? 'ok' : 'busy';
        return (await allow(`demo:${demoPhoneHash(number)}`, 86400, DEMO_TRIES_PER_DAY)) ? 'ok' : 'too_many_tries';
    } catch (err) {
        console.warn('[démo] vérification impossible, la démo a lieu :', err instanceof Error ? err.message : err);
        return 'ok';
    }
}

/** Ce que Loomina dit avant de raccrocher quand la démo est refusée. */
export function demoRefusal(gate: Exclude<DemoGate, 'ok'>): string {
    switch (gate) {
        case 'already_done':
            return "Bonjour, ici Loumina. Vous avez déjà fait votre essai gratuit, et votre récit vous a été envoyé par SMS. Pour écrire tout votre livre, rendez-vous sur loomina point e u. À bientôt !";
        case 'too_many_tries':
            return "Bonjour, ici Loumina. Vous avez déjà appelé plusieurs fois aujourd'hui. Merci de rappeler demain. À bientôt !";
        case 'busy':
            return "Bonjour, ici Loumina. Nous recevons beaucoup d'appels en ce moment. Merci de rappeler un peu plus tard. À bientôt !";
    }
}

/** Le récit est écrit : ce numéro a eu sa démo. Ne lève jamais. */
export async function markDemoDone(phone: string): Promise<void> {
    try {
        const phone_hash = demoPhoneHash(phone);
        const { error } = await db().from('demo_callers').upsert({ phone_hash, last_at: new Date().toISOString() }, { onConflict: 'phone_hash', ignoreDuplicates: false });
        if (error) console.warn('[démo] numéro non retenu :', error.message);
    } catch (err) {
        console.warn('[démo] numéro non retenu :', err instanceof Error ? err.message : err);
    }
}
