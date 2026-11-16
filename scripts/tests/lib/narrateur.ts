/**
 * Le narrateur simulé : un modèle joue la personne au téléphone, à partir
 * d'une fiche de vie et d'une manière de parler.
 */

import { track } from './env';
import OpenAI from 'openai';

export const NARRATOR_MODEL = process.env.BANC_NARRATEUR_MODEL ?? 'gpt-4.1-mini';
export const HANGUP = '[RACCROCHE]';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 3, timeout: 60_000 });

export interface Persona {
    prenom: string;
    /** Qui est cette personne : sa vie, ses proches, ses lieux, ses souvenirs. */
    fiche: string;
    /** Comment elle parle et se comporte au téléphone. */
    maniere: string;
    /** Consignes propres à cet appel (ce qu'elle doit faire à un moment donné). */
    consignes?: string;
}

export interface Line {
    role: 'loomina' | 'narrateur';
    text: string;
}

function system(p: Persona, callNumber: number): string {
    return `Tu joues ${p.prenom}, une vraie personne au téléphone avec son biographe (« Loumina »), qui recueille ses souvenirs pour en faire un livre. C'est l'appel n° ${callNumber}.

# QUI TU ES
${p.fiche}

# COMMENT TU PARLES
${p.maniere}

# RÈGLES DU JEU
- Tu parles comme à l'oral, au téléphone : phrases simples, hésitations possibles, pas de style écrit, jamais de liste ni de didascalie.
- Tu ne racontes que ta vie telle que décrite ci-dessus. Tu peux ajouter des détails concrets cohérents (une odeur, une phrase qu'on t'a dite, un objet), comme le ferait quelqu'un qui se souvient, mais jamais de nouveau fait majeur (pas de nouvel enfant, de nouveau métier, de nouvelle ville).
- Tu ne dis jamais que tu es une IA ni que c'est un test. Tu ne commentes pas les règles.
- Tu réponds à ce qu'on te demande ; tu ne mènes pas l'entretien à la place du biographe.
- Quand tu veux arrêter, dis-le simplement et attends la réponse du biographe, comme on le fait au téléphone. Tu ne termines ta réplique par ${HANGUP} que lorsque le biographe a dit au revoir, ou si ta consigne te demande de raccrocher sans attendre. Après un au revoir du biographe, ta réplique est très courte (« Au revoir, à bientôt. ${HANGUP} »). Une réplique qui se termine par ${HANGUP} est ta dernière.
${p.consignes ? `\n# POUR CET APPEL\n${p.consignes}` : ''}`;
}

export async function narratorSays(p: Persona, history: Line[], callNumber: number): Promise<{ text: string; hangup: boolean }> {
    const res = await openai.chat.completions.create({
        model: NARRATOR_MODEL,
        temperature: 0.9,
        max_tokens: 500,
        messages: [
            { role: 'system', content: system(p, callNumber) },
            ...history.map((l) => ({ role: l.role === 'loomina' ? ('user' as const) : ('assistant' as const), content: l.text })),
        ],
    });
    track(NARRATOR_MODEL, res.usage);
    const raw = (res.choices[0]?.message?.content ?? '').trim();
    const hangup = raw.includes(HANGUP);
    return { text: raw.replace(HANGUP, '').trim(), hangup };
}
