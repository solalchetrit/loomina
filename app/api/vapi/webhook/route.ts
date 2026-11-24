/**
 * LE point d'entrée unique de Vapi.
 *
 * Remplace intégralement le scénario Make « LOOMINA principal »
 * (51 modules, 4 branches dupliquées).
 *
 * TROIS COMPORTEMENTS, ET UN SEUL FICHIER POUR LES COMPRENDRE :
 *
 *   assistant-request     → réponse SYNCHRONE. Vapi attend la config de
 *                           l'assistant sous 20 s. Lectures seules,
 *                           aucun appel LLM. Cible : moins d'une seconde.
 *
 *   end-of-call-report    → on ARCHIVE, on répond 200 immédiatement,
 *                           puis on traite en arrière-plan avec after().
 *                           La chaîne Directeur + Écrivain prend 30 à 60 s :
 *                           répondre de façon synchrone dépasserait le
 *                           timeout de Vapi, qui rejouerait l'événement.
 *
 *   tout le reste         → 200 immédiat, aucun traitement.
 *                           En principe Vapi ne les envoie plus, puisque
 *                           l'assistant déclare serverMessages
 *                           = ["end-of-call-report"]. Cette branche est la
 *                           ceinture en plus des bretelles.
 */

import { refreshPrompts } from '@/lib/loomina/prompt-store';
import { NextRequest, NextResponse, after } from 'next/server';

import { findProfileByPhone, findActiveProject, getSystemPrompt, db, maskPhone } from '@/lib/loomina/db';
import { toPhase } from '@/lib/loomina/phases';
import { buildAssistant, buildUnknownCallerAssistant, buildRecoveryAssistant, canReceiveSms } from '@/lib/loomina/assistant';
import type { TokenUsage } from '@/lib/loomina/usage';
import { recordDemoCall, processDemoStory, purgeOldDemoStories } from '@/lib/loomina/demo-story';
import { extractCallData } from '@/lib/loomina/pipeline';
import type { VapiMessage } from '@/lib/loomina/pipeline';
import { recordEvent, processEvent } from '@/lib/loomina/events';
import { warmRecording } from '@/lib/admin/recording';
import { kickReview } from '@/lib/admin/ecoute';
import { internalSecret } from '@/lib/loomina/book-edition';
import { SITE } from '@/config/site';
import { checkSharedSecret } from '@/lib/loomina/secret';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 300 secondes : le défaut de Vercel avec Fluid compute, sur tous les
 * plans, Hobby compris. La chaîne complète tourne en 30 à 60 s — on a
 * donc environ cinq fois la marge nécessaire.
 */
export const maxDuration = 300;

function serverUrl(request: NextRequest): string {
    const configured = process.env.VAPI_SERVER_URL?.trim();
    if (configured) return configured;
    return new URL('/api/vapi/webhook', request.nextUrl.origin).toString();
}

/**
 * Contrôle d'accès.
 *
 * L'ancien webhook Make acceptait n'importe quelle requête sans
 * authentification — vérifié en direct : un POST depuis une page web
 * quelconque déclenchait le scénario et écrivait en base.
 *
 * Si VAPI_WEBHOOK_SECRET n'est pas défini, la requête est refusée en
 * production (voir lib/loomina/secret.ts).
 */
function isAuthorized(request: NextRequest): boolean {
    const provided =
        request.headers.get('x-vapi-secret') ??
        request.headers.get('x-webhook-secret') ??
        request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
        '';
    return checkSharedSecret(provided, process.env.VAPI_WEBHOOK_SECRET, 'vapi');
}

export async function POST(request: NextRequest) {
    const startedAt = Date.now();
    await refreshPrompts();

    if (!isAuthorized(request)) {
        console.error('[vapi] Requête rejetée : secret invalide');
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let body: { message?: VapiMessage } & VapiMessage;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const message = body.message ?? body;
    const type = message.type ?? 'unknown';

    try {
        switch (type) {
            case 'assistant-request':
            case 'Assistant-Request':
                return await handleAssistantRequest(request, message, startedAt);

            case 'end-of-call-report':
                return await handleEndOfCall(body, message, startedAt);

            default:
                // Vapi n'a pas besoin d'une réponse riche ici.
                return NextResponse.json({ received: true, type, handled: false });
        }
    } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error(`[vapi] Erreur sur "${type}" :`, detail);

        // Sur assistant-request, une erreur 500 fait échouer l'appel du
        // client. On ne sait pas qui appelle : l'assistant de secours mène
        // un entretien libre et le rattache ensuite par le numéro, au lieu
        // de servir la démonstration à un client qui a payé.
        if (type === 'assistant-request') {
            return NextResponse.json(buildRecoveryAssistant(serverUrl(request)));
        }
        return NextResponse.json({ error: 'internal', detail }, { status: 500 });
    }
}

