/**
 * L'écoute d'un appel (lib/admin/ecoute.ts), lancée par le site lui-même
 * juste après le traitement de l'appel : elle dure une à deux minutes,
 * dans sa propre fonction pour ne pas prendre sur les 300 s de l'écriture.
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { internalSecret } from '@/lib/loomina/book-edition';
import { checkSharedSecret } from '@/lib/loomina/secret';
import { beginReview, runReview } from '@/lib/admin/ecoute';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
    if (!checkSharedSecret(request.headers.get('x-loomina-internal'), internalSecret() || undefined, 'ecoute')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as { interviewId?: string };
    if (!body.interviewId) return NextResponse.json({ error: 'interviewId manquant' }, { status: 400 });
    const begun = await beginReview(body.interviewId);
    if (!begun.ok) return NextResponse.json({ ok: false, message: begun.message });
    const id = body.interviewId;
    after(() => runReview(id));
    return NextResponse.json({ ok: true });
}
