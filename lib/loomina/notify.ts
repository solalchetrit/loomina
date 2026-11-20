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

/**
 * L'habillage commun des e-mails Loomina (demande de Solal, 19/11/2026 :
 * « un peu plus de branding, déjà le logo, quelque chose de soft »).
 * Un fond crème du site, une carte blanche, le vrai logo en tête (fichier
 * public/header-logo-trimmed.png, servi par le site), un filet ambre de la
 * couleur de l'étoile, et un pied de page discret. Des tableaux et des
 * styles en ligne : c'est ce que lisent Gmail, Outlook et Apple Mail.
 */
export function brandEmailHtml(innerHtml: string): string {
    const site = SITE.url.replace(/\/$/, '');
    return (
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>' +
        '<body style="margin:0;padding:0;background:#f7f7f4">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f4">' +
        '<tr><td align="center" style="padding:32px 16px">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">' +
        `<tr><td style="padding:0 8px 20px"><a href="${site}" style="text-decoration:none"><img src="${site}/header-logo-trimmed.png" width="128" height="37" alt="Loomina" style="display:block;border:0;width:128px;height:auto"></a></td></tr>` +
        '<tr><td style="background:#ffffff;border:1px solid #e7e6e1;border-radius:20px;padding:36px 32px 28px">' +
        '<div style="width:32px;height:3px;border-radius:3px;background:#ee9b2d;margin:0 0 24px;font-size:0;line-height:0">&nbsp;</div>' +
        '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#161616">' +
        innerHtml +
        '</div></td></tr>' +
        '<tr><td style="padding:20px 8px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#66665f">' +
        `Loomina, votre vie racontée au téléphone, jusqu’au livre.<br>${SITE.phoneDisplay} · <a href="${site}" style="color:#66665f;text-decoration:underline">${HOST}</a>` +
        '</td></tr></table></td></tr></table></body></html>'
    );
}

