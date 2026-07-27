/**
 * Le pipeline de fin d'appel.
 *
 * Remplace à lui seul les 40 modules de la branche « End-of-Call » du
 * scénario Make — qui répétait quatre fois la même séquence, une par phase.
 *
 * Ordre d'exécution, et pourquoi :
 *   1. Garde-fou    — un transcript trop court ne doit rien déclencher
 *   2. Directeur    — analyse et met à jour la mémoire
 *   3. Persistance  — on écrit AVANT d'appeler l'Écrivain, pour que
 *                     l'analyse survive si la rédaction échoue
 *   4. Écrivain     — rédige le chapitre
 *   5. Chapitre     — écrit dans `chapters`, plus jamais en append
 */

import { db, findActiveProject, getRecentChapters, getNextChapterNumber } from './db';
import type { Profile, Project } from './db';
import { toPhase, isFinalPhase } from './phases';
import type { Phase } from './phases';
import { normalizeContext, contextFromLegacy, isEmptyContext } from './context';
import type { LoominaContext } from './context';
import { runDirector } from './director';
import type { DirectorResult } from './director';
import { runWriter } from './writer';

/**
 * Seuils du garde-fou.
 *
 * Auparavant un transcript de trois mots (« Bonjour au revoir »)
 * déclenchait toute la chaîne Directeur + Écrivain et consommait
 * des tokens pour produire un chapitre vide.
 */
export const MIN_TRANSCRIPT_CHARS = 200;
export const MIN_DURATION_SECONDS = 60;

export interface PipelineOutcome {
    status: 'processed' | 'too_short' | 'no_project';
    interviewId?: string;
    chapterId?: string;
    chapterNumber?: number;
    phase?: Phase;
    nextPhase?: Phase;
    progress?: number;
    wordCount?: number;
    reason?: string;
}

/** Extraction tolérante : Vapi place ces champs à des profondeurs variables. */
export function extractCallData(message: Record<string, any>) {
    const artifact = message?.artifact ?? {};
    const call = message?.call ?? {};

    const transcript: string =
        message?.transcript ?? artifact?.transcript ?? call?.transcript ?? '';

    const recordingUrl: string | null =
        message?.recordingUrl ?? artifact?.recordingUrl ?? call?.recordingUrl ?? null;

    const durationRaw =
        message?.durationSeconds ?? artifact?.durationSeconds ?? call?.durationSeconds ?? null;

    const phone: string | null =
        message?.customer?.number ?? call?.customer?.number ?? null;

    const metadata = call?.metadata ?? message?.metadata ?? {};

    return {
        transcript: typeof transcript === 'string' ? transcript.trim() : '',
        recordingUrl,
        durationSeconds: Number.isFinite(Number(durationRaw)) ? Math.round(Number(durationRaw)) : null,
        phone,
        userId: (metadata?.user_id as string) ?? null,
        projectId: (metadata?.project_id as string) ?? null,
        vapiCallId: (call?.id as string) ?? (message?.call?.id as string) ?? null,
    };
}

