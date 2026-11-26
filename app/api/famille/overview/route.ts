import { totalExtraCopies } from '@/lib/loomina/extra-copies';
import { readFulfillment } from '@/lib/loomina/fulfillment';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { readSession } from '@/lib/loomina/session';
import { testFamilyReply } from '@/lib/loomina/test-family';
import { familyMemberOf, familyWelcomeDone, findGiftProjects, giverPendingTopics, sharesWithGiver } from '@/lib/loomina/giver';
import { normalizeContext } from '@/lib/loomina/context';
import { toPhase, PHASE_LABELS } from '@/lib/loomina/phases';
import { normalizeSchedule, describeCalls, parseCallOnce } from '@/lib/loomina/schedule';
import { readPhaseState } from '@/lib/loomina/phase-plan';
import { buildWeave } from '@/lib/loomina/weave';
import { familySetupOpen } from '@/lib/loomina/family-setup';
import { readGiver } from '@/lib/loomina/giver';
import { readReveal } from '@/lib/loomina/gift-reveal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * L'espace famille : ce que voit la personne qui a offert un livre.
 * L'avancement et le titre des récits, toujours. Le texte des récits,
 * seulement si le narrateur l'a permis dans ses réglages.
 */
export async function GET(request: NextRequest) {
    const essai = await testFamilyReply(request, 'overview');
    if (essai) return essai;
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const projects = await findGiftProjects(session.phone);
        if (projects.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const books = await Promise.all(
            projects.map(async (project) => {
                const shared = sharesWithGiver(project.project_metadata);
                const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
                const [narrator, chapters, interviews, anyCall] = await Promise.all([
                    db().from('profiles').select('first_name, first_name_phonetic, politeness_preference, sensitive_topics').eq('id', project.user_id).maybeSingle(),
                    db()
                        .from('chapters')
                        .select('chapter_number, title, content_markdown, created_at, word_count, latest_interview_id')
                        .eq('project_id', project.id)
                        .neq('status', 'archived')
                        .order('chapter_number', { ascending: true }),
                    db()
                        .from('interviews')
                        .select('id, created_at, duration_seconds')
                        .eq('project_id', project.id)
                        .eq('processing_status', 'processed')
                        .order('created_at', { ascending: false })
                        .limit(30),
                    db().from('interviews').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
                ]);
                if (chapters.error) throw new Error(chapters.error.message);
                if (interviews.error) throw new Error(interviews.error.message);

                const phase = toPhase(project.phase);
                const schedule = normalizeSchedule(meta.call_schedule);
                const completed = project.status === 'completed';
                const words = (chapters.data ?? []).reduce((n, c) => n + ((c.word_count as number) ?? 0), 0);
                // Le titre d'un récit sert de titre à l'appel, seulement si le narrateur partage.
                const titleOf = new Map(
                    shared ? (chapters.data ?? []).filter((c) => c.latest_interview_id).map((c) => [c.latest_interview_id as string, (c.title as string | null) ?? null]) : [],
                );
                const topics = ((narrator.data?.sensitive_topics as string | null) ?? '')
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean);
                return {
                    id: project.id,
                    narratorFirstName: (narrator.data?.first_name as string | null) ?? null,
                    phase,
                    // Mémo, côté famille : la même toile que l'auteur voit (lib/loomina/weave.ts).
                    weave: buildWeave({
                        phase,
                        completed,
                        state: readPhaseState(meta, phase),
                        calls: (interviews.data ?? []).length,
                        words,
                        photos: Array.isArray(meta.photos) ? meta.photos.length : 0,
                        hasTitle: Boolean(project.title?.trim()),
                        hasSchedule: schedule.active || parseCallOnce(meta.call_once) !== null,
                    }),
                    words: shared ? words : null,
                    // L'accueil de l'espace famille, montré une fois à chaque proche (familyWelcomeDone).
                    welcome: !familyWelcomeDone(meta, session.phone),
                    // Préparer le premier appel : seulement avant tout appel, et tant que le narrateur n'a rien réglé.
                    setup: familySetupOpen({ meta, status: project.status, calls: anyCall.count ?? 0 })
                        ? {
                              firstName: (narrator.data?.first_name as string | null) ?? '',
                              firstNamePhonetic: (narrator.data?.first_name_phonetic as string | null) ?? '',
                              politeness: narrator.data?.politeness_preference === 'tu' ? 'tu' : 'vous',
                              sensitiveTopics: topics,
                          }
                        : null,
                    // Ce que la famille a réglé avant le premier appel (affiché, plus modifiable une fois l'appel passé).
                    setBy: meta.prefs_set_by === 'giver' ? 'giver' : meta.prefs_set_at ? 'author' : null,
                    // Livre offert : quand prévenir la personne (lib/loomina/gift-reveal.ts). Seul celui qui offre choisit,
                    // et seulement avant tout appel.
                    reveal:
                        meta.is_gift === true && readGiver(meta)?.phone === session.phone && !completed && (anyCall.count ?? 0) === 0
                            ? (() => {
                                  const r = readReveal(meta);
                                  return { date: r.date, sentAt: r.skipped ? null : r.sentAt };
                              })()
                            : null,
                    title: project.title,
                    phaseLabel: PHASE_LABELS[phase],
                    progress: Math.max(0, Math.min(100, project.phase_progress ?? 0)),
                    completed,
                    // Après « terminé » : relu, à l'impression, expédié, reçu.
                    delivery: (() => {
                        const f = readFulfillment(project.status, project.project_metadata);
                        return { stage: f.stage, tracking: f.tracking };
                    })(),
                    scheduleText: describeCalls(schedule, meta.call_once),
                    shared,
                    calls: (interviews.data ?? []).map((i) => ({
                        title: titleOf.get(i.id as string) ?? null,
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
                    // Exemplaires en plus déjà commandés pour ce livre (lib/loomina/extra-copies.ts).
                    extraCopies: totalExtraCopies(project.project_metadata),
                    openQuestions: giverPendingTopics(project.project_metadata, normalizeContext(project.context).suggested_topics),
                };
            })
        );

        return NextResponse.json({
            // Le prénom de la personne connectée : celle qui a offert le livre, ou un autre proche.
            giverFirstName: familyMemberOf(projects[0].project_metadata, session.phone)?.firstName ?? null,
            books,
        });
    } catch (err) {
        console.error('[famille/overview]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
