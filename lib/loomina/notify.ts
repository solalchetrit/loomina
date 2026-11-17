/**
 * Prévenir : l'équipe (alertes), le client (bienvenue), la famille (nouvelles).
 *
 * Demande de Solal (17/11/2026) : toute alerte part par e-mail à
 * contact@loomina.eu ET par SMS sur son portable ; le client reçoit un
 * e-mail et un SMS de bienvenue ; la famille est tenue au courant.
 *
 * - SMS : Twilio, déjà en place (`sms.ts`).
 * - E-mail : par la boîte contact@loomina.eu elle-même (SMTP de l'hébergeur
 *   du domaine, avec nodemailer), comme l'outil d'envoi de L'Étincelle. Pas
 *   de service externe (choix de Solal, 17/11/2026). Tant que `SMTP_PASS`
 *   n'est pas posée sur Vercel, aucun e-mail ne part : on le note dans les
 *   journaux et le SMS part quand même.
 *
 * Rien ici ne lève : un message manqué ne doit jamais faire échouer une
 * commande ou le traitement d'un appel.
 */

import { sendSms } from './sms';
import { SITE } from '../../config/site';

const HOST = SITE.url.replace(/^https?:\/\//, '').replace(/^www\./, '');

/** Adresse et numéro de l'équipe pour les alertes. */
export function teamContacts(): { email: string; phone: string | null } {
    return {
        email: process.env.LOOMINA_ALERT_EMAIL?.trim() || 'contact@loomina.eu',
        phone: process.env.LOOMINA_ALERT_PHONE?.trim() || process.env.CONTACT_NOTIFY_PHONE?.trim() || null,
    };
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** La boîte d'envoi : celle de contact@loomina.eu, chez l'hébergeur du domaine. */
function smtpConfig(): { host: string; port: number; user: string; pass: string } | null {
    const pass = process.env.SMTP_PASS?.trim();
    if (!pass) return null;
    return {
        host: process.env.SMTP_HOST?.trim() || 'mail.loomina.eu',
        port: Number(process.env.SMTP_PORT?.trim() || 465),
        user: process.env.SMTP_USER?.trim() || 'contact@loomina.eu',
        pass,
    };
}

/** L'envoi d'e-mails est-il branché ? (lu par l'admin, « À surveiller ») */
export function mailConfigured(): boolean {
    return smtpConfig() !== null;
}

/** Un e-mail simple : le texte, tel quel, dans une mise en page sobre. */
export async function sendEmail(params: { to: string; subject: string; text: string; replyTo?: string }): Promise<boolean> {
    const smtp = smtpConfig();
    if (!smtp) {
        console.warn(`[mail] SMTP_PASS manquante : e-mail « ${params.subject} » non envoyé`);
        return false;
    }
    const from = process.env.LOOMINA_MAIL_FROM?.trim() || `Loomina <${smtp.user}>`;
    const html =
        '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:16px;line-height:1.6;color:#161616;max-width:560px">' +
        params.text
            .split(/\n{2,}/)
            .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
            .join('') +
        '</div>';
    try {
        // Chargé à la demande : le serveur vocal n'envoie pas d'e-mail et n'a pas ce paquet.
        const { createTransport } = await import('nodemailer');
        const transporter = createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.port === 465,
            auth: { user: smtp.user, pass: smtp.pass },
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 30_000,
        });
        await transporter.sendMail({
            from,
            to: params.to,
            subject: params.subject.slice(0, 200),
            text: params.text,
            html,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
        });
        return true;
    } catch (err) {
        console.warn('[mail] échec :', err instanceof Error ? err.message : String(err));
        return false;
    }
}

/**
 * Une alerte à l'équipe : e-mail à contact@loomina.eu et SMS au numéro
 * d'alerte. `sms` est la version courte ; sans elle, le titre suffit.
 */
export async function alertTeam(alert: { subject: string; text: string; sms?: string; replyTo?: string }): Promise<void> {
    const team = teamContacts();
    const jobs: Promise<unknown>[] = [
        sendEmail({ to: team.email, subject: `[Loomina] ${alert.subject}`, text: `${alert.text}\n\nVoir dans l'admin : ${SITE.url}/admin`, replyTo: alert.replyTo }),
    ];
    if (team.phone) jobs.push(sendSms(team.phone, `Loomina admin — ${alert.sms ?? alert.subject}`));
    else console.warn('[alerte] LOOMINA_ALERT_PHONE manquante : pas de SMS à l’équipe');
    await Promise.allSettled(jobs);
}

