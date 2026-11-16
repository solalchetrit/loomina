/**
 * La pile de test : le VRAI serveur vocal (processus à part, comme sur
 * Render) et un récepteur qui tient la place du site pour le rapport de fin
 * d'appel. Ce récepteur reprend la branche `end-of-call-report` de
 * `app/api/vapi/webhook/route.ts` (secret, démo ignorée, archivage,
 * traitement en arrière-plan) et appelle le vrai code : `recordEvent`,
 * `processEvent`, donc le Directeur, l'Écrivain et la base.
 */

import './env';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { ROOT, VOICE_PORT, SITE_PORT, VOICE_URL, SITE_URL, FAKE_TWILIO_TOKEN, SILENCE_SECONDS, LOOMINA_NUMBER } from './env';
import { recordEvent, processEvent } from '../../../lib/loomina/events';
import { extractCallData } from '../../../lib/loomina/pipeline';
import type { PipelineOutcome, VapiMessage } from '../../../lib/loomina/pipeline';
import { checkSharedSecret } from '../../../lib/loomina/secret';

export interface Processed {
    eventId: string;
    outcome: PipelineOutcome | null;
    error: string | null;
    ms: number;
}

/** Résultat du traitement de chaque appel, par identifiant d'appel. */
const done = new Map<string, Processed>();
const waiters = new Map<string, Array<(p: Processed) => void>>();
/** Réponses du récepteur, par identifiant d'appel (pour vérifier les doublons). */
export const webhookAnswers = new Map<string, unknown[]>();

function settle(callId: string, p: Processed) {
    done.set(callId, p);
    for (const w of waiters.get(callId) ?? []) w(p);
    waiters.delete(callId);
}

/** Attend la fin du traitement (Directeur, Écrivain, base) d'un appel. */
export function waitProcessed(callId: string, timeoutMs = 300_000): Promise<Processed | null> {
    const known = done.get(callId);
    if (known) return Promise.resolve(known);
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), timeoutMs);
        const list = waiters.get(callId) ?? [];
        list.push((p) => { clearTimeout(timer); resolve(p); });
        waiters.set(callId, list);
    });
}

async function handleWebhook(req: http.IncomingMessage, res: http.ServerResponse) {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const json = (status: number, body: unknown, callId?: string | null) => {
        if (callId) webhookAnswers.set(callId, [...(webhookAnswers.get(callId) ?? []), body]);
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(body));
    };

    const provided = String(req.headers['x-vapi-secret'] ?? '');
    if (!checkSharedSecret(provided, process.env.VAPI_WEBHOOK_SECRET, 'vapi')) return json(401, { error: 'unauthorized' });

    let body: { message?: VapiMessage } & VapiMessage;
    try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
        return json(400, { error: 'invalid json' });
    }
    const message = body.message ?? body;
    if (message.type !== 'end-of-call-report') return json(200, { received: true, handled: false });

    const data = extractCallData(message);
    const metadata = message.call?.metadata ?? message.metadata ?? {};
    if (metadata.demo === true) return json(200, { received: true, demo: true, stored: false }, data.vapiCallId);

    const { id: eventId, alreadySeen } = await recordEvent({
        eventType: 'end-of-call-report',
        payload: body,
        vapiCallId: data.vapiCallId,
        projectId: data.projectId,
    });
    if (alreadySeen) return json(200, { received: true, duplicate: true }, data.vapiCallId);

    json(200, { received: true, eventId }, data.vapiCallId);

    const t0 = Date.now();
    processEvent(eventId)
        .then((outcome) => settle(data.vapiCallId ?? eventId, { eventId, outcome, error: null, ms: Date.now() - t0 }))
        .catch((err) => settle(data.vapiCallId ?? eventId, { eventId, outcome: null, error: err instanceof Error ? err.message : String(err), ms: Date.now() - t0 }));
}

let site: http.Server | null = null;
let voice: ChildProcess | null = null;

export async function startStack(logDir: string): Promise<void> {
    site = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url?.startsWith('/api/vapi/webhook')) {
            handleWebhook(req, res).catch((err) => {
                console.error('[récepteur]', err);
                if (!res.headersSent) { res.writeHead(500); res.end('internal'); }
            });
            return;
        }
        res.writeHead(404);
        res.end('not found');
    });
    await new Promise<void>((resolve) => site!.listen(SITE_PORT, resolve));

    // Rapports d'appels simulés restés en attente d'une série interrompue :
    // leurs profils n'existent plus, le serveur vocal les renverrait sans fin.
    const spool = path.join(ROOT, 'voice', 'spool');
    if (fs.existsSync(spool)) for (const f of fs.readdirSync(spool)) if (f.startsWith('CAbanc')) fs.rmSync(path.join(spool, f), { force: true });

    const log = fs.createWriteStream(path.join(logDir, 'serveur-vocal.log'));
    voice = spawn(path.join(ROOT, 'voice', 'node_modules', '.bin', 'tsx'), ['src/server.ts'], {
        cwd: path.join(ROOT, 'voice'),
        env: {
            ...process.env,
            PORT: String(VOICE_PORT),
            PUBLIC_URL: VOICE_URL,
            NEXT_BASE_URL: SITE_URL,
            // Jamais d'appel sortant ni de SMS depuis la pile de test.
            CALL_SCHEDULER: 'off',
            TWILIO_ACCOUNT_SID: 'ACbanc',
            TWILIO_AUTH_TOKEN: FAKE_TWILIO_TOKEN,
            TWILIO_PHONE_NUMBER: LOOMINA_NUMBER,
            VOICE_SILENCE_SECONDS: String(SILENCE_SECONDS),
            VAPI_WEBHOOK_SECRET: process.env.VAPI_WEBHOOK_SECRET || 'banc',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    voice.stdout?.pipe(log);
    voice.stderr?.pipe(log);
    if (!process.env.VAPI_WEBHOOK_SECRET) process.env.VAPI_WEBHOOK_SECRET = 'banc';

    for (let i = 0; i < 60; i++) {
        try {
            const r = await fetch(`${VOICE_URL}/health`);
            if (r.ok) return;
        } catch { /* pas encore prêt */ }
        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Le serveur vocal de test n'a pas démarré (voir ${path.join(logDir, 'serveur-vocal.log')})`);
}

export async function stopStack(): Promise<void> {
    voice?.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 300));
    site?.close();
}
