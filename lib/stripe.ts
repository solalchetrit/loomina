/**
 * Client Stripe côté serveur, créé au premier usage : un build sans
 * STRIPE_SECRET_KEY (aperçu, poste local) ne plante pas à l'import.
 */

import Stripe from 'stripe';

let cached: Stripe | null = null;

export function stripe(): Stripe {
    if (cached) return cached;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY manquante : paiement impossible.');
    cached = new Stripe(key);
    return cached;
}
