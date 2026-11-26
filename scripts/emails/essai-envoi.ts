/**
 * Essai d'envoi de bout en bout, sans toucher aux vrais clients : appelle les
 * vraies fonctions d'envoi (lib/loomina/notify.ts) vers un serveur SMTP local.
 *   SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_PASS=x JWT_SECRET=x npx -y tsx@4.19.2 --tsconfig tsconfig.json scripts/emails/essai-envoi.ts
 * Les SMS échouent sans Twilio (attendu) ; les e-mails arrivent au serveur local.
 */
import { notifyNewOrder, notifyFamily, notifyAuthorBookComplete, notifyBookStage, notifyAbandonedCart, notifyPhaseUp } from '../../lib/loomina/notify';

async function main() {
    const gift = { is_gift: true, buyer_email: 'marc@exemple.fr', giver: { first_name: 'Marc', phone: '+33600000001' } };
    const author = { first_name: 'Jeanne', politeness_preference: 'vous', phone_number: '+33600000002', email: 'jeanne@exemple.fr' };
    await notifyNewOrder({ buyerEmail: 'jeanne@exemple.fr', narratorFirstName: 'Jeanne', narratorPhone: '+33600000002', isGift: false, giver: null });
    await notifyNewOrder({ buyerEmail: 'marc@exemple.fr', narratorFirstName: 'Jeanne', narratorPhone: '+33600000002', isGift: true, giver: { first_name: 'Marc', phone: '+33600000001' } });
    for (const step of [1, 2, 3] as const) await notifyAbandonedCart({ email: 'paul@exemple.fr', firstName: 'Paul', isGift: false, narratorFirstName: null, recoveryUrl: 'https://checkout.stripe.com/c/pay/x' }, step);
    await notifyFamily({ projectMetadata: gift, narratorFirstName: 'Jeanne', kind: 'first_call', phase: 1 });
    await notifyFamily({ projectMetadata: gift, narratorFirstName: 'Jeanne', kind: 'new_story', storyTitle: 'L’arrivée à Paris', phase: 2 });
    await notifyPhaseUp({ author, projectMetadata: {}, phase: 2 });
    await notifyPhaseUp({ author, projectMetadata: gift, phase: 3 });
    await notifyAuthorBookComplete(author, {});
    await notifyFamily({ projectMetadata: gift, narratorFirstName: 'Jeanne', kind: 'book_complete', phase: 5 });
    for (const step of ['reviewed', 'printing', 'shipped'] as const)
        await notifyBookStage({ step, author, projectMetadata: gift, tracking: { number: '6A123', url: 'https://www.laposte.fr/outils/suivre-vos-envois?code=6A123' } });
}
main().then(() => console.log('fini'));
