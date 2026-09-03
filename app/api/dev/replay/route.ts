/**
 * Banc d'essai des prompts — LECTURE SEULE, rien n'est écrit en base.
 *
 * C'est le gain le plus concret du passage au code, et ce que Make ne
 * pouvait pas offrir : itérer sur les prompts sans rappeler le numéro.
 *
 * Tu colles un vrai transcript, tu vois ce que produisent le Directeur
 * et l'Écrivain, tu ajustes le prompt dans le code, tu relances. Boucle
 * de quelques secondes au lieu d'un appel téléphonique de 20 minutes.
 *
 * SÉCURITÉ : cette route ne répond qu'en développement local, ou si
 * LOOMINA_ENABLE_DEV_ROUTES vaut "true". Elle est muette en production.
 *
 * USAGE
 *   npm run dev
 *   curl -s -X POST http://localhost:3000/api/dev/replay \
 *     -H 'Content-Type: application/json' \
 *     -d '{"transcript":"...", "phase":1}' | jq
 *
 *   # Rejouer un vrai appel déjà archivé :
 *   curl -s -X POST http://localhost:3000/api/dev/replay \
 *     -H 'Content-Type: application/json' \
 *     -d '{"interviewId":"<uuid>"}' | jq
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/loomina/db';
import { toPhase } from '@/lib/loomina/phases';
import { normalizeContext, EMPTY_CONTEXT, renderContext } from '@/lib/loomina/context';
import { runDirector } from '@/lib/loomina/director';
import { runWriter, renderPreviousChapters } from '@/lib/loomina/writer';
import type { ChapterSummary } from '@/lib/loomina/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function enabled(): boolean {
    return (
        process.env.NODE_ENV !== 'production' ||
        process.env.LOOMINA_ENABLE_DEV_ROUTES === 'true'
    );
}

export async function POST(request: NextRequest) {
    if (!enabled()) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));

    let transcript: string = typeof body.transcript === 'string' ? body.transcript : '';
    let phase = toPhase(body.phase ?? 1);
    let context = body.context ? normalizeContext(body.context) : { ...EMPTY_CONTEXT };
    let previousChapters: ChapterSummary[] = [];
    let writingStyle: string | null = body.writingStyle ?? null;
    let firstName: string = body.firstName ?? 'le narrateur';
    let durationSeconds: number | null = body.durationSeconds ?? null;
    let source = 'payload';

    // Rejouer un appel réel déjà archivé
    if (body.interviewId) {
        source = `interview ${body.interviewId}`;
        const { data: interview, error } = await db()
            .from('interviews')
            .select('transcript, duration_seconds, phase, project_id')
            .eq('id', body.interviewId)
            .single();

        if (error || !interview) {
            return NextResponse.json({ error: 'interview introuvable' }, { status: 404 });
        }

        transcript = interview.transcript ?? '';
        durationSeconds = interview.duration_seconds ?? null;
        phase = toPhase(interview.phase ?? 1);

        const { data: project } = await db()
            .from('projects')
            .select('context, global_context, user_id')
            .eq('id', interview.project_id)
            .single();

        if (project) {
            context = normalizeContext(project.context);

            const { data: chapters } = await db()
                .from('chapters')
                .select('chapter_number, title, content_markdown')
                .eq('project_id', interview.project_id)
                .order('chapter_number', { ascending: false })
                .limit(3);
            previousChapters = ((chapters as ChapterSummary[]) ?? []).reverse();

            const { data: profile } = await db()
                .from('profiles')
                .select('first_name, writing_style')
                .eq('id', project.user_id)
                .single();
            if (profile) {
                firstName = profile.first_name ?? firstName;
                writingStyle = writingStyle ?? profile.writing_style;
            }
        }
    }

    if (!transcript.trim()) {
        return NextResponse.json({ error: 'transcript vide' }, { status: 400 });
    }

    const t0 = Date.now();
    const director = await runDirector({ transcript, context, phase, firstName, politeness: null, durationSeconds });
    const tDirector = Date.now() - t0;

    const t1 = Date.now();
    const writer = await runWriter({
        transcript,
        context: director.context,
        previousChapters,
        phase,
        writingStyle,
        titleHint: director.chapter_title_hint,
    });
    const tWriter = Date.now() - t1;

    return NextResponse.json({
        source,
        input: {
            phase,
            transcriptChars: transcript.length,
            durationSeconds,
            previousChapters: previousChapters.map((c) => c.chapter_number),
        },
        // Le chronomètre réel — à comparer aux 300 s de budget Vercel.
        timings: { directorMs: tDirector, writerMs: tWriter, totalMs: tDirector + tWriter },
        director: {
            progress: director.progress_percentage,
            sentiment: director.sentiment_score,
            nextPhase: director.resolved.next_phase,
            nextQuestion: director.next_question,
            summary: director.call_summary,
            familyFound: director.family_members.map((f) => `${f.full_name} (${f.relation})`),
            contextRendered: renderContext(director.context),
        },
        writer: {
            title: writer.chapter_title,
            wordCount: writer.word_count,
            notes: writer.notes,
            content: writer.chapter_content,
        },
        debug: {
            previousChaptersSentToWriter: renderPreviousChapters(previousChapters),
        },
    });
}
