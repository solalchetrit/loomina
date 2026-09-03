/**
 * Le journal d'événements — file d'attente, idempotence et archive.
 *
 * Chaque webhook Vapi exploitable est d'abord ÉCRIT, puis traité.
 * Cette séparation est ce qui manquait le plus à l'architecture Make :
 * un échec OpenAI y faisait perdre définitivement l'appel d'un client
 * à 219 €, sans trace ni possibilité de rejeu.
 */

import { db, findProfileByPhone, findActiveProject } from './db';
import type { Profile, Project } from './db';
import { processEndOfCall, extractCallData } from './pipeline';
import type { PipelineOutcome } from './pipeline';

export const MAX_ATTEMPTS = 3;

export interface RecordedEvent {
    id: string;
    alreadySeen: boolean;
}

/**
 * Enregistre l'événement. Retourne `alreadySeen: true` si Vapi l'a rejoué.
 *
 * Vapi réémet un webhook resté sans réponse dans les temps. Sans cette
 * protection, un appel pourrait être traité deux fois et produire deux
 * chapitres identiques.
 */
export async function recordEvent(params: {
    eventType: string;
    payload: Record<string, unknown>;
    vapiCallId: string | null;
    projectId?: string | null;
}): Promise<RecordedEvent> {
    const supabase = db();

    const { data, error } = await supabase
        .from('call_events')
        .insert({
            event_type: params.eventType,
            payload: params.payload,
            vapi_call_id: params.vapiCallId,
            project_id: params.projectId ?? null,
            status: 'pending',
        })
        .select('id')
        .single();

    if (error) {
        // 23505 = violation de contrainte d'unicité → doublon connu
        if (error.code === '23505' && params.vapiCallId) {
            const { data: existing } = await supabase
                .from('call_events')
                .select('id')
                .eq('vapi_call_id', params.vapiCallId)
                .eq('event_type', params.eventType)
                .single();
            return { id: existing?.id ?? '', alreadySeen: true };
        }
        throw new Error(`Écriture call_events impossible : ${error.message}`);
    }

    return { id: data.id as string, alreadySeen: false };
}

/**
 * Verrouille un événement avant traitement.
 *
 * La condition `.eq('status', 'pending')` fait office de verrou optimiste :
 * si le worker cron et le `after()` du webhook tombent sur le même
 * événement, un seul des deux obtient la ligne.
 */
export async function claimEvent(eventId: string): Promise<boolean> {
    const supabase = db();
    const { data, error } = await supabase
        .from('call_events')
        .update({ status: 'processing' })
        .eq('id', eventId)
        .in('status', ['pending', 'failed'])
        .select('id');

    if (error) throw new Error(`Verrouillage call_events impossible : ${error.message}`);
    return (data?.length ?? 0) > 0;
}

export async function markDone(eventId: string, outcome: PipelineOutcome) {
    await db()
        .from('call_events')
        .update({
            // `no_material` : l'analyse a bien tourné (mémoire à jour), il n'y
            // a juste pas de chapitre. C'est un traitement réussi, pas un rejet.
            status:
                outcome.status === 'processed' || outcome.status === 'no_material'
                    ? 'done'
                    : 'skipped',
            error: outcome.reason ?? null,
            processed_at: new Date().toISOString(),
        })
        .eq('id', eventId);
}

export async function markFailed(eventId: string, message: string) {
    const supabase = db();

    const { data } = await supabase
        .from('call_events')
        .select('attempts')
        .eq('id', eventId)
        .single();

    const attempts = ((data?.attempts as number) ?? 0) + 1;

    await supabase
        .from('call_events')
        .update({
            // Au-delà de MAX_ATTEMPTS on laisse en `failed` sans le remettre
            // en file : inutile de boucler sur une erreur permanente.
            status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
            attempts,
            error: message.slice(0, 2000),
            processed_at: new Date().toISOString(),
        })
        .eq('id', eventId);
}

/**
 * Traite un événement déjà enregistré.
 *
 * Utilisé par les deux chemins : le `after()` du webhook (cas nominal)
 * et le worker cron (rattrapage). Une seule implémentation, donc un
 * seul comportement à comprendre et à déboguer.
 */
export async function processEvent(eventId: string): Promise<PipelineOutcome | null> {
    const supabase = db();

    const claimed = await claimEvent(eventId);
    if (!claimed) return null; // déjà pris en charge ailleurs

    try {
        const { data: event, error } = await supabase
            .from('call_events')
            .select('payload, event_type')
            .eq('id', eventId)
            .single();

        if (error || !event) throw new Error(`Événement ${eventId} introuvable`);

        const message = (event.payload as Record<string, any>)?.message ?? event.payload;
        const data = extractCallData(message);

        const { profile, project } = await resolveCaller(data.phone, data.userId, data.projectId);

        if (!profile) {
            const outcome: PipelineOutcome = {
                status: 'no_project',
                reason: `Aucun profil pour le numéro ${data.phone ?? '(inconnu)'}`,
            };
            await markDone(eventId, outcome);
            return outcome;
        }

        const outcome = await processEndOfCall({ profile, project, message });
        await markDone(eventId, outcome);
        return outcome;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await markFailed(eventId, message);
        throw err;
    }
}

/**
 * Identifie l'appelant.
 *
 * Trois pistes, de la plus fiable à la moins fiable : les métadonnées
 * posées par nous sur l'assistant, puis le numéro appelant.
 *
 * Le scénario Make combinait numéro et `metadata.user_id` dans une même
 * requête Supabase. En appel ENTRANT, `metadata` n'existe pas : la
 * requête partait avec un identifiant vide.
 */
async function resolveCaller(
    phone: string | null,
    userId: string | null,
    projectId: string | null
): Promise<{ profile: Profile | null; project: Project | null }> {
    const supabase = db();

    let profile: Profile | null = null;

    if (userId) {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).limit(1);
        profile = (data?.[0] as Profile) ?? null;
    }

    if (!profile && phone) {
        profile = await findProfileByPhone(phone);
    }

    if (!profile) return { profile: null, project: null };

    let project: Project | null = null;
    if (projectId) {
        const { data } = await supabase.from('projects').select('*').eq('id', projectId).limit(1);
        project = (data?.[0] as Project) ?? null;
    }
    if (!project) {
        project = await findActiveProject(profile.id);
    }

    return { profile, project };
}

/** Reprend les événements en attente ou en échec. Appelé par le cron. */
export async function sweepPending(limit = 10): Promise<{ picked: number; results: string[] }> {
    const supabase = db();

    const { data, error } = await supabase
        .from('call_events')
        .select('id, attempts')
        .in('status', ['pending', 'failed'])
        .lt('attempts', MAX_ATTEMPTS)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) throw new Error(`Lecture de la file impossible : ${error.message}`);

    const results: string[] = [];
    for (const row of data ?? []) {
        const id = row.id as string;
        try {
            const outcome = await processEvent(id);
            results.push(`${id}: ${outcome?.status ?? 'ignoré'}`);
        } catch (err) {
            results.push(`${id}: échec — ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    return { picked: data?.length ?? 0, results };
}
