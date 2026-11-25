/**
 * 5. Pendant l'écriture : la correction appliquée (lib/loomina/corrections.ts),
 * la relance après 14 jours sans appel, à l'auteur ou à celui qui a offert
 * le livre (lib/admin/actions.ts).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, appeler, bouton, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';
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
            ...ps(t('Un autre souvenir te revient ? Raconte-le à Loomina.', 'Un autre souvenir vous revient ? Racontez-le à Loomina.')),
            appeler(),
            signature(),
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
            appeler(),
            bouton('Ouvrir mon espace', DASHBOARD),
            progression(v.age, t('Où en est ton livre', 'Où en est votre livre')),
            ...ps(t('Si quelque chose te gêne, réponds simplement à cet e-mail.', 'Si quelque chose vous gêne, répondez simplement à cet e-mail.')),
            signature(),
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
            signature(),
        ],
    });
}

/**
 * Le livre passe à l'étape suivante : Mémo grandit (demande de Solal,
 * 25/11/2026). Part après l'appel qui fait changer de phase, à l'auteur, ou à
 * celui qui a offert le livre si l'adresse du compte est la sienne.
 */
export interface EtapeSuivanteVars {
    /** Prénom du destinataire. */
    firstName: string | null;
    tu: boolean;
    /** Le nouvel âge de Mémo : 2, 3 ou 4. */
    age: 2 | 3 | 4;
    /** Pour un proche : le prénom de la personne qui raconte (on parle alors d'elle). */
    family?: { narrator: string | null };
    /** La ligne de désinscription (lib/loomina/optout.ts), tout en bas. */
    optOut?: string | null;
}

const GRANDIT: Record<2 | 3 | 4, { sujet: string; bulle: [string, string]; fait: [string, string]; suite: [string, string]; famille: string }> = {
    2: {
        sujet: 'Mémo fait ses premiers pas !',
        bulle: ['Regarde, je marche ! Raconte-moi tes racines.', 'Regardez, je marche ! Racontez-moi vos racines.'],
        fait: ['Tu as fait connaissance avec Loomina', 'Vous avez fait connaissance avec Loomina'],
        suite: ['tes racines : ta famille, tes parents, ton enfance, l’école', 'vos racines : votre famille, vos parents, votre enfance, l’école'],
        famille: 'ses racines : sa famille, ses parents, son enfance, l’école',
    },
    3: {
        sujet: 'Mémo prend la plume !',
        bulle: ['J’ai pris ma plume. Raconte-moi ta vie d’adulte !', 'J’ai pris ma plume. Racontez-moi votre vie d’adulte !'],
        fait: ['Tes racines sont racontées', 'Vos racines sont racontées'],
        suite: ['ta vie d’adulte : ce qui a rempli tes journées, les personnes que tu as aimées, tes passions', 'votre vie d’adulte : ce qui a rempli vos journées, les personnes que vous avez aimées, vos passions'],
        famille: 'sa vie d’adulte : ce qui a rempli ses journées, les personnes aimées, ses passions',
    },
    4: {
        sujet: 'Mémo met ses lunettes !',
        bulle: ['J’ai mis mes lunettes. Plus qu’une étape avant ton livre !', 'J’ai mis mes lunettes. Plus qu’une étape avant votre livre !'],
        fait: ['Ta vie est racontée', 'Votre vie est racontée'],
        suite: ['ce que tu veux transmettre : tes valeurs, tes messages à ceux que tu aimes', 'ce que vous voulez transmettre : vos valeurs, vos messages à ceux que vous aimez'],
        famille: 'ce qu’il ou elle veut transmettre : ses valeurs, ses messages à ceux qu’il ou elle aime',
    },
};

export function etapeSuivanteEmail(v: EtapeSuivanteVars): RenderedEmail {
    const g = GRANDIT[v.age];
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const last = v.age === 4;
    if (v.family) {
        const n = v.family.narrator?.trim() || 'Votre proche';
        return renderEmail({
            subject: `Le livre de ${n} avance : ${g.sujet}`,
            preheader: `${n} passe à l’étape suivante de son livre.`,
            blocks: [
                memo({ age: v.age, pose: 'c', bulle: `${n} m’a fait grandir !` }),
                titre(g.sujet),
                ...ps(hello, `Bonne nouvelle : le livre de ${n} passe à l’étape suivante, et Mémo a grandi.`, `${last ? 'Dernière étape' : 'Prochaine étape'}, ${g.famille}.`, `Une idée de souvenir sur ce sujet ? Soufflez-la dans votre espace famille : Loomina en parlera avec ${n} au prochain appel.`),
                progression(v.age, `Le livre de ${n}`),
                bouton('Ouvrir mon espace famille', DASHBOARD),
                signature(),
            ],
            optOut: v.optOut,
        });
    }
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: g.sujet,
        preheader: t('Ton livre passe à l’étape suivante.', 'Votre livre passe à l’étape suivante.'),
        blocks: [
            memo({ age: v.age, pose: 'c', bulle: t(g.bulle[0], g.bulle[1]) }),
            titre(g.sujet),
            ...ps(
                hello,
                `${t(g.fait[0], g.fait[1])}, bravo ! ${t('Ton livre', 'Votre livre')} passe à l’étape suivante, et Mémo a grandi.`,
                `${last ? 'Dernière étape' : 'Prochaine étape'}, ${t(g.suite[0], g.suite[1])}. ${t('Au prochain appel, Loomina t’emmène là-bas.', 'Au prochain appel, Loomina vous emmène là-bas.')}`
            ),
            progression(v.age, t('Où en est ton livre', 'Où en est votre livre')),
            appeler(),
            bouton('Ouvrir mon espace', DASHBOARD),
            signature(),
        ],
        optOut: v.optOut,
    });
}
