import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor, splitTopics } from '@/lib/loomina/author';
import { normalizeContext, pendingTopics } from '@/lib/loomina/context';
import { toPhase, PHASE_LABELS } from '@/lib/loomina/phases';
import { DEMO_DATA, demoOverview } from '@/lib/loomina/demo';
import { testAuthorReply } from '@/lib/loomina/test-author';
import { normalizeCallMinutes } from '@/lib/loomina/call-length';
import { normalizeSchedule, describeSchedule } from '@/lib/loomina/schedule';
import { readGiver, sharesWithGiver } from '@/lib/loomina/giver';
import { readFulfillment } from '@/lib/loomina/fulfillment';
import { readShipping } from '@/lib/loomina/shipping';
import { readPhaseState } from '@/lib/loomina/phase-plan';
import { buildWeave } from '@/lib/loomina/weave';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tout ce que l'espace auteur affiche, hors texte des chapitres (voir /api/user/stories). */
export async function GET(request: NextRequest) {
    const essai = await testAuthorReply(request, 'overview');
    if (essai) return essai;
    if (DEMO_DATA) return NextResponse.json(demoOverview());
    try {
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        const { profile, project } = author;

        const prefs = {
            title: project?.title ?? null,
            politeness: profile.politeness_preference === 'tu' ? 'tu' : 'vous',
            firstNamePhonetic: profile.first_name_phonetic,
            writingStyle: profile.writing_style,
            sensitiveTopics: splitTopics(profile.sensitive_topics),
            smsChapter: (project?.project_metadata as Record<string, unknown> | null)?.sms_chapter !== false,
            callSchedule: normalizeSchedule((project?.project_metadata as Record<string, unknown> | null)?.call_schedule),
            callMinutes: normalizeCallMinutes((project?.project_metadata as Record<string, unknown> | null)?.call_minutes),
            // Livre offert : qui l'a offert, et si l'auteur lui laisse lire ses récits.
            giverFirstName: readGiver(project?.project_metadata)?.firstName ?? (readGiver(project?.project_metadata) ? '' : null),
            shareWithGiver: sharesWithGiver(project?.project_metadata),
        };

        if (!project) {
            return NextResponse.json({ firstName: profile.first_name, project: null, prefs });
        }

        const [chapters, interviews] = await Promise.all([
            db().from('chapters').select('word_count, title, latest_interview_id').eq('project_id', project.id).neq('status', 'archived'),
            db()
                .from('interviews')
                .select('id, created_at, duration_seconds, topics_summary')
                .eq('project_id', project.id)
                .eq('processing_status', 'processed')
                .order('created_at', { ascending: false })
                .limit(30),
        ]);
        if (chapters.error) throw new Error(chapters.error.message);
        if (interviews.error) throw new Error(interviews.error.message);

        // L'accueil du premier passage : seulement tant qu'aucun appel n'a eu
        // lieu (au premier appel, Loomina demande elle-même tu/vous et les
        // sujets à éviter) et que l'auteur n'a ni réglé ni remis à plus tard.
        // Si la famille a préparé l'appel, l'accueil reste montré, avec ses choix déjà remplis.
        const pmeta = (project.project_metadata ?? {}) as Record<string, unknown>;
        const { count: anyCall } = await db().from('interviews').select('id', { count: 'exact', head: true }).eq('project_id', project.id);
        const welcome =
            !pmeta.welcome_done_at && (!pmeta.prefs_set_at || pmeta.prefs_set_by === 'giver') && !anyCall && project.status !== 'completed'
                ? { politeness: true, topics: !profile.sensitive_topics?.trim() }
                : null;

        const context = normalizeContext(project.context);
        // Le titre du récit écrit après chaque appel sert de titre à l'appel.
        const titleOf = new Map(chapters.data.filter((c) => c.latest_interview_id).map((c) => [c.latest_interview_id as string, (c.title as string | null) ?? null]));
        const phase = toPhase(project.phase);

        const completed = project.status === 'completed';
        const words = chapters.data.reduce((n, c) => n + ((c.word_count as number) ?? 0), 0);

        return NextResponse.json({
            firstName: profile.first_name,
            prefs,
            welcome,
            shipping: readShipping(pmeta),
            delivery: (() => {
                const f = readFulfillment(project.status, pmeta);
                return { stage: f.stage, tracking: f.tracking, shippedAt: f.shippedAt };
            })(),
            project: {
                phase,
                phaseLabel: PHASE_LABELS[phase],
                progress: Math.max(0, Math.min(100, project.phase_progress ?? 0)),
                completed,
                nextTopic: project.next_question_strategy,
                scheduleText: describeSchedule(prefs.callSchedule),
                chapters: chapters.data.length,
                words,
                // La toile du livre : un rang par sujet raconté (lib/loomina/weave.ts).
                weave: buildWeave({
                    phase,
                    completed,
                    state: readPhaseState(pmeta, phase),
                    calls: interviews.data.length,
                    words,
                    photos: Array.isArray(pmeta.photos) ? pmeta.photos.length : 0,
                    hasTitle: Boolean(project.title?.trim()),
                    hasSchedule: prefs.callSchedule.active,
                }),
                timeline: context.timeline,
                family: context.family.map(({ name, relation, deceased }) => ({ name, relation, deceased })),
                themes: context.key_themes,
                openQuestions: pendingTopics(context),
                calls: interviews.data.map((i) => ({
                    date: i.created_at as string,
                    minutes: i.duration_seconds ? Math.max(1, Math.round((i.duration_seconds as number) / 60)) : null,
                    title: titleOf.get(i.id as string) ?? null,
                    summary: (i.topics_summary as string | null) ?? null,
                })),
            },
        });
    } catch (err) {
        console.error('[user/overview]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