/** Le texte brut d'un e-mail en paragraphes HTML, pour l'habillage ci-dessus. */
export function paragraphsHtml(text: string): string {
    return text
        .split(/\n{2,}/)
        .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/** La boîte d'envoi : celle de contact@loomina.eu, chez l'hébergeur du domaine. */
function smtpConfig(): { host: string; port: number; user: string; pass: string } | null {
    const pass = process.env.SMTP_PASS?.trim();
    if (!pass) return null;
    return {
        // Le serveur d'o2switch qui héberge la boîte (réglages « SSL/TLS » du
        // compte de messagerie) : son certificat porte ce nom, pas mail.loomina.eu.
        host: process.env.SMTP_HOST?.trim() || 'epinoche.o2switch.net',
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
export async function sendEmail(params: {
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
    attachments?: { filename: string; content: Buffer; contentType: string }[];
    /** Une mise en page HTML à la place de celle tirée du texte (le texte reste la version brute). */
    html?: string;
}): Promise<boolean> {
    const smtp = smtpConfig();
    if (!smtp) {
        console.warn(`[mail] SMTP_PASS manquante : e-mail « ${params.subject} » non envoyé`);
        return false;
    }
    const from = process.env.LOOMINA_MAIL_FROM?.trim() || `Loomina <${smtp.user}>`;
    const html = params.html ?? brandEmailHtml(paragraphsHtml(params.text));
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
        const message = {
            from,
            to: params.to,
            subject: params.subject.slice(0, 200),
            text: params.text,
            html,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
            ...(params.attachments?.length ? { attachments: params.attachments } : {}),
        };
        const info = await transporter.sendMail(message);
        // Une copie dans « Envoyés », pour retrouver dans la boîte (et dans l'admin,
        // onglet Mails) ce que le site a écrit aux clients. Pas pour les alertes que
        // la boîte s'envoie à elle-même : elles sont déjà dans « Reçus ».
        if (params.to.toLowerCase() !== smtp.user.toLowerCase()) {
            try {
                const raw = await new Promise<Buffer>((resolve, reject) =>
                    createTransport({ streamTransport: true, buffer: true }).sendMail({ ...message, messageId: info.messageId, date: new Date() }, (err, r) => (err ? reject(err) : resolve(r.message as Buffer)))
                );
                const { saveToSent } = await import('../admin/mailbox');
                await saveToSent(raw);
            } catch (err) {
                console.warn('[mail] copie dans « Envoyés » impossible :', err instanceof Error ? err.message : String(err));
            }
        }
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
// Le livre est terminé : on le dit à l'auteur (demande de Solal, 20/11/2026)
// ------------------------------------------------------------

/** Délai annoncé pour la première version complète du livre. */
export const FIRST_VERSION_DELAY = 'une semaine';

export function bookCompleteTexts(author: { first_name: string | null; politeness_preference?: string | null }): { subject: string; email: string; sms: string } {
    const tu = author.politeness_preference === 'tu';
    const name = author.first_name?.trim();
    const hello = name ? `Bonjour ${name}` : 'Bonjour';
    const where = `${HOST}/dashboard`;
    return {
        subject: tu ? 'Ton livre est terminé' : 'Votre livre est terminé',
        sms: tu
            ? `${hello}, ton livre est terminé, bravo. Nous le relisons : sa première version complète t'attendra d'ici ${FIRST_VERSION_DELAY} sur ${where}, et par e-mail. Loomina`
            : `${hello}, votre livre est terminé, bravo. Nous le relisons : sa première version complète vous attendra d'ici ${FIRST_VERSION_DELAY} sur ${where}, et par e-mail. Loomina`,
        email: tu
            ? `${hello},\n\nTu l'as dit au téléphone : ton livre est terminé. Merci pour tout ce que tu as raconté.\n\nNotre équipe le relit maintenant en entier et le met en page. D'ici ${FIRST_VERSION_DELAY}, tu recevras sa première version complète par e-mail, et tu pourras aussi la lire sur ${where}, en te connectant avec ton numéro de téléphone.\n\nUn souvenir te revient entre-temps ? Appelle le ${SITE.phoneDisplay}, il rejoindra le livre.\n\nL'équipe Loomina`
            : `${hello},\n\nVous l'avez dit au téléphone : votre livre est terminé. Merci pour tout ce que vous avez raconté.\n\nNotre équipe le relit maintenant en entier et le met en page. D'ici ${FIRST_VERSION_DELAY}, vous recevrez sa première version complète par e-mail, et vous pourrez aussi la lire sur ${where}, en vous connectant avec votre numéro de téléphone.\n\nUn souvenir vous revient entre-temps ? Appelez le ${SITE.phoneDisplay}, il rejoindra le livre.\n\nL'équipe Loomina`,
    };
}

/** Prévient l'auteur, par SMS et par e-mail, que son livre est terminé. Ne lève jamais. */
export async function notifyAuthorBookComplete(author: {
    first_name: string | null;
    politeness_preference?: string | null;
    phone_number?: string | null;
    email?: string | null;
}): Promise<void> {
    try {
        const t = bookCompleteTexts(author);
        await Promise.allSettled([
            author.phone_number ? sendSms(author.phone_number, t.sms) : Promise.resolve(false),
            author.email ? sendEmail({ to: author.email, subject: t.subject, text: t.email }) : Promise.resolve(false),
        ]);
    } catch (e) {
        console.error('[notify] livre terminé, auteur non prévenu', e);
    }
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

// ------------------------------------------------------------
// Les étapes du livre après « terminé » (demande de Solal, 20/11/2026)
// ------------------------------------------------------------

export type AnnouncedStep = 'reviewed' | 'printing' | 'shipped';

/** Les messages de chaque étape, à l'auteur (tu ou vous) ou à la personne qui a offert le livre. */
export function bookStageTexts(
    step: AnnouncedStep,
    who: { first_name: string | null; politeness_preference?: string | null; family?: boolean; narratorFirstName?: string | null },
    tracking: { number: string; url: string } | null
): { subject: string; email: string; sms: string } {
    const tu = !who.family && who.politeness_preference === 'tu';
    const name = who.first_name?.trim();
    const hello = name ? `Bonjour ${name}` : 'Bonjour';
    const where = `${HOST}/dashboard`;
    const narrator = who.narratorFirstName?.trim() || 'votre proche';
    // « votre livre » / « ton livre » / « le livre de Jeanne »
    const book = who.family ? `le livre de ${narrator}` : tu ? 'ton livre' : 'votre livre';
    const Book = book.charAt(0).toUpperCase() + book.slice(1);
    const you = tu ? 'tu' : 'vous';
    const sign = `L'équipe Loomina`;

    if (step === 'reviewed') {
        if (who.family) {
            return {
                subject: `${Book} est relu`,
                sms: `Loomina : ${book} est relu. Sa version complète est à lire sur ${where}, avant son départ à l'impression.`,
                email: `${hello},\n\nNous avons relu ${book} en entier. Sa version complète est à lire sur ${where}, en vous connectant avec votre numéro de téléphone.\n\nIl part ensuite à l'impression : nous vous préviendrons à chaque étape, jusqu'à l'envoi.\n\n${sign}`,
            };
        }
        return {
            subject: `${Book} est relu : ${tu ? 'découvre-le' : 'découvrez-le'}`,
            sms: tu
                ? `${hello}, ton livre est relu. Sa version complète t'attend sur ${where}. Un détail à changer ? Appelle le ${SITE.phoneDisplay} ou réponds à notre e-mail. Ensuite, il part à l'impression. Loomina`
                : `${hello}, votre livre est relu. Sa version complète vous attend sur ${where}. Un détail à changer ? Appelez le ${SITE.phoneDisplay} ou répondez à notre e-mail. Ensuite, il part à l'impression. Loomina`,
            email: tu
                ? `${hello},\n\nNous avons relu ton livre en entier. Sa version complète t'attend sur ${where} : connecte-toi avec ton numéro de téléphone, puis ouvre « Mon livre ». Tu peux aussi l'y télécharger.\n\nPrends le temps de le lire. Un nom mal écrit, un souvenir à ajouter ? Appelle le ${SITE.phoneDisplay} ou réponds simplement à ce message.\n\nEnsuite, ton livre part à l'impression. Nous te préviendrons à chaque étape, jusqu'à son arrivée chez toi.\n\n${sign}`
                : `${hello},\n\nNous avons relu votre livre en entier. Sa version complète vous attend sur ${where} : connectez-vous avec votre numéro de téléphone, puis ouvrez « Mon livre ». Vous pouvez aussi l'y télécharger.\n\nPrenez le temps de le lire. Un nom mal écrit, un souvenir à ajouter ? Appelez le ${SITE.phoneDisplay} ou répondez simplement à ce message.\n\nEnsuite, votre livre part à l'impression. Nous vous préviendrons à chaque étape, jusqu'à son arrivée chez vous.\n\n${sign}`,
        };
    }

    if (step === 'printing') {
        return {
            subject: `${Book} est à l'impression`,
            sms: `${who.family ? 'Loomina : ' : `${hello}, `}${book} est à l'impression. ${tu ? 'Nous te prévenons' : 'Nous vous prévenons'} dès qu'il part, avec son numéro de suivi.${who.family ? '' : ' Loomina'}`,
            email: `${hello},\n\n${Book} est parti chez l'imprimeur. ${tu ? 'Nous te préviendrons' : 'Nous vous préviendrons'} dès qu'il sera expédié, avec le numéro qui permet de suivre le colis.\n\n${tu ? 'Tu peux' : 'Vous pouvez'} suivre chaque étape sur ${where}.\n\n${sign}`,
        };
    }

    const follow = tracking ? ` Suivi du colis : ${tracking.url}` : '';
    return {
        subject: `${Book} est en route`,
        sms: `${who.family ? 'Loomina : ' : `${hello}, `}${book} est en route.${tracking ? ` Numéro de suivi : ${tracking.number}.` : ''}${follow}${who.family ? '' : ' Loomina'}`,
        email: `${hello},\n\n${Book} vient de partir.${tracking ? `\n\nNuméro de suivi : ${tracking.number}\nSuivre le colis : ${tracking.url}` : ''}\n\n${who.family ? 'Il arrive à l’adresse indiquée par ' + narrator + '.' : `Il arrive à l'adresse que ${you} ${tu ? 'nous as donnée' : 'nous avez donnée'}.`} Une question ? Répondez simplement à ce message.\n\n${sign}`,
    };
}

/**
 * Annonce une étape du livre à l'auteur, et à la personne qui l'a offert
 * (si c'est un cadeau et qu'elle n'a pas coupé les nouvelles). Ne lève jamais.
 */
export async function notifyBookStage(params: {
    step: AnnouncedStep;
    author: { first_name: string | null; politeness_preference?: string | null; phone_number?: string | null; email?: string | null };
    projectMetadata: Record<string, unknown> | null;
    tracking: { number: string; url: string } | null;
}): Promise<void> {
    try {
        const jobs: Promise<unknown>[] = [];
        const t = bookStageTexts(params.step, params.author, params.tracking);
        const team = teamContacts().email;
        if (params.author.phone_number) jobs.push(sendSms(params.author.phone_number, t.sms));
        if (params.author.email) jobs.push(sendEmail({ to: params.author.email, subject: t.subject, text: t.email, replyTo: team }));

        const meta = params.projectMetadata ?? {};
        if (meta.is_gift === true && meta.family_news !== false) {
            const giver = meta.giver as { phone?: unknown; first_name?: unknown } | undefined;
            const phone = typeof giver?.phone === 'string' ? giver.phone : null;
            const email = typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
            const f = bookStageTexts(
                params.step,
                { first_name: typeof giver?.first_name === 'string' ? giver.first_name : null, family: true, narratorFirstName: params.author.first_name },
                params.tracking
            );
            if (phone && phone !== params.author.phone_number) jobs.push(sendSms(phone, f.sms));
            if (email && email !== params.author.email) jobs.push(sendEmail({ to: email, subject: f.subject, text: f.email, replyTo: team }));
        }
        await Promise.allSettled(jobs);
    } catch (err) {
        console.error('[notify] étape du livre non annoncée :', err instanceof Error ? err.message : String(err));
    }
}
