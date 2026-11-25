import { NextRequest, NextResponse } from 'next/server';
import { currentAuthor } from '@/lib/loomina/author';
import { addPhoto, photosOf, PhotoRefused, signedUrls } from '@/lib/loomina/photos';
import type { PhotoEntry } from '@/lib/loomina/photos';
import { DEMO_DATA } from '@/lib/loomina/demo';
import { testAuthorReply } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

async function withUrls(photos: PhotoEntry[]) {
    const urls = await signedUrls(photos.map((p) => p.path)).catch(() => ({}) as Record<string, string>);
    return photos.map((p) => ({ id: p.id, caption: p.caption, question: p.question, chapter: p.chapter ?? null, at: p.at, from: p.from ?? null, url: urls[p.path] ?? null }));
}

/** Les photos du livre, avec des liens d'affichage temporaires. */
export async function GET(request: NextRequest) {
    const essai = await testAuthorReply(request, 'photos');
    if (essai) return essai;
    if (DEMO_DATA) return NextResponse.json({ photos: [] });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        return NextResponse.json({ photos: await withUrls(photosOf(author.project?.project_metadata ?? null)) });
    } catch (err) {
        console.error('[user/photos]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

/**
 * Ajoute une photo : stockage, description, question pour le prochain
 * appel. Le navigateur la réduit avant l'envoi (1 600 px, JPEG).
 */
export async function POST(request: NextRequest) {
    const essai = await testAuthorReply(request, 'photo-upload');
    if (essai) return essai;
    if (DEMO_DATA) return NextResponse.json({ error: 'Indisponible en mode démo.' }, { status: 501 });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;
        if (!project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const form = await request.formData();
        const file = form.get('photo');
        const caption = typeof form.get('caption') === 'string' ? (form.get('caption') as string).trim().slice(0, 200) || null : null;
        const chapter = typeof form.get('chapter') === 'string' ? (form.get('chapter') as string).trim().slice(0, 120) || null : null;
        if (!(file instanceof File)) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });

        const photos = await addPhoto({
            projectId: project.id,
            meta: project.project_metadata,
            politeness: profile.politeness_preference === 'tu' ? 'tu' : 'vous',
            firstName: profile.first_name ?? 'le narrateur',
            file,
            caption,
            chapter,
        });
        return NextResponse.json({ photos: await withUrls(photos) });
    } catch (err) {
        if (err instanceof PhotoRefused) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('[user/photos]', err);
        return NextResponse.json({ error: 'L’envoi n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
