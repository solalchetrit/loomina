/**
 * Les deux arbres de parcours de l'admin, décrits à partir du code.
 *
 * Format demandé par Solal (17/11/2026) : un organigramme du haut vers le
 * bas, étape par étape. Chaque arbre est une liste d'étapes ; chaque étape
 * est une case de départ et ses suites. `branch: true` = des suites
 * possibles, côte à côte ; sinon, les cases se suivent l'une sous l'autre.
 * Le texte d'une case reste court : le reste (detail, effects) s'affiche au clic.
 *
 * À tenir à jour quand le parcours change (commande, appel, traitement).
 */

import type { TreeNode } from '@/components/admin/tree-types';
import { OFFER } from '@/config/offer';
import { SITE } from '@/config/site';
import { CALL_MINUTES_OPTIONS, DEFAULT_CALL_MINUTES } from '@/lib/loomina/call-length';
import { MIN_TRANSCRIPT_CHARS, MIN_DURATION_SECONDS, MIN_CHAPTER_WORDS, PREVIOUS_CHAPTERS } from '@/lib/loomina/pipeline';
import { MAX_ATTEMPTS } from '@/lib/loomina/events';
import { DEMO_MAX_SECONDS } from '@/lib/loomina/assistant';

const minutes = CALL_MINUTES_OPTIONS.join(', ');

// ------------------------------------------------------------------
// ARBRE 1 — LA COMMANDE
// ------------------------------------------------------------------

