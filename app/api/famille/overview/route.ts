import { readFulfillment } from '@/lib/loomina/fulfillment';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { findGiftProjects, giverPendingTopics, readGiver, sharesWithGiver } from '@/lib/loomina/giver';
import { normalizeContext } from '@/lib/loomina/context';
import { toPhase, PHASE_LABELS } from '@/lib/loomina/phases';
import { normalizeSchedule, describeSchedule } from '@/lib/loomina/schedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * L'espace famille : ce que voit la personne qui a offert un livre.
 * L'avancement et le titre des récits, toujours. Le texte des récits,
 * seulement si le narrateur l'a permis dans ses réglages.
 */
export async function GET(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const projects = await findGiftProjects(session.phone);
        if (projects.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const books = await Promise.all(
            projects.map(async (project) => {
                const shared = sharesWithGiver(project.project_metadata);
                const [narrator, chapters, interviews] = await Promise.all([
                    db().from('profiles').select('first_name').eq('id', project.user_id).maybeSingle(),
                    db()
                        .from('chapters')
                        .select('chapter_number, title, content_markdown, created_at')
                        .eq('project_id', project.id)
                        .neq('status', 'archived')
                        .order('chapter_number', { ascending: true }),
                    db()
                        .from('interviews')
                        .select('created_at, duration_seconds')
                        .eq('project_id', project.id)
                        .eq('processing_status', 'processed')
                        .order('created_at', { ascending: false })
                        .limit(30),
                ]);
                if (chapters.error) throw new Error(chapters.error.message);
                if (interviews.error) throw new Error(interviews.error.message);

                const phase = toPhase(project.phase);
                const schedule = normalizeSchedule((project.project_metadata as Record<string, unknown> | null)?.call_schedule);
                return {
                    id: project.id,
                    narratorFirstName: (narrator.data?.first_name as string | null) ?? null,
                    title: project.title,
                    phaseLabel: PHASE_LABELS[phase],
                    progress: Math.max(0, Math.min(100, project.phase_progress ?? 0)),
                    completed: project.status === 'completed',
                    // Après « terminé » : relu, à l'impression, expédié, reçu.
                    delivery: (() => {
                        const f = readFulfillment(project.status, project.project_metadata);
                        return { stage: f.stage, tracking: f.tracking };
                    })(),
                    scheduleText: describeSchedule(schedule),
                    shared,
                    calls: (interviews.data ?? []).map((i) => ({
                        date: i.created_at as string,
                        minutes: i.duration_seconds ? Math.max(1, Math.round((i.duration_seconds as number) / 60)) : null,
                    })),
                    chapters: (chapters.data ?? []).map((c) => ({
                        number: c.chapter_number as number,
                        // Sans partage, ni le texte ni le titre ne sortent du serveur :
                        // l'offreur voit seulement que le livre avance (décision du 17/11/2026).
                        title: shared ? ((c.title as string | null) ?? null) : null,
                        date: c.created_at as string,
                        // Le texte ne sort du serveur que si le narrateur l'a permis.
                        text: shared ? ((c.content_markdown as string | null) ?? null) : null,
                    })),
                    // Seulement les souvenirs que l'offreur a soufflés lui-même.
                    openQuestions: giverPendingTopics(project.project_metadata, normalizeContext(project.context).suggested_topics),
                };
            })
        );

        return NextResponse.json({
            giverFirstName: readGiver(projects[0].project_metadata)?.firstName ?? null,
            books,
        });
    } catch (err) {
        console.error('[famille/overview]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
