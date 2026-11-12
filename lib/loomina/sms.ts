/**
 * Envoi de SMS par Twilio (API REST, sans dépendance).
 *
 * Expéditeur : `LOOMINA_SMS_FROM`. En France, un numéro fixe (01…) ne peut
 * pas envoyer de SMS ; un expéditeur alphanumérique (« Loomina ») le peut,
 * mais on ne peut pas lui répondre. Par défaut : « Loomina ».
 */

import type { Profile } from './db';
import { SITE } from '../../config/site';

export async function sendSms(to: string, body: string): Promise<boolean> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.LOOMINA_SMS_FROM?.trim() || 'Loomina';
    if (!sid || !token) {
        console.warn('[sms] TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN manquante : SMS non envoyé');
        return false;
    }
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body.slice(0, 600) }),
    });
    if (!res.ok) {
        console.warn(`[sms] refusé par Twilio (${res.status}) : ${(await res.text().catch(() => '')).slice(0, 200)}`);
        return false;
    }
    return true;
}

/** Le texte du SMS « chapitre prêt », au tutoiement ou au vouvoiement. */
export function chapterReadyText(profile: Pick<Profile, 'first_name' | 'politeness_preference'>, title: string): string {
    const tu = profile.politeness_preference === 'tu';
    const name = profile.first_name?.trim();
    const hello = name ? `Bonjour ${name}` : 'Bonjour';
    const host = SITE.url.replace(/^https?:\/\//, '');
    return tu
        ? `${hello}, ton nouveau chapitre « ${title} » est prêt. Tu peux le lire sur ${host}/dashboard. À bientôt, Loomina`
        : `${hello}, votre nouveau chapitre « ${title} » est prêt. Vous pouvez le lire sur ${host}/dashboard. À bientôt, Loomina`;
}

/**
 * Prévient le narrateur qu'un chapitre l'attend. Désactivable dans les
 * réglages (`project_metadata.sms_chapter === false`). Ne lève jamais :
 * un SMS manqué ne doit pas faire échouer le traitement d'un appel.
 */
export async function notifyChapterReady(params: {
    profile: Profile;
    projectMetadata: Record<string, unknown> | null;
    title: string;
}): Promise<void> {
    try {
        if (params.projectMetadata?.sms_chapter === false) return;
        const to = params.profile.phone_number;
        if (!to) return;
        const sent = await sendSms(to, chapterReadyText(params.profile, params.title));
        if (sent) console.info('[sms] chapitre prêt : SMS envoyé');
    } catch (err) {
        console.warn('[sms] échec :', err instanceof Error ? err.message : String(err));
    }
}
