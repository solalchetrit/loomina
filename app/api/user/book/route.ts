import { NextRequest, NextResponse, after } from 'next/server';
import { currentAuthor } from '@/lib/loomina/author';
import { readEditions, startEdition, kickEdition, publicEdition, autoCompose, bookThrough, countSources, upToDate, STALE_EDITION_MS } from '@/lib/loomina/book-edition';
import { toPhase } from '@/lib/loomina/phases';
import { DEMO_DATA, demoEdition } from '@/lib/loomina/demo';
import { testAuthorReply } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Le livre composé de l'auteur connecté : la dernière édition prête, et
 * l'avancement de celle qui est en cours.
 */
export async function GET(request: NextRequest) {
    const essai = await testAuthorReply(request, 'book');
    if (essai) return essai;
    if (DEMO_DATA) return NextResponse.json(demoEdition());
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ edition: null, running: null, failed: false, sourceCount: 0, stage: null });

        const projectId = author.project.id;
        const origin = request.nextUrl.origin;
        // Le livre va jusqu'à la dernière étape finie (0 : la première étape est en cours, pas encore de livre).
        const through = bookThrough(author.project);
        const [{ ready, running, failed }, count] = await Promise.all([readEditions(projectId), countSources(projectId, through)]);

        let showRunning = running;
        let starting = false;
        if (running && !upToDate(running, through, count)) {
            // Une composition qui ne raconte plus ce qu'il faut (étape finie entre-temps, ou lancée avant les étapes) : remplacée.
            after(() => autoCompose(projectId, origin, { legacy: false }));
            showRunning = null;
            starting = through >= 1 && count >= 1;
        } else if (running && Date.now() - new Date(running.updated_at).getTime() > STALE_EDITION_MS) {
            // La chaîne d'étapes a pu casser (déploiement, fonction tuée) : on la relance.
            // Une étape encore au travail refusera simplement la relance (verrou).
            after(() => kickEdition(running.id, origin));
        } else if (!running && !failed && through >= 1 && count >= 1 && (!ready || (ready.extras?.through !== undefined && !upToDate(ready, through, count)))) {
            // Une étape finie dont le livre n'a pas été écrit (composition manquée) est rattrapée à la visite.
            after(() => autoCompose(projectId, origin, { legacy: false }));
            starting = true;
        }
        return NextResponse.json({
            edition: ready ? publicEdition(ready) : null,
            running: showRunning ? { done: showRunning.chapters.length, total: showRunning.plan.length, status: showRunning.status } : starting ? { done: 0, total: 0, status: 'planning' } : null,
            failed: Boolean(failed),
            sourceCount: count,
            // Où en est l'auteur : l'étape en cours (1 à 4), la dernière étape finie, et si le récit est complet.
            stage: { current: toPhase(author.project.phase), through, complete: author.project.status === 'completed' },
        });
    } catch (err) {
        console.error('[user/book]', err);
        return NextResponse.json({ error: 'Nous n’arrivons pas à lire votre livre pour le moment.' }, { status: 500 });
    }
}

/** Relance la composition du livre, jusqu'à la dernière étape finie (bouton « Réessayer »). */
export async function POST(request: NextRequest) {
    const essai = await testAuthorReply(request, 'book-compose');
    if (essai) return essai;
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