// ------------------------------------------------------------
// Bienvenue après la commande
// ------------------------------------------------------------

export interface Order {
    buyerEmail: string;
    /** Prénom de la personne qui racontera sa vie. */
    narratorFirstName: string;
    narratorPhone: string | null;
    isGift: boolean;
    giver: { first_name: string | null; phone: string } | null;
}

/** Les textes de bienvenue (e-mail et SMS), pour soi ou pour un livre offert. */
export function welcomeTexts(order: Order): { subject: string; email: string; sms: string; smsTo: string | null } {
    const name = order.narratorFirstName || 'votre proche';
    if (order.isGift) {
        const hello = order.giver?.first_name ? `Bonjour ${order.giver.first_name},` : 'Bonjour,';
        return {
            subject: `Le livre de ${name} peut commencer`,
            email: [
                hello,
                `Merci pour votre commande : vous venez d'offrir à ${name} le livre de sa vie.`,
                `Pour commencer, ${name} n'a qu'à appeler le ${SITE.phoneDisplay} depuis son propre téléphone, quand il ou elle le souhaite. Loomina le ou la reconnaîtra et mènera la conversation. Il n'y a rien à préparer.`,
                `Vous pouvez suivre l'avancement du livre, et souffler des souvenirs à aborder, sur ${HOST}/dashboard : connectez-vous avec votre numéro de téléphone.`,
                `Si le premier entretien ne convient pas, nous vous remboursons intégralement, sur simple demande dans les 7 jours qui suivent.`,
                `Une question ? Répondez simplement à ce message.`,
                `L'équipe Loomina`,
            ].join('\n\n'),
            sms: `Loomina : merci pour votre commande. ${name} peut commencer son livre en appelant le ${SITE.phoneDisplay} depuis son téléphone. Suivez l'avancement sur ${HOST}/dashboard`,
            smsTo: order.giver?.phone ?? null,
        };
    }
    const hello = order.narratorFirstName ? `Bonjour ${order.narratorFirstName},` : 'Bonjour,';
    return {
        subject: 'Bienvenue chez Loomina : votre livre peut commencer',
        email: [
            hello,
            `Merci pour votre commande, et bienvenue chez Loomina.`,
            `Pour commencer votre livre, appelez le ${SITE.phoneDisplay} depuis votre téléphone, quand vous le souhaitez. Loomina vous reconnaîtra et mènera la conversation. Il n'y a rien à préparer.`,
            `Après chaque appel, le récit de ce que vous avez raconté vous attend dans votre espace, sur ${HOST}/dashboard. Vous pouvez aussi y choisir des jours et une heure pour que Loomina vous appelle.`,
            `Si le premier entretien ne vous convient pas, nous vous remboursons intégralement, sur simple demande dans les 7 jours qui suivent.`,
            `Une question ? Répondez simplement à ce message.`,
            `L'équipe Loomina`,
        ].join('\n\n'),
        sms: `Bienvenue chez Loomina${order.narratorFirstName ? `, ${order.narratorFirstName}` : ''}. Pour commencer votre livre, appelez le ${SITE.phoneDisplay} depuis ce téléphone, quand vous voulez. Votre espace : ${HOST}/dashboard`,
        smsTo: order.narratorPhone,
    };
}

/** Après une commande payée : bienvenue au client, alerte à l'équipe. */
export async function notifyNewOrder(order: Order): Promise<void> {
    const w = welcomeTexts(order);
    const who = order.isGift
        ? `Livre offert à ${order.narratorFirstName || '(prénom manquant)'}${order.giver?.first_name ? ` par ${order.giver.first_name}` : ''}`
        : `Livre pour ${order.narratorFirstName || '(prénom manquant)'}`;
    await Promise.allSettled([
        sendEmail({ to: order.buyerEmail, subject: w.subject, text: w.email, replyTo: teamContacts().email }),
        w.smsTo ? sendSms(w.smsTo, w.sms) : Promise.resolve(false),
        alertTeam({
            subject: `Nouvelle commande : ${who}`,
            text: `${who}.\nE-mail de l'acheteur : ${order.buyerEmail}\nTéléphone du narrateur : ${order.narratorPhone ?? 'non renseigné'}`,
            sms: `nouvelle commande. ${who}.`,
            replyTo: order.buyerEmail,
        }),
    ]);
}

// ------------------------------------------------------------
// Nouvelles à la famille (la personne qui a offert le livre)
// ------------------------------------------------------------

