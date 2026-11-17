/**
 * La carte de Loomina : UN seul arbre, tout le projet sur un écran.
 *
 * Demandé par Solal (17/11/2026) : un rendu complet et lisible pour
 * comprendre et expliquer le projet (qui interagit avec quoi) et repérer
 * ce qui manque. Après audit, un seul arbre vaut mieux que deux : la
 * commande, les appels, l'écriture et les espaces se répondent (même base,
 * mêmes SMS, mêmes sujets suggérés) ; les séparer cachait ces liens.
 *
 * Chaque colonne est un domaine. Dans une colonne, les cases se suivent de
 * haut en bas ; une case de la sous-colonne de droite est un cas particulier
 * ou une suite de la case de gauche.
 *
 *   kind    'q'    une question, un aiguillage
 *           'end'  un résultat (quelque chose est enregistré, envoyé)
 *   status  'todo'    pas dans le code aujourd'hui : à faire
 *           'partial' existe, mais incomplet ou à surveiller
 *
 * À tenir à jour quand le produit change.
 */

import { OFFER } from '@/config/offer';
import { SITE } from '@/config/site';
import { CALL_MINUTES_OPTIONS } from '@/lib/loomina/call-length';
import { MIN_TRANSCRIPT_CHARS, MIN_DURATION_SECONDS, MIN_CHAPTER_WORDS } from '@/lib/loomina/pipeline';
import { MAX_ATTEMPTS } from '@/lib/loomina/events';

export interface MapNode {
    id: string;
    label: string;
    /** Sous-colonne : 0 (le fil principal) ou 1, 2 (cas particuliers). */
    col?: number;
    /** D'où vient le trait. Par défaut : la case précédente du fil principal. `null` : aucun trait. */
    from?: string | string[] | null;
    kind?: 'q' | 'end';
    status?: 'todo' | 'partial';
    /** Le détail, affiché au clic. */
    d?: string;
    /** Où c'est dans le code. */
    code?: string;
}

export interface MapGroup {
    key: string;
    label: string;
    /** Phrase d'explication de la colonne (vue Liste et détail). */
    about: string;
    /** Des règles sans ordre : pas de traits entre les cases. */
    flat?: boolean;
    nodes: MapNode[];
}

export interface MapRoot {
    id: string;
    label: string;
    kind?: 'q';
    /** Rangée du haut (0) ou du dessous (1). */
    row: 0 | 1;
    from?: string;
    /** Colonnes au-dessus desquelles la case est centrée, et vers lesquelles elle pointe. */
    over: string[];
    d?: string;
}

const minutes = CALL_MINUTES_OPTIONS.join(', ');

export const MAP_ROOTS: MapRoot[] = [
    { id: 'r-visiteur', label: 'Une personne découvre Loomina', row: 0, over: ['decouvrir', 'commander', 'auteur', 'famille'], d: 'Par le site, le bouche-à-oreille ou un cadeau reçu.' },
    { id: 'r-site', label: 'Le site loomina.eu', row: 1, from: 'r-visiteur', over: ['decouvrir', 'commander', 'auteur', 'famille'], d: 'Pages publiques, commande, espace auteur et espace famille. Hébergé sur Vercel.' },
    { id: 'r-tel', label: `Un appel au ${SITE.phoneDisplay}`, row: 0, over: ['appel', 'apres', 'livre'], d: 'Le numéro Twilio de Loomina. Entrant (la personne appelle) ou sortant (rendez-vous).' },
    { id: 'r-num', label: 'Quel numéro appelle ?', kind: 'q', row: 1, from: 'r-tel', over: ['appel', 'apres', 'livre'], d: 'Le serveur vocal (Render) cherche le numéro dans la base. Connu avec un livre en cours : entretien. Sinon : démonstration.' },
];

