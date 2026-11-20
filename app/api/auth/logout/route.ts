import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/loomina/session';
import { resetEssai } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';

/** Déconnexion : efface le cookie de session (sinon « Se déconnecter » ne déconnectait rien). */
export async function POST() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return resetEssai(res);
}
