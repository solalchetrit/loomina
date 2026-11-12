import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { buildBookPlan, sanitizePlan } from '@/lib/loomina/book-plan';
import type { BookPlan } from '@/lib/loomina/book-plan';
import { DEMO_DATA } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/** Le plan par périodes enregistré, s'il existe. */
export async function GET(request: NextRequest) {
    if (DEMO_DATA) return NextResponse.json({ plan: null });
    const author = await currentAuthor(request);
    if (author instanceof NextResponse) return author;
    const plan = ((author.project?.project_metadata ?? {}) as { book_plan?: BookPlan }).book_plan ?? null;
    return NextResponse.json({ plan });
}

/** Range (ou range à nouveau) les chapitres par périodes de vie. */
export async function POST(request: NextRequest) {
    if (DEMO_DATA) {
        // Démo : un plan simple, sans appel au modèle.
        return NextResponse.json({ plan: { parts: sanitizePlan([{ title: 'L’enfance', chapters: [1, 2, 3] }], [1, 2, 3]), chapter_count: 3, at: new Date().toISOString() } });
    }
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const project = author.project;
        if (!project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const { data: chapters, error } = await db()
            .from('chapters')
            .select('chapter_number, title, content_markdown')
            .eq('project_id', project.id)
            .neq('status', 'archived')
            .order('chapter_number', { ascending: true });
        if (error) throw new Error(error.message);
        if (!chapters || chapters.length < 2) {
            return NextResponse.json({ error: 'Il faut au moins deux chapitres pour les ranger.' }, { status: 409 });
        }

        const plan = await buildBookPlan({ chapters, context: normalizeContext(project.context) });
        const { error: saveErr } = await db()
            .from('projects')
            .update({ project_metadata: { ...(project.project_metadata ?? {}), book_plan: plan } })
            .eq('id', project.id);
        if (saveErr) throw new Error(saveErr.message);
        return NextResponse.json({ plan });
    } catch (err) {
        console.error('[user/book-plan]', err);
        return NextResponse.json({ error: 'Le rangement n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
