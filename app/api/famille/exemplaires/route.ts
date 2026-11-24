import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/loomina/session';
import { isTestFamilyPhone } from '@/lib/loomina/test-family';
import { findGiftProjects, familyMemberOf } from '@/lib/loomina/giver';
import { EXTRA_COPY, normalizeExtraCopies } from '@/config/offer';
import { extraCopiesLineItem } from '@/lib/loomina/extra-copies';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Des exemplaires en plus du livre, commandés depuis l'espace famille
 * (Solal, 24/11/2026). Ouvre une page de paiement Stripe ; le webhook note
 * les exemplaires sur le livre une fois payés (app/api/webhook/stripe).
 * L'adresse de livraison est demandée par Stripe : chaque proche reçoit
 * ses exemplaires chez lui.
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

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loomina.eu';
        const checkout = await stripe().checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [extraCopiesLineItem(copies)],
            shipping_address_collection: { allowed_countries: ['FR'] },
            allow_promotion_codes: true,
            success_url: `${origin}/dashboard?exemplaires=merci`,
            cancel_url: `${origin}/dashboard`,
            expires_at: Math.floor(Date.now() / 1000) + 2 * 60 * 60,
            // Pas de metadata.email : ce n'est pas une commande de livre, aucune relance de panier.
            metadata: {
                kind: 'extra_copies',
                projectId: project.id,
                copies: String(copies),
                unitPrice: String(EXTRA_COPY.price),
                byPhone: session.phone,
                byFirstName: me?.firstName ?? '',
            },
        });
        return NextResponse.json({ url: checkout.url });
    } catch (err) {
        console.error('[famille/exemplaires]', err);
        return NextResponse.json({ error: 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.' }, { status: 500 });
    }
}
