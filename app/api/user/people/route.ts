import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { normalizeContext, pendingTopics } from '@/lib/loomina/context';
import { DEMO_DATA, demoAddPerson, personTopic } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * L'auteur ajoute lui-même une personne de son histoire (prénom et rôle).
 * Elle rejoint les proches du contexte, avec une note qui dit à Loomina
 * d'en savoir plus, et un sujet suggéré : Loomina demandera qui elle est
 * lors d'un prochain appel. Le sujet est retiré une fois abordé (pipeline).
 */
export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => ({}))) as { name?: unknown; relation?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
    const relation = typeof body.relation === 'string' ? body.relation.trim().slice(0, 80) : '';
    if (name.length < 2) return NextResponse.json({ error: 'Indiquez un prénom.' }, { status: 400 });
    if (relation.length < 2) return NextResponse.json({ error: 'Indiquez qui est cette personne pour vous.' }, { status: 400 });

    if (DEMO_DATA) return NextResponse.json(demoAddPerson(name, relation));
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Aucun livre en cours' }, { status: 409 });

        const context = normalizeContext(author.project.context);
        if (context.family.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
            return NextResponse.json({ error: `${name} est déjà dans la liste.` }, { status: 409 });
        }
        const family = [{ name, relation, note: 'ajouté par l’auteur sur son espace : Loomina ne la connaît pas encore, à faire raconter' }, ...context.family];
        // Dix sujets au plus attendent : au-delà, la personne est quand même retenue dans les proches.
        const topics = context.suggested_topics ?? [];
        const suggested_topics = topics.length < 10 ? [...topics, personTopic(name, relation)] : topics;
        const next = normalizeContext({ ...context, family, suggested_topics });

        const { error } = await db().from('projects').update({ context: next }).eq('id', author.project.id);
        if (error) throw new Error(error.message);

        return NextResponse.json({
            family: next.family.map(({ name, relation, deceased }) => ({ name, relation, deceased })),
            openQuestions: pendingTopics(next),
        });
    } catch (err) {
        console.error('[user/people]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
