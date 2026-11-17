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
import { PHASE_KEYS, toPhase, isFinalPhase } from './phases';
import { voicePromptTemplate, PHASE_OBJECTIVES } from './voice-prompt';
import { readPhaseState, spokenPhase, readTopics, openTopics, pendingAxes } from './phase-plan';
import type { Profile, Project, SystemPrompt } from './db';
import { renderContext, normalizeContext, contextFromLegacy, isEmptyContext, hasCallMemory } from './context';
import type { LoominaContext } from './context';
import { normalizeCallMinutes } from './call-length';

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

    const check = phaseCheck(project, vars);
    if (check) parts.push(check.block);

    // Sujets propres à cette personne pour la partie en cours : évoqués un
    // jour (parfois des appels plus tôt), pas encore racontés.
    const own = first ? [] : openTopics(readTopics(meta), toPhase(project.phase));
    if (own.length && !check) {
        parts.push(
            [
                `# CE QUE ${name.toUpperCase()} A DÉJÀ ÉVOQUÉ ET QUI RESTE À RACONTER`,
                ...own.slice(0, 10).map((t) => `- ${t.label}`),
                `Ce sont des sujets propres à ${name}, qu'on n'a pas encore creusés. Après la question de OÙ REPRENDRE, amène-les un par un quand la conversation s'y prête (« ${tu ? 'Tu m\'avais' : 'Vous m\'aviez'} parlé de… ${tu ? 'Raconte-moi' : 'Racontez-moi'}. »). Jamais comme une liste, jamais plus de deux ou trois par appel. Si ${name} préfère ne pas en parler, n'insiste pas.`,
            ].join('\n')
        );
    }

    // Sujets du socle commun dont on ne sait encore rien : on demande d'abord
    // s'ils concernent la personne. C'est elle qui choisit d'en parler ou non.
    const pending = first || check ? [] : pendingAxes(readPhaseState(meta, toPhase(project.phase)));
    if (pending.length && toPhase(project.phase) !== 1) {
        parts.push(
            [
                '# CE DONT ON NE SAIT ENCORE RIEN',
                ...pending.map((a) => `- ${a.label}`),
                `${name} n'en a pas encore parlé, et rien ne dit que ces sujets le ou la concernent. Au cours de cet appel, quand une histoire vient de se terminer, ouvre UN de ces sujets par une question douce qui ne suppose rien, et laisse ${name} choisir d'en parler ou non. Si ${name} dit que ça ne le ou la concerne pas, ou préfère ne pas en parler : « D'accord. » et passe à autre chose. Un seul de ces sujets par appel.`,
            ].join('\n')
        );
    }

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

/**
 * Tous les sujets de la phase sont couverts : avant de passer à la suite,
 * Loomina demande à la personne, qui décide (voir phase-plan.ts). Renvoie la
 * question à poser et les consignes, ou null s'il n'y a pas de point à faire.
 */
