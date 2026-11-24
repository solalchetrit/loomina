import { NextRequest, NextResponse } from 'next/server';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeExtraCopies } from '@/config/offer';
import { cleanEmail, createExtraCopiesCheckout } from '@/lib/loomina/extra-copies';
import { readFulfillment } from '@/lib/loomina/fulfillment';
import { parseShipping, shippingLines } from '@/lib/loomina/shipping';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Des exemplaires en plus, commandés par l'auteur depuis son espace
 * (Solal, 24/11/2026). Paiement dans le site, comme la commande.
 * Envoyés avec son livre ; si son livre est déjà parti, le site demande
 * l'adresse (`need`). L'e-mail de confirmation est celui du compte.
 */
export async function POST(request: NextRequest) {
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) {
            // Espace auteur de test (06 12 34 56 78) : rien n'est payé.
            if (author.status === 403) return NextResponse.json({ error: 'Espace de test : la commande d’exemplaires est désactivée ici.' }, { status: 409 });
            return author;
        }
        const { profile, project } = author;
        if (!project) return NextResponse.json({ error: 'Aucun livre ouvert.' }, { status: 404 });

        const body = (await request.json().catch(() => ({}))) as { copies?: unknown; email?: unknown; shipping?: unknown };
        const copies = normalizeExtraCopies(body.copies);
        if (copies < 1) return NextResponse.json({ error: 'Choisissez au moins un exemplaire.' }, { status: 400 });

        const stage = readFulfillment(project.status, (project.project_metadata ?? {}) as Record<string, unknown>).stage;
        const needAddress = stage === 'shipped' || stage === 'delivered';
        const knownEmail = cleanEmail(profile.email);
        const need = [...(needAddress && !body.shipping ? ['address'] : []), ...(!knownEmail && !body.email ? ['email'] : [])];
        if (need.length) return NextResponse.json({ need }, { status: 422 });

        let shipping: string | null = null;
        if (needAddress) {
            const parsed = parseShipping((body.shipping ?? {}) as Record<string, unknown>);
            if (typeof parsed === 'string') return NextResponse.json({ error: parsed }, { status: 400 });
            shipping = shippingLines(parsed).join(', ');
        }
        const email = knownEmail ?? cleanEmail(body.email);
        if (!email) return NextResponse.json({ error: 'Vérifiez l’adresse e-mail : il manque un @ ou un point.' }, { status: 400 });

        const checkout = await createExtraCopiesCheckout({
            origin: request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loomina.eu',
            projectId: project.id,
            copies,
            source: 'auteur',
            byPhone: profile.phone_number ?? '',
            byFirstName: profile.first_name ?? null,
            email,
            shipping,
        });
        return NextResponse.json(checkout);
    } catch (err) {
        console.error('[user/exemplaires]', err);
        return NextResponse.json({ error: 'Le paiement n’a pas pu démarrer. Réessayez dans un instant.' }, { status: 500 });
    }
}
