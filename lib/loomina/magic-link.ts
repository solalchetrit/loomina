/**
 * Liens de connexion directe (« magic links »), envoyés par SMS (demande de
 * Solal du 20/11/2026). Un toucher sur le lien ouvre l'espace auteur ou
 * l'espace famille, sans taper de numéro ni de code.
 *
 * Le lien est court, pour tenir dans un SMS : loomina.eu/l/<numéro>.<expiration>.<signature>,
 * signé avec JWT_SECRET (HMAC-SHA256). Il ne contient que le numéro qui l'a reçu :
 * il ouvre la même session qu'un code SMS sur ce numéro, rien de plus. Il expire au
 * bout de LINK_DAYS jours ; après, l'espace demande le numéro et un code, comme avant.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { SITE } from '../../config/site';

/** Durée de validité d'un lien envoyé par SMS. */
export const LINK_DAYS = 30;

/**
 * Le secret qui signe et vérifie les liens : celui des sessions du site.
 * Seul le site (Vercel) fabrique des liens : ailleurs (serveur vocal sur Render),
 * le secret pourrait différer et le lien serait refusé ; on y garde loomina.eu/dashboard.
 */
function key(): string | null {
    const onSite = Boolean(process.env.VERCEL) || process.env.LOOMINA_MAGIC_LINKS === 'true' || process.env.NODE_ENV === 'test';
    return (onSite && process.env.JWT_SECRET?.trim()) || null;
}

function sign(body: string, secret: string): string {
    // 16 octets de signature suffisent (128 bits) et gardent le lien court.
    return createHmac('sha256', secret).update(`magic:${body}`).digest().subarray(0, 16).toString('base64url');
}

/** Le jeton d'un numéro E.164, ou null si les liens sont indisponibles (pas de secret, numéro invalide). */
export function magicToken(phone: string, now = Date.now(), days = LINK_DAYS): string | null {
    const secret = key();
    if (!secret || !/^\+\d{8,15}$/.test(phone)) return null;
    const exp = Math.floor(now / 60_000) + days * 24 * 60; // en minutes, pour un nombre plus court
    const body = `${BigInt(phone.slice(1)).toString(36)}.${exp.toString(36)}`;
    return `${body}.${sign(body, secret)}`;
}

/** Le numéro que ce jeton ouvre, ou null s'il est faux ou expiré. */
export function readMagicToken(token: string, now = Date.now()): { phone: string } | null {
    const secret = key();
    if (!secret) return null;
    const m = /^([0-9a-z]{1,20})\.([0-9a-z]{1,12})\.([A-Za-z0-9_-]{22})$/.exec(token);
    if (!m) return null;
    const body = `${m[1]}.${m[2]}`;
    const expected = Buffer.from(sign(body, secret));
    const given = Buffer.from(m[3]);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    if (parseInt(m[2], 36) * 60_000 < now) return null;
    let digits: string;
    try {
        digits = [...m[1]].reduce((n, c) => n * 36n + BigInt(parseInt(c, 36)), 0n).toString();
    } catch {
        return null;
    }
    const e164 = `+${digits}`;
    return /^\+\d{8,15}$/.test(e164) ? { phone: e164 } : null;
}

const HOST = SITE.url.replace(/^https?:\/\//, '').replace(/^www\./, '');

/** Le lien à mettre dans un SMS : direct si possible, sinon la page de connexion. */
export function magicLink(phone: string | null | undefined): string {
    const token = phone ? magicToken(phone) : null;
    return token ? `${HOST}/l/${token}` : `${HOST}/dashboard`;
}