// ------------------------------------------------------------
// assistant-request — chemin synchrone
// ------------------------------------------------------------

async function handleAssistantRequest(
    request: NextRequest,
    message: VapiMessage,
    startedAt: number
) {
    const url = serverUrl(request);
    const phone = message.customer?.number ?? message.call?.customer?.number ?? null;

    if (!phone) {
        console.warn('[vapi] assistant-request sans numéro appelant');
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    // La base doit répondre vite : Vapi attend, et la personne entend un
    // silence. Une lecture lente ou en échec est retentée une fois, puis on
    // bascule sur l'assistant de secours plutôt que sur la démonstration :
    // « base indisponible » n'est pas « appelant inconnu ».
    let profile: Awaited<ReturnType<typeof findProfileByPhone>>;
    let project: Awaited<ReturnType<typeof findActiveProject>> = null;
    try {
        profile = await readWithRetry(() => findProfileByPhone(phone), 'profil');
        if (profile) project = await readWithRetry(() => findActiveProject(profile!.id), 'projet');
    } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error(`[vapi] Base indisponible pour ${maskPhone(phone)}, assistant de secours servi : ${detail}`);
        return NextResponse.json(buildRecoveryAssistant(url));
    }

    if (!profile) {
        console.info(`[vapi] Appelant inconnu : ${maskPhone(phone)}`);
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    if (!project) {
        console.warn(`[vapi] Profil ${profile.id} sans projet actif`);
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    const phase = toPhase(project.phase);
    // Ne sert plus qu'à la première phrase : le prompt vit dans le code
    // (lib/loomina/voice-prompt.ts). Une base lente ne doit pas couper l'appel.
    const prompt = await getSystemPrompt(phase).catch(() => null);

    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl: url });

    console.info(
        `[vapi] assistant-request servi — profil=${profile.id} phase=${phase} en ${Date.now() - startedAt}ms`
    );

    return NextResponse.json(payload);
}

/** Délai accordé à chaque lecture de la base pendant l'assistant-request. */
const DB_READ_TIMEOUT_MS = 2500;

/**
 * Une lecture avec délai maximal, retentée une fois. Pire cas : environ
 * 5 secondes, bien en dessous des 20 secondes que Vapi accorde.
 */
