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
import { magicLink } from './magic-link';
import { SITE } from '../../config/site';
import { familyAudience } from './giver';
// Les e-mails clients : un modèle par e-mail, rangés dans lib/emails (25/11/2026).
import { bienvenueEmail, bienvenueCadeauEmail } from '../emails/messages/commande';
import { familleEmail } from '../emails/messages/famille';
import { panierEmail } from '../emails/messages/panier';
import { livreTermineEmail, etapeLivreEmail, livreRecuEmail, FIRST_VERSION_DELAY } from '../emails/messages/livre';
import { memoAge } from '../emails/memo';
import { etapeSuivanteEmail } from '../emails/messages/ecriture';

export { FIRST_VERSION_DELAY };

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

/** Les liens « loomina.eu/dashboard » d'un e-mail, en lien de connexion directe pour ce numéro. */
export function personalizeLinks(phone: string | null | undefined, body: string): string {
    if (!phone) return body;
    const link = magicLink(phone);
    if (link.endsWith('/dashboard')) return body;
    return body.replace(new RegExp(`(?:https?://)?(?:www\\.)?${HOST.replace(/[.]/g, '\\.')}/dashboard(?![\\w/])`, 'g'), `https://${link}`);
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
    /** En-têtes en plus (List-Unsubscribe des relances). */
    headers?: Record<string, string>;
    /**
     * Le numéro du destinataire, s'il a un espace : chaque bouton vers
     * loomina.eu/dashboard devient un lien de connexion directe pour ce numéro,
     * comme dans les SMS (lib/loomina/magic-link.ts).
     */
    loginPhone?: string | null;
}): Promise<boolean> {
    const smtp = smtpConfig();
    if (!smtp) {
        console.warn(`[mail] SMTP_PASS manquante : e-mail « ${params.subject} » non envoyé`);
        return false;
    }
    const from = process.env.LOOMINA_MAIL_FROM?.trim() || `Loomina <${smtp.user}>`;
    const direct = (s: string) => personalizeLinks(params.loginPhone, s);
    const html = direct(params.html ?? brandEmailHtml(paragraphsHtml(params.text)));
    params = { ...params, text: direct(params.text) };
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
            ...(params.headers && Object.keys(params.headers).length ? { headers: params.headers } : {}),
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
    /** Exemplaires en plus du livre de l'auteur, pris à la commande. */
    extraCopies?: number;
}

/** Les textes de bienvenue (e-mail et SMS), pour soi ou pour un livre offert. */
export function welcomeTexts(order: Order): { subject: string; email: string; html: string; sms: string; smsTo: string | null } {
    const name = order.narratorFirstName || 'votre proche';
    if (order.isGift) {
        const mail = bienvenueCadeauEmail({ narratorFirstName: order.narratorFirstName, giverFirstName: order.giver?.first_name ?? null });
        return {
            subject: mail.subject,
            email: mail.text,
            html: mail.html,
            // Le lien de l'espace devient un lien de connexion directe à l'envoi (lib/loomina/sms.ts).
            sms: `Loomina : merci pour votre commande ! Rien n'a été envoyé à ${name}, la surprise est intacte. Choisissez le jour où ${name} découvre son cadeau (maintenant ou le jour J) dans votre espace famille : ${HOST}/dashboard`,
            smsTo: order.giver?.phone ?? null,
        };
    }
    const mail = bienvenueEmail({ narratorFirstName: order.narratorFirstName });
    return {
        subject: mail.subject,
        email: mail.text,
        html: mail.html,
        sms: `Bienvenue chez Loomina${order.narratorFirstName ? `, ${order.narratorFirstName}` : ''}. Loomina est prêt pour vous : appelez le ${SITE.phoneDisplay} depuis ce téléphone, quand vous voulez, pour commencer votre livre. Votre espace : ${HOST}/dashboard`,
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
        sendEmail({ to: order.buyerEmail, subject: w.subject, text: w.email, html: w.html, replyTo: teamContacts().email, loginPhone: order.isGift ? order.giver?.phone : order.narratorPhone }),
        w.smsTo ? sendSms(w.smsTo, w.sms) : Promise.resolve(false),
        alertTeam({
            subject: `Nouvelle commande : ${who}`,
            text: `${who}.\nE-mail de l'acheteur : ${order.buyerEmail}\nTéléphone du narrateur : ${order.narratorPhone ?? 'non renseigné'}${order.extraCopies ? `\nExemplaires en plus : ${order.extraCopies}` : ''}`,
            sms: `nouvelle commande. ${who}.${order.extraCopies ? ` + ${order.extraCopies} ex.` : ''}`,
            replyTo: order.buyerEmail,
        }),
    ]);
}

