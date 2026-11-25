import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { updateNarrator } from '@/lib/admin/actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** « Enregistrer » sur la fiche : corrige les infos du narrateur. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return adminAction(request, `/admin/clients/${id}?onglet=fiche`, (form) => updateNarrator(id, form));
}
