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

import { db, findActiveProject, getRecentChapters, getNextChapterNumber, getChapterOutline } from './db';
import type { Profile, Project } from './db';
import { toPhase } from './phases';
import { readPhaseState, readTopics, readTold, readDeepen, readWishes } from './phase-plan';
import type { PhaseState, Topic } from './phase-plan';
import type { Phase } from './phases';
import { normalizeContext, contextFromLegacy, isEmptyContext, remainingSuggestions } from './context';
import type { LoominaContext } from './context';
import { runDirector } from './director';
import type { DirectorResult } from './director';
import { runWriter } from './writer';
import { notifyChapterReady } from './sms';
import type { TokenUsage } from './usage';
import { notifyFamily, alertTeam, notifyAuthorBookComplete } from './notify';
import { autoCompose } from './book-edition';

/**
 * Seuils du garde-fou.
 *
 * Auparavant un transcript de trois mots (« Bonjour au revoir »)
 * déclenchait toute la chaîne Directeur + Écrivain et consommait
 * des tokens pour produire un chapitre vide.
 */
export const MIN_TRANSCRIPT_CHARS = 200;
export const MIN_DURATION_SECONDS = 60;

/**
 * Chapitres déjà écrits que l'Écrivain relit. Avec trois, le livre simulé
 * du 16/11/2026 redécrivait le même décor dans quatre chapitres.
 */
export const PREVIOUS_CHAPTERS = 40;

/** En dessous, le texte de l'Écrivain n'est pas gardé comme chapitre. */
export const MIN_CHAPTER_WORDS = 40;

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

/** Les champs d'un appel que Vapi peut placer à plusieurs profondeurs. */
interface VapiCallFields {
    transcript?: string;
    recordingUrl?: string;
    durationSeconds?: number | string;
    customer?: { number?: string };
    metadata?: { user_id?: string; project_id?: string; demo?: boolean };
}

/** Un message de webhook Vapi, réduit à ce que Loomina lit. */
export interface VapiMessage extends VapiCallFields {
    type?: string;
    artifact?: VapiCallFields;
    call?: VapiCallFields & { id?: string };
}