// ------------------------------------------------------------
// Le livre est terminé : on le dit à l'auteur (demande de Solal, 20/11/2026)
// ------------------------------------------------------------

export function bookCompleteTexts(author: { first_name: string | null; politeness_preference?: string | null }): { subject: string; email: string; html: string; sms: string } {
    const tu = author.politeness_preference === 'tu';
    const name = author.first_name?.trim();
    const hello = name ? `Bonjour ${name}` : 'Bonjour';
    const where = `${HOST}/dashboard`;
    const mail = livreTermineEmail({ firstName: name || null, tu });
    return {
        subject: mail.subject,
        sms: tu
            ? `${hello}, ton livre est terminé, bravo ! Nous le relisons : sa première version complète t'attendra d'ici ${FIRST_VERSION_DELAY} sur ${where}, et par e-mail. Loomina`
            : `${hello}, votre livre est terminé, bravo ! Nous le relisons : sa première version complète vous attendra d'ici ${FIRST_VERSION_DELAY} sur ${where}, et par e-mail. Loomina`,
        email: mail.text,
        html: mail.html,
    };
}

/**
 * L'adresse e-mail de l'auteur lui-même, ou null. Pour un livre offert, le compte
 * porte l'adresse de la personne qui a offert (ou un alias « +numéro » qui arrive
 * dans sa boîte) : un e-mail « Bonjour Jeanne » partirait chez elle. L'auteur est
 * alors prévenu par SMS, et la personne qui a offert reçoit son propre message.
 */
export function authorOwnEmail(author: { email?: string | null }, projectMetadata?: Record<string, unknown> | null): string | null {
    if (projectMetadata?.is_gift === true) return null;
    return author.email?.trim() || null;
}

