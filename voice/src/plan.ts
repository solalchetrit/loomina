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
} from '../../lib/loomina/assistant';
import { config } from './config.ts';

export interface CallPlan {
    systemPrompt: string;
    firstMessage: string;
    metadata: Record<string, unknown>;
    maxSeconds: number;
    demo: boolean;
    label: string;
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
        demo,
        label,
    };
}

export async function planForCaller(customerNumber: string | null): Promise<CallPlan> {
    // L'URL serveur n'a plus de sens sans Vapi, mais `buildAssistant` la
    // demande : on lui donne le webhook du site, c'est là qu'ira le rapport.
    const serverUrl = `${config.nextBaseUrl}/api/vapi/webhook`;

    if (!customerNumber) {
        return fromVapiShape(buildUnknownCallerAssistant(serverUrl), DEMO_MAX_SECONDS, true, 'demo');
    }

    const profile = await findProfileByPhone(customerNumber);
    if (!profile) {
        return fromVapiShape(buildUnknownCallerAssistant(serverUrl), DEMO_MAX_SECONDS, true, 'demo');
    }

    const project = await findActiveProject(profile.id);
    if (!project) {
        console.warn(`[plan] profil ${profile.id} sans projet actif → démo`);
        return fromVapiShape(buildUnknownCallerAssistant(serverUrl), DEMO_MAX_SECONDS, true, 'demo');
    }

    const phase = toPhase(project.phase);
    const prompt = await getSystemPrompt(phase);
    if (!prompt?.prompt_content) {
        console.error(`[plan] aucun system_prompt pour la phase ${phase} → démo`);
        return fromVapiShape(buildUnknownCallerAssistant(serverUrl), DEMO_MAX_SECONDS, true, 'demo');
    }

    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl });
    return fromVapiShape(payload, config.limits.maxCallSeconds, false, `phase-${phase}`);
}
