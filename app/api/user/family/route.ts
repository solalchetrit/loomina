import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { testAuthorReply } from '@/lib/loomina/test-author';
import { formatToE164 } from '@/lib/phone';
import { MAX_FAMILY_MEMBERS, familyAudience, readFamilyMembers, readGiver, storeFamilyMembers } from '@/lib/loomina/giver';
import { notifyFamilyInvite } from '@/lib/loomina/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Ce que l'auteur voit de son espace famille : qui y a accès. */
function listFor(meta: Record<string, unknown> | null | undefined) {
    return familyAudience(meta).map((p) => ({ firstName: p.firstName, phone: p.phone, giver: p.giver }));
}

/**
 * L'auteur ouvre son espace famille à d'autres proches (demande de Solal du
 * 20/11/2026) : POST ajoute un proche (prénom, portable) et lui envoie un SMS
 * d'accès ; DELETE retire un proche. Celui qui a offert le livre ne peut pas
 * être retiré d'ici : c'est lui qui l'a payé.
 */
export async function POST(request: NextRequest) {
    const essai = await testAuthorReply(request, 'family');
    if (essai) return essai;
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;
        if (!project) return NextResponse.json({ error: 'Votre livre n’est pas encore ouvert.' }, { status: 409 });

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const firstName = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 60) : '';
        const phone = typeof body.phone === 'string' ? formatToE164(body.phone) : '';
        if (!firstName) return NextResponse.json({ error: 'Indiquez son prénom.' }, { status: 400 });
        if (!/^\+\d{8,15}$/.test(phone)) return NextResponse.json({ error: 'Vérifiez le numéro : dix chiffres, par exemple 06 12 34 56 78.' }, { status: 400 });
        if (phone === profile.phone_number) return NextResponse.json({ error: 'C’est votre propre numéro. Indiquez celui de votre proche.' }, { status: 400 });

        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        if (familyAudience(meta).some((p) => p.phone === phone)) return NextResponse.json({ error: 'Ce proche a déjà accès à votre espace famille.' }, { status: 409 });
        const members = readFamilyMembers(meta);
        if (members.length >= MAX_FAMILY_MEMBERS) return NextResponse.json({ error: `Dix proches au plus. Retirez-en un pour en ajouter un autre.` }, { status: 409 });

        const next = { ...meta, family_members: storeFamilyMembers([...members, { firstName, phone, addedBy: 'author', addedAt: new Date().toISOString() }]) };
        const { error } = await db().from('projects').update({ project_metadata: next }).eq('id', project.id);
        if (error) throw new Error(error.message);

        const sent = await notifyFamilyInvite({ phone, firstName, narratorFirstName: profile.first_name, invitedBy: profile.first_name });
        return NextResponse.json({ family: listFor(next), sent });
    } catch (err) {
        console.error('[user/family]', err);
        return NextResponse.json({ error: 'L’ajout n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const essai = await testAuthorReply(request, 'family');
    if (essai) return essai;
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { project } = author;
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        if (readGiver(meta)?.phone === phone) return NextResponse.json({ error: 'La personne qui vous a offert ce livre garde son accès.' }, { status: 409 });

        const next = { ...meta, family_members: storeFamilyMembers(readFamilyMembers(meta).filter((m) => m.phone !== phone)) };
        const { error } = await db().from('projects').update({ project_metadata: next }).eq('id', project.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ family: listFor(next) });
    } catch (err) {
        console.error('[user/family]', err);
        return NextResponse.json({ error: 'Le retrait n’a pas abouti. Réessayez dans un instant.' }, { status: 500 });
    }
}
