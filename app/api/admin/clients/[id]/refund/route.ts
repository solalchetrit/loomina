import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { refundClient } from '@/lib/admin/actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bouton « Rembourser ce client » de la fiche client. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}`, async (form) => {
        // Garde-fou : il faut écrire le mot en toutes lettres.
        if (String(form.get('confirmation') ?? '').trim().toUpperCase() !== 'REMBOURSER') {
            return { ok: false, message: 'Remboursement annulé : il faut écrire REMBOURSER pour confirmer.' };
        }
        return refundClient(id);
    });
}
