/**
 * 4. Autour des appels (demande de Solal, 25/11/2026) :
 * - la veille d'un appel programmé (lib/loomina/call-mails.ts) ;
 * - après chaque appel, le récit écrit (lib/loomina/pipeline.ts) ;
 * - l'appel programmé manqué : personne n'a décroché (app/api/jobs/appel-manque).
 */
import { SITE } from '../../../config/site';
import { DASHBOARD, appeler, bouton, encadre, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';
import type { MemoAge } from '../memo';

/** « 15 h », « 15 h 30 » */
export function heure(hm: string): string {
    const [h, m] = hm.split(':');
    return `${Number(h)} h${m === '00' ? '' : ` ${m}`}`;
}

export interface VeilleVars {
    firstName: string | null;
    tu: boolean;
    /** L'heure de l'appel, « HH:MM » (heure de Paris). */
    time: string;
    age: MemoAge;
    optOut?: string | null;
}

/** La veille d'un appel programmé, en fin de journée. */
export function veilleAppelEmail(v: VeilleVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    const at = heure(v.time);
    return renderEmail({
        subject: t(`À demain, ${at} !`, `À demain, ${at} !`),
        preheader: t(`Loomina t’appelle demain à ${at} pour continuer ton livre.`, `Loomina vous appelle demain à ${at} pour continuer votre livre.`),
        blocks: [
            memo({ age: v.age, pose: 'h', bulle: t('Demain, je suis tout ouïe !', 'Demain, je suis tout ouïe !') }),
            titre(t('On se parle demain !', 'On se parle demain !')),
            ...ps(
                v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !',
                t(`Petit rappel : Loomina t’appelle demain à ${at}, pour continuer ton livre.`, `Petit rappel : Loomina vous appelle demain à ${at}, pour continuer votre livre.`),
                t(
                    'Il n’y a rien à préparer. Installe-toi au calme, avec un verre d’eau, et laisse venir les souvenirs.',
                    'Il n’y a rien à préparer. Installez-vous au calme, avec un verre d’eau, et laissez venir les souvenirs.'
                ),
                t(
                    'Demain ne t’arrange pas ? Change l’heure dans ton espace, ou ne décroche pas : tu pourras rappeler quand tu veux.',
                    'Demain ne vous arrange pas ? Changez l’heure dans votre espace, ou ne décrochez pas : vous pourrez rappeler quand vous voulez.'
                )
            ),
            bouton('Ouvrir mon espace', DASHBOARD),
            signature(),
        ],
        optOut: v.optOut,
    });
}

export interface RecitPretVars {
    firstName: string | null;
    tu: boolean;
    title: string;
    /** Le début du récit, en texte simple (quelques phrases). */
    extrait: string | null;
    age: MemoAge;
    optOut?: string | null;
}

/** Juste après un appel : le récit est écrit. */
export function recitPretEmail(v: RecitPretVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: `${v.tu ? 'Ton' : 'Votre'} récit est écrit : « ${v.title} »`,
        preheader: t('Merci pour ce beau moment au téléphone !', 'Merci pour ce beau moment au téléphone !'),
        blocks: [
            memo({ age: v.age, pose: 'f', bulle: `J’ai retenu « ${v.title} ». Je ne l’oublierai pas !` }),
            titre(t('Ton récit est écrit !', 'Votre récit est écrit !')),
            ...ps(
                v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !',
                t(`Merci pour cet appel ! Ce que tu as raconté est devenu un nouveau récit de ton livre : « ${v.title} ».`, `Merci pour cet appel ! Ce que vous avez raconté est devenu un nouveau récit de votre livre : « ${v.title} ».`)
            ),
            ...(v.extrait ? [encadre([`« ${v.extrait} »`])] : []),
            bouton(t('Lire mon récit', 'Lire mon récit'), DASHBOARD),
            ...ps(t('Un détail à changer ? Écris-le sous le récit, dans ton espace : on le corrige.', 'Un détail à changer ? Écrivez-le sous le récit, dans votre espace : on le corrige.')),
            progression(v.age, t('Où en est ton livre', 'Où en est votre livre')),
            ...ps(t('Un autre souvenir te revient ? Appelle quand tu veux.', 'Un autre souvenir vous revient ? Appelez quand vous voulez.')),
            appeler(),
            signature(),
        ],
        optOut: v.optOut,
    });
}

export interface AppelManqueVars {
    firstName: string | null;
    tu: boolean;
    age: MemoAge;
    optOut?: string | null;
}

/** Loomina a appelé à l'heure prévue, personne n'a décroché. */
export function appelManqueEmail(v: AppelManqueVars): RenderedEmail {
    const t = (a: string, b: string) => (v.tu ? a : b);
    return renderEmail({
        subject: t('On s’est manqués !', 'On s’est manqués !'),
        preheader: t('Rappelle Loomina quand tu veux, on reprend là où on en était.', 'Rappelez Loomina quand vous voulez, on reprend là où on en était.'),
        blocks: [
            memo({ age: v.age, pose: 'g', bulle: t('Coucou ! J’ai essayé de t’appeler, mais tu n’étais pas là.', 'Coucou ! J’ai essayé de vous appeler, mais vous n’étiez pas là.') }),
            titre(t('On s’est manqués !', 'On s’est manqués !')),
            ...ps(
                v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !',
                t('Loomina a essayé de t’appeler à l’heure prévue, mais personne n’a décroché. Pas de souci !', 'Loomina a essayé de vous appeler à l’heure prévue, mais personne n’a décroché. Pas de souci !'),
                t('Rappelle quand tu veux, d’un simple appui sur le bouton : on reprend là où on en était.', 'Rappelez quand vous voulez, d’un simple appui sur le bouton : on reprend là où on en était.')
            ),
            appeler(),
            ...ps(t('Sinon, Loomina te rappellera au prochain rendez-vous.', 'Sinon, Loomina vous rappellera au prochain rendez-vous.')),
            signature(),
        ],
        optOut: v.optOut,
    });
}

/** Le SMS de l'appel manqué : le numéro en clair, pour rappeler d'un appui. */
export function appelManqueSms(firstName: string | null, tu: boolean): string {
    const hello = firstName ? `Bonjour ${firstName}` : 'Bonjour';
    return tu
        ? `${hello}, c'est Loomina. J'ai essayé de t'appeler, mais tu n'as pas pu décrocher. Rappelle-moi quand tu veux au ${SITE.phoneDisplay}, on reprend là où on en était !`
        : `${hello}, c'est Loomina. J'ai essayé de vous appeler, mais vous n'avez pas pu décrocher. Rappelez-moi quand vous voulez au ${SITE.phoneDisplay}, on reprend là où on en était !`;
}

/** Les premières phrases d'un récit en markdown, en texte simple (~45 mots). */
export function extraitRecit(markdown: string | null | undefined, mots = 45): string | null {
    if (!markdown) return null;
    const text = markdown
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('#'))
        .join(' ')
        .replace(/[*_>`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text) return null;
    const words = text.split(' ');
    if (words.length <= mots) return text;
    const cut = words.slice(0, mots).join(' ');
    const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    return end > 80 ? cut.slice(0, end + 1) : `${cut.replace(/[,;:]$/, '')}…`;
}
