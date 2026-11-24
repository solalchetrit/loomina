import { NextRequest, after } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';
import { beginReview, runReview } from '@/lib/admin/ecoute';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Bouton « Écouter l'appel » (ou « Réécouter ») de la fiche client. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}?onglet=appels`, async (form) => {
        const interviewId = String(form.get('interview') ?? '');
        const { data: interview } = await db().from('interviews').select('id, project_id').eq('id', interviewId).maybeSingle();
        if (!interview) return { ok: false, message: 'Appel introuvable.' };
        const { data: project } = await db().from('projects').select('user_id').eq('id', interview.project_id).maybeSingle();
        if (project?.user_id !== id) return { ok: false, message: 'Cet appel n’est pas celui de ce client.' };
        const begun = await beginReview(interviewId);
        if (!begun.ok) return begun;
        after(() => runReview(interviewId));
        return { ok: true, message: 'Écoute lancée. Elle prend une à deux minutes : rechargez la page.' };
    });
}
