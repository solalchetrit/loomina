/**
 * Les enregistrements d'appel, gardés chez nous (demande de Solal, 24/11/2026 :
 * « les audios mettent énormément de temps à charger »).
 *
 * Avant : chaque lecture dans l'admin, et chaque saut dans la barre de
 * lecture, redemandait le fichier entier à Twilio, qui le convertissait en
 * MP3 mono à la volée (une dizaine de secondes pour 20 minutes d'appel).
 * Maintenant : le MP3 est copié une fois dans le seau privé `enregistrements`
 * (juste après l'appel, ou à la première écoute), puis servi par un lien
 * signé, qui démarre tout de suite et permet d'avancer où l'on veut.
 */

import { db } from '@/lib/loomina/db';

export const RECORDING_BUCKET = 'enregistrements';

export function twilioAuth(): { sid: string; header: string } | null {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    return { sid, header: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') };
}

/** Une ressource de l'API Twilio (chemin après /Accounts/{sid}), ou null. */
export async function twilioJson<T>(path: string, timeoutMs = 8000): Promise<T | null> {
    const auth = twilioAuth();
    if (!auth) return null;
    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${auth.sid}${path}`, {
            headers: { Authorization: auth.header },
            signal: AbortSignal.timeout(timeoutMs),
        });
        return res.ok ? ((await res.json()) as T) : null;
    } catch {
        return null;
    }
}

export const isRecordingSid = (v: unknown): v is string => typeof v === 'string' && /^RE[0-9a-f]{32}$/i.test(v);

/** Le fichier audio brut chez Twilio : `mp3` mono (les deux voix mêlées) ou `wav` en deux pistes. */
export async function twilioRecording(recordingSid: string, format: 'mp3' | 'wav'): Promise<Uint8Array | null> {
    const auth = twilioAuth();
    if (!auth || !isRecordingSid(recordingSid)) return null;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${auth.sid}/Recordings/${recordingSid}.${format}${format === 'mp3' ? '?RequestedChannels=1' : ''}`;
    const res = await fetch(url, { headers: { Authorization: auth.header }, signal: AbortSignal.timeout(120_000) });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
}

/**
 * Un lien signé (une heure) vers le MP3 de l'enregistrement, copié chez nous
 * au besoin. null si l'enregistrement n'existe pas chez Twilio.
 */
export async function recordingUrl(recordingSid: string): Promise<string | null> {
    if (!isRecordingSid(recordingSid)) return null;
    const path = `${recordingSid}.mp3`;
    const store = db().storage.from(RECORDING_BUCKET);
    const signed = await store.createSignedUrl(path, 3600);
    if (signed.data?.signedUrl) return signed.data.signedUrl;

    const audio = await twilioRecording(recordingSid, 'mp3');
    if (!audio) return null;
    const { error } = await store.upload(path, audio, { contentType: 'audio/mpeg', upsert: true });
    if (error) console.error(`[enregistrement] copie de ${recordingSid} impossible :`, error.message);
    const again = await store.createSignedUrl(path, 3600);
    return again.data?.signedUrl ?? null;
}

/** Copie l'enregistrement juste après l'appel, pour que la première écoute soit immédiate. Ne lève jamais. */
export async function warmRecording(recordingSid: string | null | undefined): Promise<void> {
    if (!isRecordingSid(recordingSid)) return;
    try {
        await recordingUrl(recordingSid);
    } catch (err) {
        console.error('[enregistrement] copie après l’appel :', err instanceof Error ? err.message : err);
    }
}

/** Efface la copie (démo purgée au bout de 30 jours, par exemple). Ne lève jamais. */
export async function forgetRecording(recordingSid: string | null | undefined): Promise<void> {
    if (!isRecordingSid(recordingSid)) return;
    await db().storage.from(RECORDING_BUCKET).remove([`${recordingSid}.mp3`]).catch(() => undefined);
}
