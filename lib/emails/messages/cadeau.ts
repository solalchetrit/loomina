/**
 * Le livre offert, sans gâcher la surprise (demande de Solal, 25/11/2026).
 *
 * À la commande, rien ne part vers la personne qui va raconter. Celui qui
 * offre choisit dans son espace famille : la prévenir maintenant, ou à une
 * date (Noël, un anniversaire…). Ce jour-là, à 10 h, elle reçoit un SMS de
 * bienvenue, et celui qui offre un e-mail « c'est le jour J »
 * (lib/loomina/gift-reveal.ts).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, bouton, memo, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

/** Le SMS de bienvenue de la personne à qui on offre le livre. */
export function annonceCadeauSms(v: { narratorFirstName: string | null; giverFirstName: string | null; tu: boolean }): string {
    const hello = v.narratorFirstName ? `Bonjour ${v.narratorFirstName} !` : 'Bonjour !';
    const by = v.giverFirstName?.trim() || 'Un proche';
    return v.tu
        ? `${hello} ${by} t'offre un cadeau : le livre de ta vie, écrit par Loomina. Tu racontes tes souvenirs au téléphone, et on en fait un vrai livre imprimé. Pour commencer, appelle le ${SITE.phoneDisplay} quand tu veux. Il n'y a rien à préparer. À très vite ! Loomina`
        : `${hello} ${by} vous offre un cadeau : le livre de votre vie, écrit par Loomina. Vous racontez vos souvenirs au téléphone, et on en fait un vrai livre imprimé. Pour commencer, appelez le ${SITE.phoneDisplay} quand vous voulez. Il n'y a rien à préparer. À très vite ! Loomina`;
}

export interface JourJVars {
    giverFirstName: string | null;
    narrator: string | null;
}

/** À celui qui offre, le jour choisi : la personne vient d'être prévenue. */
export function jourJEmail(v: JourJVars): RenderedEmail {
    const n = v.narrator?.trim() || 'votre proche';
    return renderEmail({
        subject: `C’est le jour J : ${n} découvre votre cadeau !`,
        preheader: `${n} vient de recevoir son message de bienvenue.`,
        blocks: [
            memo({ age: 1, pose: 'c', bulle: `Surprise ! J’ai hâte de rencontrer ${n} !` }),
            titre('C’est le jour J !'),
            ...ps(
                v.giverFirstName ? `Bonjour ${v.giverFirstName} !` : 'Bonjour !',
                `Comme prévu, ${n} vient de recevoir un SMS de bienvenue : votre cadeau, et le numéro à appeler pour commencer, le ${SITE.phoneDisplay}.`,
                `Un petit coup de pouce aide souvent : un appel à ${n} pour en parler, ou être à ses côtés pour le tout premier appel.`,
                'On vous prévient dès que le premier récit est écrit.'
            ),
            bouton('Ouvrir mon espace famille', DASHBOARD),
            signature(),
        ],
    });
}
