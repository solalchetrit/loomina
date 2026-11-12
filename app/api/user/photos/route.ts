import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { describePhoto, photoTopic, signedUrls, MAX_PHOTOS, MAX_PHOTO_BYTES, PHOTO_BUCKET } from '@/lib/loomina/photos';
import type { PhotoEntry } from '@/lib/loomina/photos';
import { DEMO_DATA } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function photosOf(meta: Record<string, unknown> | null): PhotoEntry[] {
    return Array.isArray(meta?.photos) ? (meta!.photos as PhotoEntry[]) : [];
}

async function withUrls(photos: PhotoEntry[]) {
    const urls = await signedUrls(photos.map((p) => p.path)).catch(() => ({}) as Record<string, string>);
    return photos.map((p) => ({ id: p.id, caption: p.caption, question: p.question, at: p.at, url: urls[p.path] ?? null }));
}

/** Les photos du livre, avec des liens d'affichage temporaires. */
export async function GET(request: NextRequest) {
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
    if (DEMO_DATA) return NextResponse.json({ error: 'Indisponible en mode démo.' }, { status: 501 });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;
        if (!project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const form = await request.formData();
        const file = form.get('photo');
        const caption = typeof form.get('caption') === 'string' ? (form.get('caption') as string).trim().slice(0, 200) || null : null;
        if (!(file instanceof File)) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });
        const ext = TYPES[file.type];
        if (!ext) return NextResponse.json({ error: 'Format non pris en charge : envoyez une photo JPEG ou PNG.' }, { status: 415 });
        if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Photo trop lourde (4 Mo au plus).' }, { status: 413 });

        const existing = photosOf(project.project_metadata);
        if (existing.length >= MAX_PHOTOS) return NextResponse.json({ error: `Vous avez déjà envoyé ${MAX_PHOTOS} photos.` }, { status: 409 });

        const bytes = Buffer.from(await file.arrayBuffer());
        const id = randomUUID();
        const path = `${project.id}/${id}.${ext}`;
        const { error: upErr } = await db().storage.from(PHOTO_BUCKET).upload(path, bytes, { contentType: file.type, upsert: false });
        if (upErr) throw new Error(`stockage : ${upErr.message}`);

        const { description, question } = await describePhoto({
            bytes,
            mime: file.type,
            caption,
            politeness: profile.politeness_preference === 'tu' ? 'tu' : 'vous',
            firstName: profile.first_name ?? 'le narrateur',
        });
        const entry: PhotoEntry = { id, path, caption, description, question, at: new Date().toISOString() };

        // Relire juste avant d'écrire : le pipeline a pu changer le contexte.
        const { data: fresh, error: readErr } = await db().from('projects').select('context, project_metadata').eq('id', project.id).single();
        if (readErr) throw new Error(readErr.message);
        const context = normalizeContext(fresh.context);
        const meta = (fresh.project_metadata ?? {}) as Record<string, unknown>;
        const nextContext = normalizeContext({ ...context, suggested_topics: [...(context.suggested_topics ?? []), photoTopic(entry)] });
        const { error } = await db()
            .from('projects')
            .update({ context: nextContext, project_metadata: { ...meta, photos: [...photosOf(meta), entry] } })
            .eq('id', project.id);
        if (error) throw new Error(error.message);

        return NextResponse.json({ photos: await withUrls([...photosOf(meta), entry]) });
    } catch (err) {
        console.error('[user/photos]', err);
        return NextResponse.json({ error: 'L’envoi n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
