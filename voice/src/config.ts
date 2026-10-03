/**
 * Configuration du serveur vocal, lue une fois au démarrage.
 *
 * Les noms des variables Supabase et du secret webhook sont volontairement
 * les mêmes que côté Next.js : un seul jeu de valeurs à copier dans
 * l'hébergeur, et `lib/loomina/db.ts` fonctionne tel quel.
 */

function required(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
    return value;
}

function optional(name: string, fallback: string): string {
    return process.env[name]?.trim() || fallback;
}

export const config = {
    port: Number(optional('PORT', '8080')),
    /** URL publique https://… ; le WebSocket est dérivé en wss://…/relay */
    publicUrl: required('PUBLIC_URL').replace(/\/$/, ''),
    /** Site Next.js qui reçoit le rapport de fin d'appel */
    nextBaseUrl: required('NEXT_BASE_URL').replace(/\/$/, ''),
    webhookSecret: required('VAPI_WEBHOOK_SECRET'),

    twilio: {
        accountSid: required('TWILIO_ACCOUNT_SID'),
        authToken: required('TWILIO_AUTH_TOKEN'),
        phoneNumber: required('TWILIO_PHONE_NUMBER'),
    },

    openai: {
        apiKey: required('OPENAI_API_KEY'),
        model: optional('VOICE_MODEL', 'gpt-4.1'),
    },

    voice: {
        /** Format Twilio/ElevenLabs : voiceId[-modèle][-vitesse_stabilité_similarité] */
        ttsVoice: optional('VOICE_TTS_VOICE', 'Qrl71rx6Yg8RvyPYRGCQ-flash_v2_5-0.9_0.5_0.75'),
        language: optional('VOICE_LANGUAGE', 'fr-FR'),
        sttModel: optional('VOICE_STT_MODEL', 'nova-3-general'),
    },

    limits: {
        /** Durée maximale d'un entretien (secondes). */
        maxCallSeconds: Number(optional('VOICE_MAX_CALL_SECONDS', '2700')),
        /** Silence toléré avant de relancer puis de raccrocher (secondes). */
        silenceSeconds: Number(optional('VOICE_SILENCE_SECONDS', '45')),
    },
} as const;

export function wsUrl(): string {
    return config.publicUrl.replace(/^http/, 'ws') + '/relay';
}
