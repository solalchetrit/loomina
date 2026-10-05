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
 *
 * REJOUABLE (05/10/2026)
 * Un même événement peut être traité plusieurs fois (échec de l'Écrivain,
 * fonction tuée, rattrapage du cron). Chaque étape vérifie donc ce qui est
 * déjà fait : un seul entretien par événement (`call_event_id`), le
 * Directeur ne repasse pas si son analyse est déjà enregistrée (sinon il
 * ferait avancer la phase une seconde fois), et pas de second chapitre.
 */

import { db, findActiveProject, getRecentChapters, getNextChapterNumber } from './db';
import type { Profile, Project } from './db';
import { toPhase, isFinalPhase } from './phases';
import type { Phase } from './phases';
import { normalizeContext, contextFromLegacy, isEmptyContext } from './context';
import type { LoominaContext } from './context';
import { runDirector, DIRECTOR_MODEL } from './director';
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
    status: 'processed' | 'no_material' | 'too_short' | 'no_project';
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

interface ExistingInterview {
    id: string;
    phase: number | null;
    processing_status: string | null;
    ai_analysis_log: AnalysisLog | null;
    created_at: string;
}

/** Ce que `persistDirectorResult` écrit dans `interviews.ai_analysis_log`. */
interface AnalysisLog {
    next_phase?: Phase;
    progress?: number;
    profile_updates?: { writing_style?: string | null };
    chapter_material?: DirectorResult['chapter_material'];
    chapter_title_hint?: string | null;
    next_topic_id?: number | null;
    project_update?: Record<string, unknown> & { context?: unknown };
    family_members?: DirectorResult['family_members'];
}

/** Ce que l'Écrivain a besoin de savoir de l'analyse, rejouable depuis la base. */
interface WriterBrief {
    phase: Phase;
    context: LoominaContext;
    material: DirectorResult['chapter_material'];
    titleHint: string | null;
    writingStyle: string | null;
    nextPhase?: Phase;
    progress?: number;
    nextTopicId: number | null;
}

