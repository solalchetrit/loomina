/**
 * Serveur vocal Loomina.
 *
 *   Téléphone → Twilio → POST /twilio/voice   (TwiML : brancher ConversationRelay)
 *                      → WSS  /relay          (texte dans les deux sens)
 *                      → POST /twilio/action  (fin de session)
 *                                             → rapport → site Next.js → chapitres
 *
 * Remplace Vapi. Le site, la base et la fabrication des chapitres ne
 * changent pas : le rapport de fin d'appel garde la forme Vapi.
 */

import http from 'node:http';
import { URL } from 'node:url';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';
import twilio from 'twilio';
import { config, wsUrl } from './config.ts';
import { conversationRelayTwiml, sayAndHangupTwiml } from './twiml.ts';
import { planForCaller } from './plan.ts';
import { CallSession } from './session.ts';

const sessions = new Map<string, CallSession>();

// ------------------------------------------------------------
// Outils HTTP
// ------------------------------------------------------------

async function readForm(req: http.IncomingMessage): Promise<Record<string, string>> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = Buffer.concat(chunks).toString('utf8');
    const params: Record<string, string> = {};
    for (const [k, v] of new URLSearchParams(body)) params[k] = v;
    return params;
}

function publicUrlOf(req: http.IncomingMessage): string {
    return config.publicUrl + (req.url ?? '/');
}

/** Twilio signe chaque requête avec le jeton d'authentification du compte. */
function isFromTwilio(req: http.IncomingMessage, params: Record<string, string>, url = publicUrlOf(req)): boolean {
    const signature = req.headers['x-twilio-signature'];
    if (typeof signature !== 'string') return false;
    return twilio.validateRequest(config.twilio.authToken, signature, url, params);
}

function reply(res: http.ServerResponse, status: number, body: string, type = 'text/plain; charset=utf-8'): void {
    res.writeHead(status, { 'content-type': type });
    res.end(body);
}

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------

async function handleVoice(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const params = await readForm(req);
    if (!isFromTwilio(req, params)) {
        console.warn('[voice] requête refusée : signature Twilio invalide');
        return reply(res, 403, 'forbidden');
    }

    const callSid = params.CallSid ?? '';
    const direction = params.Direction ?? 'inbound';
    const from = params.From ?? '';
    const to = params.To ?? '';
    const customer = direction.startsWith('outbound') ? to : from;

    try {
        const plan = await planForCaller(customer || null);
        const session = new CallSession({ callSid, from, to, direction, plan });
        sessions.set(callSid, session);
        console.info(`[voice] ${direction} ${callSid} → ${plan.label}`);
        reply(res, 200, conversationRelayTwiml({ welcomeGreeting: plan.firstMessage, callSid }), 'text/xml');
    } catch (err) {
        console.error('[voice] préparation impossible :', err instanceof Error ? err.message : err);
        reply(
            res,
            200,
            sayAndHangupTwiml("Bonjour, ici Loomina. Un problème technique m'empêche de vous répondre. Merci de rappeler dans quelques minutes."),
            'text/xml'
        );
    }
}

async function handleAction(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const params = await readForm(req);
    if (!isFromTwilio(req, params)) return reply(res, 403, 'forbidden');

    const callSid = params.CallSid ?? '';
    const session = sessions.get(callSid);
    if (session) {
        const status = params.SessionStatus ?? 'completed';
        const reason = status === 'completed' ? 'customer-ended-call' : status;
        await session.finish(reason);
        sessions.delete(callSid);
    }
    // Plus rien à dire : Twilio raccroche.
    reply(res, 200, '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', 'text/xml');
}

const server = http.createServer(async (req, res) => {
    try {
        const path = new URL(req.url ?? '/', config.publicUrl).pathname;
        if (req.method === 'GET' && path === '/health') {
            return reply(res, 200, JSON.stringify({ ok: true, sessions: sessions.size, model: config.openai.model }), 'application/json');
        }
        if (req.method === 'POST' && path === '/twilio/voice') return await handleVoice(req, res);
        if (req.method === 'POST' && path === '/twilio/action') return await handleAction(req, res);
        reply(res, 404, 'not found');
    } catch (err) {
        console.error('[http] erreur :', err instanceof Error ? err.message : err);
        reply(res, 500, 'internal');
    }
});

// ------------------------------------------------------------
// WebSocket ConversationRelay
// ------------------------------------------------------------

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
    const path = new URL(req.url ?? '/', config.publicUrl).pathname;
    if (path !== '/relay') {
        socket.destroy();
        return;
    }
    // Twilio signe aussi l'ouverture du WebSocket (sans paramètres).
    if (!isFromTwilio(req, {}, wsUrl())) {
        console.warn('[relay] connexion refusée : signature Twilio invalide');
        socket.destroy();
        return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});

wss.on('connection', (ws: WebSocket) => {
    let session: CallSession | null = null;

    ws.on('message', async (raw) => {
        let msg: Record<string, unknown>;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }

        switch (msg.type) {
            case 'setup': {
                const custom = (msg.customParameters as Record<string, string> | undefined) ?? {};
                const callSid = custom.callSid ?? (msg.callSid as string);
                session = sessions.get(callSid) ?? null;
                if (!session) {
                    console.warn(`[relay] setup pour un appel inconnu ${callSid}`);
                    ws.send(JSON.stringify({ type: 'end' }));
                    return;
                }
                session.attach(ws);
                break;
            }
            case 'prompt':
                await session?.onPrompt(String(msg.voicePrompt ?? ''), Boolean(msg.last));
                break;
            case 'interrupt':
                session?.onInterrupt(String(msg.utteranceUntilInterrupt ?? ''));
                break;
            case 'error':
                console.error(`[relay] erreur Twilio :`, msg.description);
                break;
            default:
                break;
        }
    });

    ws.on('close', async () => {
        if (session) {
            await session.finish('customer-ended-call');
            sessions.delete(session.callSid);
        }
    });
});

server.listen(config.port, () => {
    console.info(`[voice] prêt sur :${config.port} — WebSocket ${wsUrl()} — modèle ${config.openai.model}`);
});
