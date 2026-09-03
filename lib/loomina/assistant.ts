/**
 * Construction de la configuration de l'assistant vocal.
 *
 * C'est la réponse synchrone à `assistant-request` : Vapi attend un JSON
 * dans les 20 secondes (`timeoutSeconds` configuré sur le numéro), sinon
 * il abandonne l'appel. Cette fonction ne doit donc faire QUE des lectures.
 * Aucun appel LLM ici.
 *
 * Remplace les modules Make 28 → 30 → 9200-9203 → 9100-9103, qui
 * répétaient quatre fois la même logique avec le prompt en dur dans le
 * corps de la réponse webhook.
 */

import type { Phase } from './phases';
import { PHASE_KEYS } from './phases';
import type { Profile, Project, SystemPrompt } from './db';
import { renderContext, normalizeContext, contextFromLegacy, isEmptyContext } from './context';

/**
 * LE réglage qui change tout côté coût.
 *
 * Par défaut Vapi envoie une dizaine de types d'événements
 * (`status-update`, `speech-update`, `conversation-update`, `transcript`,
 * `hang`…). Aucune des quatre réponses Make ne restreignait cette liste :
 * un seul appel court a produit 11 exécutions Make et 25 opérations,
 * dont 24 pour rien.
 *
 * On ne demande que ce qu'on traite réellement.
 */
export const SERVER_MESSAGES = ['end-of-call-report'] as const;

const VOICE = {
    provider: '11labs',
    voiceId: 'Qrl71rx6Yg8RvyPYRGCQ',
    model: 'eleven_turbo_v2_5',
    speed: 0.8,
    stability: 0.5,
    similarityBoost: 0.75,
} as const;

const TRANSCRIBER = {
    provider: 'deepgram',
    model: 'nova-3',
    language: 'fr',
} as const;

export interface BuildAssistantInput {
    profile: Profile;
    project: Project;
    prompt: SystemPrompt;
    phase: Phase;
    serverUrl: string;
}

/**
 * Remplit les variables `{{...}}` d'un gabarit.
 *
 * Les noms historiques sont conservés pour que les lignes existantes de
 * `system_prompts` continuent de fonctionner sans réécriture.
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
        const value = vars[key];
        return value !== undefined ? value : match;
    });
}

export function buildTemplateVars(
    profile: Profile,
    project: Project,
    phase: Phase
): Record<string, string> {
    const ctx = isEmptyContext(project.context)
        ? contextFromLegacy(project.global_context)
        : normalizeContext(project.context);

    const firstName =
        profile.first_name?.trim() ||
        profile.full_name?.trim().split(/\s+/)[0] ||
        'cher client';

    // Graphie lue par la voix de synthèse. « Solal » est prononcé « Saulal »
    // par ElevenLabs ; « Solale » passe. Le prénom réel reste `first_name`.
    const firstNameSpoken = profile.first_name_phonetic?.trim() || firstName;

    // Le gabarit de première phrase doit suivre la préférence tu/vous :
    // « votre biographe, ravi de vous retrouver » à quelqu'un qui a demandé
    // le tutoiement sonne faux dès la première seconde.
    const tu = (profile.politeness_preference ?? 'vous') === 'tu';

    return {
        first_name: firstName,
        first_name_spoken: firstNameSpoken,
        vous: tu ? 'te' : 'vous',
        votre: tu ? 'ton' : 'votre',
        vos: tu ? 'tes' : 'vos',
        vous_sujet: tu ? 'tu' : 'vous',
        // Conjugaisons utilisées par les gabarits de première phrase en base.
        sens: tu ? 'sens' : 'sentez',
        souhaite: tu ? 'souhaites' : 'souhaitez',
        full_name: profile.full_name ?? firstName,
        politeness_preference: profile.politeness_preference ?? 'vous',
        writing_style: profile.writing_style ?? 'Naturel et sobre',
        sensitive_topics: profile.sensitive_topics ?? 'Aucun sujet sensible signalé',

        // Nom historique conservé, contenu désormais structuré et lisible
        global_context: renderContext(ctx),
        context: renderContext(ctx),

        next_question_strategy:
            project.next_question_strategy ?? 'Commencer par faire connaissance, sans précipiter.',
        last_topic:
            ctx.last_call?.summary?.slice(0, 200) ?? '',
        phase_key: PHASE_KEYS[phase],
        phase_number: String(phase),
    };
}

/**
 * Tout ce que le modèle vocal écrit est lu par la voix de synthèse, jamais
 * affiché : on lui demande donc d'écrire les noms propres « comme ils se
 * prononcent », pas comme ils s'orthographient. Le livre, lui, est écrit
 * par l'Écrivain à partir du transcript et du contexte : il n'est pas
 * concerné.
 */
