import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bouton « J'ai relu ce livre » : le sort de la liste des livres à relire (ou l'y remet). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}/livre`, async (form) => {
        const { data: projects } = await db().from('projects').select('id, project_metadata').eq('user_id', id).order('created_at', { ascending: false }).limit(1);
        const project = projects?.[0];
        if (!project) return { ok: false, message: 'Ce client n’a pas de livre.' };
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        const undo = form.get('annuler') === '1';
        const { error } = await db()
            .from('projects')
            .update({ project_metadata: { ...meta, reviewed_at: undo ? null : new Date().toISOString() } })
            .eq('id', project.id);
        if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
        return { ok: true, message: undo ? 'Livre remis dans la liste à relire.' : 'Livre noté comme relu.' };
    });
}
