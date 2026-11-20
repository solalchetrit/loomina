import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { findGiftProjects } from '@/lib/loomina/giver';
import { familySetupOpen } from '@/lib/loomina/family-setup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (v: unknown, max: number): string | null => {
    if (typeof v !== 'string') return null;
    const s = v.trim().slice(0, max);
    return s === '' ? null : s;
};

/**
 * L'accueil de l'espace famille : la personne qui a offert le livre
 * prépare le premier appel du narrateur (prénom et prononciation, tu ou
 * vous, sujets à éviter), ou dit simplement qu'elle a vu l'accueil.
 * Les réglages ne s'écrivent qu'avant tout appel et tant que le narrateur
 * n'a rien réglé lui-même (lib/loomina/family-setup.ts). Au premier appel,
 * Loomina ne redemande pas ce que la famille a déjà dit.
 */
export async function PATCH(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        // Le livre visé doit être l'un de ceux que ce numéro a offerts.
        const project = (await findGiftProjects(session.phone)).find((p) => p.id === body.projectId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const meta: Record<string, unknown> = { ...(project.project_metadata ?? {}), giver_welcome_done_at: new Date().toISOString() };

        const wantsSetup = body.politeness !== undefined || body.sensitiveTopics !== undefined || body.firstName !== undefined || body.firstNamePhonetic !== undefined;
        if (wantsSetup) {
            const { count } = await db().from('interviews').select('id', { count: 'exact', head: true }).eq('project_id', project.id);
            if (!familySetupOpen({ meta: project.project_metadata, status: project.status, calls: count ?? 0 })) {
                return NextResponse.json({ error: 'Le premier appel a déjà eu lieu : ces réglages appartiennent maintenant au narrateur.' }, { status: 409 });
            }
            const updates: Record<string, string | null> = {};
            const firstName = clean(body.firstName, 60);
            if (firstName) updates.first_name = firstName;
            if (body.firstNamePhonetic !== undefined) updates.first_name_phonetic = clean(body.firstNamePhonetic, 80);
            if (body.politeness === 'tu' || body.politeness === 'vous') updates.politeness_preference = body.politeness;
            if (Array.isArray(body.sensitiveTopics)) {
                // Une virgule séparerait le sujet en deux à la relecture.
                const topics = body.sensitiveTopics
                    .map((t) => clean(typeof t === 'string' ? t.replaceAll(',', ' ') : t, 80))
                    .filter((t): t is string => !!t)
                    .slice(0, 20);
                updates.sensitive_topics = topics.length ? topics.join(', ') : null;
            }
            if (Object.keys(updates).length) {
                const { error } = await db().from('profiles').update(updates).eq('id', project.user_id);
                if (error) throw new Error(error.message);
            }
            if (updates.politeness_preference || 'sensitive_topics' in updates) {
                meta.prefs_set_at = new Date().toISOString();
                meta.prefs_set_by = 'giver';
            }
        }

        const { error } = await db().from('projects').update({ project_metadata: meta }).eq('id', project.id);
        if (error) throw new Error(error.message);
        return NextResponse.json({ saved: true });
    } catch (err) {
        console.error('[famille/preferences]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