export async function processEndOfCall(params: {
    profile: Profile;
    project?: Project | null;
    message: Record<string, any>;
}): Promise<PipelineOutcome> {
    const supabase = db();
    const data = extractCallData(params.message);

    const project = params.project ?? (await findActiveProject(params.profile.id));
    if (!project) {
        return { status: 'no_project', reason: 'Aucun projet actif pour ce profil' };
    }

    const phase = toPhase(project.phase);

    // ---------------------------------------------------------
    // 1. Garde-fou — on archive toujours, on ne traite pas toujours
    // ---------------------------------------------------------
    const tooShort =
        data.transcript.length < MIN_TRANSCRIPT_CHARS ||
        (data.durationSeconds !== null && data.durationSeconds < MIN_DURATION_SECONDS);

    const { data: interviewRow, error: interviewError } = await supabase
        .from('interviews')
        .insert({
            project_id: project.id,
            transcript: data.transcript || null,
            audio_url: data.recordingUrl,
            duration_seconds: data.durationSeconds,
            started_at: new Date().toISOString(),
            phase,
            processing_status: tooShort ? 'too_short' : 'pending',
        })
        .select('id')
        .single();

    if (interviewError) throw new Error(`Écriture interviews impossible : ${interviewError.message}`);
    const interviewId = interviewRow.id as string;

    if (tooShort) {
        return {
            status: 'too_short',
            interviewId,
            phase,
            reason: `Transcript de ${data.transcript.length} caractères pour ${data.durationSeconds ?? '?'} s — sous les seuils, aucun traitement IA lancé`,
        };
    }

    // ---------------------------------------------------------
    // 2. Le Directeur
    // ---------------------------------------------------------
    const currentContext: LoominaContext = isEmptyContext(project.context)
        ? contextFromLegacy(project.global_context)
        : normalizeContext(project.context);

    const director = await runDirector({
        transcript: data.transcript,
        context: currentContext,
        phase,
        firstName: params.profile.first_name ?? params.profile.full_name ?? 'le narrateur',
        durationSeconds: data.durationSeconds,
    });

    // ---------------------------------------------------------
    // 3. Persistance de l'analyse — AVANT la rédaction
    //    Si l'Écrivain échoue, l'analyse et la question suivante
    //    sont déjà sauvées : le prochain appel reste pertinent.
    // ---------------------------------------------------------
    await persistDirectorResult({ project, profile: params.profile, interviewId, director });

    // ---------------------------------------------------------
    // 4. L'Écrivain — avec les chapitres précédents
    // ---------------------------------------------------------
    const previousChapters = await getRecentChapters(project.id, 3);

    const writer = await runWriter({
        transcript: data.transcript,
        context: director.context,
        previousChapters,
        phase,
        writingStyle: director.profile_updates.writing_style ?? params.profile.writing_style,
        titleHint: director.chapter_title_hint,
    });

    // ---------------------------------------------------------
    // 5. Le chapitre — une ligne, pas une concaténation
    // ---------------------------------------------------------
    const chapterNumber = await getNextChapterNumber(project.id);

    const { data: chapterRow, error: chapterError } = await supabase
        .from('chapters')
        .insert({
            project_id: project.id,
            chapter_number: chapterNumber,
            phase,
            title: writer.chapter_title,
            content_markdown: writer.chapter_content,
            word_count: writer.word_count,
            status: 'draft',
            version: 1,
            latest_interview_id: interviewId,
            topic_id: director.next_topic_id,
            updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

    if (chapterError) throw new Error(`Écriture chapters impossible : ${chapterError.message}`);

    await supabase
        .from('interviews')
        .update({ processing_status: 'processed' })
        .eq('id', interviewId);

    return {
        status: 'processed',
        interviewId,
        chapterId: chapterRow.id as string,
        chapterNumber,
        phase,
        nextPhase: director.resolved.next_phase,
        progress: director.progress_percentage,
        wordCount: writer.word_count,
    };
}

async function persistDirectorResult(params: {
    project: Project;
    profile: Profile;
    interviewId: string;
    director: DirectorResult;
}) {
    const supabase = db();
    const { project, profile, interviewId, director } = params;

    const projectCompleted =
        isFinalPhase(director.resolved.phase) && director.progress_percentage >= 100;

    // -- projects
    const { error: projectError } = await supabase
        .from('projects')
        .update({
            phase: director.resolved.next_phase,
            phase_progress: director.progress_percentage,
            current_topic_id: director.next_topic_id,
            context: director.context,
            next_question_strategy: director.next_question,
            status: projectCompleted ? 'completed' : 'active',
        })
        .eq('id', project.id);

    if (projectError) throw new Error(`Mise à jour projects impossible : ${projectError.message}`);

    // -- interviews
    await supabase
        .from('interviews')
        .update({
            topics_summary: director.call_summary,
            covered_topics: director.covered_topic_ids,
            sentiment_score: director.sentiment_score,
            ai_analysis_log: {
                phase: director.resolved.phase,
                next_phase: director.resolved.next_phase,
                progress: director.progress_percentage,
                next_question: director.next_question,
                model: 'gpt-4o',
                at: new Date().toISOString(),
            },
        })
        .eq('id', interviewId);

    // -- profiles : uniquement ce que le client a exprimé pendant l'appel
    const updates: Record<string, unknown> = {};
    if (director.profile_updates.writing_style) {
        updates.writing_style = director.profile_updates.writing_style;
    }
    if (director.profile_updates.politeness_preference) {
        updates.politeness_preference = director.profile_updates.politeness_preference;
    }
    if (director.profile_updates.sensitive_topics.length) {
        const existing = (profile.sensitive_topics ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        const merged = [...new Set([...existing, ...director.profile_updates.sensitive_topics])];
        updates.sensitive_topics = merged.join(', ');
    }
    if (Object.keys(updates).length) {
        await supabase.from('profiles').update(updates).eq('id', profile.id);
    }

    // -- family_members : on n'insère que les personnes inconnues
    if (director.family_members.length) {
        const { data: existing } = await supabase
            .from('family_members')
            .select('full_name')
            .eq('project_id', project.id);

        const known = new Set(
            (existing ?? []).map((f: { full_name: string | null }) =>
                (f.full_name ?? '').trim().toLowerCase()
            )
        );

        const fresh = director.family_members
            .filter((m) => !known.has(m.full_name.trim().toLowerCase()))
            .map((m) => ({
                project_id: project.id,
                full_name: m.full_name,
                relation: m.relation,
                is_deceased: m.is_deceased,
                notes: m.notes,
            }));

        if (fresh.length) {
            await supabase.from('family_members').insert(fresh);
        }
    }
}
