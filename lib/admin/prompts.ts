/**
 * Les IA de Loomina et leurs prompts, tels qu'ils sont dans le code.
 *
 * Rien n'est recopié ici : chaque prompt est importé de son fichier, et
 * passe par `promptText` : la page admin montre la version en vigueur, y
 * compris quand elle a été réécrite dans l'admin.
 */

import type { Phase } from '@/lib/loomina/phases';
import { PHASE_LABELS } from '@/lib/loomina/phases';
import type { Profile, Project } from '@/lib/loomina/db';
import { buildAssistant, DEMO_SYSTEM, RECOVERY_SYSTEM, ONE_QUESTION_REMINDER } from '@/lib/loomina/assistant';
import { voicePromptTemplate, VOICE_INTRO, VOICE_SPEAK, PHASE_OBJECTIVES } from '@/lib/loomina/voice-prompt';
import { REVIEW_SYSTEM } from '@/lib/loomina/book-review';
import { directorSystemPrompt, DIRECTOR_MODEL, DIRECTOR_FALLBACK_MODEL } from '@/lib/loomina/director';
import { WRITER_SYSTEM, WRITER_MODEL, CORRECTION_SYSTEM } from '@/lib/loomina/writer';
import { PLAN_SYSTEM, WRITE_SYSTEM, CARRY_SYSTEM, BOOK_MODEL } from '@/lib/loomina/book';
import { BOOK_PLAN_SYSTEM, BOOK_PLAN_MODEL } from '@/lib/loomina/book-plan';
import { timeNote } from '@/lib/loomina/call-length';
import { promptText } from '@/lib/loomina/prompt-store';
import { photoSystemPrompt, VISION_MODEL } from '@/lib/loomina/photos';

export interface PromptPart {
    title: string;
    text: string;
}

export interface Ai {
    key: string;
    name: string;
    role: string;
    model: string;
    where: string;
    when: string;
    reads: string;
    writes: string;
    file: string;
    prompts: PromptPart[];
}

/** Un narrateur fictif, pour montrer le prompt vocal rempli comme le jour d'un appel. */
function sampleProfile(): Profile {
    return {
        id: 'exemple',
        first_name: 'Jeanne',
        first_name_phonetic: null,
        last_name: 'Martin',
        full_name: 'Jeanne Martin',
        email: null,
        phone_number: null,
        politeness_preference: 'vous',
        writing_style: 'Naturel',
        sensitive_topics: null,
    };
}

function sampleProject(phase: Phase, firstCall: boolean): Project {
    return {
        id: 'exemple',
        user_id: 'exemple',
        title: 'Biographie de Jeanne',
        status: 'active',
        phase,
        phase_progress: 0,
        current_topic_id: null,
        context: firstCall
            ? {}
            : {
                  identity: { birth: 'Née en 1948 à Rodez' },
                  last_call: { summary: "La ferme de ses grands-parents, l'été des moissons." },
              },
        next_question_strategy: firstCall ? null : 'Reprendre sur la ferme des grands-parents : qui travaillait avec eux aux moissons ?',
        project_metadata: { call_minutes: 20 },
        global_context: null,
    };
}

/** Le prompt vocal complet, tel que l'entend le modèle au début d'un appel. */
export function sampleVoicePrompt(phase: Phase, firstCall: boolean): { firstMessage: string; system: string } {
    const payload = buildAssistant({
        profile: sampleProfile(),
        project: sampleProject(phase, firstCall),
        prompt: null,
        phase,
        serverUrl: 'https://www.loomina.eu/api/vapi/webhook',
    });
    return {
        firstMessage: payload.assistant.firstMessage,
        system: payload.assistant.model.messages[0].content,
    };
}

