import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bouton « Traité » d'un message du formulaire de contact (ou « Remettre à traiter »). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, '/admin', async (form) => {
        const undo = form.get('annuler') === '1';
        const { error } = await db()
            .from('contact_messages')
            .update({ handled_at: undo ? null : new Date().toISOString() })
            .eq('id', id);
        if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
        return { ok: true, message: undo ? 'Message remis à traiter.' : 'Message rangé dans « Déjà traités ».' };
    });
}
