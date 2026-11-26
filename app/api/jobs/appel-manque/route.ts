/**
 * Appel programmé manqué (demande de Solal, 25/11/2026).
 *
 * Le serveur vocal (voice/src/server.ts) appelle cette route quand un appel
 * qu'il a lancé à l'heure du rendez-vous n'a pas été décroché (pas de réponse,
 * occupé, répondeur). Le site envoie alors le SMS (numéro en clair) et
 * l'e-mail (bouton « Appeler ») : lib/loomina/call-mails.ts. Une fois par
 * créneau. Même secret que le rattrapage (`x-vapi-secret`).
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkSharedSecret } from '@/lib/loomina/secret';
import { notifyMissedCall } from '@/lib/loomina/call-mails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const shared = request.headers.get('x-vapi-secret') ?? '';
    if (!checkSharedSecret(shared, process.env.VAPI_WEBHOOK_SECRET, 'appel-manque')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as { phone?: unknown };
    const phone = typeof body.phone === 'string' && /^\+\d{8,15}$/.test(body.phone) ? body.phone : null;
    if (!phone) return NextResponse.json({ error: 'phone' }, { status: 400 });
    try {
        const result = await notifyMissedCall(phone);
        console.info('[appel manqué]', result);
        return NextResponse.json(result);
    } catch (err) {
        console.error('[appel manqué]', err instanceof Error ? err.message : err);
        return NextResponse.json({ error: 'failed' }, { status: 500 });
    }
}
