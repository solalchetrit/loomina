/**
 * 5. Pendant l'écriture : la correction appliquée (lib/loomina/corrections.ts),
 * la relance après 14 jours sans appel, à l'auteur ou à celui qui a offert
 * le livre (lib/admin/actions.ts).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, bouton, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';
import type { MemoAge } from '../memo';

export interface CorrectionVars {
    firstName: string | null;
    tu: boolean;
    /** Le titre du récit corrigé. */
    title: string;
    age: MemoAge;
}

export function correctionEmail(v: CorrectionVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: t('Ta modification est faite !', 'Votre modification est faite !'),
        preheader: `« ${v.title} » est corrigé.`,
        blocks: [
            memo({ age: v.age, pose: 'e', bulle: 'Merci ! C’est noté, je m’en souviendrai pour toute la suite.' }),
            titre(v.firstName ? `C’est corrigé, ${v.firstName} !` : 'C’est corrigé !'),
            ...ps(
                t(`Ta remarque sur le récit « ${v.title} » est appliquée : le texte est corrigé, et la suite du livre en tiendra compte.`, `Votre remarque sur le récit « ${v.title} » est appliquée : le texte est corrigé, et la suite du livre en tiendra compte.`),
                t('Tu peux le relire dans ton espace.', 'Vous pouvez le relire dans votre espace.')
            ),
            bouton('Relire mon récit', DASHBOARD),
            signature('Mémo et l’équipe Loomina'),
        ],
    });
}

export interface RelanceVars {
    firstName: string | null;
    tu: boolean;
    age: MemoAge;
}

/** À l'auteur qui n'appelle plus. */
export function relanceEmail(v: RelanceVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    return renderEmail({
        subject: t('Ton livre t’attend !', 'Votre livre vous attend !'),
        preheader: t('Mémo a gardé tout ce que tu as raconté.', 'Mémo a gardé tout ce que vous avez raconté.'),
        blocks: [
            memo({ age: v.age, pose: 'h', bulle: t('J’ai gardé tout ce que tu m’as raconté. On continue ?', 'J’ai gardé tout ce que vous m’avez raconté. On continue ?') }),
            titre(t("Ton livre t'attend", 'Votre livre vous attend')),
            ...ps(
                hello,
                t(
                    `Ça fait un petit moment qu’on ne s’est pas parlé ! Quand tu veux, appelle le ${SITE.phoneDisplay} depuis ton téléphone : on reprend là où on s’était arrêtés. Il n’y a rien à préparer.`,
                    `Ça fait un petit moment qu’on ne s’est pas parlé ! Quand vous voulez, appelez le ${SITE.phoneDisplay} depuis votre téléphone : on reprend là où on s’était arrêtés. Il n’y a rien à préparer.`
                ),
                t('Tu préfères que Loomina t’appelle ? Choisis tes jours et ton heure dans ton espace.', 'Vous préférez que Loomina vous appelle ? Choisissez vos jours et votre heure dans votre espace.')
            ),
            bouton(t('Ouvrir mon espace', 'Ouvrir mon espace'), DASHBOARD),
            progression(v.age, t('Où en est ton livre', 'Où en est votre livre')),
            ...ps(t('Si quelque chose te gêne, réponds simplement à cet e-mail.', 'Si quelque chose vous gêne, répondez simplement à cet e-mail.')),
            signature('Mémo et l’équipe Loomina'),
        ],
    });
}

export interface RelanceOffreurVars {
    giverFirstName: string | null;
    narrator: string;
}

/** Livre offert, aucun appel encore : on écrit à celui qui l'a offert. */
export function relanceOffreurEmail(v: RelanceOffreurVars): RenderedEmail {
    const n = v.narrator;
    return renderEmail({
        subject: `Le livre de ${n} n’attend plus que son premier appel`,
        preheader: `${n} n’a qu’à appeler le ${SITE.phoneDisplay}.`,
        blocks: [
            memo({ age: 1, pose: 'd', bulle: `Je dors encore… ${n} me réveillera au premier appel !` }),
            titre(`Le livre de ${n} est prêt à commencer`),
            ...ps(
                v.giverFirstName ? `Bonjour ${v.giverFirstName} !` : 'Bonjour !',
                `Le livre que vous avez offert à ${n} est prêt. Il ne manque plus que le premier appel !`,
                `${n} n’a qu’à appeler le ${SITE.phoneDisplay} depuis son propre téléphone, quand il ou elle le souhaite. Loomina mène la conversation, il n’y a rien à préparer.`,
                'Un petit coup de pouce ? Vous pouvez lui transférer cet e-mail, ou être à ses côtés pour le tout premier appel.',
                'Si quelque chose bloque, répondez simplement à cet e-mail : on vous aide volontiers.'
            ),
            signature('Mémo et l’équipe Loomina'),
        ],
    });
}
