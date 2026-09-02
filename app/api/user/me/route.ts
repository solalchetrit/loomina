import { NextRequest, NextResponse } from 'next/server';
import { findProfileByPhone } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Le profil de l'auteur connecté — remplace la lecture directe de `profiles` depuis le navigateur. */
export async function GET(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const profile = await findProfileByPhone(session.phone);
        if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({
            first_name: profile.first_name,
            full_name: profile.full_name,
            phone_number: profile.phone_number,
        });
    } catch (err) {
        console.error('[user/me]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
