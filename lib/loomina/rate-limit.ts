/**
 * Limites anti-abus (25/11/2026) : « au plus N essais par fenêtre ».
 *
 * Le compteur vit dans Supabase (fonction hit_rate_limit, table rate_hits),
 * parce que les fonctions Vercel ne partagent pas de mémoire entre elles.
 * Si la base ne répond pas, on laisse passer : une limite en panne ne doit
 * jamais bloquer un vrai client.
 */

import { db } from './db';

export async function allow(key: string, windowSeconds: number, max: number): Promise<boolean> {
    try {
        const { data, error } = await db().rpc('hit_rate_limit', { p_key: key.slice(0, 200), p_window_seconds: windowSeconds, p_max: max });
        if (error) {
            console.warn(`[limite] ${key.split(':')[0]} : compteur indisponible (${error.message}), on laisse passer`);
            return true;
        }
        return data !== false;
    } catch (err) {
        console.warn('[limite] compteur indisponible, on laisse passer :', err instanceof Error ? err.message : err);
        return true;
    }
}

/** L'adresse IP du visiteur, telle que Vercel la transmet. */
export function clientIp(headers: Headers): string {
    const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    return forwarded || headers.get('x-real-ip')?.trim() || 'inconnue';
}

/** Réponse standard quand une limite est atteinte. */
export const TOO_MANY = 'Trop d’essais en peu de temps. Réessayez un peu plus tard.';
