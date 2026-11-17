import { NextRequest, after } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';
import { beginReview, runReview } from '@/lib/loomina/book-review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Bouton « Demander l'avis de l'IA » de la page de relecture. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}/livre`, async () => {
        const { data: projects } = await db().from('projects').select('id').eq('user_id', id).order('created_at', { ascending: false }).limit(1);
        const projectId = projects?.[0]?.id as string | undefined;
        if (!projectId) return { ok: false, message: 'Ce client n’a pas de livre.' };
        const begun = await beginReview(projectId);
        if (!begun.ok) return begun;
        const { data: profile } = await db().from('profiles').select('first_name').eq('id', id).maybeSingle();
        // L'avis prend une à trois minutes : la page revient tout de suite, il arrive ensuite.
        after(() => runReview(projectId, begun.editionId, begun.chapters, (profile?.first_name as string | null) ?? ''));
        return { ok: true, message: 'Avis demandé. Il arrive dans une à trois minutes : rechargez la page.' };
    });
}
