import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { countWords } from '@/lib/loomina/writer';
import { DEMO_DATA } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CHARS = 30_000;

/**
 * L'auteur enregistre un chapitre qu'il a corrigé.
 *
 * Le texte remplace le précédent (version + 1). Si l'auteur a décrit sa
 * correction, elle rejoint `context.author_corrections` : le Directeur et
 * l'Écrivain la respecteront dans tous les chapitres suivants.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
    const number = Number((await params).number);
    if (!Number.isInteger(number) || number < 1) return NextResponse.json({ error: 'Chapitre inconnu' }, { status: 400 });

    const body = (await request.json().catch(() => ({}))) as { content?: unknown; correction?: unknown };
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const correction = typeof body.correction === 'string' ? body.correction.trim().slice(0, 300) : '';
    if (!content) return NextResponse.json({ error: 'Le chapitre ne peut pas être vide.' }, { status: 400 });
    if (content.length > MAX_CHARS) return NextResponse.json({ error: 'Le chapitre est trop long.' }, { status: 400 });

    if (DEMO_DATA) return NextResponse.json({ saved: true, demo: true });

    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });
        const projectId = author.project.id;

        const { data: rows, error: readErr } = await db()
            .from('chapters')
            .select('id, version')
            .eq('project_id', projectId)
            .eq('chapter_number', number)
            .neq('status', 'archived')
            .limit(1);
        if (readErr) throw new Error(readErr.message);
        const chapter = rows?.[0];
        if (!chapter) return NextResponse.json({ error: 'Chapitre introuvable' }, { status: 404 });

        const { error } = await db()
            .from('chapters')
            .update({
                content_markdown: content,
                word_count: countWords(content),
                version: ((chapter.version as number) ?? 1) + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('id', chapter.id);
        if (error) throw new Error(error.message);

        if (correction) {
            const context = normalizeContext(author.project.context);
            const next = normalizeContext({
                ...context,
                author_corrections: [...(context.author_corrections ?? []), `Chapitre ${number} : ${correction}`],
            });
            const { error: ctxErr } = await db().from('projects').update({ context: next }).eq('id', projectId);
            if (ctxErr) throw new Error(ctxErr.message);
        }

        return NextResponse.json({ saved: true });
    } catch (err) {
        console.error('[user/chapters]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
