import { NextRequest, NextResponse } from 'next/server';
import { findByInvite, ESSAI_INVITE_TOKEN } from '@/lib/loomina/photo-invite';
import { addPhoto, PhotoRefused } from '@/lib/loomina/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;

/**
 * Un proche envoie une photo par le lien d'invitation (lib/loomina/photo-invite.ts).
 * Pas de session : le jeton du lien suffit. La réponse ne renvoie rien du
 * livre (ni les autres photos, ni leurs liens).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    try {
        const form = await request.formData();
        const file = form.get('photo');
        const text = (key: string, max: number) => (typeof form.get(key) === 'string' ? (form.get(key) as string).trim().slice(0, max) || null : null);
        const caption = text('caption', 200);
        const from = text('from', 40);
        if (!(file instanceof File)) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });

        if (token === ESSAI_INVITE_TOKEN) return NextResponse.json({ ok: true, essai: true });

        const found = await findByInvite(token);
        if (!found) return NextResponse.json({ error: 'Ce lien ne marche plus. Vérifiez l’adresse auprès de la personne qui vous l’a envoyée.' }, { status: 404 });
        const { project, profile } = found;
        await addPhoto({
            projectId: project.id,
            meta: project.project_metadata,
            politeness: profile.politeness_preference === 'tu' ? 'tu' : 'vous',
            firstName: profile.first_name ?? 'le narrateur',
            file,
            caption,
            chapter: null,
            from,
        });
        return NextResponse.json({ ok: true });
    } catch (err) {
        if (err instanceof PhotoRefused) return NextResponse.json({ error: err.message }, { status: err.status });
        console.error('[photos/lien]', err instanceof Error ? err.message : String(err));
        return NextResponse.json({ error: 'L’envoi n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
