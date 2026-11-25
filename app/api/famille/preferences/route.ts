import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { testFamilyReply } from '@/lib/loomina/test-family';
import { findGiftProjects, markFamilyWelcome, readGiver } from '@/lib/loomina/giver';
import { readReveal, revealNow, validRevealDate } from '@/lib/loomina/gift-reveal';
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
    const essai = await testFamilyReply(request, 'preferences');
    if (essai) return essai;
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        // Le livre visé doit être l'un de ceux que ce numéro a offerts.
        const project = (await findGiftProjects(session.phone)).find((p) => p.id === body.projectId);
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Livre offert : quand prévenir la personne (25/11/2026). Celui qui offre seulement, avant tout appel.
        if (body.reveal !== undefined) {
            const pm = (project.project_metadata ?? {}) as Record<string, unknown>;
            if (pm.is_gift !== true || readGiver(pm)?.phone !== session.phone) return NextResponse.json({ error: 'Seule la personne qui a offert le livre choisit ce moment.' }, { status: 403 });
            if (readReveal(pm).sentAt) return NextResponse.json({ error: 'Le message de bienvenue est déjà parti.' }, { status: 409 });
            if (body.reveal === 'now') {
                const sent = await revealNow({ id: project.id, user_id: project.user_id, project_metadata: pm });
                if (!sent) return NextResponse.json({ error: 'Le SMS n’est pas parti. Réessayez dans un instant.' }, { status: 502 });
                return NextResponse.json({ saved: true, sentAt: new Date().toISOString() });
            }
            const date = body.reveal === null ? null : validRevealDate((body.reveal as { date?: unknown } | null)?.date);
            if (body.reveal !== null && !date) return NextResponse.json({ error: 'Choisissez une date entre demain et dans un an.' }, { status: 400 });
            const { error } = await db().from('projects').update({ project_metadata: { ...pm, gift_reveal: date ? { date } : null } }).eq('id', project.id);
            if (error) throw new Error(error.message);
            return NextResponse.json({ saved: true, date });
        }

        const meta: Record<string, unknown> = { ...(project.project_metadata ?? {}), family_welcome_done: markFamilyWelcome(project.project_metadata, session.phone) };

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