/** Extraction tolérante : Vapi place ces champs à des profondeurs variables. */
export function extractCallData(message: VapiMessage) {
    const artifact = message.artifact ?? {};
    const call = message.call ?? {};

    const transcript = message.transcript ?? artifact.transcript ?? call.transcript ?? '';
    const durationRaw = message.durationSeconds ?? artifact.durationSeconds ?? call.durationSeconds;
    const metadata = call.metadata ?? message.metadata ?? {};

    return {
        transcript: typeof transcript === 'string' ? transcript.trim() : '',
        recordingUrl: message.recordingUrl ?? artifact.recordingUrl ?? call.recordingUrl ?? null,
        durationSeconds: Number.isFinite(Number(durationRaw)) ? Math.round(Number(durationRaw)) : null,
        phone: message.customer?.number ?? call.customer?.number ?? null,
        userId: metadata.user_id ?? null,
        projectId: metadata.project_id ?? null,
        vapiCallId: call.id ?? null,
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
    chapter_phase?: number;
    phase_state?: PhaseState;
    book_topics?: Topic[];
    /** Scènes racontées, scènes à approfondir, souhaits pour le livre (voir phase-plan.ts). */
    book_extra?: Record<string, unknown>;
    next_topic_id?: number | null;
    project_update?: Record<string, unknown> & { context?: unknown };
    family_members?: DirectorResult['family_members'];
    /** Sujets suggérés montrés au Directeur, et ceux qu'il a jugés abordés. */
    suggestions_shown?: string[];
    covered_suggestions?: number[];
    /** Jetons consommés par le Directeur et l'Écrivain (suivi des coûts). */
    usage?: { director?: TokenUsage; writer?: TokenUsage };
}

/** Ce que l'Écrivain a besoin de savoir de l'analyse, rejouable depuis la base. */
interface WriterBrief {
    phase: Phase;
    /** Période racontée : la phase sous laquelle le chapitre est rangé. */
    chapterPhase: Phase;
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
    message: VapiMessage;
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
        if (!newer && log.project_update) {
            await applyProjectUpdate(
                project.id,
                await withLatestSuggestions(
                    project.id,
                    log.project_update,
                    log.suggestions_shown ?? [],
                    log.covered_suggestions ?? [],
                    log.phase_state,
                    log.book_topics,
                    log.book_extra
                )
            );
        }
        await applyProfileAndFamily({
            projectId: project.id,
            profile: params.profile,
            // Un appel plus récent fait foi pour le style et le tutoiement ;
            // les sujets sensibles, eux, ne font que s'ajouter : on les garde.
            profileUpdates: replayProfileUpdates(log.profile_updates, newer),
            familyMembers: log.family_members ?? [],
        });
        brief = {
            phase,
            chapterPhase: toPhase(log.chapter_phase, phase),
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
            phaseState: readPhaseState(project.project_metadata, phase),
            topics: readTopics(project.project_metadata),
            told: readTold(project.project_metadata),
            deepen: readDeepen(project.project_metadata),
            wishes: readWishes(project.project_metadata),
            transcript: data.transcript,
            context: currentContext,
            phase,
            firstName: params.profile.first_name ?? params.profile.full_name ?? 'le narrateur',
            politeness: params.profile.politeness_preference,
            durationSeconds: data.durationSeconds,
            sensitiveTopics: params.profile.sensitive_topics,
        });

        await persistDirectorResult({ project, profile: params.profile, interviewId, director });

        brief = {
            phase,
            chapterPhase: director.chapter_phase,
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

    const [previousChapters, outline] = await Promise.all([
        getRecentChapters(project.id, PREVIOUS_CHAPTERS),
        getChapterOutline(project.id),
    ]);

    const writer = await runWriter({
        transcript: data.transcript,
        context: brief.context,
        previousChapters,
        phase: brief.chapterPhase,
        writingStyle: brief.writingStyle,
        titleHint: brief.titleHint,
        material: brief.material,
        outline,
        sensitiveTopics: params.profile.sensitive_topics,
    });

    // Un texte de quelques mots n'est pas un chapitre : sur un livre simulé
    // (16/11/2026), l'Écrivain, n'ayant rien de nouveau à raconter, avait
    // rendu 28 mots de politesses (« J'allais bien, un peu fatiguée »).
    if (writer.word_count < MIN_CHAPTER_WORDS) {
        await supabase.from('interviews').update({ processing_status: 'processed' }).eq('id', interviewId);
        return {
            status: 'no_material',
            interviewId,
            phase,
            nextPhase: brief.nextPhase,
            progress: brief.progress,
            reason: `L'Écrivain n'a rien trouvé de nouveau à raconter (${writer.word_count} mots) : mémoire mise à jour, pas de chapitre.`,
        };
    }

    // ---------------------------------------------------------
    // 5. Le chapitre — une ligne, pas une concaténation
    // ---------------------------------------------------------
    const chapterNumber = await getNextChapterNumber(project.id);

    const { data: chapterRow, error: chapterError } = await supabase
        .from('chapters')
        .insert({
            project_id: project.id,
            chapter_number: chapterNumber,
            // Un souvenir d'enfance raconté en phase 3 est rangé dans l'enfance.
            phase: brief.chapterPhase,
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

    // Les jetons de l'Écrivain rejoignent ceux du Directeur dans le journal de
    // l'analyse (relu ici : il a été écrit plus haut, parfois par un essai précédent).
    const { data: logRow } = await supabase.from('interviews').select('ai_analysis_log').eq('id', interviewId).single();
    const priorLog = (logRow?.ai_analysis_log ?? {}) as AnalysisLog;
    await supabase
        .from('interviews')
        .update({
            processing_status: 'processed',
            ...(writer.usage ? { ai_analysis_log: { ...priorLog, usage: { ...priorLog.usage, writer: writer.usage } } } : {}),
        })
        .eq('id', interviewId);

    // Après l'écriture seulement : un essai repris qui retrouve le chapitre
    // déjà écrit (plus haut) ne renvoie pas le SMS.
    await notifyChapterReady({
        profile: params.profile,
        projectMetadata: project.project_metadata,
        title: writer.chapter_title,
    });

    // La personne qui a offert le livre est tenue au courant.
    await notifyFamily({
        projectMetadata: project.project_metadata,
        narratorFirstName: params.profile.first_name,
        kind: chapterNumber === 1 ? 'first_call' : 'new_story',
        // Le titre ne part que si le narrateur partage ses récits avec l'offreur.
        storyTitle: project.project_metadata?.share_with_giver === true ? writer.chapter_title : undefined,
    });

    // Le livre se recompose avec ce nouveau récit, sans attendre ici.
    await autoCompose(project.id);

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

    const projectCompleted = director.project_completed;

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
                chapter_phase: director.chapter_phase,
                covered_axes: director.covered_axes,
                phase_answer: director.phase_answer,
                phase_state: director.phase_state,
                book_topics: director.book_topics,
                book_extra: bookExtra(director),
                next_topic_id: director.next_topic_id,
                project_update: projectUpdate,
                family_members: director.family_members,
                suggestions_shown: director.context.suggested_topics ?? [],
                covered_suggestions: director.covered_suggestions,
                usage: director.usage ? { director: director.usage } : undefined,
                model: director.model,
                at: new Date().toISOString(),
            },
        })
        .eq('id', interviewId);
    if (logError) throw new Error(`Écriture de l'analyse impossible : ${logError.message}`);

    // -- projects
    await applyProjectUpdate(
        project.id,
        await withLatestSuggestions(
            project.id,
            projectUpdate,
            director.context.suggested_topics ?? [],
            director.covered_suggestions,
            director.phase_state,
            director.book_topics,
            bookExtra(director)
        )
    );

    await applyProfileAndFamily({
        projectId: project.id,
        profile,
        profileUpdates: director.profile_updates,
        familyMembers: director.family_members,
    });

    // Le livre vient d'être déclaré complet : la famille et l'équipe le savent.
    // (Un essai repris peut renvoyer ce message : rare, et sans gravité.)
    if (projectCompleted && project.status !== 'completed') {
        const name = profile.first_name ?? 'Un auteur';
        // La date de fin : l'admin compte les jours de la semaine promise pour la première version.
        try {
            const { data: fresh } = await db().from('projects').select('project_metadata').eq('id', project.id).single();
            const meta = (fresh?.project_metadata ?? {}) as Record<string, unknown>;
            if (!meta.completed_at) await db().from('projects').update({ project_metadata: { ...meta, completed_at: new Date().toISOString() } }).eq('id', project.id);
        } catch (err) {
            console.warn('[pipeline] date de fin non notée :', err instanceof Error ? err.message : String(err));
        }
        // L'auteur d'abord : ce que Loomina vient de lui dire au téléphone, par écrit.
        await notifyAuthorBookComplete(profile, project.project_metadata);
        await notifyFamily({ projectMetadata: project.project_metadata, narratorFirstName: profile.first_name, kind: 'book_complete' });
        await alertTeam({
            subject: `Livre terminé : ${name}`,
            text: `${name} a dit que son livre est complet. Il attend maintenant votre relecture. Loomina lui a annoncé sa première version complète d'ici une semaine, par e-mail et dans son espace : à lui envoyer avant cette date.`,
            sms: `${name} a terminé son livre. Il attend la relecture.`,
        });
    }
}

