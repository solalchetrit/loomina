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
import { voicePromptTemplate } from './voice-prompt';
import type { Profile, Project, SystemPrompt } from './db';
import { renderContext, normalizeContext, contextFromLegacy, isEmptyContext, hasCallMemory } from './context';
import type { LoominaContext } from './context';

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

/** Salutation du tout premier appel, quand la mémoire du projet est vide. */
export const FIRST_CALL_MESSAGE_TEMPLATE =
    "Bonjour {{first_name}}, c'est Loumina, {{votre}} biographe. Je suis ravi de faire {{ta}} connaissance ! Comment ça va aujourd'hui ?";

export interface BuildAssistantInput {
    profile: Profile;
    project: Project;
    /** Ligne `system_prompts` de la phase : ne sert plus qu'à la première phrase. */
    prompt: SystemPrompt | null;
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

function projectContext(project: Project): LoominaContext {
    return isEmptyContext(project.context)
        ? contextFromLegacy(project.global_context)
        : normalizeContext(project.context);
}

/** Premier appel : aucune mémoire d'entretien (un sujet suggéré n'en est pas une). */
export function isFirstCall(project: Project): boolean {
    return !hasCallMemory(projectContext(project)) && !project.global_context?.trim();
}

export function buildTemplateVars(
    profile: Profile,
    project: Project,
    phase: Phase
): Record<string, string> {
    const ctx = projectContext(project);

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
        // Devant un nom féminin : « ta connaissance », pas « ton connaissance ».
        ta: tu ? 'ta' : 'votre',
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

/**
 * Ce que l'espace auteur a changé pour CET appel. Ajouté après le prompt
 * de phase (voice-prompt.ts) : les règles valent pour les quatre phases,
 * et l'entrée comme la sortie (Vapi, serveur vocal) passent par ici.
 *
 * - Les sujets proposés sur le site : le site promet « Loomina l'abordera
 *   au prochain appel ». Noyés dans les « questions encore ouvertes » du
 *   contexte, ils n'étaient jamais posés.
 * - Un livre offert : le narrateur découvre peut-être le principe.
 */
export function sessionBlock(profile: Profile, project: Project, vars: Record<string, string>): string {
    const ctx = projectContext(project);
    const first = isFirstCall(project);
    const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
    const name = vars.first_name;
    const tu = vars.politeness_preference === 'tu';
    const parts: string[] = [];

    const suggestions = ctx.suggested_topics ?? [];
    if (suggestions.length) {
        parts.push(
            [
                `# SUJETS DEMANDÉS DEPUIS L'ESPACE AUTEUR (par ${name} ou un proche)`,
                ...suggestions.map((t, i) => `${i + 1}. ${t}`),
                `- Aborde le sujet n° 1 au cours de cet appel. S'il reste du temps et que ${name} est en forme, le suivant. Jamais plus de deux par appel.`,
                "- Choisis le bon moment : quand une histoire vient de se terminer, ou quand la conversation s'essouffle. Ne coupe jamais un récit pour ça.",
                `- Présente-le simplement, sans dire qui l'a écrit : « On m'a glissé une question sur ${tu ? 'ton' : 'votre'} espace : … ». Reformule-le en ${tu ? 'tutoyant' : 'vouvoyant'} si besoin.`,
                `- Si le sujet touche un sujet sensible ci-dessus, ne l'aborde pas. Si ${name} préfère ne pas en parler, n'insiste pas et passe à autre chose.`,
                first
                    ? "- Au premier appel, garde-le pour la seconde moitié : d'abord faire connaissance."
                    : "- Ne laisse pas OÙ REPRENDRE empêcher ce sujet : s'il ne trouve pas sa place après la première histoire, amène-le ensuite.",
            ].join('\n')
        );
    }

    if (first) {
        if (meta.is_gift === true) {
            parts.push(
                [
                    '# UN LIVRE OFFERT',
                    `Ce livre a été offert à ${name} par un proche. ${name} découvre peut-être le principe : si l'idée surprend ou fait hésiter, explique en une phrase (« On va discuter au téléphone, à ${tu ? 'ton' : 'votre'} rythme, et j'en ferai un livre de ${tu ? 'tes' : 'vos'} souvenirs. ») et rassure. Ne cite aucun prix.`,
                ].join('\n')
            );
        }
    }

    return parts.join('\n\n');
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

    const session = sessionBlock(profile, project, vars);
    const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
    const template = voicePromptTemplate({
        phase,
        firstCall: isFirstCall(project),
        politenessAlreadySet: Boolean(meta.prefs_set_at),
        topicsAlreadyKnown: Boolean(profile.sensitive_topics?.trim()),
    });
    const systemPrompt = [fillTemplate(template, vars), session, pronunciationBlock(vars)]
        .filter((part) => part.trim())
        .join('\n\n');

    // Dans la première phrase, seule la graphie parlée compte : c'est le TTS
    // qui la lit, personne ne la voit écrite.
    //
    // Premier appel (mémoire vide) : on ne « retrouve » personne. Le gabarit
    // en base est écrit pour les appels suivants ; ici on salue une première
    // fois. Le test « nouveau client » du 04/09 disait « Ravi de vous
    // retrouver » à quelqu'un qu'on n'avait jamais eu au téléphone.
    const greeting = isFirstCall(project)
        ? FIRST_CALL_MESSAGE_TEMPLATE
        : prompt?.first_message_template?.trim() ||
          `Bonjour {{first_name_spoken}} ! Ici Loumina, {{votre}} biographe. Je suis heureux de {{vous}} retrouver.`;
    const firstMessage = spokenForm(
        fillTemplate(greeting, { ...vars, first_name: vars.first_name_spoken })
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

/** Durée maximale de la démonstration offerte aux appelants inconnus. */
export const DEMO_MAX_SECONDS = 300;

/**
 * Réponse pour un appelant inconnu : une vraie démonstration.
 *
 * C'est là qu'arrive le bouton « Essayer gratuitement » du site. Plutôt
 * qu'un message d'accueil qui renvoie vers le site, l'appelant vit un
 * mini-entretien de trois minutes sur un seul souvenir, puis entend
 * comment commander.
 *
 * Rien n'est conservé : pas d'enregistrement audio, pas de rapport de
 * fin d'appel envoyé au serveur (serverMessages vide), et le webhook
 * ignore de toute façon tout appel marqué `demo` dans ses métadonnées.
 */
export function buildUnknownCallerAssistant(serverUrl: string) {
    const systemPrompt = `Tu es Loomina, un biographe masculin, chaleureux, patient et curieux. Tu fais une DÉMONSTRATION de trois minutes à une personne qui découvre le service. Elle n'est pas cliente : rien de ce qu'elle dit n'est conservé.

# PRONONCIATION (ce que tu écris est lu à voix haute, jamais affiché)
- Écris toujours la marque « Loumina », jamais « Loomina ».
- Écris « loomina point e u » pour l'adresse du site.

# DÉROULÉ
1. Après ta première phrase, attends sa réponse. S'il hésite, rassure-le : c'est un essai, il n'y a rien à préparer.
2. Demande son prénom, et utilise-le ensuite.
3. Propose-lui de choisir UN souvenir : « un lieu de votre enfance, une personne qui a compté, ou un moment dont vous êtes fier ». S'il ne sait pas, propose : « Racontez-moi la maison où vous avez grandi. »
4. Pose au maximum QUATRE questions sur ce souvenir, une à la fois, en creusant les détails sensoriels : les odeurs, les sons, ce que les gens disaient, ce qu'il ressentait. Réagis à ce qu'il dit avant de poser la question suivante.
5. Après la quatrième réponse, ou si l'appel approche les trois minutes, fais la CLÔTURE :
   - Reformule en deux phrases ce qu'il vient de raconter, avec ses mots, comme le début d'un chapitre. N'invente aucun détail.
   - Puis dis : « Voilà comment je travaille. Avec un vrai livre, nous aurions des dizaines d'appels comme celui-ci, à votre rythme, et notre équipe mettrait tout en forme dans un livre relié. Tout est expliqué sur loomina point e u. Merci pour ce moment, [prénom]. »
   - Termine par ##END_CALL##.

# RÈGLES
- Une seule question à la fois. Une à deux phrases par intervention. Pas de liste, pas de monologue.
- Vouvoie toujours.
- Ne demande ni nom de famille, ni adresse, ni téléphone, ni e-mail. Ne prends pas de commande, ne parle pas de prix : renvoie vers le site.
- Si la personne dit qu'elle est déjà cliente, explique qu'il faut appeler depuis le numéro communiqué à la commande, et termine par ##END_CALL##.
- Si elle veut arrêter, remercie-la et termine par ##END_CALL##.`;

    return {
        assistant: {
            name: 'Loomina-Demo',
            transcriber: TRANSCRIBER,
            voice: VOICE,
            backgroundDenoisingEnabled: true,
            backgroundSound: 'off',
            startSpeakingPlan: { waitSeconds: 1.5 },
            stopSpeakingPlan: { numWords: 0, voiceSeconds: 0, backoffSeconds: 3 },
            firstMessageMode: 'assistant-speaks-first',
            firstMessage:
                "Bonjour, ici Loumina, le biographe par téléphone. " +
                "Je ne reconnais pas votre numéro, alors je vous propose une petite démonstration : " +
                "pendant trois minutes, je vous pose quelques questions sur un souvenir, " +
                "et vous entendez comment je travaille. Rien n'est enregistré. " +
                "Ça vous tente ?",
            model: {
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.6,
                messages: [{ role: 'system', content: systemPrompt }],
                tools: [{ type: 'endCall', messages: [{ type: 'request-start', content: 'Belle journée !' }] }],
            },
            // Rien n'est conservé : ni audio, ni rapport serveur.
            artifactPlan: { recordingEnabled: false },
            server: { url: serverUrl, timeoutSeconds: 20 },
            serverMessages: [],
            metadata: { demo: true },
            maxDurationSeconds: DEMO_MAX_SECONDS,
            silenceTimeoutSeconds: 30,
            endCallPhrases: ['##END_CALL##'],
        },
    };
}
