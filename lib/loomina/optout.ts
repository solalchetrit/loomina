/**
 * « Ne plus recevoir ces rappels » : le lien en bas des e-mails de relance
 * (paniers abandonnés, fin de la réduction de la démo). Demande de Solal du
 * 23/11/2026 ; un e-mail commercial doit toujours offrir un moyen simple de
 * ne plus en recevoir.
 *
 * Le lien ne contient pas l'adresse : seulement son empreinte (HMAC-SHA256
 * avec JWT_SECRET, 16 octets). La table email_optouts ne garde que cette
 * empreinte. Pour savoir si une adresse s'est désinscrite, on recalcule son
 * empreinte et on la cherche.
 */

import { createHmac } from 'node:crypto';
import { SITE } from '../../config/site';
import { db } from './db';

function secret(): string | null {
    return process.env.JWT_SECRET?.trim() || null;
}

/** L'empreinte d'une adresse (casse et espaces ignorés), ou null sans secret. */
export function optOutToken(email: string): string | null {
    const key = secret();
    const clean = email.trim().toLowerCase();
    if (!key || !clean) return null;
    return createHmac('sha256', key).update(`optout:${clean}`).digest().subarray(0, 16).toString('base64url');
}

/** Le lien de désinscription d'une adresse, ou null sans secret. */
export function optOutUrl(email: string): string | null {
    const t = optOutToken(email);
    return t ? `${SITE.url}/desinscription?t=${t}` : null;
}

/** L'adresse à donner dans l'en-tête List-Unsubscribe (désinscription en un clic des messageries). */
export function optOutHeaders(email: string): Record<string, string> {
    const t = optOutToken(email);
    if (!t) return {};
    return {
        'List-Unsubscribe': `<${SITE.url}/api/desinscription?t=${t}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
}

export function isOptOutToken(t: unknown): t is string {
    return typeof t === 'string' && /^[A-Za-z0-9_-]{22}$/.test(t);
}

/** Enregistre la désinscription. Renvoie false si l'écriture a échoué. */
export async function recordOptOut(token: string): Promise<boolean> {
    if (!isOptOutToken(token)) return false;
    const { error } = await db().from('email_optouts').upsert({ email_hash: token }, { onConflict: 'email_hash', ignoreDuplicates: true });
    if (error) console.warn('[désinscription] écriture impossible :', error.message);
    return !error;
}

/** Annule une désinscription (« Annuler ma désinscription »). Renvoie false si l'écriture a échoué. */
export async function removeOptOut(token: string): Promise<boolean> {
    if (!isOptOutToken(token)) return false;
    const { error } = await db().from('email_optouts').delete().eq('email_hash', token);
    if (error) console.warn('[désinscription] annulation impossible :', error.message);
    return !error;
}

/** Cette adresse a-t-elle demandé à ne plus recevoir de rappels ? En cas de doute (base injoignable), oui. */
export async function isOptedOut(email: string): Promise<boolean> {
    const t = optOutToken(email);
    if (!t) return false;
    const { data, error } = await db().from('email_optouts').select('email_hash').eq('email_hash', t).limit(1);
    if (error) {
        console.warn('[désinscription] lecture impossible :', error.message);
        return true;
    }
    return (data?.length ?? 0) > 0;
}

/** La ligne à ajouter en bas d'un e-mail de relance. */
export function optOutLine(email: string): string | null {
    const url = optOutUrl(email);
    return url ? `Vous ne souhaitez plus recevoir ces e-mails ? ${url}` : null;
}
