/**
 * 1. La démo gratuite : le récit en PDF avec le code de réduction, puis le
 * rappel deux jours avant la fin du code. Envoyés par lib/loomina/demo-story.ts.
 */
import { SITE } from '../../../config/site';
import { DEMO_PROMO } from '../../../config/offer';
import { HOST, bouton, encadre, memo, petit, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

/** « 1er décembre », « 3 décembre », avec des espaces insécables. */
export function frenchDay(d: Date): string {
    return d
        .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
        .replace(/^1 /, '1er ')
        .replace(/ /g, ' ');
}

export interface DemoRecitVars {
    firstName: string | null;
    /** Le titre du récit écrit pendant la démo. */
    title: string;
    /** Le code personnel et sa vraie date de fin, ou null si Stripe l'a refusé. */
    promo: { code: string; expires: Date } | null;
    /** Le pourcentage de réduction (config/offer.ts). */
    percentOff?: number;
}

/** Le récit de la démo, avec le PDF en pièce jointe (ajoutée par l'envoi). */
export function demoRecitEmail(v: DemoRecitVars): RenderedEmail & { orderUrl: string } {
    const pct = v.percentOff ?? DEMO_PROMO.percentOff;
    const orderUrl = `https://${HOST}/order${v.promo ? `?code=${v.promo.code}` : ''}`;
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const mail = renderEmail({
        subject: `Votre récit est prêt : « ${v.title} »`,
        preheader: 'Votre souvenir, écrit et mis en page comme dans un vrai livre.',
        blocks: [
            memo({ age: 1, pose: 'f', bulle: `J’ai retenu « ${v.title} ». Je ne l’oublierai pas !` }),
            titre('Votre souvenir est devenu un récit'),
            ...ps(
                hello,
                `Voici « ${v.title} », écrit par Loomina à partir de notre conversation au téléphone. Il est en pièce jointe, mis en page exactement comme il le serait dans votre livre.`,
                'Ce n’était qu’un souvenir. Imaginez votre vie entière, appel après appel, dans un livre à garder et à offrir à ceux que vous aimez.'
            ),
            ...(v.promo ? [encadre([`Votre cadeau : -${pct} % sur votre livre.`, `Déjà appliqué sur le bouton ci-dessous, jusqu’au ${frenchDay(v.promo.expires)}.`])] : []),
            bouton('Écrire mon livre', orderUrl),
            ...ps('À très vite !'),
            signature(),
        ],
    });
    return { ...mail, orderUrl };
}

export interface DemoRappelVars {
    firstName: string | null;
    title: string;
    code: string;
    expires: Date;
    /** Le lien du récit s'il est encore en ligne (30 jours), sinon null. */
    storyUrl: string | null;
    /** La ligne de désinscription (lib/loomina/optout.ts). */
    optOut: string | null;
    percentOff?: number;
}

/** Deux jours avant la fin du code de la démo. */
export function demoRappelEmail(v: DemoRappelVars): RenderedEmail & { orderUrl: string } {
    const pct = v.percentOff ?? DEMO_PROMO.percentOff;
    const until = frenchDay(v.expires);
    const orderUrl = `https://${HOST}/order?code=${v.code}`;
    const hello = v.firstName ? `Bonjour ${v.firstName} !` : 'Bonjour !';
    const mail = renderEmail({
        subject: `Votre -${pct} % se termine le ${until}`,
        preheader: `On écrit la suite de « ${v.title} » ensemble ?`,
        blocks: [
            memo({ age: 1, pose: 'g', bulle: `J’ai toujours « ${v.title} » en mémoire. On écrit la suite ?` }),
            titre('Plus que deux jours pour votre réduction'),
            ...ps(
                hello,
                `Il y a quelques jours, vous avez raconté « ${v.title} » à Loomina. Votre réduction de ${pct} % pour écrire tout votre livre se termine le ${until}.`,
                'Elle est déjà appliquée sur ce bouton :'
            ),
            bouton('Écrire mon livre', orderUrl),
            ...ps(v.storyUrl ? `Envie de relire votre récit ? Il est toujours ici : ${v.storyUrl}` : null, `Une question ? Appelez le ${SITE.phoneDisplay} ou répondez à cet e-mail.`),
            signature(),
            ...petit(v.optOut),
        ],
    });
    return { ...mail, orderUrl };
}
