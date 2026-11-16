/**
 * Une étape de la composition du livre (voir lib/loomina/book-edition.ts).
 *
 * Appelé par le site lui-même : chaque appel écrit le plan ou UN chapitre,
 * puis demande l'étape suivante. Ainsi aucune fonction ne dépasse 300 s,
 * quelle que soit la taille du livre.
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { advanceEdition, kickEdition, internalSecret } from '@/lib/loomina/book-edition';
import { checkSharedSecret } from '@/lib/loomina/secret';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
    if (!checkSharedSecret(request.headers.get('x-loomina-internal'), internalSecret() || undefined, 'livre')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as { id?: string };
    if (!body.id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

    try {
        const edition = await advanceEdition(body.id);
        if (!edition) return NextResponse.json({ ok: true, busy: true });
        if (edition.status === 'planning' || edition.status === 'writing') {
            const origin = request.nextUrl.origin;
            after(() => kickEdition(edition.id, origin));
        }
        return NextResponse.json({ ok: true, status: edition.status, done: edition.chapters.length, total: edition.plan.length });
    } catch (err) {
        console.error('[jobs/book]', err);
        return NextResponse.json({ error: 'internal' }, { status: 500 });
    }
}