export const ORDER_TREE: TreeNode[] = [
    {
        who: 'client',
        label: 'Découvre Loomina',
        detail: 'Il arrive sur le site : accueil, Comment ça marche, Le livre et le prix, Questions. Deux portes.',
        branch: true,
        children: [
            {
                who: 'client',
                label: 'Essaie la démo par téléphone',
                detail: `Il appelle le ${SITE.phoneDisplay}. Son numéro n’est celui d’aucun client.`,
                children: [
                    {
                        who: 'voix',
                        label: 'Démonstration de 5 minutes',
                        effects: [
                            'Twilio décroche et passe l’appel au serveur vocal, qui ne reconnaît pas le numéro.',
                            `Un souvenir, quatre questions, ${Math.round(DEMO_MAX_SECONDS / 60)} min au plus, puis Loomina explique comment commander.`,
                        ],
                        code: 'voice/src/plan.ts · lib/loomina/assistant.ts (DEMO_SYSTEM)',
                        children: [
                            {
                                who: 'base',
                                label: 'Rien n’est enregistré',
                                effects: ['Pas de transcript, pas de compte, rien en base.'],
                            },
                        ],
                    },
                ],
            },
            {
                who: 'client',
                label: 'Clique « Commencer mon livre » ou « Offrir le livre »',
                effects: ['Ouvre la page de commande avec le choix déjà fait (#pour-moi ou #pour-offrir).'],
                code: 'app/order/page.tsx',
                children: [{ who: 'site', label: 'Page de commande', detail: 'Voir l’étape 2, « Remplit la commande ».' }],
            },
        ],
    },
    {
        who: 'client',
        label: 'Remplit la commande',
        code: 'app/order/page.tsx',
        children: [
            {
                who: 'client',
                label: '1 · Pour qui ?',
                branch: true,
                children: [
                    {
                        who: 'client',
                        label: 'C’est pour moi',
                        children: [
                            {
                                who: 'client',
                                label: '2 · Ses coordonnées',
                                detail: 'Prénom, nom, téléphone, e-mail.',
                                effects: ['Le téléphone est celui depuis lequel il appellera : c’est ce qui le fera reconnaître.'],
                            },
                        ],
                    },
                    {
                        who: 'offreur',
                        label: 'C’est pour offrir',
                        children: [
                            {
                                who: 'offreur',
                                label: '2 · Les coordonnées du narrateur',
                                detail: 'Prénom, nom, téléphone, e-mail de la personne qui racontera.',
                            },
                            {
                                who: 'offreur',
                                label: '« Et vous ? » : son prénom et son portable',
                                effects: [
                                    'Un numéro différent de celui du narrateur.',
                                    'Il ouvrira l’espace famille : suivre l’avancement, souffler des souvenirs.',
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                who: 'client',
                label: 'Choisit la durée des appels',
                effects: [`${minutes} min (${DEFAULT_CALL_MINUTES} par défaut). Modifiable plus tard dans l’espace auteur.`],
            },
            {
                who: 'site',
                label: 'Vérifie le formulaire',
                effects: ['Prénom et nom remplis, numéro plausible, e-mail avec un @ et un point. Sinon, un message sous le champ.'],
            },
            {
                who: 'client',
                label: '3 · Clique « Payer »',
                effects: [
                    `Le site crée une page de paiement Stripe : ${OFFER.price} €, carte bancaire, codes promo acceptés.`,
                    'Les coordonnées voyagent avec le paiement : rien n’est encore écrit chez Loomina.',
                ],
                code: 'app/api/checkout/route.ts',
            },
        ],
    },
    {
        who: 'client',
        label: 'Sur la page de paiement Stripe',
        branch: true,
        children: [
            {
                who: 'client',
                label: 'Abandonne',
                children: [{ who: 'site', label: 'Retour sur la page de commande', effects: ['Aucun compte, aucun livre.'] }],
            },
            {
                who: 'client',
                label: 'Paie',
                children: [
                    {
                        who: 'site',
                        label: 'Le client voit « commande reçue »',
                        effects: ['Stripe le renvoie sur son espace auteur.'],
                    },
                    {
                        who: 'stripe',
                        label: 'Stripe prévient le site',
                        detail: 'En même temps, Stripe envoie « paiement réussi » au site. C’est l’étape 4 qui crée tout.',
                    },
                ],
            },
        ],
    },
    {
        who: 'stripe',
        label: 'Le site crée le compte et le livre',
        detail: 'À la réception du « paiement réussi » de Stripe.',
        code: 'app/api/webhook/stripe/route.ts',
        children: [
            {
                who: 'site',
                label: 'Le message vient-il de Stripe ?',
                branch: true,
                children: [
                    { who: 'site', label: 'Non : refusé', effects: ['Rien n’est créé.'] },
                    {
                        who: 'site',
                        label: 'Oui : déjà traité ?',
                        branch: true,
                        children: [
                            { who: 'site', label: 'Déjà traité : ignoré', effects: ['Stripe renvoie parfois deux fois le même message : un seul livre par paiement.'] },
                            {
                                who: 'site',
                                label: 'Nouveau : on continue',
                                children: [
                                    {
                                        who: 'site',
                                        label: 'Trouve ou crée le compte',
                                        effects: [
                                            'Un client existe déjà avec ce téléphone : son compte est repris (nouvelle commande).',
                                            'Sinon : compte créé avec l’e-mail saisi.',
                                            'E-mail déjà pris par un autre narrateur : compte distinct « e-mail+numéro », dans la même boîte.',
                                        ],
                                    },
                                    {
                                        who: 'base',
                                        label: 'Écrit le profil',
                                        effects: ['Prénom, nom, téléphone (+33…), e-mail. Par défaut : vouvoiement, style « Naturel ».'],
                                        code: 'table profiles',
                                    },
                                    {
                                        who: 'base',
                                        label: 'Crée le livre',
                                        effects: [
                                            '« Biographie de [prénom] », en cours, phase 1 (Vue d’ensemble), 0 %.',
                                            'Avec : cadeau oui/non, e-mail de l’acheteur, durée d’appel, l’offreur, la référence du paiement.',
                                        ],
                                        code: 'table projects',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        who: 'client',
        label: 'Les premiers pas',
        detail: 'Rien n’est envoyé automatiquement par Loomina après la commande (pas d’e-mail ni de SMS de bienvenue). La commande apparaît dans l’admin, onglet Clients.',
        branch: true,
        children: [
            {
                who: 'client',
                label: 'Ouvre son espace auteur',
                children: [
                    { who: 'client', label: 'Tape son numéro' },
                    {
                        who: 'twilio',
                        label: 'Reçoit un code par SMS',
                        effects: ['Numéro inconnu : « Avez-vous déjà passé commande ? ».', 'Le bon code ouvre une session de 7 jours.'],
                        code: 'app/api/auth/verify/route.ts',
                    },
                ],
            },
            {
                who: 'offreur',
                label: 'Ouvre l’espace famille',
                children: [
                    {
                        who: 'offreur',
                        label: 'Avec son propre numéro',
                        effects: [
                            'Il voit l’avancement et les titres des récits ; le texte seulement si le narrateur l’a permis.',
                            'Il peut souffler un souvenir : Loomina l’abordera au prochain appel.',
                        ],
                        code: 'app/api/famille/*',
                    },
                ],
            },
            {
                who: 'client',
                label: 'Fait son premier appel',
                children: [{ who: 'voix', label: 'Voir l’arbre « Le livre s’écrit »' }],
            },
        ],
    },
];

// ------------------------------------------------------------------
// ARBRE 2 — L'ÉCRITURE DU LIVRE
// ------------------------------------------------------------------

export const AUTHOR_TREE: TreeNode[] = [
    {
        who: 'client',
        label: 'Prépare ses appels (facultatif)',
        detail: 'Tout se fait dans l’espace auteur. On peut écrire un livre entier sans jamais l’ouvrir.',
        branch: true,
        children: [
            {
                who: 'client',
                label: 'Règle ses préférences',
                effects: [
                    'Tu ou vous : Loomina ne posera plus la question.',
                    'Sujets à éviter : jamais abordés, jamais écrits.',
                    'Style, durée des appels, SMS « récit prêt », partage avec l’offreur.',
                ],
                code: 'app/api/user/preferences',
            },
            {
                who: 'client',
                label: 'Choisit des rendez-vous',
                effects: ['Des jours et une heure : Loomina l’appellera à l’heure de Paris dite, jamais entre 21 h et 9 h.'],
                code: 'voice/src/scheduler.ts',
            },
            {
                who: 'client',
                label: 'Suggère un sujet',
                effects: ['Loomina l’abordera au prochain appel, deux au plus par appel, sans dire qui l’a écrit.'],
                code: 'app/api/user/questions',
            },
            {
                who: 'client',
                label: 'Envoie une photo',
                children: [
                    {
                        who: 'ia',
                        label: 'L’IA la décrit',
                        effects: ['Elle prépare une question ouverte sur le souvenir derrière la photo, ajoutée aux sujets du prochain appel.'],
                        code: 'lib/loomina/photos.ts',
                    },
                ],
            },
            {
                who: 'offreur',
                label: 'Souffle un souvenir',
                effects: ['Même file que les sujets suggérés.'],
                code: 'app/api/famille/questions',
            },
        ],
    },
    {
        who: 'twilio',
        label: 'Un appel commence',
        branch: true,
        children: [
            {
                who: 'client',
                label: `Il appelle le ${SITE.phoneDisplay}`,
                detail: 'Depuis le numéro donné à la commande.',
            },
            {
                who: 'voix',
                label: 'Loomina l’appelle (rendez-vous)',
                branch: true,
                code: 'voice/src/scheduler.ts',
                children: [
                    { who: 'voix', label: 'Pas de réponse', effects: ['Rien. Prochain créneau.'] },
                    { who: 'voix', label: 'Répondeur', effects: ['Un message court, puis Loomina raccroche.'] },
                    { who: 'client', label: 'Il décroche' },
                ],
            },
        ],
    },
    {
        who: 'voix',
        label: 'Loomina reconnaît l’appelant',
        detail: 'Par son numéro de téléphone.',
        code: 'voice/src/plan.ts',
        branch: true,
        children: [
            {
                who: 'voix',
                label: 'Numéro inconnu',
                children: [{ who: 'voix', label: 'Démonstration', effects: ['5 minutes, rien n’est gardé.'] }],
            },
            {
                who: 'voix',
                label: 'Base injoignable',
                children: [{ who: 'voix', label: '« Rappelez dans quelques minutes »', effects: ['Puis Loomina raccroche.'] }],
            },
            {
                who: 'voix',
                label: 'Client reconnu',
                children: [
                    {
                        who: 'voix',
                        label: 'Prépare l’entretien',
                        effects: [
                            'Le prompt de la phase en cours.',
                            'La mémoire du livre et « où reprendre » (préparés après l’appel précédent).',
                            'Les sujets suggérés, les préférences, la prononciation du prénom.',
                        ],
                    },
                    {
                        who: 'voix',
                        label: 'Premier appel ?',
                        branch: true,
                        children: [
                            {
                                who: 'voix',
                                label: 'Oui : « Ravi de faire votre connaissance »',
                                children: [
                                    {
                                        who: 'voix',
                                        label: 'Fait connaissance',
                                        effects: ['Tu ou vous ? Des sujets à éviter ? (sauf si déjà réglés)', '« Racontez-moi où vous avez grandi. »'],
                                    },
                                ],
                            },
                            {
                                who: 'voix',
                                label: 'Non : « Heureux de vous retrouver »',
                                children: [{ who: 'voix', label: 'Rappelle où on en était', effects: ['Puis pose la question préparée.'] }],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        who: 'client',
        label: 'Il raconte',
        code: 'voice/src/session.ts',
        children: [
            { who: 'twilio', label: 'Sa voix est transcrite', effects: ['Deepgram, phrase par phrase, vers le serveur vocal.'] },
            {
                who: 'voix',
                label: 'Loomina prépare sa réponse',
                effects: [
                    'Elle attend 0,8 s après la phrase (rien après une question) : s’il reprend, la réponse est jetée.',
                    'Une seule question par réplique : une deuxième est coupée.',
                ],
            },
            { who: 'twilio', label: 'Elle la dit', effects: ['Voix ElevenLabs. Le narrateur peut lui couper la parole.'] },
            {
                who: 'voix',
                label: 'Que se passe-t-il ?',
                branch: true,
                children: [
                    { who: 'client', label: 'Il continue', effects: ['On recommence : il parle, elle relance sur un détail.'] },
                    {
                        who: 'client',
                        label: 'Il se tait',
                        children: [
                            { who: 'voix', label: '60 s : elle relance' },
                            { who: 'voix', label: '60 s de plus : « Je vous laisse »', effects: ['Puis elle raccroche.'] },
                        ],
                    },
                    {
                        who: 'voix',
                        label: 'La phase est finie',
                        children: [
                            {
                                who: 'voix',
                                label: 'Elle fait le point',
                                effects: ['« On a bien fait le tour. Vous voulez ajouter quelque chose, ou on passe à la suite ? » La personne décide.'],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        who: 'voix',
        label: 'L’appel se termine',
        branch: true,
        children: [
            {
                who: 'voix',
                label: 'Loomina propose d’arrêter',
                effects: [
                    'Seulement une fois la durée souhaitée atteinte et le souvenir épuisé, ou si la personne est fatiguée.',
                    'Elle reprend un souvenir de l’appel, annonce la suite, dit au revoir.',
                ],
            },
            { who: 'client', label: 'Il raccroche lui-même', effects: ['Tout ce qui a été dit est gardé.'] },
            { who: 'voix', label: 'Durée maximale atteinte', effects: ['Durée souhaitée + 20 min (45 min au moins).'] },
        ],
    },
    {
        who: 'voix',
        label: 'Après le raccroché',
        detail: 'Tout se fait seul, en une à trois minutes.',
        effects: [
            `Si une étape échoue : reprise toutes les 5 min (serveur vocal) et chaque nuit à 3 h (site), ${MAX_ATTEMPTS} essais au plus.`,
            'La reprise repart d’où elle s’était arrêtée : jamais deux récits pour un appel. Un échec définitif s’affiche dans l’admin.',
        ],
        children: [
            {
                who: 'voix',
                label: 'Envoie le rapport d’appel au site',
                effects: ['Transcript, durée, mesures. Gardé sur disque et renvoyé chaque minute si le site ne répond pas.'],
                code: 'voice/src/report.ts',
            },
            {
                who: 'site',
                label: 'L’archive',
                effects: ['Table call_events. Un rapport reçu deux fois n’est traité qu’une fois.'],
                code: 'app/api/vapi/webhook · lib/loomina/events.ts',
            },
            {
                who: 'site',
                label: 'Appel assez long ?',
                branch: true,
                children: [
                    {
                        who: 'site',
                        label: 'Trop court',
                        effects: [`Moins de ${MIN_DURATION_SECONDS} s ou de ${MIN_TRANSCRIPT_CHARS} caractères : noté « trop court », rien d’autre (aucun coût d’IA).`],
                    },
                    {
                        who: 'site',
                        label: 'Assez long',
                        children: [
                            {
                                who: 'ia',
                                label: 'Le Directeur analyse',
                                effects: [
                                    'Résume l’appel, réécrit la mémoire du livre.',
                                    'Coche les sujets racontés, décide de la phase (avec l’accord de la personne).',
                                    'Prépare la question du prochain appel.',
                                    'Relève tu/vous, style, sujets à éviter, proches.',
                                ],
                                code: 'lib/loomina/director.ts',
                            },
                            {
                                who: 'base',
                                label: 'Enregistre l’analyse',
                                effects: ['Avant l’écriture : si l’écriture échoue, l’analyse est gardée.'],
                                code: 'lib/loomina/pipeline.ts',
                            },
                            {
                                who: 'ia',
                                label: 'Quelque chose à raconter ?',
                                branch: true,
                                children: [
                                    { who: 'site', label: 'Rien', effects: ['Pas de récit. La mémoire est à jour pour le prochain appel.'] },
                                    {
                                        who: 'ia',
                                        label: 'Oui',
                                        children: [
                                            {
                                                who: 'ia',
                                                label: 'L’Écrivain écrit le récit',
                                                effects: [
                                                    'À la première personne, à partir du seul transcript.',
                                                    `Il relit les ${PREVIOUS_CHAPTERS} derniers récits pour ne rien redire. Moins de ${MIN_CHAPTER_WORDS} mots : rien n’est gardé.`,
                                                ],
                                                code: 'lib/loomina/writer.ts',
                                            },
                                            { who: 'base', label: 'Range le récit', effects: ['Numéroté, dans sa période de vie.'], code: 'table chapters' },
                                            { who: 'sms', label: '« Votre récit est prêt »', effects: ['Sauf si coupé dans les réglages.'], code: 'lib/loomina/sms.ts' },
                                            {
                                                who: 'ia',
                                                label: 'Le livre se recompose',
                                                effects: ['Dès deux récits : nouveau plan, puis les chapitres un par un.'],
                                                code: 'lib/loomina/book-edition.ts',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        who: 'client',
        label: 'Entre deux appels',
        branch: true,
        children: [
            { who: 'client', label: 'Lit son récit', effects: ['Dans l’espace auteur, avec la progression de la phase.'] },
            {
                who: 'client',
                label: 'Corrige un récit',
                children: [
                    { who: 'ia', label: 'L’IA propose la correction', effects: ['Il relit et enregistre.'] },
                    {
                        who: 'base',
                        label: 'Nouvelle version gardée',
                        effects: ['La correction est mémorisée pour tout le livre, et reportée mot pour mot dans le livre composé.'],
                    },
                ],
                code: 'app/api/user/chapters/[number]/*',
            },
            { who: 'client', label: 'Lit son livre composé' },
            { who: 'offreur', label: 'Suit l’avancement', effects: ['Dans l’espace famille.'] },
        ],
    },
    {
        who: 'voix',
        label: 'Les quatre phases',
        detail: 'On change de phase selon ce qui a été raconté, jamais selon un nombre d’appels, et toujours avec l’accord de la personne.',
        children: [
            { who: 'voix', label: '1 · Vue d’ensemble', effects: ['Nom, naissance, lieux de vie, proches, grandes lignes.'] },
            { who: 'voix', label: '2 · Construction', effects: ['L’enfance, les racines, la maison, l’école, la jeunesse.'] },
            { who: 'voix', label: '3 · Accomplissements', effects: ['Le travail, la vie affective, les passions, les épreuves.'] },
            { who: 'voix', label: '4 · Messages', effects: ['Ce qu’on veut transmettre, les messages aux proches, la fin du livre.'] },
            {
                who: 'loomina',
                label: 'Le livre est terminé',
                effects: ['Pas encore automatisé : relecture humaine, mise en page, impression, envoi du livre relié et de la version numérique.'],
            },
        ],
    },
];
