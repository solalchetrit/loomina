/**
 * Accès à l'administration (loomina.eu/admin).
 *
 * Un seul mot de passe, `ADMIN_PASSWORD`, posé dans les variables
 * d'environnement de Vercel. Sans lui, l'admin reste fermée : personne
 * n'entre, pas même en local.
 *
 * Le cookie `loomina_admin` contient l'heure de connexion et sa signature
 * (HMAC du mot de passe). Changer le mot de passe déconnecte donc tout le
 * monde. Il expire au bout de 30 jours (demande de Solal, 17/11/2026).
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'loomina_admin';
export const ADMIN_MAX_AGE_S = 30 * 24 * 60 * 60;

function password(): string | null {
    const p = process.env.ADMIN_PASSWORD?.trim();
    return p && p.length >= 8 ? p : null;
}

export function adminConfigured(): boolean {
    return password() !== null;
}

function sign(issuedAt: number, secret: string): string {
    return createHmac('sha256', secret).update(`loomina-admin|${issuedAt}`).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
}

/** Le mot de passe saisi est-il le bon ? */
export function checkPassword(input: string): boolean {
    const p = password();
    if (!p) return false;
    // Comparaison sur les empreintes : longueur égale, temps constant.
    const h = (s: string) => createHmac('sha256', 'loomina-admin-cmp').update(s).digest('hex');
    return safeEqual(h(input), h(p));
}

/** La valeur du cookie à poser après une connexion réussie. */
export function newAdminToken(now = Date.now()): string {
    const p = password();
    if (!p) throw new Error('ADMIN_PASSWORD absente');
    return `${now}.${sign(now, p)}`;
}

export function isValidAdminToken(token: string | undefined | null, now = Date.now()): boolean {
    const p = password();
    if (!p || !token) return false;
    const [at, sig] = token.split('.');
    const issuedAt = Number(at);
    if (!Number.isFinite(issuedAt) || !sig) return false;
    if (now - issuedAt > ADMIN_MAX_AGE_S * 1000 || issuedAt > now + 60_000) return false;
    return safeEqual(sig, sign(issuedAt, p));
}

export async function isAdmin(): Promise<boolean> {
    const store = await cookies();
    return isValidAdminToken(store.get(ADMIN_COOKIE)?.value);
}

/** À appeler en tête de chaque page de l'admin, avant toute lecture de la base. */
export async function requireAdmin(): Promise<void> {
    if (!(await isAdmin())) redirect('/admin/connexion');
}