export const MAP_GROUPS: MapGroup[] = [
    {
        key: 'regles',
        label: 'Règles de conversation',
        about: 'Ce que Loomina respecte à chaque réplique, à tous les appels.',
        flat: true,
        nodes: [
            { id: 'g-finir', label: 'Laisser finir la personne', d: 'Loomina attend 0,8 s après la fin d’une phrase (rien après une question). Si la personne reprend, la réponse préparée est jetée.', code: 'voice/src/session.ts' },
            { id: 'g-une', label: 'Une seule question à la fois', d: 'Demandé dans le prompt, et garanti par le code : une deuxième question est coupée avant d’être dite.' },
            { id: 'g-court', label: 'Deux phrases, 30 mots au plus', d: 'Jamais de liste, jamais de monologue.' },
            { id: 'g-detail', label: 'Relancer sur un détail concret', d: 'Avec les mots de la personne : un lieu, quelqu’un, ce qui a été dit.' },
            { id: 'g-tu', label: 'Tu ou vous respecté', d: 'Réglé dans l’espace auteur ou demandé au premier appel, puis jamais redemandé.' },
            { id: 'g-sensibles', label: 'Sujets à éviter', d: 'Jamais abordés par Loomina, jamais écrits par l’Écrivain. Un deuil : une phrase douce, pas de question.' },
            { id: 'g-presume', label: 'Ne rien présumer d’une vie', d: 'Ni mariage, ni enfants, ni métier : d’abord une question ouverte, puis les mots de la personne.' },
            { id: 'g-silence', label: 'Silence', d: '60 s : Loomina relance. 60 s de plus : « Je vous laisse », et elle raccroche.' },
            { id: 'g-duree', label: 'Durée souhaitée', d: `${minutes} min, choisie à la commande ou dans l’espace auteur. Avant ce temps, Loomina ne propose jamais d’arrêter.` },
            { id: 'g-max', label: 'Durée maximale', d: 'Durée souhaitée + 20 min, et au moins 45 min : l’appel est coupé.' },
            { id: 'g-voix', label: 'Prononciation', d: '« Loumina » à l’oral, prénom écrit comme il doit se dire, noms propres épelés une fois.' },
            { id: 'g-ia', label: 'Humain ou machine ?', d: 'Si on le lui demande, elle dit en une phrase qu’elle est une voix d’intelligence artificielle.' },
            { id: 'g-prix', label: 'Ni prix ni remboursement', d: 'Elle ne parle que des souvenirs. Pour le reste, elle renvoie vers le site.' },
        ],
    },
    {
        key: 'decouvrir',
        label: 'Découvrir',
        about: 'Avant d’acheter : le site, la démonstration gratuite, le contact.',
        nodes: [
            { id: 'd-pages', label: 'Pages du site', d: 'Accueil, Comment ça marche, Le livre et le prix, Questions, Notre histoire, pages légales.' },
            { id: 'd-demo', label: 'Essayer la démo', d: `Le bouton appelle le ${SITE.phoneDisplay}.` },
            { id: 'd-inconnu', label: 'Numéro inconnu', kind: 'q', d: 'Le serveur vocal ne trouve pas le numéro parmi les clients.' },
            { id: 'd-5min', label: 'Démonstration de 5 min', d: 'Un souvenir, quatre questions, puis Loomina explique comment commander.', code: 'lib/loomina/assistant.ts (DEMO_SYSTEM)' },
            { id: 'd-rien', label: 'Rien n’est enregistré', kind: 'end', d: 'Pas de transcript, pas de compte, rien en base.' },
            { id: 'd-contact', label: 'Formulaire de contact', col: 1, from: 'd-pages', d: 'Nom, e-mail, sujet, message.', code: 'app/api/contact' },
            { id: 'd-msg', label: 'Message enregistré', col: 1, from: 'd-contact', kind: 'end', d: 'Table contact_messages. Visible dans l’admin, Vue d’ensemble.' },
            { id: 'd-sms', label: 'SMS à l’équipe', col: 1, from: 'd-msg', status: 'partial', d: 'Seulement si CONTACT_NOTIFY_PHONE est posée sur Vercel. Elle ne l’est pas aujourd’hui : aucun SMS ne part.' },
            { id: 'd-ga', label: 'Mesure d’audience', col: 1, from: null, d: 'Google Analytics et Search Console.' },
            { id: 'd-cookies', label: 'Bandeau cookies', col: 1, from: 'd-ga', status: 'todo', d: 'Pas encore en ligne (travail en cours dans une autre demande de fusion).' },
        ],
    },
    {
        key: 'commander',
        label: 'Commander',
        about: 'Du bouton « Commander » au compte créé.',
        nodes: [
            { id: 'c-qui', label: 'Pour qui ?', kind: 'q', d: '« C’est pour moi » ou « C’est pour offrir ».', code: 'app/order/page.tsx' },
            { id: 'c-coord', label: 'Coordonnées du narrateur', d: 'Prénom, nom, téléphone, e-mail. Le téléphone est celui qui le fera reconnaître quand il appellera.' },
            { id: 'c-duree', label: 'Durée des appels', d: `${minutes} min. Modifiable plus tard.` },
            { id: 'c-verif', label: 'Formulaire vérifié', d: 'Champs remplis, numéro plausible, e-mail valide. Sinon, un message sous le champ.' },
            { id: 'c-payer', label: 'Payer', d: `Le site crée la page de paiement Stripe : ${OFFER.price} €, carte, codes promo acceptés. Rien n’est encore écrit chez Loomina.`, code: 'app/api/checkout' },
            { id: 'c-stripe', label: 'Page Stripe', kind: 'q' },
            { id: 'c-ok', label: 'Paiement réussi', d: 'Stripe renvoie le client sur son espace auteur, et prévient le site en parallèle.' },
            { id: 'c-signe', label: 'Message de Stripe vérifié', d: 'Signature fausse : refusé, rien n’est créé.', code: 'app/api/webhook/stripe' },
            { id: 'c-deja', label: 'Déjà traité ?', kind: 'q', d: 'Stripe renvoie parfois deux fois le même message : un seul livre par paiement.' },
            { id: 'c-compte', label: 'Compte trouvé ou créé', d: 'Par le téléphone d’abord (client qui recommande), sinon par l’e-mail. Deux cadeaux par le même acheteur : deux comptes distincts.' },
            { id: 'c-profil', label: 'Profil écrit', kind: 'end', d: 'Prénom, nom, téléphone, e-mail. Par défaut : vouvoiement, style « Naturel ». Table profiles.' },
            { id: 'c-livre', label: 'Livre créé, phase 1', kind: 'end', d: '« Biographie de [prénom] », en cours, 0 %. Avec : cadeau ou non, e-mail de l’acheteur, durée d’appel, l’offreur. Table projects.' },
            { id: 'c-offrir', label: 'Pour offrir : « Et vous ? »', col: 1, from: 'c-qui', d: 'Le prénom et le portable de la personne qui offre, différent de celui du narrateur. Il ouvrira l’espace famille.' },
            { id: 'c-abandon', label: 'Abandon', col: 1, from: 'c-stripe', d: 'Retour sur la page de commande. Aucun compte, aucun livre.' },
            { id: 'c-relance', label: 'Relance des paniers abandonnés', col: 1, from: 'c-abandon', status: 'todo', d: 'Rien n’est gardé d’une commande non payée : impossible de relancer.' },
            { id: 'c-ignore', label: 'Oui : ignoré', col: 1, from: 'c-deja' },
            { id: 'c-echec', label: 'Erreur : Stripe réessaie', col: 1, from: 'c-compte', d: 'Le site répond « échec » à Stripe, qui renvoie le message plus tard. Un client ne repart jamais sans compte en silence.' },
            { id: 'c-bienvenue', label: 'Message de bienvenue', col: 1, from: 'c-livre', status: 'todo', d: 'Aucun e-mail ni SMS envoyé par Loomina après la commande (seul le reçu Stripe, s’il est activé). Le client ne reçoit ni le numéro à appeler ni le mode d’emploi.' },
            { id: 'c-alerte', label: 'Alerte « nouvelle commande »', col: 1, from: 'c-bienvenue', status: 'todo', d: 'Personne n’est prévenu chez Loomina. La commande apparaît seulement dans l’admin, onglet Clients.' },
            { id: 'c-adresse', label: 'Adresse de livraison', col: 1, from: 'c-alerte', status: 'todo', d: 'Jamais demandée, ni à la commande ni dans l’espace auteur. Il la faudra pour envoyer le livre relié.' },
            { id: 'c-rembours', label: 'Remboursement sous 7 jours', col: 1, from: 'c-adresse', status: 'partial', d: 'Promis sur le site. Se fait à la main dans Stripe ; le livre et le compte ne sont pas fermés automatiquement.' },
        ],
    },
    {
        key: 'auteur',
        label: 'Espace auteur',
        about: 'Ce que le narrateur fait sur le site, entre deux appels.',
        nodes: [
            { id: 'a-num', label: 'Tape son numéro', code: 'app/api/auth/verify' },
            { id: 'a-code', label: 'Code reçu par SMS', d: 'Envoyé par Twilio Verify.' },
            { id: 'a-session', label: 'Session de 7 jours', kind: 'end' },
            { id: 'a-avance', label: 'Voit l’avancement', d: 'La phase en cours et la part des sujets déjà racontés.' },
            { id: 'a-lire', label: 'Lit ses récits', d: 'Un récit par appel.' },
            { id: 'a-corrige', label: 'Corrige un récit', d: 'Dans le texte, ou en décrivant la correction.', code: 'app/api/user/chapters' },
            { id: 'a-memo', label: 'Correction mémorisée', kind: 'end', d: 'Nouvelle version du récit. Le Directeur et l’Écrivain la respectent ensuite ; elle est reportée mot pour mot dans le livre composé.' },
            { id: 'a-livre', label: 'Lit le livre composé', d: 'Le livre recomposé à partir de tous les récits.' },
            { id: 'a-regle', label: 'Règle ses préférences', d: 'Tu ou vous, style, sujets à éviter, durée des appels, SMS « récit prêt », partage avec l’offreur.', code: 'app/api/user/preferences' },
            { id: 'a-rdv', label: 'Choisit des rendez-vous', d: 'Des jours et une heure : Loomina l’appellera. Jamais entre 21 h et 9 h.' },
            { id: 'a-sujet', label: 'Suggère un sujet', kind: 'end', d: 'Rejoint les sujets suggérés : abordé au prochain appel, deux au plus par appel.', code: 'app/api/user/questions' },
            { id: 'a-photo', label: 'Envoie une photo', code: 'app/api/user/photos' },
            { id: 'a-inconnu', label: 'Numéro inconnu', col: 1, from: 'a-num', d: '« Avez-vous déjà passé commande ? »' },
            { id: 'a-ouvert', label: 'Accès de test ouvert', col: 1, from: 'a-code', status: 'partial', d: 'LOOMINA_OPEN_AUTHOR_PROFILE_ID est posée sur Vercel : l’espace auteur s’ouvre sans code sur un profil de test. À retirer avant le premier vrai client.' },
            { id: 'a-propose', label: 'L’IA propose le texte corrigé', col: 1, from: 'a-corrige', d: 'L’auteur relit et enregistre lui-même.' },
            { id: 'a-pdf', label: 'Télécharger le livre', col: 1, from: 'a-livre', status: 'todo', d: 'Pas de téléchargement (PDF ou autre) depuis l’espace auteur.' },
            { id: 'a-pause', label: 'Mettre le livre en pause', col: 1, from: 'a-regle', status: 'todo', d: 'Le statut « en pause » existe en base, mais rien ne permet de le choisir.' },
            { id: 'a-decrit', label: 'L’IA décrit la photo', col: 1, from: 'a-photo', kind: 'end', d: 'Et prépare une question ouverte, ajoutée aux sujets du prochain appel.', code: 'lib/loomina/photos.ts' },
        ],
    },
    {
        key: 'famille',
        label: 'Espace famille',
        about: 'Ce que voit la personne qui a offert le livre.',
        nodes: [
            { id: 'f-num', label: 'Tape son propre numéro', d: 'Le portable donné à la commande, dans « Et vous ? ».' },
            { id: 'f-code', label: 'Code reçu par SMS' },
            { id: 'f-avance', label: 'Voit l’avancement', d: 'La phase et les titres des récits.', code: 'app/api/famille/overview' },
            { id: 'f-texte', label: 'Le narrateur partage ?', kind: 'q', d: 'Réglage du narrateur dans son espace : c’est sa vie, c’est lui qui choisit.' },
            { id: 'f-lit', label: 'Oui : lit les récits' },
            { id: 'f-souffle', label: 'Souffle un souvenir', kind: 'end', d: 'Même file que les sujets suggérés : Loomina l’aborde au prochain appel, sans dire qui l’a écrit.', code: 'app/api/famille/questions' },
            { id: 'f-non', label: 'Non : titres seulement', col: 1, from: 'f-texte' },
            { id: 'f-nouvelles', label: 'Nouvelles par SMS ou e-mail', col: 1, from: 'f-souffle', status: 'todo', d: 'L’offreur n’est jamais prévenu (premier appel fait, nouveau récit, livre terminé). Il doit penser à revenir voir.' },
        ],
    },
    {
        key: 'appel',
        label: 'L’appel',
        about: 'De la sonnerie au raccroché. Tout se passe sur le serveur vocal (Render), avec Twilio et OpenAI.',
        nodes: [
            { id: 'p-entrant', label: 'La personne appelle', d: 'Depuis le numéro donné à la commande.' },
            { id: 'p-reconnu', label: 'Client reconnu ?', kind: 'q', from: ['p-entrant', 'p-rdv'], code: 'voice/src/plan.ts' },
            { id: 'p-prompt', label: 'Prompt assemblé', d: 'L’objectif de la phase, la mémoire du livre, « où reprendre », les sujets suggérés, les préférences. Texte complet dans Structure et IA.' },
            { id: 'p-bonjour', label: 'Bonjour', d: 'Ne peut pas être coupé. Premier appel : « Ravi de faire votre connaissance ». Ensuite : « Heureux de vous retrouver ».' },
            { id: 'p-premier', label: 'Premier appel ?', kind: 'q' },
            { id: 'p-reprend', label: 'Rappelle où on en était', d: 'Puis pose la question préparée par le Directeur après l’appel précédent.' },
            { id: 'p-raconte', label: 'La personne raconte', from: ['p-reprend', 'p-connaissance'] },
            { id: 'p-stt', label: 'Sa voix devient du texte', d: 'Transcription Deepgram, par Twilio.' },
            { id: 'p-gpt', label: 'Loomina prépare sa réplique', d: 'GPT, en flux, sur le serveur vocal. Elle reçoit à chaque réplique le temps écoulé.', code: 'voice/src/session.ts' },
            { id: 'p-tts', label: 'Elle la dit', d: 'Voix ElevenLabs, par Twilio. La personne peut lui couper la parole.' },
            { id: 'p-suggere', label: 'Aborde un sujet suggéré', d: 'Quand une histoire vient de finir. Deux au plus par appel.' },
            { id: 'p-point', label: 'Phase finie : fait le point', kind: 'q', d: '« On a bien fait le tour. Vous voulez ajouter quelque chose, ou on passe à la suite ? » La personne décide.' },
            { id: 'p-fin', label: 'Fin de l’appel', kind: 'end', d: 'Loomina propose d’arrêter (durée atteinte et souvenir épuisé, ou fatigue), ou la personne raccroche, ou la durée maximale est atteinte.' },
            { id: 'p-rdv', label: 'Rendez-vous : Loomina appelle', col: 1, from: null, d: 'Chaque minute, le serveur vocal regarde qui a rendez-vous. Un seul essai par créneau.', code: 'voice/src/scheduler.ts' },
            { id: 'p-repondeur', label: 'Répondeur ou pas de réponse', col: 2, from: 'p-rdv', d: 'Répondeur : un message court. Pas de réponse : rien. Prochain créneau.' },
            { id: 'p-rappel', label: 'Rappel avant le rendez-vous', col: 2, from: 'p-repondeur', status: 'todo', d: 'Aucun SMS avant un appel prévu, ni après un rendez-vous manqué.' },
            { id: 'p-demo', label: 'Non : démonstration', col: 1, from: 'p-reconnu', d: 'Numéro inconnu, ou client sans livre en cours.' },
            { id: 'p-panne', label: 'Base injoignable', col: 1, from: 'p-reconnu', status: 'partial', d: '« Un problème technique m’empêche de vous répondre, rappelez dans quelques minutes », puis elle raccroche. L’entretien de secours n’existe que sur l’ancien chemin Vapi.' },
            { id: 'p-connaissance', label: 'Oui : fait connaissance', col: 1, from: 'p-premier', d: 'Tu ou vous ? Des sujets à éviter ? (sauf si déjà réglés), puis « Racontez-moi où vous avez grandi ».' },
            { id: 'p-tait', label: 'Silence : relance, puis raccroche', col: 1, from: 'p-tts' },
            { id: 'p-audio', label: 'Enregistrement audio', col: 1, from: 'p-fin', status: 'todo', d: 'Seul le texte est gardé. La voix de la personne n’est pas conservée (elle pourrait accompagner le livre).' },
        ],
    },
    {
        key: 'apres',
        label: 'Après l’appel',
        about: 'Ce qui se passe tout seul après le raccroché, en une à trois minutes, sur le site (Vercel).',
        nodes: [
            { id: 'x-rapport', label: 'Rapport d’appel envoyé', d: 'Transcript, durée, mesures. Gardé sur disque et renvoyé chaque minute si le site ne répond pas.', code: 'voice/src/report.ts' },
            { id: 'x-archive', label: 'Archivé', kind: 'end', d: 'Table call_events. Un rapport reçu deux fois n’est traité qu’une fois.', code: 'lib/loomina/events.ts' },
            { id: 'x-long', label: 'Assez long ?', kind: 'q', d: `Au moins ${MIN_DURATION_SECONDS} s et ${MIN_TRANSCRIPT_CHARS} caractères.` },
            { id: 'x-directeur', label: 'Le Directeur analyse', d: 'GPT. Il n’écrit pas le livre : il pilote la suite.', code: 'lib/loomina/director.ts' },
            { id: 'x-memoire', label: 'Mémoire du livre réécrite', kind: 'end', d: 'Identité, lieux, frise, proches, thèmes. Relue par la voix au prochain appel.' },
            { id: 'x-phase', label: 'Phase et avancement', kind: 'end', d: 'Selon la quantité d’information reçue, jamais selon un nombre d’appels, et avec l’accord de la personne.' },
            { id: 'x-question', label: 'Question du prochain appel', kind: 'end', d: '« Où reprendre ».' },
            { id: 'x-matiere', label: 'Quelque chose à raconter ?', kind: 'q' },
            { id: 'x-ecrivain', label: 'L’Écrivain écrit le récit', d: `À la première personne, à partir du seul transcript. Moins de ${MIN_CHAPTER_WORDS} mots : rien n’est gardé.`, code: 'lib/loomina/writer.ts' },
            { id: 'x-recit', label: 'Récit rangé', kind: 'end', d: 'Numéroté, dans sa période de vie. Table chapters.' },
            { id: 'x-sms', label: 'SMS « récit prêt »', kind: 'end', d: 'Au narrateur, sauf s’il l’a coupé dans ses réglages.', code: 'lib/loomina/sms.ts' },
            { id: 'x-recompose', label: 'Livre recomposé', kind: 'end', d: 'Dès deux récits : nouveau plan, puis les chapitres un par un.', code: 'lib/loomina/book-edition.ts' },
            { id: 'x-court', label: 'Non : noté « trop court »', col: 1, from: 'x-long', d: 'Rien d’autre ne se passe : aucune IA, aucun coût.' },
            { id: 'x-prefs', label: 'Préférences et proches relevés', col: 1, from: 'x-directeur', kind: 'end', d: 'Tu ou vous, style, sujets à éviter demandés pendant l’appel ; proches cités.' },
            { id: 'x-rien', label: 'Non : pas de récit', col: 1, from: 'x-matiere', d: 'La mémoire est quand même à jour pour le prochain appel.' },
            { id: 'x-echec', label: 'Une étape échoue', col: 1, from: 'x-ecrivain', kind: 'q', d: `Reprise toutes les 5 min (serveur vocal) et chaque nuit à 3 h (site), ${MAX_ATTEMPTS} essais au plus. Elle repart d’où elle s’était arrêtée.` },
            { id: 'x-alerte', label: 'Échec définitif : dans l’admin', col: 1, from: 'x-echec', status: 'partial', d: 'Visible dans l’admin, « À surveiller ». Personne n’est prévenu par SMS ou e-mail, et il n’y a pas de bouton pour relancer.' },
            { id: 'x-cout', label: 'Coût de l’appel', col: 1, from: 'x-recompose', status: 'todo', d: 'Le coût OpenAI et Twilio d’un appel ou d’un client n’est suivi nulle part.' },
        ],
    },
    {
        key: 'livre',
        label: 'Le livre',
        about: 'Des quatre phases au livre relié.',
        nodes: [
            { id: 'l-1', label: '1 · Vue d’ensemble', d: 'Nom, naissance, lieux de vie, proches, grandes lignes.' },
            { id: 'l-2', label: '2 · Construction', d: 'L’enfance, les racines, la maison, l’école, la jeunesse.' },
            { id: 'l-3', label: '3 · Accomplissements', d: 'Le travail, la vie affective, les passions, les épreuves.' },
            { id: 'l-4', label: '4 · Messages', d: 'Ce qu’on veut transmettre, les messages aux proches, la fin du livre.' },
            { id: 'l-complet', label: 'Le livre est complet ?', kind: 'q', d: 'C’est la personne qui le dit, au téléphone.' },
            { id: 'l-termine', label: 'Livre « terminé »', kind: 'end', d: 'Visible dans l’admin. Un appel reste possible pour ajouter un souvenir.' },
            { id: 'l-relecture', label: 'Relecture par l’équipe', status: 'todo', d: 'Promise sur le site (« relu par notre équipe »). Rien dans le code : ni liste des livres à relire, ni outil de relecture.' },
            { id: 'l-maquette', label: 'Mise en page', status: 'todo', d: `Le livre au format ${OFFER.format}, avec la couverture et les photos. Rien dans le code.` },
            { id: 'l-impression', label: 'Impression', status: 'todo', d: 'Pas d’imprimeur branché, pas de fichier d’impression produit.' },
            { id: 'l-envoi', label: 'Envoi du livre relié', status: 'todo', d: 'Il faudra l’adresse de livraison, jamais demandée aujourd’hui.' },
            { id: 'l-numerique', label: 'Version numérique', status: 'todo', d: 'Promise avec le livre. Pas de fichier produit aujourd’hui.' },
            { id: 'l-continue', label: 'Non : on continue', col: 1, from: 'l-complet' },
            { id: 'l-photos', label: 'Photos dans le livre', col: 1, from: 'l-maquette', status: 'todo', d: 'Les photos envoyées servent à faire parler, mais ne sont pas placées dans le livre.' },
        ],
    },
    {
        key: 'coulisses',
        label: 'Coulisses',
        about: 'Les services qui font tourner Loomina, et l’admin.',
        flat: true,
        nodes: [
            { id: 'k-vercel', label: 'Site · Vercel', d: 'Les pages, la commande, les espaces, et tout le traitement après l’appel.' },
            { id: 'k-render', label: 'Serveur vocal · Render', d: 'Les appels en direct, les rendez-vous, le rattrapage. Toujours allumé.' },
            { id: 'k-twilio', label: 'Twilio', d: 'Le numéro, la transcription et la voix pendant l’appel, les SMS.' },
            { id: 'k-openai', label: 'OpenAI', d: 'Tous les modèles : la voix, le Directeur, l’Écrivain, l’Éditeur du livre, les photos.' },
            { id: 'k-supabase', label: 'Supabase', d: 'La base (clients, livres, appels, récits) et les photos.' },
            { id: 'k-stripe', label: 'Stripe', d: 'Le paiement.' },
            { id: 'k-admin', label: 'Admin · lecture seule', d: 'Clients, appels, récits, prompts, cette carte.' },
            { id: 'k-actions', label: 'Actions depuis l’admin', status: 'todo', d: 'Relancer un appel en échec, recomposer un livre, corriger une fiche, rembourser : rien de tout cela ne se fait encore depuis l’admin.' },
            { id: 'k-credits', label: 'Alerte crédits OpenAI', status: 'todo', d: 'Si le compte OpenAI est à sec, les appels et l’écriture s’arrêtent sans prévenir (arrivé le 16/11/2026).' },
            { id: 'k-sauvegarde', label: 'Sauvegarde de la base', status: 'partial', d: 'Celle de Supabase, selon l’offre souscrite. Pas de copie à part des récits et des transcripts.' },
        ],
    },
];

/** Les liens d'une colonne à l'autre : ce qui fait que tout se tient. */
export const MAP_LINKS: Array<{ from: string; to: string; label: string }> = [
    { from: 'c-livre', to: 'p-reconnu', label: 'le numéro est reconnu' },
    { from: 'c-offrir', to: 'f-num', label: 'ouvre l’espace famille' },
    { from: 'a-sujet', to: 'p-suggere', label: 'sujets suggérés' },
    { from: 'f-souffle', to: 'p-suggere', label: 'sujets suggérés' },
    { from: 'a-rdv', to: 'p-rdv', label: 'jours et heure' },
    { from: 'p-fin', to: 'x-rapport', label: 'raccroché' },
    { from: 'x-question', to: 'p-prompt', label: 'au prochain appel' },
    { from: 'x-recit', to: 'a-lire', label: 'à lire' },
    { from: 'x-phase', to: 'l-1', label: 'avancement' },
    { from: 'x-recompose', to: 'a-livre', label: 'à lire' },
];