/** Prévient l'auteur, par SMS et par e-mail, que son livre est terminé. Ne lève jamais. */
export async function notifyAuthorBookComplete(
    author: {
        first_name: string | null;
        politeness_preference?: string | null;
        phone_number?: string | null;
        email?: string | null;
    },
    projectMetadata?: Record<string, unknown> | null
): Promise<void> {
    try {
        const t = bookCompleteTexts(author);
        const email = authorOwnEmail(author, projectMetadata);
        await Promise.allSettled([
            author.phone_number ? sendSms(author.phone_number, t.sms) : Promise.resolve(false),
            email ? sendEmail({ to: email, subject: t.subject, text: t.email, html: t.html, loginPhone: author.phone_number }) : Promise.resolve(false),
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
    /** L'étape du livre, pour Mémo dans l'e-mail. */
    phase?: number | null;
}): Promise<void> {
    try {
        const meta = params.projectMetadata ?? {};
        if (meta.family_news === false) return;
        // Celui qui a offert le livre, et les autres proches ajoutés (lib/loomina/giver.ts).
        const phones = familyAudience(meta).map((p) => p.phone);
        const email = meta.is_gift === true && typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
        if (!phones.length && !email) return;
        const news = familyNewsText(params.kind, params.narratorFirstName ?? '', params.storyTitle);
        const follow = `Suivez l'avancement sur ${HOST}/dashboard`;
        // Les nouvelles sont des e-mails « en plus » : la désinscription les arrête (25/11/2026).
        const { optOutLine, optOutHeaders, isOptedOut } = await import('./optout');
        const mailTo = email && !(await isOptedOut(email)) ? email : null;
        const mail = familleEmail({ kind: params.kind, narrator: params.narratorFirstName, storyTitle: params.storyTitle, age: memoAge(params.phase, params.kind === 'book_complete'), optOut: mailTo ? optOutLine(mailTo) : null });
        const giverPhone = familyAudience(meta).find((p) => p.giver)?.phone ?? null;
        await Promise.allSettled([
            ...phones.map((phone) => sendSms(phone, `Loomina : ${news.text} ${follow}`)),
            mailTo ? sendEmail({ to: mailTo, subject: mail.subject, text: mail.text, html: mail.html, headers: optOutHeaders(mailTo), loginPhone: giverPhone }) : Promise.resolve(false),
        ]);
    } catch (err) {
        console.warn('[famille] nouvelles non envoyées :', err instanceof Error ? err.message : String(err));
    }
}

/** Le SMS qui ouvre l'espace famille à un proche ajouté. */
export function familyInviteSms(params: { firstName: string | null; narratorFirstName: string | null; invitedBy: string | null }): string {
    const hello = params.firstName ? `Bonjour ${params.firstName}, ` : 'Bonjour, ';
    const narrator = params.narratorFirstName?.trim() || 'votre proche';
    const by = params.invitedBy?.trim() ? `${params.invitedBy.trim()} vous invite` : 'Loomina vous invite';
    // Le lien devient un lien de connexion directe pour ce numéro à l'envoi (lib/loomina/sms.ts).
    return `Loomina : ${hello}Loomina est prêt pour vous. ${by} à suivre l'histoire de ${narrator}, racontée au téléphone. Votre espace famille : ${HOST}/dashboard`;
}

/** Prévient un proche qu'il a accès à l'espace famille. Ne lève jamais. */
export async function notifyFamilyInvite(params: { phone: string; firstName: string | null; narratorFirstName: string | null; invitedBy: string | null }): Promise<boolean> {
    try {
        return await sendSms(params.phone, familyInviteSms(params));
    } catch (err) {
        console.warn('[famille] invitation non envoyée :', err instanceof Error ? err.message : String(err));
        return false;
    }
}

// ------------------------------------------------------------
// Panier abandonné
// ------------------------------------------------------------

export interface AbandonedCart {
    email: string;
    /** Prénom de la personne qui commandait. */
    firstName: string | null;
    isGift: boolean;
    narratorFirstName: string | null;
    /** Lien Stripe qui rouvre la commande telle quelle (valable 30 jours). */
    recoveryUrl: string | null;
}

/** Les trois relances d'un panier abandonné : à l'expiration, deux jours après, cinq jours après. */
export type CartStep = 1 | 2 | 3;

/**
 * Les trois e-mails d'un panier abandonné (demande de Solal, 23/11/2026 :
 * plus de SMS, trois e-mails sur la semaine). Modèle : lib/emails/messages/panier.ts.
 */
export function abandonedCartTexts(cart: AbandonedCart, step: CartStep = 1, optOut: string | null = null): { subject: string; email: string; html: string } {
    const mail = panierEmail({ firstName: cart.firstName, isGift: cart.isGift, narratorFirstName: cart.narratorFirstName, recoveryUrl: cart.recoveryUrl, optOut }, step);
    return { subject: mail.subject, email: mail.text, html: mail.html };
}

/** Une relance de panier abandonné, par e-mail seulement, avec le lien pour ne plus en recevoir. Ne lève pas. */
export async function notifyAbandonedCart(cart: AbandonedCart, step: CartStep = 1): Promise<boolean> {
    const { optOutLine, optOutHeaders } = await import('./optout');
    const t = abandonedCartTexts(cart, step, optOutLine(cart.email));
    return sendEmail({
        to: cart.email,
        subject: t.subject,
        text: t.email,
        html: t.html,
        replyTo: teamContacts().email,
        headers: optOutHeaders(cart.email),
    }).catch(() => false);
}

// ------------------------------------------------------------
// Les étapes du livre après « terminé » (demande de Solal, 20/11/2026)
// ------------------------------------------------------------

export type AnnouncedStep = 'reviewed' | 'printing' | 'shipped' | 'delivered';

/** Les messages de chaque étape, à l'auteur (tu ou vous) ou à la personne qui a offert le livre. */
export function bookStageTexts(
    step: AnnouncedStep,
    who: { first_name: string | null; politeness_preference?: string | null; family?: boolean; narratorFirstName?: string | null },
    tracking: { number: string; url: string } | null
): { subject: string; email: string; html: string; sms: string } {
    const tu = !who.family && who.politeness_preference === 'tu';
    const name = who.first_name?.trim();
    const hello = name ? `Bonjour ${name}` : 'Bonjour';
    const where = `${HOST}/dashboard`;
    const narrator = who.narratorFirstName?.trim() || 'votre proche';
    // « votre livre » / « ton livre » / « le livre de Jeanne »
    const book = who.family ? `le livre de ${narrator}` : tu ? 'ton livre' : 'votre livre';
    if (step === 'delivered') {
        // Le livre est arrivé (25/11/2026) : merci, et un avis.
        const recu = livreRecuEmail({ firstName: name || null, tu, family: who.family ? { narrator: who.narratorFirstName ?? null } : undefined, reviewUrl: process.env.LOOMINA_REVIEW_URL?.trim() || null });
        const sms = who.family
            ? `Loomina : ${book} est arrivé ! Merci de nous avoir confié ses souvenirs. Il vous plaît ? Dites-le-nous à contact@loomina.eu, on lit tout.`
            : tu
              ? `${hello}, ton livre est arrivé ! Merci pour tous ces souvenirs partagés. Il te plaît ? Dis-le-nous à contact@loomina.eu, on lit tout. Loomina`
              : `${hello}, votre livre est arrivé ! Merci pour tous ces souvenirs partagés. Il vous plaît ? Dites-le-nous à contact@loomina.eu, on lit tout. Loomina`;
        return { subject: recu.subject, email: recu.text, html: recu.html, sms };
    }
    const mail = etapeLivreEmail({ step, firstName: name || null, tu, family: !!who.family, narratorFirstName: who.narratorFirstName ?? null, tracking });
    const out = (sms: string) => ({ subject: mail.subject, email: mail.text, html: mail.html, sms });

    if (step === 'reviewed') {
        if (who.family) return out(`Loomina : ${book} est relu ! Sa version complète est à lire sur ${where}, avant son départ à l'impression.`);
        return out(
            tu
                ? `${hello}, ton livre est relu ! Sa version complète t'attend sur ${where}. Un détail à changer ? Appelle le ${SITE.phoneDisplay}. Ensuite, il part à l'impression. Loomina`
                : `${hello}, votre livre est relu ! Sa version complète vous attend sur ${where}. Un détail à changer ? Appelez le ${SITE.phoneDisplay}. Ensuite, il part à l'impression. Loomina`
        );
    }
    if (step === 'printing') {
        return out(`${who.family ? 'Loomina : ' : `${hello}, `}${book} est à l'impression ! ${tu ? 'Nous te prévenons' : 'Nous vous prévenons'} dès qu'il part, avec son numéro de suivi.${who.family ? '' : ' Loomina'}`);
    }
    const follow = tracking ? ` Suivi du colis : ${tracking.url}` : '';
    return out(`${who.family ? 'Loomina : ' : `${hello}, `}${book} est en route !${tracking ? ` Numéro de suivi : ${tracking.number}.` : ''}${follow}${who.family ? '' : ' Loomina'}`);
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
        const meta = params.projectMetadata ?? {};
        const authorEmail = authorOwnEmail(params.author, meta);
        if (params.author.phone_number) jobs.push(sendSms(params.author.phone_number, t.sms));
        if (authorEmail) jobs.push(sendEmail({ to: authorEmail, subject: t.subject, text: t.email, html: t.html, replyTo: team, loginPhone: params.author.phone_number }));

        if (meta.family_news !== false) {
            // Celui qui a offert le livre, et les autres proches ajoutés (lib/loomina/giver.ts).
            for (const person of familyAudience(meta)) {
                if (person.phone === params.author.phone_number) continue;
                const f = bookStageTexts(params.step, { first_name: person.firstName, family: true, narratorFirstName: params.author.first_name }, params.tracking);
                jobs.push(sendSms(person.phone, f.sms));
                const email = person.giver && meta.is_gift === true && typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
                if (email && email !== authorEmail) jobs.push(sendEmail({ to: email, subject: f.subject, text: f.email, html: f.html, replyTo: team, loginPhone: person.phone }));
            }
        }
        await Promise.allSettled(jobs);
    } catch (err) {
        console.error('[notify] étape du livre non annoncée :', err instanceof Error ? err.message : String(err));
    }
}

// ------------------------------------------------------------
// Le livre passe à l'étape suivante : Mémo grandit (demande de Solal, 25/11/2026)
// ------------------------------------------------------------

/**
 * Prévient par e-mail que le livre change d'étape : l'auteur si l'adresse du
 * compte est la sienne, et celui qui a offert le livre (sauf s'il a coupé les
 * nouvelles). Pas de SMS : le SMS « récit prêt » part déjà après l'appel. Ne lève jamais.
 */
export async function notifyPhaseUp(params: {
    author: { first_name: string | null; politeness_preference?: string | null; email?: string | null; phone_number?: string | null };
    projectMetadata: Record<string, unknown> | null;
    /** La nouvelle étape (2, 3 ou 4). */
    phase: number;
    /** Le récit écrit à cet appel : l'e-mail de l'auteur en parle (il remplace « ton récit est écrit »). */
    recitTitle?: string | null;
}): Promise<void> {
    try {
        if (params.phase !== 2 && params.phase !== 3 && params.phase !== 4) return;
        const age = params.phase as 2 | 3 | 4;
        const meta = params.projectMetadata ?? {};
        const team = teamContacts().email;
        const jobs: Promise<unknown>[] = [];
        // E-mail « en plus » : la désinscription l'arrête (25/11/2026).
        const { optOutLine, optOutHeaders, isOptedOut } = await import('./optout');
        const authorEmail = authorOwnEmail(params.author, meta);
        if (authorEmail && !(await isOptedOut(authorEmail))) {
            const m = etapeSuivanteEmail({ firstName: params.author.first_name, tu: params.author.politeness_preference === 'tu', age, optOut: optOutLine(authorEmail), recit: params.recitTitle ?? null });
            jobs.push(sendEmail({ to: authorEmail, subject: m.subject, text: m.text, html: m.html, replyTo: team, headers: optOutHeaders(authorEmail), loginPhone: params.author.phone_number }));
        }
        const giverEmail = meta.is_gift === true && meta.family_news !== false && typeof meta.buyer_email === 'string' ? meta.buyer_email : null;
        if (giverEmail && giverEmail !== authorEmail && !(await isOptedOut(giverEmail))) {
            const giver = familyAudience(meta).find((p) => p.giver);
            const m = etapeSuivanteEmail({ firstName: giver?.firstName ?? null, tu: false, age, family: { narrator: params.author.first_name }, optOut: optOutLine(giverEmail) });
            jobs.push(sendEmail({ to: giverEmail, subject: m.subject, text: m.text, html: m.html, replyTo: team, headers: optOutHeaders(giverEmail), loginPhone: giver?.phone }));
        }
        await Promise.allSettled(jobs);
    } catch (err) {
        console.error('[notify] nouvelle étape non annoncée :', err instanceof Error ? err.message : String(err));
    }
}
