/**
 * Loomina Configuration Constants
 * Centralized configuration for the Loomina application
 */

export const LOOMINA_CONFIG = {
    // The main Loomina phone number (for users to call)
    PHONE_NUMBER: "+33159169357",
    PHONE_NUMBER_DISPLAY: "01 59 16 93 57",

    // Make.com webhook for triggering outbound calls & Verification
    // Consolidated Gateway Webhook
    MAKE_WEBHOOK_URL: "https://hook.eu1.make.com/t1io85fnb9im0f3isnnf47iyn0n3s0ms",

    // Client phases (must match Make.com blueprint)
    PHASES: {
        ONBOARDING: "Onboarding",
        INTERVIEW: "Interview",
        FINALISATION: "Finalisation",
    } as const,
};

export type ClientPhase = typeof LOOMINA_CONFIG.PHASES[keyof typeof LOOMINA_CONFIG.PHASES];