export type FamilyNews = 'first_call' | 'new_story' | 'book_complete';

export function familyNewsText(kind: FamilyNews, narrator: string, storyTitle?: string): { subject: string; text: string } {
    const name = narrator || 'Votre proche';
    if (kind === 'first_call') {
        return { subject: `${name} a fait son premier appel`, text: `${name} a fait son premier appel avec Loomina : le livre est lancé.` };
    }
    if (kind === 'book_complete') {
        return { subject: `Le livre de ${name} est terminé`, text: `${name} a terminé de raconter : son livre va maintenant être préparé.` };
    }
    return {
        subject: `Un nouveau récit dans le livre de ${name}`,
        text: `Un nouveau récit vient d'être écrit dans le livre de ${name}${storyTitle ? ` : « ${storyTitle} »` : ''}.`,
    };
}

/**
 * Prévient la personne qui a offert le livre, par SMS et par e-mail.
 * Désactivable (`project_metadata.family_news === false`).
 */
export async function notifyFamily(params: {
    projectMetadata: Record<string, unknown> | null;
    narratorFirstName: string | null;
    kind: FamilyNews;
    storyTitle?: string;
}): Promise<void> {
    try {
        const meta = params.projectMetadata ?? {};
        if (meta.is_gift !== true || meta.family_news === false) return;
        const giver = meta.giver as { phone?: unknown } | undefined;
        const phone = typeof giver?.phone === 'string' ? giver.phone : null;
        const email = typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
        const news = familyNewsText(params.kind, params.narratorFirstName ?? '', params.storyTitle);
        const follow = `Suivez l'avancement sur ${HOST}/dashboard`;
        await Promise.allSettled([
            phone ? sendSms(phone, `Loomina : ${news.text} ${follow}`) : Promise.resolve(false),
            email
                ? sendEmail({ to: email, subject: news.subject, text: `Bonjour,\n\n${news.text}\n\n${follow}, en vous connectant avec votre numéro de téléphone.\n\nL'équipe Loomina` })
                : Promise.resolve(false),
        ]);
    } catch (err) {
        console.warn('[famille] nouvelles non envoyées :', err instanceof Error ? err.message : String(err));
    }
}

// ------------------------------------------------------------
// Panier abandonné
// ------------------------------------------------------------

export interface AbandonedCart {
    email: string;
    phone: string | null;
    /** Prénom de la personne qui commandait. */
    firstName: string | null;
    isGift: boolean;
    narratorFirstName: string | null;
    /** Lien Stripe qui rouvre la commande telle quelle (valable 30 jours). */
    recoveryUrl: string | null;
}

export function abandonedCartTexts(cart: AbandonedCart): { subject: string; email: string; sms: string } {
    const hello = cart.firstName ? `Bonjour ${cart.firstName},` : 'Bonjour,';
    const link = cart.recoveryUrl ?? `${SITE.url}/order`;
    const what = cart.isGift && cart.narratorFirstName ? `le livre de ${cart.narratorFirstName}` : 'votre livre';
    return {
        subject: cart.isGift && cart.narratorFirstName ? `Le livre de ${cart.narratorFirstName} vous attend` : 'Votre livre Loomina vous attend',
        email: [
            hello,
            `Vous avez commencé une commande sur Loomina sans la terminer. Si vous le souhaitez, vous pouvez la reprendre là où vous l'avez laissée :`,
            link,
            `Pour rappel : si le premier entretien ne convient pas, nous vous remboursons intégralement, sur simple demande dans les 7 jours qui suivent.`,
            `Une question avant de vous décider ? Répondez simplement à ce message, ou essayez la démonstration gratuite en appelant le ${SITE.phoneDisplay}.`,
            `Nous ne vous écrirons pas une seconde fois à ce sujet.`,
            `L'équipe Loomina`,
        ].join('\n\n'),
        sms: `Loomina : votre commande pour ${what} n'a pas été terminée. Vous pouvez la reprendre ici : ${link} Une question ? ${SITE.phoneDisplay}`,
    };
}

/** Relance unique d'une commande commencée et jamais payée : e-mail et SMS. Ne lève pas. */
export async function notifyAbandonedCart(cart: AbandonedCart): Promise<void> {
    const t = abandonedCartTexts(cart);
    await Promise.allSettled([
        sendEmail({ to: cart.email, subject: t.subject, text: t.email, replyTo: teamContacts().email }),
        cart.phone ? sendSms(cart.phone, t.sms) : Promise.resolve(false),
    ]);
}
