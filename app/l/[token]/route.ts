import { NextRequest, NextResponse } from 'next/server';
import { readMagicToken } from '@/lib/loomina/magic-link';
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_S } from '@/lib/loomina/session';
import { findProfileByPhone } from '@/lib/loomina/db';
import { findGiftProjects } from '@/lib/loomina/giver';
import { isTestAuthorPhone } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Le lien reçu par SMS (lib/loomina/magic-link.ts) : il ouvre la session du
 * numéro qui l'a reçu, puis l'espace (auteur ou famille, choisi comme après un
 * code SMS). Lien faux, expiré ou numéro sans livre : la page de connexion,
 * avec un mot d'explication.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const to = (q: string) => NextResponse.redirect(new URL(`/dashboard?lien=${q}`, request.url), 303);

    const read = readMagicToken(token);
    if (!read || isTestAuthorPhone(read.phone)) return to('expire');
    try {
        const known = (await findProfileByPhone(read.phone)) || (await findGiftProjects(read.phone)).length > 0;
        if (!known) return to('expire');
    } catch (err) {
        console.error('[lien] vérification impossible :', err instanceof Error ? err.message : String(err));
        return to('erreur');
    }

    const res = to('ok');
    res.cookies.set(SESSION_COOKIE, await signSession(read.phone), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE_S,
        path: '/',
    });
    // Un lien ne dit pas comment il a été touché : ni le jeton ni le numéro dans les journaux.
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
}
