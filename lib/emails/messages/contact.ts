/**
 * Le formulaire de contact : la réponse automatique « bien reçu »
 * (app/api/contact/route.ts, demande de Solal, 25/11/2026).
 */
import { memo, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

export interface ContactRecuVars {
    name: string | null;
}

export function contactRecuEmail(v: ContactRecuVars): RenderedEmail {
    const first = v.name?.trim().split(/\s+/)[0] || null;
    return renderEmail({
        subject: 'Bien reçu, merci pour votre message !',
        preheader: 'L’équipe Loomina vous répond très vite.',
        blocks: [
            memo({ age: 1, pose: 'e', bulle: 'Votre message est bien arrivé. Je le garde précieusement !' }),
            titre(first ? `Merci ${first} !` : 'Merci !'),
            ...ps(
                'Votre message est bien arrivé. L’équipe Loomina le lit et revient vers vous très vite, en général dans la journée.',
                'Un détail à ajouter ? Répondez simplement à cet e-mail.'
            ),
            signature(),
        ],
    });
}
