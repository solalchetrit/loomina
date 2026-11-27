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
import { buildAssistant, DEMO_SYSTEM, RECOVERY_SYSTEM, ONE_QUESTION_REMINDER, demoFirstMessage, demoNumberBlock, demoTimeNote } from '@/lib/loomina/assistant';
import { voicePromptTemplate, VOICE_INTRO, VOICE_SPEAK, PHASE_OBJECTIVES } from '@/lib/loomina/voice-prompt';
import { REVIEW_SYSTEM } from '@/lib/loomina/book-review';
import { directorSystemPrompt, DIRECTOR_MODEL, DIRECTOR_FALLBACK_MODEL } from '@/lib/loomina/director';
import { WRITER_SYSTEM, WRITER_MODEL, CORRECTION_SYSTEM } from '@/lib/loomina/writer';
import { PLAN_SYSTEM, WRITE_SYSTEM, CARRY_SYSTEM, POLISH_SYSTEM, FIDELITY_SYSTEM, PIECES_SYSTEM, BOOK_MODEL } from '@/lib/loomina/book';
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
        project_metadata: firstCall
            ? { call_minutes: 20 }
            : {
                  call_minutes: 20,
                  // Ce que le Directeur a noté aux appels précédents, pour voir les blocs du prompt remplis.
                  book_told: [
                      { axis: 'maison', what: 'La ferme des grands-parents à Sébazac : la cuisine, la grande table, le chien Pataud' },
                      { axis: 'quotidien', what: "Les moissons d'août, toute la famille aux champs" },
                  ],
                  book_deepen: [{ id: 1, label: 'Le jour où le grand-père a vendu les bêtes : dit en une phrase, sans détail', status: 'open' }],
              },
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
            reads: "Profil (prénom, tu/vous, sujets à éviter), projet (phase, mémoire, où reprendre, sujets suggérés, sujets propres à la personne, scènes déjà racontées, scènes fortes à approfondir, sujets entamés à enrichir), durée souhaitée.",
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
            role: "Répond à un numéro inconnu : se présente, puis recueille en cinq minutes de quoi écrire le récit d'une période de sa vie (l'enfance par défaut). Le récit part ensuite par SMS.",
            model: `${voiceModel} (OpenAI), même chaîne que la voix.`,
            where: 'Serveur vocal (Render)',
            when: "Quand le numéro qui appelle n'est celui d'aucun client (ou d'un client sans livre en cours).",
            reads: 'Rien.',
            writes: "Le transcript (jamais l'audio) part au site, dans demo_stories, effacé après 30 jours. L'Écrivain en tire le récit, envoyé par SMS avec un lien ; sur la page du lien, l'e-mail donne le PDF.",
            file: 'lib/loomina/assistant.ts (DEMO_SYSTEM), lib/loomina/demo-story.ts',
            prompts: [
                { title: 'Prompt de la démonstration', text: promptText('demo', DEMO_SYSTEM) },
                { title: 'Première phrase (portable, puis fixe ou numéro masqué)', text: `${demoFirstMessage(true)}\n\n---\n\n${demoFirstMessage(false)}` },
                { title: 'Ajouté selon le numéro (portable, puis fixe)', text: `${demoNumberBlock(true)}\n\n---\n\n${demoNumberBlock(false)}` },
                { title: 'Note de temps ajoutée à chaque réplique (à 2, 4 et 5 min)', text: [120, 240, 300].map(demoTimeNote).join('\n\n---\n\n') },
            ],
        },
        {
            key: 'directeur',
            name: 'Le Directeur',
            role: "Analyse l'appel qui vient de finir et pilote la suite : met à jour la mémoire du livre, note chaque scène racontée et son sujet (c'est le code qui compte les scènes et coche un sujet quand il y en a assez), repère les scènes fortes à approfondir et ce que la personne veut pour son livre (titre, dédicace, remerciements, fin), prépare la question du prochain appel, repère les proches et les préférences.",
            model: `${DIRECTOR_MODEL} (OpenAI, raisonnement léger), repli ${DIRECTOR_FALLBACK_MODEL} s'il échoue.`,
            where: 'Site (Vercel), en arrière-plan après le raccroché',
            when: 'Une fois par appel de plus de 60 s et 200 caractères de transcript.',
            reads: 'Transcript, mémoire du livre, sujets suggérés, sujets à éviter, état de la phase, sujets propres à la personne, scènes déjà racontées (avec le compte par sujet), scènes à approfondir en attente.',
            writes: 'interviews (résumé, analyse), projects (phase, avancement, mémoire, prochaine question, scènes racontées, scènes à approfondir, souhaits pour le livre), profiles (tu/vous, style, sujets sensibles), family_members.',
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
            role: "Recompose le livre en quatre temps : le plan (chapitres dans l'ordre de la vie, sans redites, en gardant le plan précédent tant qu'il tient), l'écriture des chapitres un par un à partir des récits ET des paroles d'origine (un chapitre dont les scènes n'ont pas changé est repris mot pour mot), une relecture du livre entier (redites, noms, raccords), puis les pièces du livre (titre, dédicace, avant-propos, remerciements, quatrième de couverture).",
            model: `${BOOK_MODEL} (OpenAI, raisonnement moyen).`,
            where: 'Site (Vercel), par étapes (une étape = le plan, un chapitre, la relecture ou les pièces)',
            when: "Automatiquement à la fin de chaque étape de Mémo (depuis le 26/11/2026) : le livre est écrit jusqu'à l'étape finie, avec tous les récits des appels de cette étape et des précédentes. Plus de réécriture après chaque appel.",
            reads: "Tous les récits, les paroles d'origine des appels (transcripts, sauf pour un récit que l'auteur a corrigé), la mémoire du livre, les sujets à éviter, les souhaits de la personne pour son livre, l'édition précédente.",
            writes: 'book_editions (plan, chapitres, état, et dans « extras » : retouches de la relecture, pièces du livre).',
            file: 'lib/loomina/book.ts, lib/loomina/book-edition.ts',
            prompts: [
                { title: 'Le plan du livre', text: promptText('livre.plan', PLAN_SYSTEM) },
                { title: "L'écriture d'un chapitre du livre", text: promptText('livre.ecriture', WRITE_SYSTEM) },
                { title: 'La relecture du livre entier (retouches appliquées par le code)', text: promptText('livre.finition', POLISH_SYSTEM) },
                { title: 'La relecture de fidélité : retire les phrases que la personne n’a pas dites', text: promptText('livre.fidelite', FIDELITY_SYSTEM) },
                { title: 'Les pièces du livre : titre, dédicace, avant-propos, remerciements, quatrième de couverture', text: promptText('livre.pieces', PIECES_SYSTEM) },
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
        { key: 'livre.finition', ai: 'editeur', title: 'La relecture du livre entier', original: POLISH_SYSTEM },
        { key: 'livre.fidelite', ai: 'editeur', title: 'La relecture de fidélité (phrases jamais dites)', original: FIDELITY_SYSTEM },
        { key: 'livre.pieces', ai: 'editeur', title: 'Les pièces du livre (titre, dédicace, avant-propos, remerciements, dos)', original: PIECES_SYSTEM },
        { key: 'livre.report', ai: 'editeur', title: 'Report d’une correction de l’auteur dans le livre composé', original: CARRY_SYSTEM },
        { key: 'avis', ai: 'editeur', title: 'L’avis de lecture sur le livre entier', original: REVIEW_SYSTEM },
        { key: 'rangement', ai: 'periodes', title: 'Le rangement par périodes', original: BOOK_PLAN_SYSTEM },
        { key: 'secours', ai: 'secours', title: 'Prompt de l’entretien de secours', original: RECOVERY_SYSTEM },
    ];
}
