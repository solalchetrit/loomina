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
    /**
     * Enregistrement audio des entretiens (jamais des démonstrations). Gardé
     * chez Twilio, écouté depuis l'admin. « off » pour couper.
     */
    recordingEnabled: optional('VOICE_RECORDING', 'on') !== 'off',
    /** Rendez-vous d'appel réguliers (voir scheduler.ts). « off » pour couper. */
    schedulerEnabled: optional('CALL_SCHEDULER', 'on') !== 'off',

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
        // Stabilité 0,6 au lieu de 0,5 (19/11/2026) : une voix plus régulière,
        // moins de petits accrocs entendus à la démo.
        // « Martin » (bibliothèque ElevenLabs : voix française grave, calme,
        // conversationnelle, faite pour le téléphone) depuis le 20/11/2026.
        // Avant : « Olivier » (Qrl71rx6Yg8RvyPYRGCQ), choisie vite il y a un an.
        // Vitesse 0,88 : un rien plus lente, pour une oreille âgée.
        ttsVoice: optional('VOICE_TTS_VOICE', 'b0Ev8lcOOXx2o9ZcF46H-flash_v2_5-0.88_0.6_0.8'),
        language: optional('VOICE_LANGUAGE', 'fr-FR'),
        sttModel: optional('VOICE_STT_MODEL', 'nova-3-general'),
    },

    limits: {
        /** Durée maximale d'un entretien (secondes). */
        maxCallSeconds: Number(optional('VOICE_MAX_CALL_SECONDS', '5400')),
        /** Silence toléré avant de relancer puis de raccrocher (secondes). */
        // 30 s (demande de Solal, 17/11/2026) : Loomina dit qu'elle est toujours
        // là. Le compte repart de zéro tant que la personne parle.
        silenceSeconds: Number(optional('VOICE_SILENCE_SECONDS', '30')),
        /** Après la relance, silence toléré avant de raccrocher (secondes). */
        // Plus long que la relance : une personne âgée peut chercher ses mots.
        hangupSilenceSeconds: Number(optional('VOICE_HANGUP_SILENCE_SECONDS', '60')),
        /** Couper la réplique après sa première question (« off » pour laisser passer). */
        // Malgré le prompt, 16 à 28 % des répliques en posaient plusieurs
        // (appels simulés du 16/11/2026) : une personne âgée ne sait plus à
        // laquelle répondre.
        oneQuestion: optional('VOICE_ONE_QUESTION', 'on') !== 'off',
    },
} as const;

export function wsUrl(): string {
    return config.publicUrl.replace(/^http/, 'ws') + '/relay';
}
