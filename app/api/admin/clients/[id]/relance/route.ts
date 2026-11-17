import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { relanceClient } from '@/lib/admin/actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bouton « Relancer » : SMS et e-mail au client qui n'appelle pas. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const back = new URL(request.url).searchParams.get('retour') === 'suivi' ? '/admin/suivi' : `/admin/clients/${id}`;
    return adminAction(request, back, () => relanceClient(id));
}
