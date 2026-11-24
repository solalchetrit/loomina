/**
 * Décide ce que Loomina dit à un appelant, à partir des mêmes briques
 * que la version Vapi : `buildAssistant` (client reconnu, prompt de la
 * phase en base) ou `buildUnknownCallerAssistant` (démonstration).
 *
 * On ne garde de la charge utile Vapi que ce dont un cerveau texte a
 * besoin : le prompt système, la première phrase, les métadonnées et la
 * durée maximale. Les réglages de voix sont dans le TwiML.
 */

import { findProfileByPhone, findActiveProject, getSystemPrompt } from '../../lib/loomina/db';
import { toPhase } from '../../lib/loomina/phases';
import {
    buildAssistant,
    buildUnknownCallerAssistant,
    DEMO_MAX_SECONDS,
    canReceiveSms,
} from '../../lib/loomina/assistant';
import { config } from './config.ts';
import { hardLimitSeconds, normalizeCallMinutes } from '../../lib/loomina/call-length';
import { refreshPrompts } from '../../lib/loomina/prompt-store';

export interface CallPlan {
    systemPrompt: string;
    firstMessage: string;
    metadata: Record<string, unknown>;
    maxSeconds: number;
    /** Durée souhaitée par la personne (minutes) ; null pour la démonstration. */
    targetMinutes: number | null;
    demo: boolean;
    label: string;
    /** Noms propres de cet auteur (lieux, proches), pour la transcription. */
    hints?: string[];
}

/**
 * Les noms propres déjà connus de l'auteur, donnés à la transcription
 * (24/11/2026 : « Sidi Ferruch » perdu, « Babel-Wed » pour Bab El Oued au
 * premier appel de Patricia). Au plus 40, sans doublon.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function authorHints(context: any): string[] {
    const out = new Set<string>();
    const add = (v: unknown) => {
        if (typeof v !== 'string') return;
        const t = v.replace(/^(?:(?:la|le|les)\s+|l['’]\s*)/i, '').replace(/[,"<>&]/g, ' ').replace(/\s+/g, ' ').trim();
        if (t.length >= 3 && t.length <= 40) out.add(t);
    };
    const identity = context?.identity ?? {};
    add(identity.full_name);
    for (const p of identity.places ?? []) add(p);
    for (const s of identity.spellings ?? []) add(typeof s === 'string' ? s : s?.correct ?? s?.name);
    for (const f of context?.family ?? []) add(f?.name);
    return [...out].slice(0, 40);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function fromVapiShape(payload: any, maxSeconds: number, demo: boolean, label: string): CallPlan {
    const assistant = payload.assistant;
    const systemPrompt: string = assistant?.model?.messages?.[0]?.content ?? '';
    return {
        systemPrompt,
        firstMessage: assistant?.firstMessage ?? '',
        metadata: { ...(assistant?.metadata ?? {}), ...(demo ? { demo: true } : {}) },
        maxSeconds,
        targetMinutes: null,
        demo,
        label,
    };
}

export async function planForCaller(customerNumber: string | null): Promise<CallPlan> {
    // L'URL serveur n'a plus de sens sans Vapi, mais `buildAssistant` la
    // demande : on lui donne le webhook du site, c'est là qu'ira le rapport.
    const serverUrl = `${config.nextBaseUrl}/api/vapi/webhook`;
    // Les prompts réécrits dans l'admin (relus au plus une fois par minute ; ne lève jamais).
    await refreshPrompts();

    // La démonstration : le récit part par SMS si le numéro est un portable.
    const demo = () => fromVapiShape(buildUnknownCallerAssistant(serverUrl, { canText: canReceiveSms(customerNumber) }), DEMO_MAX_SECONDS, true, 'demo');

    if (!customerNumber) {
        return demo();
    }

    const profile = await findProfileByPhone(customerNumber);
    if (!profile) {
        return demo();
    }

    const project = await findActiveProject(profile.id);
    if (!project) {
        console.warn(`[plan] profil ${profile.id} sans projet actif → démo`);
        return demo();
    }

    const phase = toPhase(project.phase);
    // Le prompt vit dans le code (lib/loomina/voice-prompt.ts) ; la base ne
    // donne plus que la première phrase. Une base lente ne coupe pas l'appel.
    const prompt = await getSystemPrompt(phase).catch(() => null);

    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl });
    const targetMinutes = normalizeCallMinutes(project.project_metadata?.call_minutes);
    return {
        ...fromVapiShape(payload, hardLimitSeconds(targetMinutes, config.limits.maxCallSeconds), false, `phase-${phase}`),
        targetMinutes,
        hints: authorHints(project.context),
    };
}
