import { NextRequest, NextResponse } from 'next/server';
import { allow, clientIp } from '@/lib/loomina/rate-limit';
import { ADMIN_COOKIE, ADMIN_MAX_AGE_S, checkPassword, newAdminToken } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Connexion à l'admin : formulaire de /admin/connexion. */
export async function POST(request: NextRequest) {
    const form = await request.formData().catch(() => null);
    const input = typeof form?.get('password') === 'string' ? String(form.get('password')) : '';

    // Au plus 10 essais par quart d'heure et par adresse (25/11/2026).
    if (!(await allow(`admin:ip:${clientIp(request.headers)}`, 900, 10))) {
        console.warn('[admin] trop d\'essais de mot de passe');
        return NextResponse.redirect(new URL('/admin/connexion?erreur=1', request.url), 303);
    }

    if (!checkPassword(input)) {
        // Un peu d'attente pour décourager les essais en série.
        await new Promise((r) => setTimeout(r, 800));
        console.warn('[admin] mot de passe refusé');
        return NextResponse.redirect(new URL('/admin/connexion?erreur=1', request.url), 303);
    }

    const res = NextResponse.redirect(new URL('/admin', request.url), 303);
    res.cookies.set(ADMIN_COOKIE, newAdminToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: ADMIN_MAX_AGE_S,
    });
    return res;
}
