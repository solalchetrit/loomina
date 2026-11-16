/**
 * Environnement de la batterie de tests. À importer EN PREMIER.
 *
 * Charge `.env.local` (mêmes clés que le site), puis neutralise tout ce qui
 * pourrait toucher une vraie personne : aucun SMS, aucun appel Twilio.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = process.cwd();

const file = path.join(ROOT, '.env.local');
if (fs.existsSync(file)) {
    for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq < 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        if (process.env[key] === undefined) process.env[key] = value;
    }
}

// Une clé OpenAI réservée aux tests (avec son propre plafond de dépense)
// met la production à l'abri : le 16/11/2026, une série a vidé les crédits
// de la clé partagée avec le serveur vocal.
if (process.env.BANC_OPENAI_API_KEY) process.env.OPENAI_API_KEY = process.env.BANC_OPENAI_API_KEY;
export const DEDICATED_KEY = Boolean(process.env.BANC_OPENAI_API_KEY);

/** Jetons consommés par le banc lui-même (narrateur et juges), par modèle. */
export const usage: Record<string, { calls: number; input: number; output: number }> = {};
export function track(model: string, u?: { prompt_tokens?: number; completion_tokens?: number } | null): void {
    const row = (usage[model] ??= { calls: 0, input: 0, output: 0 });
    row.calls += 1;
    row.input += u?.prompt_tokens ?? 0;
    row.output += u?.completion_tokens ?? 0;
}

/** Le vrai numéro Loomina, seulement comme « To » des appels simulés. */
export const LOOMINA_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+33159169357';

// Aucun SMS ne peut partir de ce processus : sans identifiant de compte,
// `sendSms` s'arrête avant tout appel réseau.
// La batterie ne déclenche pas la recomposition du livre sur le site en ligne.
process.env.LOOMINA_AUTO_BOOK = 'off';
process.env.TWILIO_ACCOUNT_SID = '';
process.env.TWILIO_AUTH_TOKEN = '';

export const VOICE_PORT = Number(process.env.BANC_VOICE_PORT ?? 8791);
export const SITE_PORT = Number(process.env.BANC_SITE_PORT ?? 8792);
export const VOICE_URL = `http://localhost:${VOICE_PORT}`;
export const SITE_URL = `http://localhost:${SITE_PORT}`;

/** Jeton Twilio factice : le simulateur signe ses requêtes avec, le serveur vocal de test les vérifie avec. */
export const FAKE_TWILIO_TOKEN = crypto.randomBytes(16).toString('hex');

/** Silence toléré par le serveur vocal de test (60 s en production). */
export const SILENCE_SECONDS = 25;

/** Accélération de la parole simulée (1 = temps réel). */
export const SPEED = Number(process.env.BANC_VITESSE ?? 6);

for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']) {
    if (!process.env[key]) {
        console.error(`Variable manquante dans .env.local : ${key}`);
        process.exit(2);
    }
}
