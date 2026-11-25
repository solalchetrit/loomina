/**
 * Le catalogue de tous les e-mails envoyés aux clients, dans l'ordre du
 * parcours, avec un exemple de variables pour chacun.
 *
 * Sert à l'onglet « E-mails types » de l'admin et à la page d'aperçu
 * (scripts/emails/apercu.ts). Pour ajouter un e-mail : écrire son modèle dans
 * lib/emails/messages, puis l'ajouter ici.
 */
import { demoRecitEmail, demoRappelEmail } from './messages/demo';
import { panierEmail } from './messages/panier';
import { bienvenueEmail, bienvenueCadeauEmail } from './messages/commande';
import { familleEmail } from './messages/famille';
import { correctionEmail, relanceEmail, relanceOffreurEmail } from './messages/ecriture';
import { livreTermineEmail, etapeLivreEmail } from './messages/livre';
import { remboursementEmail } from './messages/remboursement';
import type { RenderedEmail } from './mise-en-page';

export interface CatalogueEntry {
    id: string;
    /** L'étape du parcours client. */
    etape: string;
    nom: string;
    quand: string;
    aQui: string;
    /** Les variables du modèle, en clair. */
    variables: string[];
    /** Le code qui l'envoie. */
    code: string;
    exemple: () => RenderedEmail;
}

const OPT_OUT = 'Vous ne souhaitez plus recevoir ces rappels ? https://www.loomina.eu/desinscription?t=…';
const EXPIRE = new Date('2026-12-09T12:00:00+01:00');
const TRACK = { number: '6A12345678901', url: 'https://www.laposte.fr/outils/suivre-vos-envois?code=6A12345678901' };
const CART = { firstName: 'Marc', isGift: false, narratorFirstName: null, recoveryUrl: 'https://checkout.stripe.com/c/pay/…', optOut: OPT_OUT };

export const ETAPES = ['La démo gratuite', 'Panier abandonné', 'La commande', 'Après chaque appel', 'Pendant l’écriture', 'La fin du livre', 'Remboursement'];

