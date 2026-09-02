import { NextRequest, NextResponse } from 'next/server';
import { db, findProfileByPhone, findActiveProject } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Le livre en cours de l'auteur connecté.
 *
 * Remplace la RPC `get_client_stories`, qui interrogeait des tables
 * disparues. Lit directement `profiles` → `projects` → `chapters` avec la
 * clé service role, et renvoie le même format de lignes qu'avant pour ne
 * pas toucher au composant LiveBook.
 */
export async function GET(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const profile = await findProfileByPhone(session.phone);
        if (!profile) return NextResponse.json([]);

        const project = await findActiveProject(profile.id);
        if (!project) return NextResponse.json([]);

        const { data: chapters, error } = await db()
            .from('chapters')
            .select('id, chapter_number, title, content_markdown, created_at, status')
            .eq('project_id', project.id)
            .neq('status', 'archived')
            .order('chapter_number', { ascending: true });

        if (error) throw new Error(error.message);

        const bookTitle = project.title ?? (profile.first_name ? `L'histoire de ${profile.first_name}` : 'Mon histoire');
        const base = { book_id: project.id, book_title: bookTitle, book_style: profile.writing_style ?? null };

        if (!chapters || chapters.length === 0) {
            return NextResponse.json([{ ...base, story_id: null, story_title: null, story_content: null, story_date: null }]);
        }

        return NextResponse.json(
            chapters.map((c) => ({
                ...base,
                story_id: c.chapter_number,
                story_title: c.title ?? `Chapitre ${c.chapter_number}`,
                story_content: c.content_markdown ?? '',
                story_date: c.created_at,
            }))
        );
    } catch (err) {
        console.error('[user/stories]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