/** Ce que le Directeur tient à jour pour le livre, en plus des sujets : gardé dans `project_metadata`. */
function bookExtra(director: DirectorResult): Record<string, unknown> {
    return { book_told: director.book_told, book_deepen: director.book_deepen, book_wishes: director.book_wishes };
}

/**
 * Les sujets suggérés et les corrections de l'auteur sont relus en base juste avant l'écriture : l'auteur
 * a pu en ajouter un pendant l'appel ou pendant l'analyse. On retire ceux
 * que le Directeur a jugés abordés, on garde tous les autres.
 */
async function withLatestSuggestions(
    projectId: string,
    update: Record<string, unknown> & { context?: unknown },
    shown: string[],
    covered: number[],
    phaseState?: PhaseState,
    topics?: Topic[],
    extra?: Record<string, unknown>
): Promise<Record<string, unknown>> {
    const { data, error } = await db().from('projects').select('context, project_metadata').eq('id', projectId).single();
    if (error) throw new Error(`Lecture projects impossible : ${error.message}`);
    const fresh = normalizeContext(data?.context);
    const latest = fresh.suggested_topics ?? [];
    const context = normalizeContext(update.context);
    return {
        ...update,
        // Les réglages de l'espace auteur (rendez-vous, SMS…) sont relus et
        // gardés ; seul l'état de la phase est remplacé.
        ...(phaseState ? { project_metadata: { ...((data?.project_metadata ?? {}) as Record<string, unknown>), phase_state: phaseState, ...(topics ? { book_topics: topics } : {}), ...(extra ?? {}) } } : {}),
        context: {
            ...context,
            suggested_topics: remainingSuggestions(shown, covered, latest),
            // Une correction écrite par l'auteur pendant l'analyse est gardée.
            author_corrections: fresh.author_corrections ?? context.author_corrections ?? [],
        },
    };
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

function replayProfileUpdates(
    updates: AnalysisLog['profile_updates'],
    newer: boolean
): DirectorResult['profile_updates'] | null {
    if (!updates) return null;
    const u = updates as DirectorResult['profile_updates'];
    return newer ? { writing_style: null, politeness_preference: null, sensitive_topics: u.sensitive_topics ?? [] } : u;
}
