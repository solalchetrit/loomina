import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { readEditions, startEdition, kickEdition, publicEdition } from '@/lib/loomina/book-edition';
import { DEMO_DATA } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Une composition sans nouvelle depuis ce délai est relancée par la lecture. */
const STALE_MS = 3 * 60 * 1000;

/**
 * Le livre composé de l'auteur connecté : la dernière édition prête, et
 * l'avancement de celle qui est en cours.
 */
export async function GET(request: NextRequest) {
    if (DEMO_DATA) return NextResponse.json({ edition: null, running: null, failed: false, sourceCount: 0 });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ edition: null, running: null, failed: false, sourceCount: 0 });

        const { ready, running, failed } = await readEditions(author.project.id);
        const { count } = await db().from('chapters').select('id', { count: 'exact', head: true }).eq('project_id', author.project.id).neq('status', 'archived');

        // La chaîne d'étapes a pu casser (déploiement, fonction tuée) : on la relance.
        if (running && !running.claimed_at && Date.now() - new Date(running.updated_at).getTime() > STALE_MS) {
            const origin = request.nextUrl.origin;
            after(() => kickEdition(running.id, origin));
        }
        return NextResponse.json({
            edition: ready ? publicEdition(ready) : null,
            running: running ? { done: running.chapters.length, total: running.plan.length, status: running.status } : null,
            failed: Boolean(failed),
            sourceCount: count ?? 0,
        });
    } catch (err) {
        console.error('[user/book]', err);
        return NextResponse.json({ error: 'Nous n’arrivons pas à lire votre livre pour le moment.' }, { status: 500 });
    }
}

/** Compose (ou recompose) le livre à partir de tous les appels. */
export async function POST(request: NextRequest) {
    if (DEMO_DATA) return NextResponse.json({ error: 'La composition n’est pas disponible en démonstration.' }, { status: 409 });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });
        let edition;
        try {
            edition = await startEdition(author.project.id);
        } catch (err) {
            return NextResponse.json({ error: err instanceof Error ? err.message : 'Composition impossible.' }, { status: 409 });
        }
        const origin = request.nextUrl.origin;
        after(() => kickEdition(edition.id, origin));
        return NextResponse.json({ running: { done: edition.chapters.length, total: edition.plan.length, status: edition.status } });
    } catch (err) {
        console.error('[user/book]', err);
        return NextResponse.json({ error: 'La composition n’a pas pu démarrer. Réessayez dans un instant.' }, { status: 500 });
    }
}