export function pronunciationBlock(vars: Record<string, string>): string {
    const lines = [
        '# PRONONCIATION (ce que tu écris est lu à voix haute, jamais affiché)',
        '- Écris toujours le nom de la marque « Loumina », jamais « Loomina ».',
    ];
    if (vars.first_name_spoken && vars.first_name_spoken !== vars.first_name) {
        lines.push(
            `- Le prénom de ton interlocuteur est « ${vars.first_name} ». Pour qu'il soit bien prononcé, écris-le toujours « ${vars.first_name_spoken} ».`
        );
    } else if (vars.first_name) {
        lines.push(`- Le prénom de ton interlocuteur est « ${vars.first_name} ».`);
    }
    lines.push(
        `- ÉPELER est différent de PRONONCER : si on te demande d'épeler, donne les VRAIES lettres, en majuscules séparées par des tirets. La marque s'épelle « L-O-O-M-I-N-A » (deux O). Le prénom s'épelle « ${spellOut(vars.first_name)} ».`,
        "- Si l'interlocuteur épelle un nom lettre par lettre, remercie-le et ne le fais pas répéter : l'orthographe sera reprise dans le livre.",
        '',
        '# ÉCOUTE',
        "- Ne réponds jamais à ta propre question. Si tu n'as pas reçu de réponse, ou une réponse incompréhensible, demande simplement de répéter (« Pardon, je n'ai pas bien entendu, tu peux redire ? ») et attends.",
        "- Ne conclus jamais à la place de l'interlocuteur (« le basket semble avoir été pour toi… ») : reformule seulement ce qu'il a dit."
    );
    return lines.join('\n');
}

/** « Solal » → « S-O-L-A-L », pour que le modèle épelle les vraies lettres. */
export function spellOut(name: string): string {
    return Array.from(name.trim().toUpperCase()).filter((c) => c !== ' ').join('-');
}

/** Graphie orale de la marque, pour les textes lus par la voix de synthèse. */
export function spokenForm(text: string): string {
    return text.replace(/Loomina/g, 'Loumina');
}

/**
 * Construit la charge utile complète attendue par Vapi.
 */
export function buildAssistant({
    profile,
    project,
    prompt,
    phase,
    serverUrl,
}: BuildAssistantInput) {
    const vars = buildTemplateVars(profile, project, phase);

    const systemPrompt =
        fillTemplate(prompt.prompt_content ?? '', vars) + '\n\n' + pronunciationBlock(vars);

    // Dans la première phrase, seule la graphie parlée compte : c'est le TTS
    // qui la lit, personne ne la voit écrite.
    const firstMessage = spokenForm(
        fillTemplate(
            prompt.first_message_template?.trim() ||
                `Bonjour {{first_name_spoken}} ! Ici Loumina, votre biographe. Je suis heureux de vous retrouver.`,
            { ...vars, first_name: vars.first_name_spoken }
        )
    );

    return {
        assistant: {
            name: `Loomina-${PHASE_KEYS[phase]}`,
            transcriber: TRANSCRIBER,
            voice: VOICE,
            backgroundDenoisingEnabled: true,
            backgroundSound: 'off',

            // Laisser respirer une personne âgée : ne pas la couper,
            // et attendre avant de reprendre la parole.
            startSpeakingPlan: { waitSeconds: 1.5 },
            stopSpeakingPlan: { numWords: 0, voiceSeconds: 0, backoffSeconds: 3 },
            silenceTimeoutSeconds: 60,

            firstMessageMode: 'assistant-speaks-first',
            firstMessage,
            endCallPhrases: ['##END_CALL##'],

            model: {
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                messages: [{ role: 'system', content: systemPrompt }],
                tools: [
                    {
                        type: 'endCall',
                        messages: [{ type: 'request-start', content: 'À bientôt !' }],
                    },
                ],
            },

            server: { url: serverUrl, timeoutSeconds: 20 },
            serverMessages: [...SERVER_MESSAGES],

            // Repêchage en cas de rejeu : permet de retrouver le projet
            // même si le numéro appelant est masqué.
            metadata: {
                user_id: profile.id,
                project_id: project.id,
                phase,
            },
        },
    };
}

/**
 * Réponse pour un appelant inconnu.
 *
 * Auparavant le module Make 15 renvoyait une réponse « Client Inconnu ».
 * Autant en faire quelque chose d'utile commercialement.
 */
export function buildUnknownCallerAssistant(serverUrl: string) {
    return {
        assistant: {
            name: 'Loomina-Accueil',
            transcriber: TRANSCRIBER,
            voice: VOICE,
            firstMessageMode: 'assistant-speaks-first',
            firstMessage:
                "Bonjour, vous êtes bien chez Loumina, le biographe par téléphone. " +
                "Je ne reconnais pas ce numéro : il n'est rattaché à aucun projet de livre. " +
                "Si vous souhaitez commencer votre biographie, rendez-vous sur loomina point e u. " +
                "Si vous êtes déjà client, appelez depuis le numéro que vous nous avez communiqué.",
            model: {
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.5,
                messages: [
                    {
                        role: 'system',
                        content:
                            "Tu es l'accueil téléphonique de Loomina. L'appelant n'est pas reconnu. " +
                            "Ce que tu écris est lu à voix haute : écris la marque « Loumina ». " +
                            "Sois chaleureux et bref. Explique que Loumina écrit des autobiographies " +
                            "à partir d'entretiens téléphoniques, et oriente vers le site loomina.eu. " +
                            "Ne promets rien, ne collecte aucune donnée personnelle, ne prends pas de commande. " +
                            "Termine l'appel poliment après avoir répondu.",
                    },
                ],
                tools: [{ type: 'endCall', messages: [{ type: 'request-start', content: 'Belle journée !' }] }],
            },
            server: { url: serverUrl, timeoutSeconds: 20 },
            serverMessages: [...SERVER_MESSAGES],
            silenceTimeoutSeconds: 30,
            endCallPhrases: ['##END_CALL##'],
        },
    };
}