export async function processEndOfCall(params: {
    profile: Profile;
    project?: Project | null;
    message: Record<string, any>;
    /** L'événement `call_events` d'origine : rend le traitement rejouable. */
    eventId?: string;
}): Promise<PipelineOutcome> {
    const supabase = db();
    const data = extractCallData(params.message);

    const project = params.project ?? (await findActiveProject(params.profile.id));
    if (!project) {
        return { status: 'no_project', reason: 'Aucun projet actif pour ce profil' };
    }

    // ---------------------------------------------------------
    // 0. Reprise : cet événement a-t-il déjà été (en partie) traité ?
    // ---------------------------------------------------------
    let existing: ExistingInterview | null = null;
    if (params.eventId) {
        const { data: rows, error } = await supabase
            .from('interviews')
            .select('id, phase, processing_status, ai_analysis_log, created_at')
            .eq('call_event_id', params.eventId)
            .limit(1);
        if (error) throw new Error(`Lecture interviews impossible : ${error.message}`);
        existing = (rows?.[0] as ExistingInterview | undefined) ?? null;
    }

    if (existing && (existing.processing_status === 'processed' || existing.processing_status === 'too_short')) {
        return {
            status: existing.processing_status === 'processed' ? 'processed' : 'too_short',
            interviewId: existing.id,
            reason: 'Déjà traité lors d\'un essai précédent',
        };
    }

    const phase = existing?.phase ? toPhase(existing.phase) : toPhase(project.phase);

    // ---------------------------------------------------------
    // 1. Garde-fou — on archive toujours, on ne traite pas toujours
    // ---------------------------------------------------------
    const tooShort =
        data.transcript.length < MIN_TRANSCRIPT_CHARS ||
        (data.durationSeconds !== null && data.durationSeconds < MIN_DURATION_SECONDS);

    let interviewId: string;
    if (existing) {
        interviewId = existing.id;
    } else {
        const { data: interviewRow, error: interviewError } = await supabase
            .from('interviews')
            .insert({
                project_id: project.id,
                call_event_id: params.eventId ?? null,
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
        interviewId = interviewRow.id as string;
    }

    if (tooShort) {
        return {
            status: 'too_short',
            interviewId,
            phase,
            reason: `Transcript de ${data.transcript.length} caractères pour ${data.durationSeconds ?? '?'} s — sous les seuils, aucun traitement IA lancé`,
        };
    }

    // ---------------------------------------------------------
    // 2-3. Le Directeur, puis la persistance de son analyse — AVANT la
    //      rédaction. Si l'analyse existe déjà (essai précédent), on la
    //      réutilise : la relancer ferait avancer la phase deux fois.
    // ---------------------------------------------------------
    let brief: WriterBrief;
    const log = existing?.ai_analysis_log;
    if (log && log.chapter_material) {
        // L'essai précédent a pu s'arrêter entre l'analyse et le projet, ou
        // avant le profil et la famille : on les réapplique. Sauf si un appel
        // PLUS RÉCENT a déjà été analysé : sa mémoire et sa phase font foi,
        // réappliquer l'ancienne analyse les effacerait.
        const newer = await hasNewerAnalysis(project.id, existing!.created_at);
        if (!newer && log.project_update) await applyProjectUpdate(project.id, log.project_update);
        await applyProfileAndFamily({
            projectId: project.id,
            profile: params.profile,
            profileUpdates: newer ? null : (log.profile_updates as DirectorResult['profile_updates'] | undefined) ?? null,
            familyMembers: log.family_members ?? [],
        });
        brief = {
            phase,
            context: normalizeContext(newer ? project.context : log.project_update?.context ?? project.context),
            material: log.chapter_material,
            titleHint: log.chapter_title_hint ?? null,
            writingStyle: log.profile_updates?.writing_style ?? params.profile.writing_style,
            nextPhase: log.next_phase,
            progress: log.progress,
            nextTopicId: log.next_topic_id ?? null,
        };
    } else {
        const currentContext: LoominaContext = isEmptyContext(project.context)
            ? contextFromLegacy(project.global_context)
            : normalizeContext(project.context);

        const director = await runDirector({
            transcript: data.transcript,
            context: currentContext,
            phase,
            firstName: params.profile.first_name ?? params.profile.full_name ?? 'le narrateur',
            politeness: params.profile.politeness_preference,
            durationSeconds: data.durationSeconds,
        });

        await persistDirectorResult({ project, profile: params.profile, interviewId, director });

        brief = {
            phase,
            context: director.context,
            material: director.chapter_material,
            titleHint: director.chapter_title_hint,
            writingStyle: director.profile_updates.writing_style ?? params.profile.writing_style,
            nextPhase: director.resolved.next_phase,
            progress: director.progress_percentage,
            nextTopicId: director.next_topic_id,
        };
    }

    // ---------------------------------------------------------
    // 4. L'Écrivain — seulement s'il y a quelque chose à raconter
    //    L'analyse (mémoire, question suivante) est déjà sauvée : un appel
    //    sans matière n'est pas perdu, il n'a simplement pas de chapitre.
    // ---------------------------------------------------------
    if (brief.material === 'none') {
        await supabase
            .from('interviews')
            .update({ processing_status: 'processed' })
            .eq('id', interviewId);

        return {
            status: 'no_material',
            interviewId,
            phase,
            nextPhase: brief.nextPhase,
            progress: brief.progress,
            reason: 'Le Directeur n\'a rien trouvé de racontable dans cet appel : mémoire mise à jour, pas de chapitre.',
        };
    }

    // Un chapitre déjà écrit pour cet entretien (essai coupé juste après) ?
    const { data: already } = await supabase
        .from('chapters')
        .select('id, chapter_number, word_count')
        .eq('latest_interview_id', interviewId)
        .limit(1);
    if (already?.[0]) {
        await supabase.from('interviews').update({ processing_status: 'processed' }).eq('id', interviewId);
        return {
            status: 'processed',
            interviewId,
            chapterId: already[0].id as string,
            chapterNumber: already[0].chapter_number as number,
            phase,
            nextPhase: brief.nextPhase,
            progress: brief.progress,
            wordCount: (already[0].word_count as number) ?? undefined,
        };
    }

    const previousChapters = await getRecentChapters(project.id, 3);

    const writer = await runWriter({
        transcript: data.transcript,
        context: brief.context,
        previousChapters,
        phase,
        writingStyle: brief.writingStyle,
        titleHint: brief.titleHint,
        material: brief.material,
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
            topic_id: brief.nextTopicId,
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
        nextPhase: brief.nextPhase,
        progress: brief.progress,
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

    const projectUpdate = {
        phase: director.resolved.next_phase,
        phase_progress: director.progress_percentage,
        current_topic_id: director.next_topic_id,
        context: director.context,
        next_question_strategy: director.next_question,
        // Un livre déjà terminé le reste : un appel de plus enrichit le
        // projet sans le rouvrir.
        status: projectCompleted || project.status === 'completed' ? 'completed' : 'active',
    };

    // -- interviews D'ABORD : une fois l'analyse écrite ici, un nouvel essai
    //    ne relance plus le Directeur. Elle contient la mise à jour du
    //    projet, qu'un essai suivant peut réappliquer telle quelle.
    const { error: logError } = await supabase
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
                profile_updates: director.profile_updates,
                // De quoi relancer l'Écrivain sans repasser par le Directeur.
                chapter_material: director.chapter_material,
                chapter_title_hint: director.chapter_title_hint,
                next_topic_id: director.next_topic_id,
                project_update: projectUpdate,
                family_members: director.family_members,
                model: DIRECTOR_MODEL,
                at: new Date().toISOString(),
            },
        })
        .eq('id', interviewId);
    if (logError) throw new Error(`Écriture de l'analyse impossible : ${logError.message}`);

    // -- projects
    await applyProjectUpdate(project.id, projectUpdate);

    await applyProfileAndFamily({
        projectId: project.id,
        profile,
        profileUpdates: director.profile_updates,
        familyMembers: director.family_members,
    });
}

/** Idempotent : réappliquer la même mise à jour ne change rien. */
async function applyProjectUpdate(projectId: string, update: Record<string, unknown>) {
    const { error } = await db().from('projects').update(update).eq('id', projectId);
    if (error) throw new Error(`Mise à jour projects impossible : ${error.message}`);
}

/**
 * Profil (seulement ce que le client a exprimé) et proches (seulement les
 * inconnus). Rejouable : la fusion des sujets sensibles et la recherche
 * des proches par nom évitent les doublons.
 */
async function applyProfileAndFamily(params: {
    projectId: string;
    profile: Profile;
    profileUpdates: DirectorResult['profile_updates'] | null;
    familyMembers: DirectorResult['family_members'];
}) {
    const supabase = db();
    const { projectId, profile, profileUpdates, familyMembers } = params;

    // -- profiles : uniquement ce que le client a exprimé pendant l'appel
    const updates: Record<string, unknown> = {};
    if (profileUpdates?.writing_style) {
        updates.writing_style = profileUpdates.writing_style;
    }
    if (profileUpdates?.politeness_preference) {
        updates.politeness_preference = profileUpdates.politeness_preference;
    }
    if (profileUpdates?.sensitive_topics?.length) {
        const existing = (profile.sensitive_topics ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        const merged = [...new Set([...existing, ...profileUpdates.sensitive_topics])];
        updates.sensitive_topics = merged.join(', ');
    }
    if (Object.keys(updates).length) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profile.id);
        if (profileError) {
            // Non bloquant : le chapitre est déjà écrit. Mais on veut le voir dans les logs Vercel.
            console.error(
                `[pipeline] Mise à jour profiles refusée (${Object.keys(updates).join(', ')}) : ${profileError.message}`
            );
        } else {
            console.info(`[pipeline] profiles mis à jour : ${Object.keys(updates).join(', ')}`);
        }
    }

    // -- family_members : on n'insère que les personnes inconnues
    if (familyMembers.length) {
        const { data: existing } = await supabase
            .from('family_members')
            .select('full_name')
            .eq('project_id', projectId);

        const known = new Set(
            (existing ?? []).map((f: { full_name: string | null }) =>
                (f.full_name ?? '').trim().toLowerCase()
            )
        );

        const fresh = familyMembers
            .filter((m) => !known.has(m.full_name.trim().toLowerCase()))
            .map((m) => ({
                project_id: projectId,
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

/** Un appel plus récent de ce projet a-t-il déjà été analysé ? */
async function hasNewerAnalysis(projectId: string, createdAt: string): Promise<boolean> {
    const { data, error } = await db()
        .from('interviews')
        .select('id')
        .eq('project_id', projectId)
        .gt('created_at', createdAt)
        .not('ai_analysis_log', 'is', null)
        .limit(1);
    if (error) throw new Error(`Lecture interviews impossible : ${error.message}`);
    return (data?.length ?? 0) > 0;
}
