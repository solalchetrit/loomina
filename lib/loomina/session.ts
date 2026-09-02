/**
 * Session client de l'espace auteur.
 *
 * Le cookie `loomina_session` est un JWT signé avec JWT_SECRET, posé par
 * /api/auth/verify après validation du code SMS. Toute route « espace
 * auteur » passe par `readSession()` et ne fait confiance qu'au téléphone
 * contenu dans le jeton — jamais à un paramètre envoyé par le navigateur.
 */

import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const COOKIE = 'loomina_session';

function secret(): Uint8Array {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET manquante : sessions impossibles.');
    return new TextEncoder().encode(s);
}

export async function signSession(phone: string): Promise<string> {
    return new SignJWT({ phone, role: 'authenticated' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret());
}

export async function readSession(request: NextRequest): Promise<{ phone: string } | null> {
    const cookie = request.cookies.get(COOKIE)?.value;
    if (!cookie) return null;
    try {
        const { payload } = await jwtVerify(cookie, secret());
        const phone = typeof payload.phone === 'string' ? payload.phone : null;
        return phone ? { phone } : null;
    } catch {
        return null;
    }
}

export const SESSION_COOKIE = COOKIE;
