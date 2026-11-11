import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { currentAuthor, splitTopics } from '@/lib/loomina/author';
import { normalizeContext } from '@/lib/loomina/context';
import { toPhase, PHASE_LABELS } from '@/lib/loomina/phases';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tout ce que l'espace auteur affiche, hors texte des chapitres (voir /api/user/stories). */
export async function GET(request: NextRequest) {
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
        };

        if (!project) {
            return NextResponse.json({ firstName: profile.first_name, project: null, prefs });
        }

        const [chapters, interviews] = await Promise.all([
            db().from('chapters').select('word_count').eq('project_id', project.id).neq('status', 'archived'),
            db()
                .from('interviews')
                .select('created_at, duration_seconds, topics_summary')
                .eq('project_id', project.id)
                .eq('processing_status', 'processed')
                .order('created_at', { ascending: false })
                .limit(30),
        ]);
        if (chapters.error) throw new Error(chapters.error.message);
        if (interviews.error) throw new Error(interviews.error.message);

        const context = normalizeContext(project.context);
        const phase = toPhase(project.phase);

        return NextResponse.json({
            firstName: profile.first_name,
            prefs,
            project: {
                phase,
                phaseLabel: PHASE_LABELS[phase],
                progress: Math.max(0, Math.min(100, project.phase_progress ?? 0)),
                completed: project.status === 'completed',
                nextTopic: project.next_question_strategy,
                chapters: chapters.data.length,
                words: chapters.data.reduce((n, c) => n + ((c.word_count as number) ?? 0), 0),
                timeline: context.timeline,
                family: context.family.map(({ name, relation, deceased }) => ({ name, relation, deceased })),
                themes: context.key_themes,
                openQuestions: context.open_questions,
                calls: interviews.data.map((i) => ({
                    date: i.created_at as string,
                    minutes: i.duration_seconds ? Math.max(1, Math.round((i.duration_seconds as number) / 60)) : null,
                    summary: (i.topics_summary as string | null) ?? null,
                })),
            },
        });
    } catch (err) {
        console.error('[user/overview]', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
