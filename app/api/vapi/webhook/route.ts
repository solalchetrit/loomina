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

import { NextRequest, NextResponse, after } from 'next/server';

import { findProfileByPhone, findActiveProject, getSystemPrompt, db } from '@/lib/loomina/db';
import { toPhase } from '@/lib/loomina/phases';
import { buildAssistant, buildUnknownCallerAssistant } from '@/lib/loomina/assistant';
import { extractCallData } from '@/lib/loomina/pipeline';
import { recordEvent, processEvent } from '@/lib/loomina/events';

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
 * Si VAPI_WEBHOOK_SECRET n'est pas défini, on laisse passer mais on
 * journalise bruyamment : cela évite de bloquer la bascule, sans laisser
 * le trou passer inaperçu.
 */
function isAuthorized(request: NextRequest): boolean {
    const expected = process.env.VAPI_WEBHOOK_SECRET?.trim();
    if (!expected) {
        console.warn('[vapi] VAPI_WEBHOOK_SECRET non défini — webhook OUVERT. À corriger.');
        return true;
    }
    const provided =
        request.headers.get('x-vapi-secret') ??
        request.headers.get('x-webhook-secret') ??
        request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
        '';
    return provided === expected;
}

export async function POST(request: NextRequest) {
    const startedAt = Date.now();

    if (!isAuthorized(request)) {
        console.error('[vapi] Requête rejetée : secret invalide');
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let body: Record<string, any>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const message = body?.message ?? body;
    const type: string = message?.type ?? 'unknown';

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
        // client. Mieux vaut renvoyer l'assistant d'accueil : il entendra
        // une voix plutôt qu'une tonalité.
        if (type === 'assistant-request') {
            return NextResponse.json(buildUnknownCallerAssistant(serverUrl(request)));
        }
        return NextResponse.json({ error: 'internal', detail }, { status: 500 });
    }
}

// ------------------------------------------------------------
// assistant-request — chemin synchrone
// ------------------------------------------------------------

async function handleAssistantRequest(
    request: NextRequest,
    message: Record<string, any>,
    startedAt: number
) {
    const url = serverUrl(request);
    const phone: string | null =
        message?.customer?.number ?? message?.call?.customer?.number ?? null;

    if (!phone) {
        console.warn('[vapi] assistant-request sans numéro appelant');
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    const profile = await findProfileByPhone(phone);
    if (!profile) {
        console.info(`[vapi] Appelant inconnu : ${phone}`);
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    const project = await findActiveProject(profile.id);
    if (!project) {
        console.warn(`[vapi] Profil ${profile.id} sans projet actif`);
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    const phase = toPhase(project.phase);
    const prompt = await getSystemPrompt(phase);

    if (!prompt?.prompt_content) {
        // Sans prompt en base, impossible de mener l'entretien.
        console.error(`[vapi] Aucun system_prompt pour la phase ${phase}`);
        return NextResponse.json(buildUnknownCallerAssistant(url));
    }

    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl: url });

    console.info(
        `[vapi] assistant-request servi — profil=${profile.id} phase=${phase} en ${Date.now() - startedAt}ms`
    );

    return NextResponse.json(payload);
}

// ------------------------------------------------------------
// end-of-call-report — archivage puis traitement différé
// ------------------------------------------------------------

async function handleEndOfCall(
    body: Record<string, any>,
    message: Record<string, any>,
    startedAt: number
) {
    const data = extractCallData(message);

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

// ------------------------------------------------------------
// Sonde de santé — pour vérifier le déploiement sans passer d'appel
// ------------------------------------------------------------

export async function GET() {
    const checks: Record<string, string> = {};

    checks.supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'MANQUANTE';
    checks.service_role = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'MANQUANTE';
    checks.openai = process.env.OPENAI_API_KEY ? 'ok' : 'MANQUANTE';
    checks.webhook_secret = process.env.VAPI_WEBHOOK_SECRET ? 'ok' : 'non défini (webhook ouvert)';

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
