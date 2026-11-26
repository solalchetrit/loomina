/**
 * 7. Le remboursement, depuis la fiche client de l'admin (lib/admin/actions.ts).
 */
import { memo, ps, renderEmail, signature, titre, type RenderedEmail } from '../mise-en-page';

export interface RemboursementVars {
    firstName: string | null;
    /** Le montant réellement remboursé par Stripe, en euros. */
    amount: number;
}

/** « 199 € », « 199,50 € ». */
export function euros(amount: number): string {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).replace(/ /g, ' ')} €`;
}

export function remboursementEmail(v: RemboursementVars): RenderedEmail {
    const amount = euros(v.amount);
    return renderEmail({
        subject: 'Votre remboursement Loomina',
        preheader: `${amount} remboursés, en entier.`,
        blocks: [
            memo({ age: 1, pose: 'e', bulle: 'Merci d’avoir essayé Loomina. À bientôt, peut-être !' }),
            titre('C’est remboursé'),
            ...ps(
                v.firstName ? `Bonjour ${v.firstName},` : 'Bonjour,',
                `C’est fait : nous vous avons remboursé votre commande en entier, soit ${amount}. Selon votre banque, le montant apparaît sur votre compte sous 5 à 10 jours.`,
                'Merci d’avoir essayé Loomina. Si vous avez une minute, dites-nous en répondant à cet e-mail ce qui ne vous a pas plu : ça nous aide vraiment à faire mieux.'
            ),
            signature(),
        ],
    });
}
