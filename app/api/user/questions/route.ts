import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext, pendingTopics } from '@/lib/loomina/context';
import { DEMO_DATA, demoAddQuestion } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Un sujet suggéré par l'auteur ou un proche. Il rejoint `suggested_topics`,
 * que l'assistant reçoit au prochain appel dans un bloc à part, avec la
 * consigne de l'aborder (lib/loomina/assistant.ts). Le Directeur signale
 * quand il a été traité et le pipeline le retire.
 */
export async function POST(request: NextRequest) {
    if (DEMO_DATA) {
        const { question } = (await request.json().catch(() => ({}))) as { question?: string };
        if (!question?.trim()) return NextResponse.json({ error: 'Question trop courte' }, { status: 400 });
        return NextResponse.json({ openQuestions: demoAddQuestion(question.trim().slice(0, 280)) });
    }
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const body = (await request.json().catch(() => ({}))) as { question?: unknown };
        const question = typeof body.question === 'string' ? body.question.trim().slice(0, 280) : '';
        if (question.length < 5) return NextResponse.json({ error: 'Question trop courte' }, { status: 400 });

        const context = normalizeContext(author.project.context);
        if ((context.suggested_topics?.length ?? 0) >= 10) {
            return NextResponse.json(
                { error: 'Dix sujets attendent déjà : Loomina les abordera avant d’en ajouter d’autres.' },
                { status: 409 }
            );
        }
        // La plus ancienne en tête : c'est elle que l'assistant aborde en premier.
        // normalizeContext déduplique et plafonne la liste à 10.
        const next = normalizeContext({ ...context, suggested_topics: [...(context.suggested_topics ?? []), question] });

        const { error } = await db().from('projects').update({ context: next }).eq('id', author.project.id);
        if (error) throw new Error(error.message);

        return NextResponse.json({ openQuestions: pendingTopics(next) });
    } catch (err) {
        console.error('[user/questions]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
