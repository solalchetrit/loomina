import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/loomina/session';
import { isTestFamilyPhone } from '@/lib/loomina/test-family';
import { findGiftProjects, familyMemberOf } from '@/lib/loomina/giver';
import { normalizeExtraCopies } from '@/config/offer';
import { createExtraCopiesCheckout } from '@/lib/loomina/extra-copies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Des exemplaires en plus du livre, commandés depuis l'espace famille
 * (Solal, 24/11/2026). Ouvre une page de paiement Stripe, qui demande
 * l'adresse : chaque proche reçoit ses exemplaires chez lui.
 */
export async function POST(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // L'espace famille de test (07 12 34 56 78) ne paie rien.
    if (isTestFamilyPhone(session.phone)) {
        return NextResponse.json({ error: 'Espace de test : la commande d’exemplaires est désactivée ici.' }, { status: 409 });
    }

    try {
        const body = (await request.json().catch(() => ({}))) as { projectId?: unknown; copies?: unknown };
        const copies = normalizeExtraCopies(body.copies);
        if (copies < 1) return NextResponse.json({ error: 'Choisissez au moins un exemplaire.' }, { status: 400 });

        // Le livre visé doit être l'un de ceux que ce numéro suit.
        const project = (await findGiftProjects(session.phone)).find((p) => p.id === body.projectId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const me = familyMemberOf(project.project_metadata, session.phone);

        const url = await createExtraCopiesCheckout({
            origin: request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loomina.eu',
            projectId: project.id,
            copies,
            source: 'famille',
            byPhone: session.phone,
            byFirstName: me?.firstName ?? null,
            askAddress: true,
        });
        return NextResponse.json({ url });
    } catch (err) {
        console.error('[famille/exemplaires]', err);
        return NextResponse.json({ error: 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.' }, { status: 500 });
    }
}
