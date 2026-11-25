/**
 * 2. Panier abandonné : trois e-mails sur la semaine (à l'expiration, deux
 * jours après, cinq jours après). Envoyés par lib/loomina/abandoned-cart.ts.
 */
import { SITE } from '../../../config/site';
import { SITE_URL, bouton, etapes, memo, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

export type CartStep = 1 | 2 | 3;

export interface PanierVars {
    /** Prénom de la personne qui commandait. */
    firstName: string | null;
    isGift: boolean;
    /** Pour un cadeau : le prénom de la personne qui racontera. */
    narratorFirstName: string | null;
    /** Le lien Stripe qui rouvre la commande telle quelle (30 jours), sinon la page de commande. */
    recoveryUrl: string | null;
    optOut: string | null;
}

export function panierEmail(v: PanierVars, step: CartStep = 1): RenderedEmail {
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const link = v.recoveryUrl ?? `${SITE_URL}/order`;
    const n = v.isGift ? v.narratorFirstName?.trim() || null : null;
    const refund = 'Et si le premier appel ne convient pas, on vous rembourse en entier, sur simple demande, dans les 7 jours.';
    const demo = `Envie d’essayer d’abord ? Appelez le ${SITE.phoneDisplay}, racontez un souvenir pendant cinq minutes, et recevez-le écrit par SMS. C’est gratuit.`;

    if (step === 2) {
        return renderEmail({
            subject: n ? `Comment se passera le livre de ${n}` : 'Comment se passe un livre Loomina',
            preheader: 'Trois étapes, rien à préparer.',
            blocks: [
                memo({ age: 3, pose: 'd', bulle: 'Moi, je retiens tout. Loomina écrit, et le livre avance à chaque appel !' }),
                titre(n ? `Le livre de ${n}, comment ça marche ?` : 'Votre livre, comment ça marche ?'),
                ...ps(hello, `Vous aviez commencé à commander ${n ? `le livre de ${n}` : 'votre livre'}. Voici comment ça se passe, en vrai :`),
                etapes([
                    n
                        ? `${n} appelle Loomina au ${SITE.phoneDisplay} depuis son téléphone, quand bon lui semble. Ou bien choisit des jours et une heure, et Loomina l’appelle. Rien à préparer : Loomina pose les questions et écoute.`
                        : `Vous appelez Loomina au ${SITE.phoneDisplay} depuis votre téléphone, quand vous le souhaitez. Ou bien vous choisissez des jours et une heure, et Loomina vous appelle. Rien à préparer : Loomina pose les questions et écoute.`,
                    'Après chaque appel, le récit est écrit. On le lit dans l’espace auteur, et on peut le corriger.',
                    'Quand l’histoire est complète, notre équipe relit le livre, puis il est imprimé et livré.',
                ]),
                ...ps(demo),
                bouton('Reprendre ma commande', link),
                signature(),
            ],
            optOut: v.optOut,
        });
    }
    if (step === 3) {
        return renderEmail({
            subject: n ? `Dernier rappel pour le livre de ${n}` : 'Dernier rappel pour votre livre',
            preheader: 'Promis, après celui-ci, on ne vous écrit plus à ce sujet.',
            blocks: [
                memo({ age: 1, pose: 'g', bulle: 'Je vous fais un dernier petit signe, et après, promis, je ne dis plus rien !' }),
                titre('Un dernier petit mot'),
                ...ps(hello, `C’est notre dernier message au sujet de votre commande. Si l’envie ${n ? `d’offrir son livre à ${n}` : 'd’écrire votre livre'} revient, elle vous attend ici :`),
                bouton('Reprendre ma commande', link),
                ...ps('Si ce n’est pas le bon moment, aucun souci. Et si quelque chose vous fait hésiter, dites-le-nous en répondant à cet e-mail : on lit tout, et on répond.'),
                signature(),
            ],
            optOut: v.optOut,
        });
    }
    return renderEmail({
        subject: n ? `Le livre de ${n} vous attend` : 'Votre livre Loomina vous attend',
        preheader: 'Votre commande est gardée telle quelle.',
        blocks: [
            memo({ age: 1, pose: 'h', bulle: n ? `J’ai hâte de rencontrer ${n} !` : 'Je suis prêt à vous écouter !' }),
            titre(n ? `Le livre de ${n} vous attend` : 'Votre livre vous attend'),
            ...ps(hello, 'Vous avez commencé une commande sans la terminer. Pas de panique, elle est gardée telle quelle : un clic et c’est reparti.'),
            bouton('Reprendre ma commande', link),
            ...ps(refund, demo),
            signature(),
        ],
        optOut: v.optOut,
    });
}
