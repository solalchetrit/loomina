import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * « Client de test » : classe tous les livres du client en test (ou les en
 * sort). Un test reste visible dans l'admin mais ne compte dans aucun chiffre.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}`, async (form) => {
        const test = form.get('annuler') !== '1';
        const { data: projects, error } = await db().from('projects').select('id, project_metadata').eq('user_id', id);
        if (error) return { ok: false, message: `Lecture impossible : ${error.message}` };
        if (!projects?.length) return { ok: false, message: 'Ce client n’a pas de livre.' };
        for (const p of projects) {
            const meta = { ...((p.project_metadata ?? {}) as Record<string, unknown>), test };
            const { error: e } = await db().from('projects').update({ project_metadata: meta }).eq('id', p.id);
            if (e) return { ok: false, message: `Enregistrement impossible : ${e.message}` };
        }
        return { ok: true, message: test ? 'Client classé en test : il ne compte plus dans les chiffres.' : 'Client remis parmi les vrais clients.' };
    });
}
