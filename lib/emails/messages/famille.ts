/**
 * 4. Les nouvelles à la famille (la personne qui a offert le livre) :
 * premier appel, nouveau récit, livre terminé. Envoyés par
 * lib/loomina/notify.ts (notifyFamily), après chaque appel.
 */
import { DASHBOARD, bouton, memo, progression, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';
import type { MemoAge } from '../memo';

export type FamilyNews = 'first_call' | 'new_story' | 'book_complete';

export interface FamilleVars {
    kind: FamilyNews;
    /** Prénom de la personne qui raconte. */
    narrator: string | null;
    /** Le titre du récit, seulement si l'auteur partage ses récits avec l'offreur. */
    storyTitle?: string;
    /** L'âge de Mémo, c'est-à-dire l'étape du livre (lib/emails/memo.ts). */
    age: MemoAge;
    /** La ligne de désinscription (lib/loomina/optout.ts), tout en bas. */
    optOut?: string | null;
}

export function familleEmail(v: FamilleVars): RenderedEmail {
    const n = v.narrator?.trim() || 'Votre proche';
    const follow = bouton('Ouvrir mon espace famille', DASHBOARD);
    const login = 'Connectez-vous avec votre numéro de téléphone.';
    if (v.kind === 'first_call') {
        return renderEmail({
            subject: `${n} a fait son premier appel !`,
            preheader: 'Le premier récit est déjà écrit.',
            blocks: [
                memo({ age: v.age, pose: 'c', bulle: `${n} et moi, on a fait connaissance. Je n’oublierai rien !` }),
                titre(`C’est parti pour le livre de ${n} !`),
                ...ps('Bonjour,', `${n} vient de faire son premier appel avec Loomina. Le premier récit est déjà écrit !`, `Une idée de souvenir à raconter ? Soufflez-la dans votre espace famille : Loomina en parlera avec ${n} au prochain appel.`),
                progression(v.age, `Le livre de ${n}`),
                follow,
                ...ps(login),
                signature(),
            ],
            optOut: v.optOut,
        });
    }
    if (v.kind === 'book_complete') {
        return renderEmail({
            subject: `${n} a terminé son livre !`,
            preheader: 'Notre équipe le relit maintenant en entier.',
            blocks: [
                memo({ age: 5, pose: 'c', bulle: `${n} a tout raconté. Je tiens son livre !` }),
                titre(`Bravo ${n} !`),
                ...ps('Bonjour,', `${n} vient de dire au téléphone que son livre est terminé. Notre équipe le relit maintenant en entier et le met en page.`, 'On vous prévient à chaque étape : relu, à l’impression, en route.'),
                progression(5, `Le livre de ${n}`),
                follow,
                signature(),
            ],
            optOut: v.optOut,
        });
    }
    return renderEmail({
        subject: `Un nouveau récit dans le livre de ${n}`,
        preheader: v.storyTitle ? `« ${v.storyTitle} » vient d’être écrit.` : 'Le livre avance !',
        blocks: [
            memo({ age: v.age, pose: 'f', bulle: v.storyTitle ? `Je viens de retenir « ${v.storyTitle} » !` : `Je viens de retenir un nouveau souvenir de ${n} !` }),
            titre(`Le livre de ${n} avance !`),
            ...ps('Bonjour,', `Un nouveau récit vient d’être écrit dans le livre de ${n}${v.storyTitle ? ` : « ${v.storyTitle} »` : ''}.`, `Une idée de souvenir à raconter ? Soufflez-la dans votre espace famille : Loomina en parlera avec ${n} au prochain appel.`),
            progression(v.age, `Le livre de ${n}`),
            follow,
            ...ps(login),
            signature(),
        ],
        optOut: v.optOut,
    });
}