export const CATALOGUE: CatalogueEntry[] = [
    {
        id: 'demo-recit', etape: ETAPES[0], nom: 'Le récit de la démo, avec le code de réduction',
        quand: 'Quand le visiteur laisse son e-mail sur la page de son récit', aQui: 'Le visiteur',
        variables: ['prénom', 'titre du récit', 'code personnel et date de fin', 'pourcentage (config/offer.ts)', 'PDF du récit en pièce jointe'],
        code: 'lib/loomina/demo-story.ts (emailDemoStory)',
        exemple: () => demoRecitEmail({ firstName: 'Jeanne', title: 'Le bal du 14 juillet', promo: { code: 'RECIT4F2A9B1C', expires: EXPIRE } }),
    },
    {
        id: 'demo-rappel', etape: ETAPES[0], nom: 'Rappel : la réduction se termine',
        quand: '48 h avant la fin du code (entre 10 h et 19 h), s’il n’a pas commandé', aQui: 'Le visiteur',
        variables: ['prénom', 'titre du récit', 'code et date de fin', 'lien du récit s’il est encore en ligne', 'lien de désinscription'],
        code: 'lib/loomina/demo-story.ts (sweepDemoReminders)',
        exemple: () => demoRappelEmail({ firstName: 'Jeanne', title: 'Le bal du 14 juillet', code: 'RECIT4F2A9B1C', expires: EXPIRE, storyUrl: 'https://www.loomina.eu/recit/abc123', optOut: OPT_OUT }),
    },
    ...([1, 2, 3] as const).map((step) => ({
        id: `panier-${step}`, etape: ETAPES[1], nom: `Relance ${step} sur 3`,
        quand: ['Quand la page de paiement expire', 'Deux jours après', 'Cinq jours après'][step - 1], aQui: 'L’acheteur',
        variables: ['prénom', 'cadeau ou non', 'prénom de la personne qui racontera (cadeau)', 'lien Stripe de reprise', 'lien de désinscription'],
        code: 'lib/loomina/abandoned-cart.ts',
        exemple: () => panierEmail(CART, step),
    })),
    {
        id: 'bienvenue', etape: ETAPES[2], nom: 'Bienvenue (livre pour soi)',
        quand: 'Juste après le paiement', aQui: 'L’auteur',
        variables: ['prénom de l’auteur'], code: 'lib/loomina/notify.ts (notifyNewOrder)',
        exemple: () => bienvenueEmail({ narratorFirstName: 'Jeanne' }),
    },
    {
        id: 'bienvenue-cadeau', etape: ETAPES[2], nom: 'Bienvenue (livre offert)',
        quand: 'Juste après le paiement', aQui: 'Celui qui offre',
        variables: ['prénom de celui qui offre', 'prénom de la personne qui racontera'], code: 'lib/loomina/notify.ts (notifyNewOrder)',
        exemple: () => bienvenueCadeauEmail({ narratorFirstName: 'Jeanne', giverFirstName: 'Marc' }),
    },
    {
        id: 'famille-premier-appel', etape: ETAPES[3], nom: 'Famille : premier appel fait',
        quand: 'Après le tout premier appel (livre offert)', aQui: 'Celui qui offre',
        variables: ['prénom de l’auteur', 'étape du livre (âge de Mémo)'], code: 'lib/loomina/notify.ts (notifyFamily)',
        exemple: () => familleEmail({ kind: 'first_call', narrator: 'Jeanne', age: 1 }),
    },
    {
        id: 'famille-nouveau-recit', etape: ETAPES[3], nom: 'Famille : nouveau récit',
        quand: 'Après chaque appel suivant (livre offert)', aQui: 'Celui qui offre',
        variables: ['prénom de l’auteur', 'titre du récit (seulement si l’auteur partage ses récits)', 'étape du livre (âge de Mémo)'], code: 'lib/loomina/notify.ts (notifyFamily)',
        exemple: () => familleEmail({ kind: 'new_story', narrator: 'Jeanne', storyTitle: 'L’arrivée à Paris', age: 2 }),
    },
    {
        id: 'correction', etape: ETAPES[4], nom: 'Correction appliquée',
        quand: 'Quand une remarque de l’auteur a été appliquée au récit', aQui: 'L’auteur',
        variables: ['prénom', 'tu ou vous', 'titre du récit', 'étape du livre (âge de Mémo)'], code: 'lib/loomina/corrections.ts',
        exemple: () => correctionEmail({ firstName: 'Jeanne', tu: false, title: 'L’arrivée à Paris', age: 2 }),
    },
    {
        id: 'relance', etape: ETAPES[4], nom: 'Relance : 14 jours sans appel',
        quand: 'Automatique après 14 jours sans appel (10 h à 19 h), ou bouton de l’admin', aQui: 'L’auteur',
        variables: ['prénom', 'tu ou vous', 'étape du livre (âge de Mémo)'], code: 'lib/admin/actions.ts (relanceClient)',
        exemple: () => relanceEmail({ firstName: 'Jeanne', tu: false, age: 3 }),
    },
    {
        id: 'relance-offreur', etape: ETAPES[4], nom: 'Relance : le premier appel n’a pas eu lieu',
        quand: 'Livre offert, aucun appel encore (même règle de 14 jours)', aQui: 'Celui qui offre',
        variables: ['prénom de celui qui offre', 'prénom de l’auteur'], code: 'lib/admin/actions.ts (relanceClient)',
        exemple: () => relanceOffreurEmail({ giverFirstName: 'Marc', narrator: 'Jeanne' }),
    },
    {
        id: 'livre-termine', etape: ETAPES[5], nom: 'Livre terminé',
        quand: 'Quand l’auteur dit au téléphone que son livre est fini', aQui: 'L’auteur',
        variables: ['prénom', 'tu ou vous'], code: 'lib/loomina/notify.ts (notifyAuthorBookComplete)',
        exemple: () => livreTermineEmail({ firstName: 'Jeanne', tu: false }),
    },
    {
        id: 'famille-livre-termine', etape: ETAPES[5], nom: 'Famille : livre terminé',
        quand: 'Au même moment (livre offert)', aQui: 'Celui qui offre',
        variables: ['prénom de l’auteur'], code: 'lib/loomina/notify.ts (notifyFamily)',
        exemple: () => familleEmail({ kind: 'book_complete', narrator: 'Jeanne', age: 5 }),
    },
    ...(
        [
            ['reviewed', 'Livre relu', 'Quand l’équipe clique « Relu » dans l’admin'],
            ['printing', 'À l’impression', 'Quand l’équipe clique « À l’impression »'],
            ['shipped', 'En route', 'Quand l’équipe clique « Expédié », avec le suivi'],
        ] as const
    ).flatMap(([step, nom, quand]) => [
        {
            id: `livre-${step}`, etape: ETAPES[5], nom, quand, aQui: 'L’auteur',
            variables: ['prénom', 'tu ou vous', ...(step === 'shipped' ? ['numéro et lien de suivi'] : [])], code: 'lib/loomina/notify.ts (notifyBookStage)',
            exemple: () => etapeLivreEmail({ step, firstName: 'Jeanne', tu: false, family: false, narratorFirstName: 'Jeanne', tracking: TRACK }),
        },
        {
            id: `livre-${step}-famille`, etape: ETAPES[5], nom: `${nom} (famille)`, quand, aQui: 'Celui qui offre',
            variables: ['prénom du proche', 'prénom de l’auteur', ...(step === 'shipped' ? ['numéro et lien de suivi'] : [])], code: 'lib/loomina/notify.ts (notifyBookStage)',
            exemple: () => etapeLivreEmail({ step, firstName: 'Marc', tu: false, family: true, narratorFirstName: 'Jeanne', tracking: TRACK }),
        },
    ]),
    {
        id: 'remboursement', etape: ETAPES[6], nom: 'Remboursement',
        quand: 'Quand l’équipe rembourse depuis la fiche client', aQui: 'L’acheteur',
        variables: ['prénom', 'montant réellement remboursé par Stripe'], code: 'lib/admin/actions.ts (refundClient)',
        exemple: () => remboursementEmail({ firstName: 'Jeanne', amount: 449 }),
    },
];

/** Les moments où aucun e-mail ne part (à décider avec Solal). */
export const SANS_EMAIL: { etape: string; texte: string }[] = [
    { etape: ETAPES[2], texte: 'Livre offert : la personne qui va raconter ne reçoit pas de bienvenue (ni e-mail, ni SMS).' },
    { etape: ETAPES[3], texte: 'Avant un appel programmé : seulement un SMS 30 minutes avant. Après chaque appel : seulement le SMS « votre récit est prêt » à l’auteur.' },
    { etape: ETAPES[4], texte: 'Passage à une nouvelle étape du livre (Mémo grandit) : rien n’est envoyé.' },
    { etape: ETAPES[5], texte: 'Livre reçu : pas de merci ni de demande d’avis.' },
];