export function phaseCheck(project: Project, vars: Record<string, string>): { ask: string; block: string } | null {
    const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
    const phase = toPhase(project.phase);
    if (isFirstCall(project) || readPhaseState(meta, phase).check !== 'to_ask') return null;
    const name = vars.first_name;
    const tu = vars.politeness_preference === 'tu';
    const here = spokenPhase(phase, tu);
    const final = isFinalPhase(phase);
    const ask = final
        ? `Je crois qu'on a fait un beau tour de ${tu ? 'ta' : 'votre'} vie. ${tu ? 'Tu veux' : 'Vous voulez'} encore ajouter quelque chose, ou on considère que le livre est complet ?`
        : `Je crois qu'on a bien fait le tour de ${here}. ${tu ? 'Tu veux' : 'Vous voulez'} y ajouter quelque chose, ou on passe à ${spokenPhase((phase + 1) as Phase, tu)} ?`;
    const block = [
        '# FAIRE LE POINT AVANT DE PASSER À LA SUITE',
        `${name} a raconté tout ce qu'on attendait sur ${here}. La question de OÙ REPRENDRE est celle-ci, à poser avec tes mots juste après la réponse à ta salutation, avant toute autre question : « ${ask} »`,
        `- Si ${name} veut ajouter quelque chose : écoute, creuse comme d'habitude, et reste sur ${here} pour cet appel.`,
        final
            ? `- Si ${name} dit que le livre est complet : remercie chaleureusement, dis que le livre va maintenant être préparé et qu'un appel reste possible à tout moment pour ajouter un souvenir, puis termine l'appel.`
            : `- Si ${name} veut passer à la suite : enchaîne dans ce même appel sur ${spokenPhase((phase + 1) as Phase, tu)}, avec une première question ouverte tirée de ces pistes.\n${fillTemplate(PHASE_OBJECTIVES[(phase + 1) as Phase], vars)}`,
        `- Ne parle jamais de « phase » ni de numéro : ${name} ne connaît pas ces mots.`,
    ].join('\n');
    return { ask, block };
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
 * Placé en toute fin de prompt : sur les appels simulés du 16/11/2026, 28 %
 * des répliques posaient deux questions malgré la règle de « COMMENT TU
 * PARLES ». Le modèle suit mieux une règle répétée en dernier, avec le
 * mauvais exemple à côté du bon.
 */
export const ONE_QUESTION_REMINDER = `# AVANT CHAQUE RÉPLIQUE
Relis-la : elle contient UN SEUL point d'interrogation, à la fin.
- Mauvais : « Vous le regardiez travailler, parfois ? Racontez-moi un moment précis. Qu'est-ce qu'il vous disait ? »
- Bon : « Racontez-moi un moment où vous le regardiez travailler. »
- Mauvais : « Où était-ce, et à quoi ressemblait la maison ? » Bon : « À quoi ressemblait la maison ? »
Si deux questions te viennent, garde la plus ouverte et jette l'autre : tu la poseras plus tard.
Relis aussi tes répliques précédentes : si l'une des deux dernières commençait par « Vous vous souvenez » ou « Vous vous rappelez » (ou « Tu te souviens »), n'emploie pas ces mots. Demande plutôt directement :
- « À quoi ressemblait la cour ? » plutôt que « Vous vous souvenez de la cour ? »
- « Qui était là ce soir-là ? », « Qu'est-ce qu'elle vous a dit ? », « Racontez-moi la suite. »`;

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
    // Le point sur la phase prend la place de la question prévue : laissée
    // dans OÙ REPRENDRE, celle-ci passait devant et le point n'était jamais fait.
    const check = phaseCheck(project, vars);
    if (check) vars.next_question_strategy = check.ask;

    const session = sessionBlock(profile, project, vars);
    const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
    const template = voicePromptTemplate({
        phase,
        firstCall: isFirstCall(project),
        politenessAlreadySet: Boolean(meta.prefs_set_at),
        topicsAlreadyKnown: Boolean(profile.sensitive_topics?.trim()),
    });
    const systemPrompt = [fillTemplate(template, vars), session, pronunciationBlock(vars), ONE_QUESTION_REMINDER]
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
                politeness: vars.politeness_preference,
                // Durée souhaitée : le serveur vocal la donne au modèle à chaque réplique.
                call_minutes: normalizeCallMinutes(meta.call_minutes),
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

/** Durée maximale d'un entretien de secours. */
export const RECOVERY_MAX_SECONDS = 1200;

/**
 * Réponse quand la base ne répond pas : on ne sait pas si l'appelant est
 * un client. Plutôt que la démonstration (qui promet que rien n'est
 * conservé, et coupe au bout de cinq minutes), un entretien libre sur un
 * souvenir, de vingt minutes au plus.
 *
 * Le rapport de fin d'appel est bien envoyé : sans `project_id` dans les
 * métadonnées, le webhook retrouve le projet par le numéro appelant
 * (resolveCaller), et le souvenir rejoint le livre. Si le numéro n'est
 * celui d'aucun client, l'événement est simplement classé « no_project ».
 */
export function buildRecoveryAssistant(serverUrl: string) {
    const systemPrompt = `Tu es Loomina, un biographe masculin, chaleureux, patient et curieux. Tu mènes un entretien au téléphone pour un livre de souvenirs.

Ce jour-là, tu n'as pas accès au dossier de la personne. Ne parle jamais de problème technique, de base de données ou de dossier introuvable au-delà de ta première phrase.

# PRONONCIATION (ce que tu écris est lu à voix haute, jamais affiché)
- Écris toujours la marque « Loumina », jamais « Loomina ».

# DÉROULÉ
1. Après ta première phrase, attends sa réponse.
2. Si la personne dit qu'elle découvre le service ou qu'elle n'est pas cliente : explique en deux phrases que Loumina l'aide à raconter sa vie au fil d'appels, qu'un livre relié est ensuite imprimé, que tout est expliqué sur loomina point e u, remercie-la et termine par ##END_CALL##.
3. Sinon, demande-lui de quoi elle aimerait parler aujourd'hui. Si elle ne sait pas, propose : « Racontez-moi la maison où vous avez grandi. »
4. Creuse ce souvenir, une question à la fois : les lieux, les personnes, ce qu'on se disait, ce qu'elle ressentait. Réagis à ce qu'elle dit avant de poser la question suivante.
5. Après une vingtaine de minutes, ou si elle souhaite s'arrêter, remercie-la, dis que ce souvenir rejoindra son livre, et termine par ##END_CALL##.

# RÈGLES
- Une seule question à la fois. Une à deux phrases par intervention.
- Vouvoie toujours, sauf si la personne te demande de la tutoyer.
- Ne demande ni adresse, ni e-mail, ni coordonnées bancaires.
- N'invente rien sur sa vie : tu ne connais que ce qu'elle te dit pendant cet appel.`;

    return {
        assistant: {
            name: 'Loomina-Secours',
            transcriber: TRANSCRIBER,
            voice: VOICE,
            backgroundDenoisingEnabled: true,
            backgroundSound: 'off',
            startSpeakingPlan: { waitSeconds: 1.5 },
            stopSpeakingPlan: { numWords: 0, voiceSeconds: 0, backoffSeconds: 3 },
            silenceTimeoutSeconds: 60,
            firstMessageMode: 'assistant-speaks-first',
            firstMessage:
                "Bonjour, ici Loumina, votre biographe. " +
                "Je n'ai pas votre carnet de notes sous la main aujourd'hui, mais nous pouvons quand même avancer : " +
                "racontez-moi un souvenir, et il rejoindra votre livre.",
            endCallPhrases: ['##END_CALL##'],
            model: {
                provider: 'openai',
                model: 'gpt-4o',
                temperature: 0.7,
                messages: [{ role: 'system', content: systemPrompt }],
                tools: [{ type: 'endCall', messages: [{ type: 'request-start', content: 'À bientôt !' }] }],
            },
            server: { url: serverUrl, timeoutSeconds: 20 },
            serverMessages: [...SERVER_MESSAGES],
            metadata: { recovery: true },
            maxDurationSeconds: RECOVERY_MAX_SECONDS,
        },
    };
}
