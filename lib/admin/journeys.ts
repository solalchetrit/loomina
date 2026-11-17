/**
 * Les deux arbres de parcours de l'admin, décrits à partir du code.
 * Chaque nœud : qui agit, ce qu'il fait, ce que ça produit, et le fichier.
 *
 * À tenir à jour quand le parcours change (commande, appel, traitement).
 */

import type { TreeNode } from '@/components/admin/Tree';
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
        label: 'Arrive sur le site',
        detail: 'Accueil, Offre, Expérience, FAQ, À propos. Deux portes : essayer gratuitement, ou commander.',
        children: [
            {
                who: 'client',
                label: `Essaie gratuitement : appelle le ${SITE.phoneDisplay}`,
                detail: 'Son numéro n’est celui d’aucun client.',
                effects: [
                    `Twilio décroche et passe l’appel au serveur vocal, qui ne reconnaît pas le numéro.`,
                    `Démonstration de ${Math.round(DEMO_MAX_SECONDS / 60)} min au plus : un souvenir, quatre questions, puis Loomina explique comment commander.`,
                    'Rien n’est enregistré : pas de transcript, pas de compte, rien en base.',
                ],
                code: 'voice/src/plan.ts · lib/loomina/assistant.ts (DEMO_SYSTEM)',
                closed: true,
            },
            {
                who: 'client',
                label: '« Commencer mon livre » ou « Offrir le livre »',
                effects: ['Ouvre /order, avec le choix déjà fait (#pour-moi ou #pour-offrir).'],
                code: 'app/order/page.tsx',
                children: [
                    {
                        who: 'client',
                        label: 'Étape 1 · Pour qui ?',
                        detail: '« C’est pour moi » ou « C’est pour offrir ».',
                        effects: ['Le formulaire de l’étape 2 s’adapte : « Votre prénom » ou « Son prénom ».'],
                    },
                    {
                        who: 'client',
                        label: 'Étape 2 · Coordonnées du narrateur',
                        detail: 'Prénom, nom, téléphone, e-mail. Le téléphone est celui depuis lequel le narrateur appellera : c’est lui qui le fera reconnaître.',
                        effects: [
                            'Vérifié dans le navigateur : prénom et nom remplis, numéro français ou international plausible, e-mail avec un @ et un point.',
                            `Durée souhaitée de chaque appel : ${minutes} min (${DEFAULT_CALL_MINUTES} par défaut). Modifiable plus tard dans l’espace auteur.`,
                        ],
                        children: [
                            {
                                who: 'offreur',
                                label: 'Si c’est un cadeau : « Et vous ? »',
                                detail: 'Le prénom et le portable de la personne qui offre. Le numéro doit être différent de celui du narrateur.',
                                effects: ['Ce numéro ouvrira l’espace famille : suivre l’avancement, souffler des souvenirs.'],
                            },
                        ],
                    },
                    {
                        who: 'client',
                        label: 'Étape 3 · « Payer »',
                        effects: [
                            `Le site crée une page de paiement Stripe : ${OFFER.price} €, carte bancaire, codes promo acceptés.`,
                            'Toutes les coordonnées voyagent avec le paiement (métadonnées Stripe) : rien n’est encore écrit chez Loomina.',
                            'Le navigateur part sur la page Stripe. Si Stripe ne répond pas : message d’erreur sur la page, rien n’est créé.',
                        ],
                        code: 'app/api/checkout/route.ts',
                        children: [
                            {
                                who: 'client',
                                label: 'Abandonne sur Stripe',
                                effects: ['Retour sur /order. Aucun compte, aucun livre.'],
                            },
                            {
                                who: 'client',
                                label: 'Paie',
                                effects: ['Stripe renvoie le client sur /dashboard avec un message « commande reçue ».'],
                                children: [
                                    {
                                        who: 'stripe',
                                        label: 'Prévient le site : « paiement réussi »',
                                        detail: 'En parallèle du retour du client, Stripe appelle /api/webhook/stripe. C’est cette étape qui crée tout.',
                                        code: 'app/api/webhook/stripe/route.ts',
                                        children: [
                                            {
                                                who: 'site',
                                                label: 'Vérifie que le message vient bien de Stripe',
                                                effects: ['Signature fausse : refusé, rien n’est créé.'],
                                            },
                                            {
                                                who: 'site',
                                                label: 'Ce paiement a-t-il déjà été traité ?',
                                                effects: ['Stripe renvoie parfois deux fois le même message : le second est ignoré (un seul livre par paiement).'],
                                            },
                                            {
                                                who: 'site',
                                                label: 'Trouve ou crée le compte du narrateur',
                                                effects: [
                                                    'Un client existe déjà avec ce téléphone : c’est lui, son compte est repris (nouvelle commande).',
                                                    'Sinon : compte créé avec l’e-mail saisi.',
                                                    'E-mail déjà pris par un autre narrateur (deux cadeaux par la même personne) : compte distinct « e-mail+numéro », qui arrive dans la même boîte.',
                                                ],
                                            },
                                            {
                                                who: 'base',
                                                label: 'Écrit le profil (profiles)',
                                                effects: [
                                                    'Prénom, nom, téléphone au format international (+33…), e-mail.',
                                                    'Par défaut, seulement s’ils sont vides : vouvoiement, style « Naturel ».',
                                                ],
                                            },
                                            {
                                                who: 'base',
                                                label: 'Crée le livre (projects)',
                                                effects: [
                                                    '« Biographie de [prénom] », en cours, phase 1 (Vue d’ensemble), 0 %.',
                                                    'Gardés avec : cadeau oui/non, e-mail de l’acheteur, durée d’appel, l’offreur s’il y en a un, la référence du paiement.',
                                                ],
                                            },
                                            {
                                                who: 'site',
                                                label: 'En cas d’erreur',
                                                effects: ['Le site répond « échec » à Stripe, qui réessaie plus tard. Un client ne repart jamais sans compte en silence.'],
                                            },
                                        ],
                                    },
                                    {
                                        who: 'loomina',
                                        label: 'Ce qui n’est pas automatique aujourd’hui',
                                        effects: [
                                            'Aucun e-mail ni SMS de bienvenue envoyé par Loomina (seul le reçu Stripe, s’il est activé chez Stripe).',
                                            'Personne n’est prévenu chez Loomina d’une nouvelle commande : elle apparaît dans l’admin, onglet Clients.',
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
        label: 'Après la commande : premiers pas',
        children: [
            {
                who: 'client',
                label: 'Ouvre son espace auteur (/dashboard)',
                detail: 'Il tape son numéro de téléphone.',
                effects: [
                    'Numéro inconnu : « Avez-vous déjà passé commande ? ».',
                    'Numéro connu : Twilio envoie un code par SMS ; le bon code ouvre une session de 7 jours.',
                ],
                code: 'app/api/auth/verify/route.ts',
            },
            {
                who: 'offreur',
                label: 'Ouvre l’espace famille, avec son propre numéro',
                effects: [
                    'Même écran de connexion : son numéro est reconnu comme celui d’un offreur.',
                    'Il voit l’avancement et les titres des récits. Le texte seulement si le narrateur l’a permis dans ses réglages.',
                    'Il peut souffler un souvenir ou une question : Loomina l’abordera au prochain appel.',
                ],
                code: 'app/api/famille/*',
            },
            {
                who: 'client',
                label: 'Premier appel : il appelle, ou Loomina l’appelle à l’heure choisie',
                effects: ['Voir l’arbre 2, « Le livre s’écrit ».'],
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
        label: 'Avant un appel, dans l’espace auteur',
        detail: 'Tout est facultatif : on peut écrire un livre entier sans jamais ouvrir l’espace.',
        closed: true,
        children: [
            {
                who: 'client',
                label: 'Règle ses préférences',
                effects: [
                    'Tu ou vous : Loomina ne posera plus la question au premier appel.',
                    'Sujets à éviter : Loomina ne les aborde jamais, l’Écrivain ne les écrit pas.',
                    'Style d’écriture, durée des appels, SMS « récit prêt » oui/non, partage des récits avec l’offreur.',
                ],
                code: 'app/api/user/preferences/route.ts',
            },
            {
                who: 'client',
                label: 'Choisit des rendez-vous (jours et heure)',
                effects: ['Le serveur vocal regarde chaque minute et appelle à l’heure de Paris dite. Jamais entre 21 h et 9 h. Un seul essai par créneau.'],
                code: 'voice/src/scheduler.ts',
            },
            {
                who: 'client',
                label: 'Suggère un sujet (ou l’offreur en souffle un)',
                effects: ['Rejoint la liste des sujets suggérés : Loomina l’aborde au prochain appel, deux au plus par appel, sans dire qui l’a écrit.'],
                code: 'app/api/user/questions · app/api/famille/questions',
            },
            {
                who: 'client',
                label: 'Envoie une photo',
                effects: [
                    'Une IA de vision la décrit et prépare une question ouverte sur le souvenir derrière la photo.',
                    'Cette question rejoint les sujets suggérés du prochain appel.',
                ],
                code: 'app/api/user/photos · lib/loomina/photos.ts',
            },
        ],
    },
    {
        who: 'client',
        label: 'Un appel commence',
        children: [
            {
                who: 'client',
                label: `Il appelle le ${SITE.phoneDisplay} depuis son numéro`,
                effects: ['Twilio décroche et prévient le serveur vocal.'],
            },
            {
                who: 'voix',
                label: 'Ou c’est l’heure d’un rendez-vous : Loomina appelle',
                effects: [
                    'Personne ne décroche : rien, prochain créneau.',
                    'Répondeur : un message court (« je vous rappellerai au prochain créneau »), puis Loomina raccroche.',
                    'Déjà en ligne : le créneau est sauté.',
                ],
                code: 'voice/src/scheduler.ts · voice/src/server.ts',
            },
            {
                who: 'voix',
                label: 'Reconnaît l’appelant par son numéro',
                code: 'voice/src/plan.ts',
                children: [
                    { who: 'voix', label: 'Numéro inconnu, ou client sans livre en cours', effects: ['Démonstration (voir arbre 1).'] },
                    { who: 'voix', label: 'Base injoignable', effects: ['« Un problème technique m’empêche de vous répondre, rappelez dans quelques minutes », puis raccroche.'] },
                    {
                        who: 'voix',
                        label: 'Client reconnu : prépare l’entretien',
                        detail: 'Le prompt est assemblé à chaque appel (onglet Structure et IA pour le texte complet).',
                        effects: [
                            'Le gabarit commun, avec l’objectif de la phase en cours.',
                            'La mémoire du livre et « où reprendre » (préparés par le Directeur à l’appel précédent).',
                            'Les sujets suggérés, les sujets propres à la personne, le point de fin de phase s’il est dû.',
                            'Les préférences (tu/vous, sujets à éviter), la prononciation du prénom.',
                        ],
                    },
                ],
            },
            {
                who: 'voix',
                label: 'Dit bonjour',
                effects: [
                    'Premier appel : « Bonjour Jeanne, c’est Loumina, votre biographe. Je suis ravi de faire votre connaissance ! »',
                    'Appels suivants : « Je suis heureux de vous retrouver », puis rappel en une phrase de là où on en était.',
                    'Ce bonjour ne peut pas être coupé.',
                ],
            },
        ],
    },
    {
        who: 'client',
        label: 'Pendant l’appel : il raconte',
        children: [
            {
                who: 'voix',
                label: 'Au premier appel seulement',
                effects: [
                    'Tu ou vous ? (sauf si déjà réglé dans l’espace)',
                    'Des sujets à laisser de côté ? (sauf si déjà réglés)',
                    '« Je vais surtout vous écouter », puis : « Racontez-moi où vous avez grandi. »',
                ],
            },
            {
                who: 'twilio',
                label: 'Chaque phrase du narrateur est transcrite (Deepgram) et envoyée au serveur vocal',
            },
            {
                who: 'voix',
                label: 'Loomina prépare sa réponse (GPT, en flux) et la dit (voix ElevenLabs)',
                effects: [
                    'Elle attend 0,8 s après la fin de la phrase (rien si c’est une question) : si le narrateur reprend, sa réponse préparée est jetée.',
                    'Une seule question par réplique : une deuxième question est coupée avant d’être dite.',
                    'Le narrateur peut lui couper la parole.',
                    'À chaque réplique, elle reçoit le temps écoulé : avant la durée souhaitée elle ne propose jamais d’arrêter.',
                ],
                code: 'voice/src/session.ts · lib/loomina/call-length.ts',
            },
            {
                who: 'client',
                label: 'Se tait longtemps',
                effects: ['Au bout de 60 s, Loomina relance une fois. Encore 60 s : « Je vous laisse, rappelez-moi quand vous voulez », et raccroche.'],
            },
            {
                who: 'voix',
                label: 'La phase est finie : Loomina fait le point',
                detail: 'Quand tous les sujets de la phase sont couverts, le Directeur l’a noté à l’appel précédent.',
                effects: [
                    '« On a bien fait le tour de votre enfance. Vous voulez y ajouter quelque chose, ou on passe à la suite ? »',
                    'La personne décide : on reste, ou on enchaîne dans le même appel sur la phase suivante.',
                ],
            },
        ],
    },
    {
        who: 'client',
        label: 'L’appel se termine',
        children: [
            {
                who: 'voix',
                label: 'Loomina propose d’arrêter',
                effects: [
                    'Seulement une fois la durée souhaitée atteinte et le souvenir en cours épuisé, ou si la personne est fatiguée ou le demande.',
                    'Elle reprend un souvenir précis de l’appel, annonce le sujet de la prochaine fois, dit au revoir et raccroche.',
                ],
            },
            {
                who: 'client',
                label: 'Ou il raccroche lui-même, à n’importe quel moment',
                effects: ['Même suite : tout ce qui a été dit est gardé.'],
            },
            {
                who: 'voix',
                label: 'Ou la durée maximale est atteinte',
                effects: ['Durée souhaitée + 20 min (45 min au moins) : l’appel est coupé.'],
            },
        ],
    },
    {
        who: 'voix',
        label: 'Après le raccroché : le récit s’écrit',
        detail: 'Tout se fait sans personne, en une à trois minutes.',
        children: [
            {
                who: 'voix',
                label: 'Fabrique le rapport d’appel et l’envoie au site',
                effects: [
                    'Transcript complet, durée, mesures (latence, interruptions, mots de chaque côté).',
                    'Écrit d’abord sur disque : si le site ne répond pas, renvoyé chaque minute.',
                ],
                code: 'voice/src/report.ts',
            },
            {
                who: 'site',
                label: 'Archive le rapport, puis le traite en arrière-plan',
                effects: ['Rangé dans call_events. Un rapport reçu deux fois n’est traité qu’une fois.'],
                code: 'app/api/vapi/webhook/route.ts · lib/loomina/events.ts',
            },
            {
                who: 'site',
                label: `Garde-fou : moins de ${MIN_DURATION_SECONDS} s ou de ${MIN_TRANSCRIPT_CHARS} caractères ?`,
                effects: ['Oui : l’appel est noté « trop court » et rien d’autre ne se passe (aucune IA, aucun coût).'],
            },
            {
                who: 'ia',
                label: 'Le Directeur analyse l’appel',
                effects: [
                    'Résume l’appel et réécrit la mémoire du livre (identité, lieux, frise, proches, thèmes).',
                    'Coche les sujets de la phase qui ont été racontés, note les sujets propres à la personne.',
                    'Décide de la phase : on change selon la quantité d’information reçue, jamais selon un nombre d’appels, et toujours avec l’accord de la personne.',
                    'Prépare la question du prochain appel (« où reprendre »).',
                    'Relève ce que la personne a demandé : tu/vous, style, sujets à éviter. Repère les proches.',
                    'Juge la matière : rien, mince ou riche. Et la période racontée (un souvenir d’enfance dit en phase 3 va dans l’enfance).',
                ],
                code: 'lib/loomina/director.ts',
            },
            {
                who: 'base',
                label: 'L’analyse est enregistrée avant l’écriture',
                effects: ['interviews, projects (phase, %, mémoire, prochaine question), profiles, family_members. Si l’écriture échoue ensuite, l’analyse n’est pas perdue.'],
                code: 'lib/loomina/pipeline.ts',
            },
            {
                who: 'site',
                label: 'Rien de racontable ?',
                effects: ['Pas de récit pour cet appel. La mémoire est quand même à jour pour le prochain.'],
            },
            {
                who: 'ia',
                label: 'L’Écrivain écrit le récit de l’appel',
                effects: [
                    'À la première personne, à partir du seul transcript, dans le style demandé.',
                    `Il relit les ${PREVIOUS_CHAPTERS} derniers récits pour ne rien redire.`,
                    `Moins de ${MIN_CHAPTER_WORDS} mots : rien n’est gardé.`,
                ],
                code: 'lib/loomina/writer.ts',
            },
            {
                who: 'base',
                label: 'Le récit est rangé dans le livre (chapters)',
                effects: ['Numéroté, rangé dans sa période de vie, version 1.'],
            },
            {
                who: 'sms',
                label: '« Le récit de votre appel est prêt »',
                effects: ['Envoyé au numéro du narrateur, sauf s’il l’a coupé dans ses réglages.'],
                code: 'lib/loomina/sms.ts',
            },
            {
                who: 'ia',
                label: 'Le livre se recompose tout seul',
                effects: [
                    'Dès deux récits : l’Éditeur refait le plan (ordre de la vie, sans redites), puis écrit les chapitres un par un.',
                    'Une composition en cours est remplacée si un nouvel appel arrive.',
                ],
                code: 'lib/loomina/book-edition.ts · lib/loomina/book.ts',
            },
            {
                who: 'voix',
                label: 'Une étape a échoué ?',
                effects: [
                    `Le serveur vocal redemande le traitement toutes les 5 minutes, et le site une fois par nuit à 3 h. ${MAX_ATTEMPTS} essais au plus.`,
                    'Chaque reprise repart d’où elle s’était arrêtée : jamais deux récits pour un appel.',
                    'Un échec définitif apparaît dans l’admin (Vue d’ensemble, « À surveiller »).',
                ],
                code: 'app/api/jobs/process · voice/src/scheduler.ts',
            },
        ],
    },
    {
        who: 'client',
        label: 'Entre deux appels',
        closed: true,
        children: [
            {
                who: 'client',
                label: 'Lit le récit de son appel',
                effects: ['Dans l’espace auteur, avec la progression de la phase.'],
            },
            {
                who: 'client',
                label: 'Corrige un récit',
                effects: [
                    'Directement dans le texte, ou en décrivant la correction : une IA propose le texte corrigé, il relit et enregistre.',
                    'Nouvelle version du récit. La correction est mémorisée : le Directeur et l’Écrivain la respectent pour tout le reste du livre.',
                    'Elle est reportée dans le livre composé, dans les seuls chapitres concernés, mot pour mot.',
                ],
                code: 'app/api/user/chapters/[number]/*',
            },
            {
                who: 'client',
                label: 'Lit son livre composé',
                effects: ['Le livre recomposé à partir de tous ses récits, par parties et chapitres.'],
            },
            {
                who: 'offreur',
                label: 'Suit l’avancement dans l’espace famille',
            },
        ],
    },
    {
        who: 'client',
        label: 'Les quatre phases du livre',
        closed: true,
        children: [
            { who: 'voix', label: '1 · Vue d’ensemble', detail: 'Faire connaissance : nom, naissance, lieux de vie, proches, grandes lignes de la vie.' },
            { who: 'voix', label: '2 · Construction', detail: 'L’enfance, les racines, la maison, l’école, la jeunesse.' },
            { who: 'voix', label: '3 · Accomplissements', detail: 'La vie adulte : travail, vie affective, lieux, passions, épreuves.' },
            {
                who: 'voix',
                label: '4 · Messages',
                detail: 'Ce qu’on veut transmettre, les messages aux proches, la vie d’aujourd’hui, comment finir le livre.',
                effects: ['Quand la personne dit que le livre est complet : le livre passe « terminé ». Un appel reste possible pour ajouter un souvenir.'],
            },
        ],
    },
    {
        who: 'loomina',
        label: 'Le livre est terminé',
        effects: [
            'Pas encore automatisé : relecture humaine, mise en page, impression, envoi du livre relié et de la version numérique.',
            'Dans l’admin, le livre apparaît « Terminé » dans la liste des clients.',
        ],
    },
];