async function readWithRetry<T>(read: () => Promise<T>, label: string): Promise<T> {
    try {
        return await withTimeout(read(), DB_READ_TIMEOUT_MS, label);
    } catch (first) {
        console.warn(`[vapi] Lecture ${label} en échec, nouvel essai : ${first instanceof Error ? first.message : first}`);
        return await withTimeout(read(), DB_READ_TIMEOUT_MS, label);
    }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`lecture ${label} au-delà de ${ms} ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ------------------------------------------------------------
// end-of-call-report — archivage puis traitement différé
// ------------------------------------------------------------

async function handleEndOfCall(
    body: object,
    message: VapiMessage,
    startedAt: number
) {
    const data = extractCallData(message);

    // Démonstration pour appelant inconnu : on écrit le récit et on
    // l'envoie par SMS (lib/loomina/demo-story.ts). Jamais dans call_events
    // ni dans un livre : la personne n'est pas cliente.
    const metadata = message.call?.metadata ?? message.metadata ?? {};
    if (metadata.demo === true) {
        const rec = (metadata as { recordingSid?: unknown }).recordingSid;
        // Les jetons de la conversation, pour le coût de la démo (onglet Coûts de l'admin).
        const t = ((message as { costBreakdown?: { llmPromptTokens?: number; llmCompletionTokens?: number } }).costBreakdown ?? {});
        const model = (metadata as { model?: unknown }).model;
        const voiceUsage = t.llmPromptTokens || t.llmCompletionTokens
            ? { model: typeof model === 'string' ? model : 'gpt-4.1', input: Number(t.llmPromptTokens) || 0, cached: 0, output: Number(t.llmCompletionTokens) || 0 }
            : null;
        return handleDemoEnd(data, typeof rec === 'string' ? rec : null, voiceUsage);
    }

    const { id: eventId, alreadySeen } = await recordEvent({
        eventType: 'end-of-call-report',
        payload: body,
        vapiCallId: data.vapiCallId,
        projectId: data.projectId,
    });

    if (alreadySeen) {
        console.info(`[vapi] Rejeu ignoré pour l'appel ${data.vapiCallId}`);
        return NextResponse.json({ received: true, duplicate: true });
    }

    // On rend la main à Vapi tout de suite. after() maintient l'instance
    // vivante pour le traitement, sans bloquer la réponse.
    after(async () => {
        try {
            const outcome = await processEvent(eventId);
            console.info(`[vapi] Événement ${eventId} traité :`, JSON.stringify(outcome));
            // L'enregistrement est copié chez nous (écoute immédiate dans
            // l'admin), puis l'appel est réécouté et comparé au transcript
            // (lib/admin/ecoute.ts, demande de Solal du 24/11/2026).
            const rec = (metadata as { recordingSid?: unknown }).recordingSid;
            await warmRecording(typeof rec === 'string' ? rec : null);
            if (outcome?.interviewId && typeof rec === 'string') await kickReview(outcome.interviewId, SITE.url, internalSecret());
        } catch (err) {
            // Déjà consigné dans call_events par processEvent.
            // Le cron de rattrapage reprendra la main.
            console.error(
                `[vapi] Échec du traitement de ${eventId} :`,
                err instanceof Error ? err.message : String(err)
            );
        }
    });

    console.info(
        `[vapi] end-of-call archivé (${eventId}) en ${Date.now() - startedAt}ms — traitement en arrière-plan`
    );

    return NextResponse.json({ received: true, eventId });
}

async function handleDemoEnd(data: ReturnType<typeof extractCallData>, recordingSid: string | null, voiceUsage: TokenUsage | null) {
    // Pas de SMS possible, mais un enregistrement : la démo est gardée pour
    // l'écoute dans l'admin, sans récit (demande de Solal, 20/11/2026).
    if (data.vapiCallId && recordingSid && (!data.phone || !data.transcript || !canReceiveSms(data.phone))) {
        await recordDemoCall({ callId: data.vapiCallId, phone: data.phone ?? 'numéro masqué', transcript: data.transcript ?? '', durationSeconds: data.durationSeconds, recordingSid, status: 'no_sms', voiceUsage });
        after(purgeOldDemoStories);
        return NextResponse.json({ received: true, demo: true, stored: 'recording' });
    }
    if (!data.vapiCallId || !data.phone || !data.transcript || !canReceiveSms(data.phone)) {
        console.info('[vapi] démo sans récit possible (pas de portable ou pas de transcript)');
        return NextResponse.json({ received: true, demo: true, stored: false });
    }
    const id = await recordDemoCall({ callId: data.vapiCallId, phone: data.phone, transcript: data.transcript, durationSeconds: data.durationSeconds, recordingSid, voiceUsage });
    if (!id) return NextResponse.json({ received: true, demo: true, duplicate: true });
    after(async () => {
        const outcome = await processDemoStory(id);
        console.info(`[vapi] récit de démo ${id} : ${outcome}`);
        await purgeOldDemoStories();
    });
    return NextResponse.json({ received: true, demo: true, id });
}

// ------------------------------------------------------------
// Sonde de santé — pour vérifier le déploiement sans passer d'appel
// ------------------------------------------------------------

export async function GET() {
    const checks: Record<string, string> = {};

    checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'MANQUANTE';
    checks.service_role = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'MANQUANTE';
    checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'MANQUANTE';
    checks.webhook_secret = process.env.VAPI_WEBHOOK_SECRET ? 'ok' : 'non défini (refusé en production)';

    try {
        const { error } = await db().from('call_events').select('id').limit(1);
        checks.db = error ? `ERREUR : ${error.message}` : 'ok';
    } catch (err) {
        checks.db = `ERREUR : ${err instanceof Error ? err.message : String(err)}`;
    }

    const healthy = !Object.values(checks).some((v) => v.includes('MANQUANTE') || v.includes('ERREUR'));

    return NextResponse.json({ service: 'loomina-vapi-webhook', healthy, checks }, {
        status: healthy ? 200 : 503,
    });
}
