import { NextRequest, NextResponse } from 'next/server';
import { findProfileByPhone, findActiveProject, getSystemPrompt } from '@/lib/loomina/db';
import { toPhase } from '@/lib/loomina/phases';
import { buildAssistant } from '@/lib/loomina/assistant';
import { readSession } from '@/lib/loomina/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Appel SORTANT déclenché depuis l'espace auteur (« Démarrer l'entretien »).
 *
 * Avant : URL Make en dur, numéro Vapi en dur, aucune authentification,
 * et un assistant construit inline qui divergeait de l'appel entrant.
 *
 * Maintenant : même assistant que l'appel entrant (`buildAssistant`),
 * rapport de fin d'appel renvoyé vers /api/vapi/webhook, et seul l'auteur
 * connecté (cookie de session) peut se faire appeler — sur SON numéro.
 */
export async function POST(request: NextRequest) {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // Serveur vocal maison (voice/) : si VOICE_SERVER_URL est posée, l'appel
    // sortant passe par Twilio directement et c'est le serveur vocal qui
    // mène l'entretien. Sinon, chemin Vapi historique (retour arrière).
    const voiceServerUrl = process.env.VOICE_SERVER_URL?.trim();
    if (voiceServerUrl) {
        return callViaTwilio(session.phone, voiceServerUrl.replace(/\/$/, ''));
    }

    const apiKey = process.env.VAPI_API_KEY;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    if (!apiKey || !phoneNumberId) {
        console.error('[call] VAPI_API_KEY ou VAPI_PHONE_NUMBER_ID manquante');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const profile = await findProfileByPhone(session.phone);
        if (!profile?.phone_number) {
            return NextResponse.json({ message: 'Client profil not found' }, { status: 404 });
        }

        const project = await findActiveProject(profile.id);
        if (!project) {
            return NextResponse.json({ message: 'Aucun projet actif' }, { status: 404 });
        }

        const phase = toPhase(project.phase);
        const prompt = await getSystemPrompt(phase);
        if (!prompt?.prompt_content) {
            console.error(`[call] Aucun system_prompt pour la phase ${phase}`);
            return NextResponse.json({ message: 'System Prompt not found' }, { status: 500 });
        }

        const serverUrl =
            process.env.VAPI_SERVER_URL?.trim() ||
            new URL('/api/vapi/webhook', request.nextUrl.origin).toString();

        const { assistant } = buildAssistant({ profile, project, prompt, phase, serverUrl });

        const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumberId,
                customer: { number: profile.phone_number },
                assistant,
            }),
        });

        const data = await vapiResponse.json().catch(() => ({}));
        if (!vapiResponse.ok) {
            console.error('[call] Vapi error:', data);
            return NextResponse.json(
                { message: 'Failed to initiate call', error: data?.message ?? 'Unknown error' },
                { status: vapiResponse.status }
            );
        }

        console.info(`[call] appel sortant lancé — profil=${profile.id} phase=${phase} call=${data?.id}`);
        return NextResponse.json({ status: 'initiated', call_id: data?.id ?? null });
    } catch (err) {
        console.error('[call] Handler error:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Appel sortant via Twilio : Twilio compose le numéro de l'auteur et, au
 * décroché, demande le TwiML à `${voiceServerUrl}/twilio/voice`, qui
 * reconnaît le numéro appelé et branche ConversationRelay sur la bonne
 * phase. Même parcours qu'un appel entrant.
 */
async function callViaTwilio(sessionPhone: string, voiceServerUrl: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER ?? '+33159169357';
    if (!accountSid || !authToken) {
        console.error('[call] TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN manquante');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const profile = await findProfileByPhone(sessionPhone);
    if (!profile?.phone_number) {
        return NextResponse.json({ message: 'Client profil not found' }, { status: 404 });
    }
    const project = await findActiveProject(profile.id);
    if (!project) {
        return NextResponse.json({ message: 'Aucun projet actif' }, { status: 404 });
    }

    const body = new URLSearchParams({
        To: profile.phone_number,
        From: fromNumber,
        Url: `${voiceServerUrl}/twilio/voice`,
        Method: 'POST',
    });
    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
        {
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
        }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        console.error('[call] Twilio error:', data);
        return NextResponse.json(
            { message: 'Failed to initiate call', error: data?.message ?? 'Unknown error' },
            { status: response.status }
        );
    }

    console.info(`[call] appel sortant Twilio lancé — profil=${profile.id} phase=${project.phase} call=${data?.sid}`);
    return NextResponse.json({ status: 'initiated', call_id: data?.sid ?? null });
}
