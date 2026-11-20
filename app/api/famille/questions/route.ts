import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { testFamilyReply } from '@/lib/loomina/test-family';
import { findGiftProjects, giverPendingTopics } from '@/lib/loomina/giver';
import { normalizeContext } from '@/lib/loomina/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Un souvenir ou une question soufflés par la personne qui a offert le livre.
 * Même file que les sujets suggérés par l'auteur (`suggested_topics`) :
 * Loomina l'aborde à un prochain appel. Voir app/api/user/questions.
 */
export async function POST(request: NextRequest) {
    const essai = await testFamilyReply(request, 'questions');
    if (essai) return essai;
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = (await request.json().catch(() => ({}))) as { projectId?: unknown; question?: unknown };
        const question = typeof body.question === 'string' ? body.question.trim().slice(0, 280) : '';
        if (question.length < 5) return NextResponse.json({ error: 'Question trop courte' }, { status: 400 });

        // Le livre visé doit être l'un de ceux que ce numéro a offerts.
        const project = (await findGiftProjects(session.phone)).find((p) => p.id === body.projectId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const context = normalizeContext(project.context);
        if ((context.suggested_topics?.length ?? 0) >= 10) {
            return NextResponse.json(
                { error: 'Dix sujets attendent déjà : Loomina les abordera avant d’en ajouter d’autres.' },
                { status: 409 }
            );
        }
        const next = normalizeContext({ ...context, suggested_topics: [...(context.suggested_topics ?? []), question] });
        // On retient ce que l'offreur a soufflé, pour ne lui montrer que ses propres sujets.
        const kept = giverPendingTopics(project.project_metadata, next.suggested_topics);
        const meta = { ...(project.project_metadata ?? {}), giver_topics: [...kept, question].slice(-10) };
        const { error } = await db().from('projects').update({ context: next, project_metadata: meta }).eq('id', project.id);
        if (error) throw new Error(error.message);

        return NextResponse.json({ openQuestions: giverPendingTopics(meta, next.suggested_topics) });
    } catch (err) {
        console.error('[famille/questions]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
