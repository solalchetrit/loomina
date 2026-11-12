import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { applyCorrection } from '@/lib/loomina/writer';
import { DEMO_DATA } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Propose une version corrigée d'un chapitre, à partir d'une phrase de
 * l'auteur (« Ma grand-mère s'appelait Rose, pas Rosa »). Rien n'est
 * enregistré : l'auteur relit la proposition puis l'enregistre (PATCH).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
    const number = Number((await params).number);
    const body = (await request.json().catch(() => ({}))) as { correction?: unknown; content?: unknown };
    const correction = typeof body.correction === 'string' ? body.correction.trim().slice(0, 300) : '';
    if (correction.length < 4) return NextResponse.json({ error: 'Décrivez la correction en quelques mots.' }, { status: 400 });

    if (DEMO_DATA) {
        const content = typeof body.content === 'string' ? body.content : '';
        return NextResponse.json({ content, demo: true });
    }

    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const { data: rows, error } = await db()
            .from('chapters')
            .select('content_markdown')
            .eq('project_id', author.project.id)
            .eq('chapter_number', number)
            .neq('status', 'archived')
            .limit(1);
        if (error) throw new Error(error.message);
        const current = (rows?.[0]?.content_markdown as string | null) ?? '';
        if (!current) return NextResponse.json({ error: 'Chapitre introuvable' }, { status: 404 });

        const content = await applyCorrection({ content: current, correction, context: normalizeContext(author.project.context) });
        return NextResponse.json({ content });
    } catch (err) {
        console.error('[user/chapters/correction]', err);
        return NextResponse.json({ error: 'La correction automatique n’a pas abouti. Vous pouvez corriger le texte à la main.' }, { status: 500 });
    }
}
