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
    /** Rangées laissées vides au-dessus (fil principal), pour loger les cases de droite de l'étape précédente. */
    gap?: number;
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
    { id: 'r-site', label: 'Le site loomina.eu', row: 1, from: 'r-visiteur', over: ['decouvrir', 'commander', 'auteur', 'famille'], d: 'Pages publiques, commande, espace auteur et espace famille. Hébergé sur Vercel. Le 18/11/2026 : les titres apparaissent une fois en entier quand on les atteint (plus de titres restés gris), et les questions de la FAQ s’ouvrent sans à-coup.' },
    { id: 'r-tel', label: `Un appel au ${SITE.phoneDisplay}`, row: 0, over: ['appel', 'apres', 'livre'], d: 'Le numéro Twilio de Loomina. Entrant (la personne appelle) ou sortant (rendez-vous).' },
    { id: 'r-admin', label: 'Vous, sur loomina.eu/admin', row: 1, over: ['admin'], d: 'L’espace réservé à l’équipe, protégé par un mot de passe. Aucun lien n’y mène depuis le site.' },
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
            { id: 'g-silence', label: 'Silence', d: '30 s : Loomina dit qu’elle est toujours là. 60 s de plus sans rien : « Je vous laisse », et elle raccroche.' },
            { id: 'g-duree', label: 'Durée souhaitée', d: `${minutes} min, choisie à la commande ou dans l’espace auteur. Avant ce temps, Loomina ne propose jamais d’arrêter.` },
            { id: 'g-max', label: 'Durée maximale', d: 'Tant que la personne raconte, Loomina la laisse continuer, même après la durée souhaitée. Seul plafond : 1 h 30, où l’appel est coupé.' },
            { id: 'g-voix', label: 'Prononciation', d: '« Loumina » à l’oral, prénom écrit comme il doit se dire, noms propres épelés une fois.' },
            { id: 'g-ia', label: 'Humain ou machine ?', d: 'Si on le lui demande, elle dit en une phrase qu’elle est une voix d’intelligence artificielle. Elle ne nomme aucune technologie et ne répète pas un nom qu’on lui cite.' },
            { id: 'g-prix', label: 'Ni prix ni remboursement', d: 'Pendant un entretien, elle ne parle que des souvenirs et renvoie vers le site pour le reste. Pendant la démonstration, elle répond aux questions sur le prix, le remboursement et Loomina.' },
            { id: 'g-piege', label: 'Hors sujet ou piège', d: 'Si on lui demande tout autre chose (une recette, jouer un rôle, oublier ses consignes), elle dit tout de suite qu’elle n’est pas faite pour ça et revient aux souvenirs. En démonstration, si la personne insiste, elle termine l’appel.' },
        ],
    },
    {
        key: 'decouvrir',
        label: 'Découvrir',
        about: 'Avant d’acheter : le site, la démonstration gratuite, le contact.',
        nodes: [
            { id: 'd-pages', label: 'Pages du site', d: 'Accueil, Comment ça marche, Le livre et le prix, Questions, Notre histoire, pages légales. En haut de l’accueil, à droite du titre, la scène « de la voix au livre » en trois temps qui défilent seuls et se cliquent : « Vous racontez » (Jeanne au téléphone), « Loomina écrit » (sa page s’écrit dans le livre ouvert, dans la mise en page du livre imprimé), « Le livre arrive » (le livre se referme puis se présente debout, en photos). Elle remplace la carte « Le livre de Jeanne » depuis le 18/11/2026. Version en cours de validation, pas encore en ligne : le haut de page occupe tout le premier écran sur ordinateur (on ne voit plus la photo de famille en dessous), avec en bas une ligne fine qui porte les trois garanties et l’invitation « Comment ça marche ». « De l’appel à la page du livre » est animée : la conversation se déroule à gauche et la page s’écrit à droite dans le livre ouvert (chapitre « Le car de six heures »). « Un prix, tout compris » montre la photo des deux exemplaires au-dessus du prix. Sur « Comment ça marche » : la page d’exemple est au format du livre imprimé, et les 14 thèmes se parcourent à côté du sommaire imprimé dans le livre ouvert, avec pour chacun la question que Loomina pourrait poser. Sur « Le livre et le prix » : les sections « Ce que couvre le prix, en détail » et « Votre récit vous appartient » sont retirées.', code: 'components/home/VoiceToBook.tsx' },
            { id: 'd-demo', label: 'Essayer la démo', d: `Le bouton appelle le ${SITE.phoneDisplay}.` },
            { id: 'd-inconnu', label: 'Numéro inconnu', kind: 'q', d: 'Le serveur vocal ne trouve pas le numéro parmi les clients.' },
            { id: 'd-5min', label: 'Démonstration de 5 min', d: 'Un souvenir, quatre questions, puis Loomina explique comment commander. Elle répond aussi aux questions sur le prix, le remboursement et le fonctionnement.', code: 'lib/loomina/assistant.ts (DEMO_SYSTEM)' },
            { id: 'd-rien', label: 'Rien n’est enregistré', kind: 'end', d: 'Pas de transcript, pas de compte, rien en base.' },
            { id: 'd-contact', label: 'Formulaire de contact', col: 1, from: 'd-pages', d: 'Nom, e-mail, sujet, message.', code: 'app/api/contact' },
            { id: 'd-msg', label: 'Message enregistré', col: 1, from: 'd-contact', kind: 'end', d: 'Table contact_messages. Visible dans l’admin, Vue d’ensemble.' },
            { id: 'd-sms', label: 'E-mail et SMS à l’équipe', col: 1, from: 'd-msg', d: 'Chaque message part par e-mail à contact@loomina.eu et par SMS au numéro d’alerte (LOOMINA_ALERT_PHONE). Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
            { id: 'd-ga', label: 'Mesure d’audience', col: 1, from: null, d: 'Google Analytics et Search Console.' },
            { id: 'd-cookies', label: 'Bandeau cookies', col: 1, from: 'd-ga', d: 'Au premier passage, un bandeau classique : « Nous utilisons des cookies pour améliorer votre expérience et mesurer l’audience du site. » Google Analytics ne se charge qu’après « Accepter ». Le choix se change par le lien « Cookies » en bas du site.', code: 'components/Analytics.tsx' },
        ],
    },
    {
        key: 'commander',
        label: 'Commander',
        about: 'Du bouton « Commander » au compte créé.',
        nodes: [
            { id: 'c-qui', label: 'Pour qui ?', kind: 'q', d: 'Deux cartes avec photo : « Pour moi » ou « Pour offrir ». Une fois le choix fait, les photos se réduisent et l’autre carte passe en grisé.', code: 'app/order/page.tsx' },
            { id: 'c-coord', label: 'Coordonnées du narrateur', d: 'Prénom, nom, téléphone, e-mail. Le téléphone est celui qui le fera reconnaître quand il appellera.' },
            { id: 'c-duree', label: 'Durée des appels', d: `${minutes} min. Modifiable plus tard.` },
            { id: 'c-verif', label: 'Formulaire vérifié', d: 'Champs remplis, numéro plausible, e-mail valide. Sinon, un message sous le champ.' },
            { id: 'c-payer', label: 'Payer, sans quitter le site', d: `La commande se fait sur une page épurée, sans menu ni pied de page (logo, étapes, une seule carte au centre). Étape 3, dessinée par Loomina : récapitulatif, champ « J’ai un code promo », total, puis le seul champ carte de Stripe (sans Link, donc sans code SMS) et le bouton « Payer ${OFFER.price} € ». Deux choix au-dessus du champ de paiement : « Carte bancaire, en une fois » et « Payer en 3 ou 4 fois » (Klarna, avec le montant des échéances) ; chaque choix a sa propre session Stripe, et le code promo suit ; Klarna envoie obligatoirement sur sa propre page pour valider l’échéancier, puis revient sur la page de bienvenue. Si Klarna était désactivé dans Stripe, la carte seule. Numéro de téléphone remis en paires, même collé. Vérifié en ligne le 18/11/2026. À 0 € avec un code, le champ carte disparaît et le bouton devient « Valider ma commande ». Rien n’est encore écrit chez Loomina. Clé publiable STRIPE_PUBLISHABLE_KEY posée sur Vercel le 18/11/2026 ; sans elle, le site reprendrait la page Stripe externe.`, code: 'app/api/checkout' },
            { id: 'c-stripe', label: 'Paiement validé ?', kind: 'q' },
            { id: 'c-ok', label: 'Paiement réussi', d: 'Stripe renvoie le client sur la page de bienvenue du site, et prévient le site en parallèle.' },
            { id: 'c-signe', label: 'Message de Stripe vérifié', d: 'Signature fausse : refusé, rien n’est créé.', code: 'app/api/webhook/stripe' },
            { id: 'c-deja', label: 'Déjà traité ?', kind: 'q', d: 'Stripe renvoie parfois deux fois le même message : un seul livre par paiement.' },
            { id: 'c-compte', label: 'Compte trouvé ou créé', d: 'Par le téléphone d’abord (client qui recommande), sinon par l’e-mail. Deux cadeaux par le même acheteur : deux comptes distincts.' },
            { id: 'c-profil', label: 'Profil écrit', kind: 'end', d: 'Prénom, nom, téléphone, e-mail. Par défaut : vouvoiement, style « Naturel ». Table profiles.' },
            { id: 'c-livre', label: 'Livre créé, phase 1', kind: 'end', d: '« Biographie de [prénom] », en cours, 0 %. Avec : cadeau ou non, e-mail de l’acheteur, durée d’appel, l’offreur. Table projects. Si la personne a déjà un livre en cours, le nouveau est créé « En pause » et prend le relais quand le premier est terminé (corrigé le 18/11/2026 : avant, cette commande payée ne créait rien).' },
            { id: 'c-offrir', label: 'Pour offrir : « Et vous ? »', col: 1, from: 'c-qui', d: 'Le prénom et le portable de la personne qui offre, différent de celui du narrateur. Il ouvrira l’espace famille.' },
            { id: 'c-accueil', label: 'Page de bienvenue', col: 2, from: 'c-ok', d: 'Juste après le paiement : « Bienvenue » puis, en trois étapes, comment se passent les appels, l’écriture et le livre (pour un cadeau : prévenir le proche, avec un message à copier, et l’espace famille). Le bouton final ouvre directement l’espace auteur, ou l’espace famille de celui qui offre, sans code SMS, dès que le livre est créé. Le lien ne marche que 24 h.', code: 'app/bienvenue' },
            { id: 'c-abandon', label: 'Abandon', col: 1, from: 'c-stripe', d: 'Retour sur la page de commande. Aucun compte, aucun livre.' },
            { id: 'c-relance', label: 'Relance des paniers abandonnés', col: 1, from: 'c-abandon', status: 'partial', d: 'Une commande commencée et pas payée expire au bout de deux heures. Stripe prévient le site (réglage fait dans Stripe le 18/11/2026), qui envoie une seule fois un e-mail et un SMS avec le lien vers la page de commande. Pas encore vu tourner sur un vrai panier.' },
            { id: 'c-ignore', label: 'Oui : ignoré', col: 1, from: 'c-deja' },
            { id: 'c-echec', label: 'Erreur : Stripe réessaie', col: 1, from: 'c-compte', d: 'Le site répond « échec » à Stripe, qui renvoie le message plus tard. Un client ne repart jamais sans compte en silence.' },
            { id: 'c-bienvenue', label: 'Message de bienvenue', col: 1, from: 'c-livre', d: 'Après le paiement, le client reçoit un e-mail et un SMS : le numéro à appeler, le mode d’emploi, son espace. Pour un livre offert, ils vont à celui qui offre, jamais au narrateur. Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
            { id: 'c-alerte', label: 'Alerte « nouvelle commande »', col: 1, from: 'c-bienvenue', d: 'À chaque commande payée : e-mail à contact@loomina.eu et SMS au numéro d’alerte. La commande est aussi annoncée en haut de la Vue d’ensemble de l’admin pendant sept jours. Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
            { id: 'c-adresse', label: 'Adresse de livraison', col: 1, from: 'c-alerte', d: 'Pas demandée à la commande. Une fois le livre terminé, l’espace auteur demande où l’envoyer ; l’équipe est prévenue et l’adresse apparaît sur la fiche du client.', code: 'app/api/user/address' },
            { id: 'c-rembours', label: 'Remboursement sous 7 jours', col: 1, from: 'c-adresse', d: 'Promis sur le site. Dans l’admin, fiche du client, bouton « Rembourser ce client » : la commande est remboursée dans Stripe, le livre est fermé, les rendez-vous arrêtés, et le client reçoit un e-mail.' },
        ],
    },
    {
        key: 'auteur',
        label: 'Espace auteur',
        about: 'Ce que le narrateur fait sur le site, entre deux appels.',
        nodes: [
            { id: 'a-num', label: 'Tape son numéro', code: 'app/api/auth/verify' },
            { id: 'a-code', label: 'Code reçu par SMS', d: 'Envoyé par Twilio Verify.' },
            { id: 'a-session', label: 'Session de 30 jours', kind: 'end', d: 'L’auteur reste connecté 30 jours sans redemander de code.' },
            { id: 'a-accueil', label: 'Accueil : ses préférences', d: 'Au premier passage, avant tout appel : tu ou vous, sujets à éviter, durée des appels. « Plus tard » le ferme. Si un appel a déjà eu lieu, Loomina a déjà la réponse et ne redemande rien.', code: 'components/author/Welcome.tsx' },
            { id: 'a-avance', label: 'Voit l’avancement', d: 'La phase en cours et la part des sujets déjà racontés.' },
            { id: 'a-lire', label: 'Lit ses récits', d: 'Un récit par appel.' },
            { id: 'a-corrige', label: 'Corrige un récit', d: 'Deux façons : réécrire le texte soi-même (enregistré et affiché tout de suite), ou écrire une remarque.', code: 'app/api/user/chapters' },
            { id: 'a-memo', label: 'Correction mémorisée', kind: 'end', d: 'Nouvelle version du récit. Le Directeur et l’Écrivain la respectent ensuite ; elle est reportée mot pour mot dans le livre composé.' },
            { id: 'a-livre', label: 'Lit le livre composé', d: 'Le livre recomposé à partir de tous les récits.' },
            { id: 'a-regle', label: 'Règle ses préférences', d: 'Tu ou vous, style, sujets à éviter, durée des appels, SMS « récit prêt », partage avec l’offreur.', code: 'app/api/user/preferences' },
            { id: 'a-rdv', label: 'Choisit des rendez-vous', d: 'Des jours et une heure : Loomina l’appellera. Jamais entre 21 h et 9 h.' },
            { id: 'a-sujet', label: 'Suggère un sujet', kind: 'end', d: 'Rejoint les sujets suggérés : abordés au prochain appel, l’un après l’autre, tant que la durée souhaitée le permet.', code: 'app/api/user/questions' },
            { id: 'a-photo', label: 'Envoie une photo', d: 'Avec un titre et, s’il le veut, le chapitre du livre où il aimerait la voir.', code: 'app/api/user/photos' },
            { id: 'a-inconnu', label: 'Numéro inconnu', col: 1, from: 'a-num', d: '« Avez-vous déjà passé commande ? »' },
            { id: 'a-propose', label: 'L’IA applique la remarque', col: 1, from: 'a-corrige', kind: 'end', d: 'Environ cinq minutes après la remarque, l’IA corrige le récit, la mémoire du livre et le livre composé. L’auteur est prévenu par e-mail (ou par SMS si le livre est offert).', code: 'lib/loomina/corrections.ts' },
            { id: 'a-pdf', label: 'Télécharger le livre', col: 1, from: 'a-livre', status: 'todo', d: 'Pas de téléchargement (PDF ou autre) depuis l’espace auteur. Attend le format du livre, travaillé avec la mise en page.' },
            { id: 'a-decrit', label: 'L’IA décrit la photo', col: 1, from: 'a-photo', kind: 'end', d: 'Et prépare une question ouverte. Au prochain appel, Loomina dit qu’elle a vu la photo et demande si la personne veut en dire plus.', code: 'lib/loomina/photos.ts' },
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
            { id: 'f-non', label: 'Non : avancement seulement', col: 1, from: 'f-texte', d: 'Sans partage, celui qui a offert le livre voit que le livre avance (appels, phase), mais ni les textes ni les titres.' },
            { id: 'f-nouvelles', label: 'Nouvelles par SMS ou e-mail', col: 1, from: 'f-souffle', d: 'Celui qui a offert le livre reçoit un SMS et un e-mail au premier appel, à chaque nouveau récit (le titre, jamais le texte) et quand le livre est terminé. Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
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
            { id: 'p-suggere', label: 'Aborde un sujet suggéré', d: 'Quand une histoire vient de finir. Pas de maximum : la seule limite est la durée souhaitée.' },
            { id: 'p-point', label: 'Phase finie : fait le point', kind: 'q', d: 'Loomina marque la fin de la partie : elle rappelle ce que la personne a raconté, puis demande s’il y a des détails à ajouter ou autre chose qui manque, avant de passer à la suite. La personne décide.' },
            { id: 'p-fin', label: 'Fin de l’appel', kind: 'end', d: 'Loomina propose d’arrêter (durée atteinte et souvenir épuisé, ou fatigue), ou la personne raccroche, ou la durée maximale est atteinte.' },
            { id: 'p-rdv', label: 'Rendez-vous : Loomina appelle', col: 1, from: null, d: 'Chaque minute, le serveur vocal regarde qui a rendez-vous. Un seul essai par créneau.', code: 'voice/src/scheduler.ts' },
            { id: 'p-repondeur', label: 'Répondeur ou pas de réponse', col: 2, from: 'p-rdv', d: 'Répondeur : un message court. Pas de réponse : rien. Prochain créneau.' },
            { id: 'p-rappel', label: 'Rappel avant le rendez-vous', col: 2, from: 'p-repondeur', status: 'partial', d: 'Une demi-heure avant un rendez-vous, un SMS prévient que Loomina va appeler (pas encore vu tourner sur un vrai rendez-vous). Rien n’est envoyé après un rendez-vous manqué.' },
            { id: 'p-demo', label: 'Non : démonstration', col: 1, from: 'p-reconnu', d: 'Numéro inconnu, ou client sans livre en cours.' },
            { id: 'p-panne', label: 'Base injoignable', col: 1, from: 'p-reconnu', status: 'partial', d: '« Un problème technique m’empêche de vous répondre, rappelez dans quelques minutes », puis elle raccroche. L’entretien de secours n’existe que sur l’ancien chemin Vapi.' },
            { id: 'p-connaissance', label: 'Oui : fait connaissance', col: 1, from: 'p-premier', d: 'Tu ou vous ? Des sujets à éviter ? (sauf si déjà réglés), puis « Racontez-moi où vous avez grandi ».' },
            { id: 'p-tait', label: 'Silence : relance, puis raccroche', col: 1, from: 'p-tts' },
            { id: 'p-audio', label: 'Enregistrement audio', col: 1, from: 'p-fin', d: 'Chaque entretien est enregistré, les deux voix (jamais la démonstration). Loomina le dit au premier appel. Le son reste chez Twilio et s’écoute dans l’admin, sur la fiche du client, au-dessus du transcript. Vérifié sur un vrai appel le 18/11/2026.', code: 'voice/src/server.ts' },
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
            { id: 'x-alerte', label: 'Échec définitif : équipe prévenue', col: 1, from: 'x-echec', status: 'partial', d: 'Après le dernier essai, e-mail à contact@loomina.eu et SMS au numéro d’alerte, en plus de l’admin, « À surveiller ». Un bouton « Relancer » sur la fiche du client remet l’appel dans la file. Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
            { id: 'x-cout', label: 'Coût de l’appel', col: 1, from: 'x-recompose', d: 'Chaque appel a son coût, HT et TTC, sur la fiche du client : la ligne (prix réel lu chez Twilio), la voix et l’enregistrement, l’IA de la conversation, l’analyse et l’écriture du récit (jetons réels depuis le 17/11/2026, estimés avant). Grille de prix : config/costs.ts.' },
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
            { id: 'l-avis', label: 'Avis d’une IA sur le livre', d: 'Quand un livre est terminé et composé, une IA le lit en entier toute seule et signale les incohérences, les répétitions, les passages obscurs et les points délicats. Elle ne change rien : c’est un avis pour l’équipe, qui est prévenue. On peut aussi le redemander d’un bouton.', code: 'lib/loomina/book-review.ts' },
            { id: 'l-relecture', label: 'Relecture par l’équipe', d: 'Promise sur le site (« relu par notre équipe »). Dans l’admin : la liste des livres terminés à relire (Vue d’ensemble), une page pour lire le livre en entier, et le bouton « J’ai relu ce livre ». Les corrections se font encore à la main.' },
            { id: 'l-maquette', label: 'Mise en page', status: 'todo', d: `Le livre au format ${OFFER.format}, avec la couverture et les photos. Rien dans le code.` },
            { id: 'l-impression', label: 'Impression', status: 'todo', d: 'Pas d’imprimeur branché, pas de fichier d’impression produit.' },
            { id: 'l-envoi', label: 'Envoi du livre relié', status: 'todo', d: 'L’adresse est demandée dans l’espace auteur une fois le livre terminé. L’envoi lui-même reste à organiser avec l’imprimeur.' },
            { id: 'l-numerique', label: 'Version numérique', status: 'todo', d: 'Promise avec le livre. Pas de fichier produit aujourd’hui.' },
            { id: 'l-continue', label: 'Non : on continue', col: 1, from: 'l-complet' },
            { id: 'l-photos', label: 'Photos dans le livre', col: 1, from: 'l-maquette', status: 'todo', d: 'L’auteur donne un titre à chaque photo et peut choisir son chapitre. Le placement automatique dans le livre reste à faire, avec la mise en page.' },
        ],
    },
    {
        key: 'admin',
        label: 'L’admin',
        about: 'Ce que vous pouvez voir et faire sur loomina.eu/admin : suivre les clients, agir (relancer, rembourser), lire vos mails, régler les IA.',
        nodes: [
            { id: 'm-mdp', label: 'Mot de passe', d: 'Un seul mot de passe (ADMIN_PASSWORD, sur Vercel). Aucun lien depuis le site, pages non indexées.', code: 'lib/admin/auth.ts' },
            { id: 'm-session', label: 'Session de 30 jours', kind: 'end', d: 'Changer le mot de passe déconnecte tout le monde.' },
            { id: 'm-vue', label: 'Vue d’ensemble', d: 'La page d’accueil de l’admin.', code: 'app/admin/page.tsx' },
            { id: 'm-suivi', label: 'Suivi client', gap: 2, d: 'Où en sont les clients, d’un coup d’œil.', code: 'app/admin/suivi' },
            { id: 'm-clients', label: 'Clients', gap: 2, d: 'La liste de tous les narrateurs, du plus récent au plus ancien.', code: 'app/admin/clients' },
            { id: 'm-fiche', label: 'Fiche d’un client', d: 'Tout ce que Loomina sait d’un client, sur une page.', code: 'app/admin/clients/[id]' },
            { id: 'm-mails', label: 'Mails', gap: 1, d: 'La boîte contact@loomina.eu dans l’admin, au format webmail comme sur L’Étincelle : la liste à gauche, le message à droite, dossiers Reçus, Envoyés, Indésirables, Corbeille, recherche, raccourcis clavier. Lue en direct chez l’hébergeur.', code: 'app/admin/mails' },
            { id: 'm-carte', label: 'La carte', gap: 3, d: 'Cette page : tout le projet sur un seul arbre, avec ce qui manque.', code: 'lib/admin/map.ts' },
            { id: 'm-structure', label: 'Structure', d: 'Le schéma « qui parle à qui », le contenu de la base, ce qui tourne tout seul.', code: 'app/admin/structure' },
            { id: 'm-ia', label: 'Les IA', d: 'Les huit IA : modèle, moment, ce qu’elles lisent et écrivent.', code: 'app/admin/ia' },
            { id: 'm-refus', label: 'Mauvais mot de passe', col: 1, from: 'm-mdp', d: 'Refusé, avec une petite attente pour décourager les essais en série.' },
            { id: 'm-alertes', label: 'Alertes « À surveiller »', col: 1, from: 'm-vue', d: 'Appel dont le traitement a échoué, livre en échec, serveur vocal injoignable, réglage risqué sur Vercel.' },
            { id: 'm-chiffres', label: 'Chiffres et derniers appels', col: 1, from: 'm-alertes', d: 'Clients, appels de la semaine, récits écrits, état du serveur vocal, les douze derniers appels.' },
            { id: 'm-contact', label: 'Messages de contact', col: 1, from: 'm-chiffres', d: 'Les messages du formulaire de contact du site.' },
            { id: 'm-embarques', label: 'Embarqués et parcours', col: 1, from: 'm-suivi', d: 'Combien ont commandé, fait un premier vrai appel, reçu un premier récit, dépassé la phase 1, terminé.' },
            { id: 'm-relancer', label: 'Clients à relancer', col: 1, from: 'm-embarques', d: 'Pas de vrai appel 3 jours après la commande, ou plus d’appel depuis 14 jours.' },
            { id: 'm-activite', label: 'Activité et moyennes', col: 1, from: 'm-relancer', d: 'Appels par semaine, commandes par mois, délai avant le premier appel, durée d’un appel, mots par livre.' },
            { id: 'm-commande', label: 'Commande et réglages', col: 1, from: 'm-fiche', d: 'Date, cadeau ou non, offreur, durée d’appel, lien vers le paiement Stripe ; rendez-vous, SMS, partage.' },
            { id: 'm-memoire', label: 'Mémoire et prochain appel', col: 1, from: 'm-commande', d: 'Ce que Loomina sait de la personne, la question prévue, les sujets en attente, et le prompt exact de son prochain appel.' },
            { id: 'm-appels', label: 'Appels et transcripts', col: 1, from: 'm-memoire', d: 'Chaque appel : durée, résumé, transcript complet, analyse du Directeur.' },
            { id: 'm-recits', label: 'Récits et livre composé', col: 1, from: 'm-appels', d: 'Chaque récit et ses versions, le livre recomposé, et le journal technique des appels.' },
            { id: 'm-mails-agir', label: 'Lire, répondre, écrire', col: 1, from: 'm-mails', kind: 'end', d: 'Répondre, répondre à tous, transférer, écrire, joindre des fichiers, télécharger les pièces jointes, marquer lu ou non lu, suivre, mettre à la corbeille (un ou plusieurs messages). Une copie de chaque envoi va dans « Envoyés », comme pour les e-mails envoyés tout seuls par le site.', code: 'lib/admin/mailbox.ts' },
            { id: 'm-manques', label: 'Ce qui manque', col: 1, from: 'm-carte', d: 'Le filtre « Ce qui manque » de la carte : les cases à faire et à surveiller.' },
            { id: 'm-prompts', label: 'Prompts exacts', col: 1, from: 'm-ia', d: 'Lus directement dans le code : ce qui est affiché est ce qui tourne en ligne.' },
            { id: 'm-actions', label: 'Agir depuis l’admin', col: 2, from: 'm-commande', status: 'partial', d: 'Depuis la fiche d’un client : le relancer, le rembourser, relancer le traitement d’un appel en échec. Reste à faire : recomposer un livre, corriger une fiche.' },
            { id: 'm-prevenir', label: 'Être prévenu', col: 2, from: 'm-alertes', status: 'partial', d: 'Nouvelle commande, appel en échec, message de contact, livre terminé, avis de l’IA prêt, adresse de livraison reçue, client à relancer : e-mail à contact@loomina.eu et SMS au numéro d’alerte. Les SMS et les e-mails partent (vérifié le 18/11/2026) ; les e-mails sont envoyés par la boîte contact@loomina.eu.' },
            { id: 'm-relance', label: 'Relancer un client', col: 2, from: 'm-relancer', d: 'Bouton « Relancer » dans Suivi client et sur la fiche : un SMS et un e-mail rappellent le numéro à appeler. Livre offert sans aucun appel : la relance va à celui qui l’a offert.' },
            { id: 'm-argent', label: 'Montants réels et coûts', col: 2, from: 'm-activite', status: 'partial', d: 'Suivi client affiche ce que Stripe a réellement encaissé, les codes promo et les remboursements. Le coût de chaque appel et le total par client sont sur la fiche du client. Reste à faire : la marge par client.' },
            { id: 'm-audience', label: 'Audience du site', col: 2, from: 'm-chiffres', d: 'Suivi client affiche les visites, les visiteurs, les pages les plus vues, la provenance et le chemin jusqu’à la vente, lus dans Google Analytics (en service depuis le 17/11/2026). Seuls les visiteurs qui acceptent les cookies sont comptés.', code: 'lib/admin/audience.ts' },
            { id: 'm-modifier', label: 'Modifier un prompt', col: 2, from: 'm-prompts', d: 'Dans « Les IA », sous chaque IA : « Modifier ». On réécrit le prompt en entier, il est pris en compte dans la minute. Si une variable obligatoire manque, l’enregistrement est refusé. « Revenir au texte d’origine » annule tout. Pas encore modifiable : le regard sur les photos.', code: 'lib/loomina/prompt-store.ts' },
            { id: 'm-comptes', label: 'Plusieurs comptes admin', col: 2, from: 'm-refus', status: 'todo', d: 'Un seul mot de passe partagé : pas de compte par personne, pas d’historique de qui a consulté quoi. Décidé le 17/11/2026 : on laisse ainsi tant que Solal est seul.' },
        ],
    },
    {
        key: 'coulisses',
        label: 'Coulisses',
        about: 'Les services qui font tourner Loomina.',
        flat: true,
        nodes: [
            { id: 'k-vercel', label: 'Site · Vercel', d: 'Les pages, la commande, les espaces, et tout le traitement après l’appel.' },
            { id: 'k-render', label: 'Serveur vocal · Render', d: 'Les appels en direct, les rendez-vous, le rattrapage. Toujours allumé.' },
            { id: 'k-twilio', label: 'Twilio', d: 'Le numéro, la transcription et la voix pendant l’appel, les SMS.' },
            { id: 'k-openai', label: 'OpenAI', d: 'Tous les modèles : la voix, le Directeur, l’Écrivain, l’Éditeur du livre, les photos.' },
            { id: 'k-supabase', label: 'Supabase', d: 'La base (clients, livres, appels, récits) et les photos.' },
            { id: 'k-stripe', label: 'Stripe', d: 'Le paiement.' },
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
    { from: 'x-alerte', to: 'm-alertes', label: 'visible dans l’admin' },
    { from: 'd-msg', to: 'm-contact', label: 'visible dans l’admin' },
    { from: 'c-livre', to: 'm-clients', label: 'nouveau client' },
];
