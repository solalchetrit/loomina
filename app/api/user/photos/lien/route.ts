import { NextRequest, NextResponse } from 'next/server';
import { currentAuthor } from '@/lib/loomina/author';
import { ensureInvite, inviteUrl, ESSAI_INVITE_TOKEN } from '@/lib/loomina/photo-invite';
import { DEMO_DATA } from '@/lib/loomina/demo';
import { isTestSession } from '@/lib/loomina/test-author';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Le lien de l'auteur, à envoyer à ses proches pour qu'ils ajoutent des photos (un par livre, créé au premier affichage, fixe ensuite). */
export async function GET(request: NextRequest) {
    // Espace de test et mode démo : la page d'essai, où rien ne s'enregistre.
    if (DEMO_DATA || (await isTestSession(request))) return NextResponse.json({ url: inviteUrl(ESSAI_INVITE_TOKEN) });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });
        const invite = await ensureInvite(author.project.id);
        return NextResponse.json({ url: inviteUrl(invite.token) });
    } catch (err) {
        console.error('[user/photos/lien]', err);
        return NextResponse.json({ error: 'Le lien n’a pas pu être préparé. Réessayez dans un instant.' }, { status: 500 });
    }
}