export function aiCatalog(): Ai[] {
    const voiceModel = process.env.VOICE_MODEL?.trim() || 'gpt-4.1';
    const phases: Phase[] = [1, 2, 3, 4];

    return [
        {
            key: 'voix',
            name: 'La voix de Loomina',
            role: "Mène l'entretien au téléphone, en direct : une question à la fois, relances sur les détails, fin d'appel.",
            model: `${voiceModel} (OpenAI), sur le serveur vocal Render. Oreille : Deepgram nova-3. Voix : ElevenLabs, via Twilio.`,
            where: 'Serveur vocal (Render)',
            when: 'Pendant chaque appel, à chaque réplique du narrateur.',
            reads: "Profil (prénom, tu/vous, sujets à éviter), projet (phase, mémoire, où reprendre, sujets suggérés, sujets propres à la personne), durée souhaitée.",
            writes: 'Rien en base pendant l’appel. À la fin : le rapport d’appel (transcript, durée, mesures) envoyé au site.',
            file: 'lib/loomina/voice-prompt.ts, lib/loomina/assistant.ts, voice/src/session.ts',
            prompts: [
                {
                    title: 'Gabarit commun aux quatre phases (variables {{…}} remplies à chaque appel)',
                    text: voicePromptTemplate({ phase: 2, firstCall: false, politenessAlreadySet: false, topicsAlreadyKnown: false }),
                },
                {
                    title: 'Premier appel : la partie qui remplace « Mémoire » et « Où reprendre »',
                    text: voicePromptTemplate({ phase: 1, firstCall: true, politenessAlreadySet: false, topicsAlreadyKnown: false })
                        .split('\n\n')
                        .filter((b) => b.startsWith('# PREMIER APPEL'))
                        .join('\n\n'),
                },
                ...phases.map((p) => {
                    const ex = sampleVoicePrompt(p, p === 1);
                    return {
                        title: `Exemple rempli, phase ${p} (${PHASE_LABELS[p]})${p === 1 ? ', premier appel' : ''}, pour Jeanne`,
                        text: `PREMIÈRE PHRASE DITE : « ${ex.firstMessage} »\n\n${ex.system}`,
                    };
                }),
                { title: 'Rappel placé en toute fin du prompt', text: promptText('voix.rappel', ONE_QUESTION_REMINDER) },
                {
                    title: 'Note de temps ajoutée à chaque réplique (exemples à 5 et 22 min sur 20 souhaitées)',
                    text: `${timeNote(5 * 60, 20)}\n\n---\n\n${timeNote(22 * 60, 20)}`,
                },
            ],
        },
        {
            key: 'demo',
            name: 'La démonstration',
            role: "Répond à un numéro inconnu : trois minutes sur un souvenir, puis explique comment commander. Rien n'est enregistré.",
            model: `${voiceModel} (OpenAI), même chaîne que la voix.`,
            where: 'Serveur vocal (Render)',
            when: "Quand le numéro qui appelle n'est celui d'aucun client (ou d'un client sans livre en cours).",
            reads: 'Rien.',
            writes: 'Rien : pas de rapport, pas de transcript.',
            file: 'lib/loomina/assistant.ts (DEMO_SYSTEM)',
            prompts: [{ title: 'Prompt de la démonstration', text: promptText('demo', DEMO_SYSTEM) }],
        },
        {
            key: 'directeur',
            name: 'Le Directeur',
            role: "Analyse l'appel qui vient de finir et pilote la suite : met à jour la mémoire du livre, coche les sujets, décide de la phase, prépare la question du prochain appel, repère les proches et les préférences.",
            model: `${DIRECTOR_MODEL} (OpenAI, raisonnement léger), repli ${DIRECTOR_FALLBACK_MODEL} s'il échoue.`,
            where: 'Site (Vercel), en arrière-plan après le raccroché',
            when: 'Une fois par appel de plus de 60 s et 200 caractères de transcript.',
            reads: 'Transcript, mémoire du livre, sujets suggérés, sujets à éviter, état de la phase, sujets propres à la personne.',
            writes: 'interviews (résumé, analyse), projects (phase, avancement, mémoire, prochaine question), profiles (tu/vous, style, sujets sensibles), family_members.',
            file: 'lib/loomina/director.ts',
            prompts: phases.map((p) => ({ title: `Prompt système, phase ${p} (${PHASE_LABELS[p]})`, text: promptText(`directeur.${p}`, directorSystemPrompt(p)) })),
        },
        {
            key: 'ecrivain',
            name: "L'Écrivain",
            role: "Écrit le récit de l'appel, à la première personne, à partir du seul transcript. C'est ce que l'auteur lit dans son espace après chaque appel.",
            model: `${WRITER_MODEL} (OpenAI, raisonnement moyen).`,
            where: 'Site (Vercel), juste après le Directeur',
            when: "Après chaque appel où le Directeur a trouvé de la matière. Moins de 40 mots écrits : rien n'est gardé.",
            reads: 'Transcript, mémoire, style demandé, sommaire du livre, 40 derniers récits, sujets à éviter, piste de titre du Directeur.',
            writes: 'chapters (un récit par appel), puis SMS « votre récit est prêt » et recomposition du livre.',
            file: 'lib/loomina/writer.ts',
            prompts: [
                { title: 'Prompt système', text: promptText('ecrivain', WRITER_SYSTEM) },
                { title: "Correction demandée par l'auteur sur un récit (proposée, l'auteur valide)", text: promptText('correction', CORRECTION_SYSTEM) },
            ],
        },
        {
            key: 'editeur',
            name: "L'Éditeur du livre",
            role: "Recompose le livre à partir de tous les récits : décide du plan (chapitres dans l'ordre de la vie, sans redites), puis écrit les chapitres un par un.",
            model: `${BOOK_MODEL} (OpenAI, raisonnement moyen).`,
            where: 'Site (Vercel), par étapes (une étape = le plan ou un chapitre)',
            when: "Automatiquement après chaque nouveau récit (dès 2 récits), ou quand l'auteur clique « recomposer ».",
            reads: 'Tous les récits, la mémoire du livre, les sujets à éviter.',
            writes: 'book_editions (plan, chapitres, état).',
            file: 'lib/loomina/book.ts, lib/loomina/book-edition.ts',
            prompts: [
                { title: 'Le plan du livre', text: promptText('livre.plan', PLAN_SYSTEM) },
                { title: "L'écriture d'un chapitre du livre", text: promptText('livre.ecriture', WRITE_SYSTEM) },
                { title: "Report d'une correction de l'auteur dans le livre composé", text: promptText('livre.report', CARRY_SYSTEM) },
            ],
        },
        {
            key: 'periodes',
            name: 'Le rangement par périodes',
            role: "Range les récits en parties qui suivent la vie (enfance, jeunesse…), pour le sommaire de l'espace auteur.",
            model: `${BOOK_PLAN_MODEL} (OpenAI, raisonnement léger).`,
            where: 'Site (Vercel)',
            when: "Quand l'auteur demande le rangement par périodes dans son espace.",
            reads: 'Titres et débuts des récits, mémoire du livre.',
            writes: 'projects.project_metadata (plan par périodes).',
            file: 'lib/loomina/book-plan.ts',
            prompts: [{ title: 'Prompt système', text: promptText('rangement', BOOK_PLAN_SYSTEM) }],
        },
        {
            key: 'photos',
            name: 'Le regard sur les photos',
            role: "Décrit une photo envoyée par l'auteur ou sa famille et prépare une question ouverte pour faire raconter le souvenir.",
            model: `${VISION_MODEL} (OpenAI, vision, raisonnement léger).`,
            where: 'Site (Vercel)',
            when: "À chaque photo ajoutée dans l'espace auteur.",
            reads: 'La photo (en basse définition) et sa légende.',
            writes: 'projects.project_metadata (la photo, sa description) et une question dans les sujets suggérés du prochain appel.',
            file: 'lib/loomina/photos.ts',
            prompts: [{ title: 'Prompt système (exemple au vouvoiement)', text: photoSystemPrompt('Jeanne', false) }],
        },
        {
            key: 'secours',
            name: "L'entretien de secours",
            role: "Ancien chemin Vapi : si la base ne répondait pas pendant l'appel, un entretien libre de 20 min rattaché ensuite au client par son numéro.",
            model: 'gpt-4o (Vapi). Plus utilisé depuis le passage au serveur vocal : celui-ci annonce un problème technique et raccroche.',
            where: 'Site (route /api/vapi/webhook, chemin Vapi)',
            when: 'Seulement si Vapi est rebranché.',
            reads: 'Rien.',
            writes: 'Un rapport d’appel normal.',
            file: 'lib/loomina/assistant.ts (RECOVERY_SYSTEM)',
            prompts: [{ title: 'Prompt de secours', text: promptText('secours', RECOVERY_SYSTEM) }],
        },
    ];
}

