/**
 * 3. La commande : bienvenue (livre pour soi, ou livre offert).
 * Envoyé par lib/loomina/notify.ts (notifyNewOrder).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, appeler, bouton, etapes, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

const REFUND = 'Et si le premier appel ne convient pas, on vous rembourse en entier, sur simple demande, dans les 7 jours.';

export interface BienvenueVars {
    /** Prénom de la personne qui racontera. */
    narratorFirstName: string | null;
}

/** Bienvenue : on écrit son propre livre. */
export function bienvenueEmail(v: BienvenueVars): RenderedEmail {
    const n = v.narratorFirstName?.trim() || null;
    return renderEmail({
        subject: n ? `Bienvenue chez Loomina, ${n} ! Votre livre commence` : 'Bienvenue chez Loomina ! Votre livre commence',
        preheader: `Pour commencer, il suffit d’appeler le ${SITE.phoneDisplay}.`,
        blocks: [
            memo({ age: 1, pose: 'c', bulle: n ? `Bonjour ${n} ! Moi, c’est Mémo. Je vais grandir avec votre livre.` : 'Bonjour ! Moi, c’est Mémo. Je vais grandir avec votre livre.' }),
            titre(n ? `Bienvenue, ${n} !` : 'Bienvenue !'),
            ...ps('Merci pour votre commande ! À partir d’aujourd’hui, on écrit votre livre ensemble, et on a vraiment hâte. Pour commencer, c’est tout simple :'),
            etapes([
                `Appelez le ${SITE.phoneDisplay} depuis votre téléphone, quand vous voulez. Loomina vous reconnaît.`,
                'Racontez. Loomina pose les questions et vous écoute. Il n’y a rien à préparer.',
                'Après chaque appel, le récit de ce que vous avez raconté vous attend dans votre espace.',
            ]),
            appeler(),
            bouton('Ouvrir mon espace', DASHBOARD),
            ...ps('Vous préférez que Loomina vous appelle ? Choisissez vos jours et votre heure dans votre espace.'),
            progression(1, 'Votre livre en cinq étapes. Vous êtes ici :'),
            ...ps(REFUND),
            signature(),
        ],
    });
}

export interface BienvenueCadeauVars {
    /** Prénom de la personne qui racontera. */
    narratorFirstName: string | null;
    /** Prénom de la personne qui offre. */
    giverFirstName: string | null;
}

/** Bienvenue : on offre le livre à un proche. Part à celui qui offre. */
export function bienvenueCadeauEmail(v: BienvenueCadeauVars): RenderedEmail {
    const n = v.narratorFirstName?.trim() || 'votre proche';
    const g = v.giverFirstName?.trim() || null;
    return renderEmail({
        subject: `Quel beau cadeau ! Le livre de ${n} peut commencer`,
        preheader: `${n} n’a plus qu’à appeler le ${SITE.phoneDisplay}.`,
        blocks: [
            memo({ age: 1, pose: 'g', bulle: `J’ai hâte de rencontrer ${n} !` }),
            titre(g ? `Merci ${g}, quel beau cadeau !` : 'Quel beau cadeau !'),
            ...ps(g ? `Bonjour ${g},` : 'Bonjour,', `Merci pour votre commande : vous venez d’offrir à ${n} le livre de sa vie. On va prendre grand soin de ses souvenirs.`, 'Voici comment ça se passe :'),
            etapes([
                `${n} appelle le ${SITE.phoneDisplay} depuis son propre téléphone, quand il ou elle le souhaite. Loomina le ou la reconnaît.`,
                'Loomina mène la conversation. Il n’y a rien à préparer.',
                `Après chaque appel, un nouveau récit rejoint le livre de ${n}.`,
            ]),
            ...ps('De votre côté, suivez l’aventure dans votre espace famille. Vous pouvez même y souffler des souvenirs à raconter. Connectez-vous avec votre numéro de téléphone.'),
            bouton('Ouvrir mon espace famille', DASHBOARD),
            ...ps(REFUND),
            signature(),
        ],
    });
}
