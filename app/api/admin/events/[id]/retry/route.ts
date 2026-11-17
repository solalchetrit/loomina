import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { retryEvent } from '@/lib/admin/actions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bouton « Relancer » d'un appel en échec, dans le journal technique. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = new URL(request.url).searchParams.get('client');
    return adminAction(request, client && /^[0-9a-f-]{36}$/.test(client) ? `/admin/clients/${client}` : '/admin', () => retryEvent(id));
}
