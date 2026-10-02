/**
 * Vérification de secrets partagés (webhook Vapi, cron Vercel).
 *
 * - Comparaison à temps constant (sur des empreintes SHA-256, pour que
 *   deux valeurs de longueurs différentes restent comparables).
 * - En production, un secret NON configuré ferme la porte au lieu de
 *   l'ouvrir : une variable oubliée ne doit jamais exposer les données
 *   des auteurs.
 */

import { createHash, timingSafeEqual } from 'crypto';

function digest(value: string): Buffer {
    return createHash('sha256').update(value, 'utf8').digest();
}

export function safeEqual(provided: string, expected: string): boolean {
    return timingSafeEqual(digest(provided), digest(expected));
}

/**
 * @returns true si `provided` correspond au secret attendu.
 *          Si le secret n'est pas configuré : refus en production,
 *          accepté (avec avertissement) en développement local.
 */
export function checkSharedSecret(
    provided: string | null | undefined,
    expected: string | undefined,
    label: string
): boolean {
    const secret = expected?.trim();
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            console.error(`[${label}] secret non configuré — requête refusée.`);
            return false;
        }
        console.warn(`[${label}] secret non configuré — accepté en développement uniquement.`);
        return true;
    }
    return safeEqual(provided ?? '', secret);
}
