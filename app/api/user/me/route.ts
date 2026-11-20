import { NextRequest, NextResponse } from 'next/server';
import { findProfileByPhone } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { isTestAuthorPhone, TEST_AUTHOR_PHONE } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Le profil de l'auteur connecté — remplace la lecture directe de `profiles` depuis le navigateur. */
export async function GET(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (isTestAuthorPhone(session.phone)) return NextResponse.json({ first_name: null, full_name: null, phone_number: TEST_AUTHOR_PHONE });

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
