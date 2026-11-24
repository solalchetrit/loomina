import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/loomina/session';
import { isTestFamilyPhone } from '@/lib/loomina/test-family';
import { findGiftProjects, familyMemberOf } from '@/lib/loomina/giver';
import { normalizeExtraCopies } from '@/config/offer';
import { cleanEmail, createExtraCopiesCheckout } from '@/lib/loomina/extra-copies';
import { parseShipping, shippingLines } from '@/lib/loomina/shipping';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Des exemplaires en plus du livre, commandés depuis l'espace famille
 * (Solal, 24/11/2026). Le proche donne son adresse et son e-mail dans le
 * site, puis paie dans le site (paiement intégré, comme la commande).
 * Sans adresse ni e-mail : la réponse dit ce qu'il manque (`need`).
 */
export async function POST(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // L'espace famille de test (07 12 34 56 78) ne paie rien.
    if (isTestFamilyPhone(session.phone)) {
        return NextResponse.json({ error: 'Espace de test : la commande d’exemplaires est désactivée ici.' }, { status: 409 });
    }

    try {
        const body = (await request.json().catch(() => ({}))) as { projectId?: unknown; copies?: unknown; email?: unknown; shipping?: unknown };
        const copies = normalizeExtraCopies(body.copies);
        if (copies < 1) return NextResponse.json({ error: 'Choisissez au moins un exemplaire.' }, { status: 400 });

        // Le livre visé doit être l'un de ceux que ce numéro suit.
        const project = (await findGiftProjects(session.phone)).find((p) => p.id === body.projectId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const me = familyMemberOf(project.project_metadata, session.phone);

        // Chaque proche reçoit ses exemplaires chez lui : il faut son adresse et son e-mail.
        if (!body.shipping && !body.email) return NextResponse.json({ need: ['address', 'email'] }, { status: 422 });
        const shipping = parseShipping((body.shipping ?? {}) as Record<string, unknown>);
        if (typeof shipping === 'string') return NextResponse.json({ error: shipping }, { status: 400 });
        const email = cleanEmail(body.email);
        if (!email) return NextResponse.json({ error: 'Vérifiez l’adresse e-mail : il manque un @ ou un point.' }, { status: 400 });

        const checkout = await createExtraCopiesCheckout({
            origin: request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loomina.eu',
            projectId: project.id,
            copies,
            source: 'famille',
            byPhone: session.phone,
            byFirstName: me?.firstName ?? null,
            email,
            shipping: shippingLines(shipping).join(', '),
        });
        return NextResponse.json(checkout);
    } catch (err) {
        console.error('[famille/exemplaires]', err);
        return NextResponse.json({ error: 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.' }, { status: 500 });
    }
}
