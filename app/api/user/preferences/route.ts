import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor } from '@/lib/loomina/author';
import { DEMO_DATA, demoSavePrefs } from '@/lib/loomina/demo';
import { normalizeSchedule } from '@/lib/loomina/schedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const clean = (v: unknown, max: number): string | null | undefined => {
    if (v === undefined) return undefined;
    if (typeof v !== 'string') return null;
    const s = v.trim().slice(0, max);
    return s === '' ? null : s;
};

/**
 * Réglages de l'entretien, modifiés par l'auteur.
 * Lus par l'assistant vocal au prochain appel (lib/loomina/assistant.ts) et par l'Écrivain.
 */
export async function PATCH(request: NextRequest) {
    if (DEMO_DATA) {
        demoSavePrefs(await request.json().catch(() => ({})));
        return NextResponse.json({ saved: true });
    }
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;

        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

        const profileUpdates: Record<string, string | null> = {};
        if (body.politeness === 'tu' || body.politeness === 'vous') profileUpdates.politeness_preference = body.politeness;
        const phonetic = clean(body.firstNamePhonetic, 80);
        if (phonetic !== undefined) profileUpdates.first_name_phonetic = phonetic;
        const style = clean(body.writingStyle, 200);
        if (style !== undefined) profileUpdates.writing_style = style;
        if (Array.isArray(body.sensitiveTopics)) {
            // Une virgule séparerait le sujet en deux à la relecture.
            const topics = body.sensitiveTopics
                .map((t) => clean(typeof t === 'string' ? t.replaceAll(',', ' ') : t, 80))
                .filter((t): t is string => !!t)
                .slice(0, 20);
            profileUpdates.sensitive_topics = topics.length ? topics.join(', ') : null;
        }

        if (Object.keys(profileUpdates).length) {
            const { error } = await db().from('profiles').update(profileUpdates).eq('id', profile.id);
            if (error) throw new Error(error.message);
        }

        const projectUpdates: Record<string, unknown> = {};
        const title = clean(body.title, 120);
        if (title !== undefined) projectUpdates.title = title;
        // Trace que l'auteur a réglé l'entretien lui-même : au premier appel,
        // l'assistant ne redemande pas tutoiement et sujets à éviter
        // (sessionBlock dans lib/loomina/assistant.ts).
        const meta: Record<string, unknown> = { ...(project?.project_metadata ?? {}) };
        let metaChanged = false;
        if (profileUpdates.politeness_preference || 'sensitive_topics' in profileUpdates) {
            meta.prefs_set_at = new Date().toISOString();
            metaChanged = true;
        }
        if (typeof body.smsChapter === 'boolean') {
            meta.sms_chapter = body.smsChapter;
            metaChanged = true;
        }
        if (body.callSchedule !== undefined) {
            meta.call_schedule = normalizeSchedule(body.callSchedule);
            metaChanged = true;
        }
        if (metaChanged) projectUpdates.project_metadata = meta;
        if (project && Object.keys(projectUpdates).length) {
            const { error } = await db().from('projects').update(projectUpdates).eq('id', project.id);
            if (error) throw new Error(error.message);
        }

        return NextResponse.json({ saved: true });
    } catch (err) {
        console.error('[user/preferences]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
