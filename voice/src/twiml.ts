/**
 * TwiML renvoyé à Twilio quand un appel arrive (ou qu'un appel sortant
 * est décroché) : on branche l'appel sur ConversationRelay, qui fait la
 * transcription (Deepgram) et la voix (ElevenLabs), et nous parle en
 * texte sur le WebSocket /relay.
 */

import { config, wsUrl } from './config.ts';

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function conversationRelayTwiml(params: {
    welcomeGreeting: string;
    callSid: string;
}): string {
    const attrs: Record<string, string> = {
        url: wsUrl(),
        welcomeGreeting: params.welcomeGreeting,
        welcomeGreetingInterruptible: 'true',
        language: config.voice.language,
        ttsProvider: 'ElevenLabs',
        voice: config.voice.ttsVoice,
        transcriptionProvider: 'Deepgram',
        speechModel: config.voice.sttModel,
        deepgramSmartFormat: 'true',
        // Le narrateur peut couper Loomina ; on évite les faux départs
        // (« hum », « oui ») grâce à la sensibilité basse.
        interruptible: 'speech',
        interruptSensitivity: 'low',
        // Les noms propres de la marque, pour la transcription.
        hints: 'Loomina,Loumina',
        dtmfDetection: 'false',
    };

    const attrString = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeXml(v)}"`)
        .join(' ');

    const action = `${config.publicUrl}/twilio/action`;

    return (
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response>` +
        `<Connect action="${escapeXml(action)}">` +
        `<ConversationRelay ${attrString}>` +
        `<Parameter name="callSid" value="${escapeXml(params.callSid)}"/>` +
        `</ConversationRelay>` +
        `</Connect>` +
        `</Response>`
    );
}

/** Réponse de secours : une phrase, puis on raccroche. */
export function sayAndHangupTwiml(text: string): string {
    return (
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<Response><Say language="fr-FR">${escapeXml(text)}</Say><Hangup/></Response>`
    );
}
