import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { DEMO_DATA, demoAddQuestion } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Un sujet suggéré par l'auteur ou un proche. Il rejoint les « questions encore
 * ouvertes » du contexte, que l'assistant reçoit au prochain appel ; le Directeur
 * le retire une fois la réponse obtenue.
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
        // La plus récente en tête : normalizeContext plafonne la liste à 15.
        const next = normalizeContext({ ...context, open_questions: [question, ...context.open_questions] });

        const { error } = await db().from('projects').update({ context: next }).eq('id', author.project.id);
        if (error) throw new Error(error.message);

        return NextResponse.json({ openQuestions: next.open_questions });
    } catch (err) {
        console.error('[user/questions]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