// ------------------------------------------------------------------
// Les prompts que l'admin peut réécrire (lib/loomina/prompt-store.ts)
// ------------------------------------------------------------------

export interface EditablePrompt {
    /** Clé dans `prompt_overrides`. */
    key: string;
    /** L'IA à laquelle il appartient (clé de `aiCatalog`). */
    ai: string;
    title: string;
    original: string;
}

export function editablePrompts(): EditablePrompt[] {
    const phases: Phase[] = [1, 2, 3, 4];
    return [
        { key: 'voix.intro', ai: 'voix', title: 'Ouverture : qui est Loomina, ce qu’est un bon appel, les préférences', original: VOICE_INTRO },
        ...phases.map((p) => ({ key: `voix.objectif.${p}`, ai: 'voix', title: `Objectif de la phase ${p} (${PHASE_LABELS[p]})`, original: PHASE_OBJECTIVES[p] })),
        { key: 'voix.parler', ai: 'voix', title: 'Comment tu parles, et la fin d’appel', original: VOICE_SPEAK },
        { key: 'voix.rappel', ai: 'voix', title: 'Rappel placé en toute fin du prompt', original: ONE_QUESTION_REMINDER },
        { key: 'demo', ai: 'demo', title: 'Prompt de la démonstration', original: DEMO_SYSTEM },
        ...phases.map((p) => ({ key: `directeur.${p}`, ai: 'directeur', title: `Prompt du Directeur, phase ${p} (${PHASE_LABELS[p]})`, original: directorSystemPrompt(p) })),
        { key: 'ecrivain', ai: 'ecrivain', title: 'Prompt système de l’Écrivain', original: WRITER_SYSTEM },
        { key: 'correction', ai: 'ecrivain', title: 'Correction demandée par l’auteur sur un récit', original: CORRECTION_SYSTEM },
        { key: 'livre.plan', ai: 'editeur', title: 'Le plan du livre', original: PLAN_SYSTEM },
        { key: 'livre.ecriture', ai: 'editeur', title: 'L’écriture d’un chapitre du livre', original: WRITE_SYSTEM },
        { key: 'livre.report', ai: 'editeur', title: 'Report d’une correction de l’auteur dans le livre composé', original: CARRY_SYSTEM },
        { key: 'avis', ai: 'editeur', title: 'L’avis de lecture sur le livre entier', original: REVIEW_SYSTEM },
        { key: 'rangement', ai: 'periodes', title: 'Le rangement par périodes', original: BOOK_PLAN_SYSTEM },
        { key: 'secours', ai: 'secours', title: 'Prompt de l’entretien de secours', original: RECOVERY_SYSTEM },
    ];
}
