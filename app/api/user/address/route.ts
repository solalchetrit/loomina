import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { DEMO_DATA } from '@/lib/loomina/demo';
import { testAuthorReply } from '@/lib/loomina/test-author';
import { parseShipping, shippingLines } from '@/lib/loomina/shipping';
import { alertTeam } from '@/lib/loomina/notify';
import { readFulfillment } from '@/lib/loomina/fulfillment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** L'auteur indique où envoyer son livre (espace auteur, une fois le livre terminé). */
export async function POST(request: NextRequest) {
    const essai = await testAuthorReply(request, 'address');
    if (essai) return essai;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const shipping = parseShipping(body);
    if (typeof shipping === 'string') return NextResponse.json({ message: shipping }, { status: 400 });
    if (DEMO_DATA) return NextResponse.json({ saved: true, shipping });
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;
        if (!project) return NextResponse.json({ message: 'Aucun livre ouvert.' }, { status: 404 });

        // Relu juste avant l'écriture : d'autres réglages ont pu changer.
        const { data: fresh } = await db().from('projects').select('project_metadata').eq('id', project.id).single();
        const meta = (fresh?.project_metadata ?? project.project_metadata ?? {}) as Record<string, unknown>;
        // Le colis est parti : l'adresse ne peut plus changer d'ici.
        const stage = readFulfillment(project.status, meta).stage;
        if (stage === 'shipped' || stage === 'delivered') {
            return NextResponse.json({ message: 'Votre livre est déjà parti. Pour toute question sur la livraison, écrivez-nous à contact@loomina.eu.' }, { status: 409 });
        }
        const { error } = await db().from('projects').update({ project_metadata: { ...meta, shipping } }).eq('id', project.id);
        if (error) throw new Error(error.message);

        const name = profile.first_name ?? 'Un auteur';
        await alertTeam({
            subject: `${meta.shipping ? 'Adresse de livraison modifiée' : 'Adresse de livraison reçue'} : ${name}`,
            text: `${name} a indiqué où envoyer son livre :\n\n${shippingLines(shipping).join('\n')}`,
            sms: `${name} a donné son adresse de livraison.`,
        });
        return NextResponse.json({ saved: true, shipping });
    } catch (err) {
        console.error('[user/address]', err);
        return NextResponse.json({ message: 'L’enregistrement n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
