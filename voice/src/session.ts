/**
 * Une session = un appel. Elle tient l'historique de la conversation,
 * interroge le modèle en flux et renvoie les phrases à Twilio au fur et
 * à mesure, gère les interruptions, les silences, la durée maximale, et
 * fabrique le rapport de fin d'appel.
 *
 * Messages ConversationRelay reçus : setup, prompt, interrupt, error.
 * Messages envoyés : text (token, last), end.
 */

import type { WebSocket } from 'ws';
import OpenAI from 'openai';
import { config } from './config.ts';
import type { CallPlan } from './plan.ts';
import { buildEndOfCallReport, postEndOfCallReport } from './report.ts';
import type { TurnRecord } from './report.ts';

const END_MARKER = '##END_CALL##';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface SessionInit {
    callSid: string;
    from: string;
    to: string;
    direction: string;
    plan: CallPlan;
}

export class CallSession {
    readonly callSid: string;
    readonly from: string;
    readonly to: string;
    readonly direction: string;
    readonly plan: CallPlan;
    readonly startedAt = new Date();

    private ws: WebSocket | null = null;
    private readonly openai = new OpenAI({ apiKey: config.openai.apiKey });
    private readonly turns: TurnRecord[] = [];
    private readonly modelLatenciesMs: number[] = [];
    private promptTokens = 0;
    private completionTokens = 0;
    private interruptions = 0;

    private generation: AbortController | null = null;
    private silenceTimer: NodeJS.Timeout | null = null;
    private maxTimer: NodeJS.Timeout | null = null;
    private silenceNudged = false;
    private finished = false;
    private endRequested = false;

    constructor(init: SessionInit) {
        this.callSid = init.callSid;
        this.from = init.from;
        this.to = init.to;
        this.direction = init.direction;
        this.plan = init.plan;
    }

    // ------------------------------------------------------------
    // Cycle de vie
    // ------------------------------------------------------------

    attach(ws: WebSocket): void {
        this.ws = ws;
        // La première phrase est dite par Twilio (welcomeGreeting) ; on la
        // garde dans l'historique pour que le modèle sache ce qu'il a dit.
        if (this.plan.firstMessage) {
            this.turns.push({ role: 'bot', message: this.plan.firstMessage, time: Date.now() });
        }
        this.armSilenceTimer();
        this.maxTimer = setTimeout(() => {
            console.info(`[${this.callSid}] durée maximale atteinte`);
            void this.sayAndEnd("Nous avons bien travaillé aujourd'hui. Reprenons la prochaine fois. À bientôt !", 'max-duration');
        }, this.plan.maxSeconds * 1000);
    }

    async onPrompt(text: string, last: boolean): Promise<void> {
        if (!last || this.finished) return;
        const clean = text.trim();
        if (!clean) return;

        this.armSilenceTimer();
        this.turns.push({ role: 'user', message: clean, time: Date.now() });
        this.abortGeneration();
        await this.generate();
    }

    onInterrupt(utteranceUntilInterrupt: string): void {
        this.interruptions += 1;
        this.abortGeneration();
        // Ne garder que ce que le narrateur a réellement entendu.
        const lastBot = [...this.turns].reverse().find((t) => t.role === 'bot');
        if (lastBot && utteranceUntilInterrupt) {
            lastBot.message = utteranceUntilInterrupt.trim();
        }
    }

    /** Fin de session, quelle qu'en soit la cause. Idempotent. */
    async finish(reason: string): Promise<void> {
        if (this.finished) return;
        this.finished = true;
        this.abortGeneration();
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (this.maxTimer) clearTimeout(this.maxTimer);

        const endedAt = new Date();
        const seconds = Math.round((endedAt.getTime() - this.startedAt.getTime()) / 1000);
        console.info(
            `[${this.callSid}] fin (${reason}) — ${seconds}s, ${this.turns.length} tours, ` +
            `latence modèle moy. ${avg(this.modelLatenciesMs)} ms, ${this.interruptions} interruption(s)`
        );

        if (this.plan.demo) {
            console.info(`[${this.callSid}] démo : rien n'est conservé`);
            return;
        }

        const report = buildEndOfCallReport({
            callSid: this.callSid,
            from: this.from,
            to: this.to,
            direction: this.direction,
            startedAt: this.startedAt,
            endedAt,
            endedReason: reason,
            turns: this.turns,
            metadata: this.plan.metadata,
            modelLatenciesMs: this.modelLatenciesMs,
            promptTokens: this.promptTokens,
            completionTokens: this.completionTokens,
            interruptions: this.interruptions,
        });

        try {
            await postEndOfCallReport(report);
            console.info(`[${this.callSid}] rapport envoyé au site`);
        } catch (err) {
            console.error(`[${this.callSid}] rapport NON envoyé :`, err instanceof Error ? err.message : err);
        }
    }

    // ------------------------------------------------------------
    // Génération
    // ------------------------------------------------------------

    private async generate(): Promise<void> {
        const controller = new AbortController();
        this.generation = controller;
        const t0 = Date.now();
        let firstTokenAt: number | null = null;
        let spoken = '';
        let pending = '';

        try {
            const stream = await this.openai.chat.completions.create(
                {
                    model: config.openai.model,
                    temperature: 0.6,
                    max_tokens: 300,
                    stream: true,
                    stream_options: { include_usage: true },
                    messages: this.chatMessages(),
                },
                { signal: controller.signal }
            );

            for await (const chunk of stream) {
                if (controller.signal.aborted) break;
                if (chunk.usage) {
                    this.promptTokens += chunk.usage.prompt_tokens ?? 0;
                    this.completionTokens += chunk.usage.completion_tokens ?? 0;
                }
                const delta = chunk.choices?.[0]?.delta?.content ?? '';
                if (!delta) continue;
                if (firstTokenAt === null) {
                    firstTokenAt = Date.now();
                    this.modelLatenciesMs.push(firstTokenAt - t0);
                }
                pending += delta;

                // Le marqueur de fin peut arriver en plusieurs morceaux :
                // on ne lit à voix haute que ce qui précède.
                const idx = pending.indexOf(END_MARKER);
                if (idx >= 0) {
                    this.endRequested = true;
                    const before = pending.slice(0, idx);
                    if (before) { this.sendText(before, false); spoken += before; }
                    pending = '';
                    break;
                }
                // Garder un éventuel début de marqueur ("##END") en attente.
                const keep = partialMarkerLength(pending);
                const emit = pending.slice(0, pending.length - keep);
                if (emit) { this.sendText(emit, false); spoken += emit; }
                pending = pending.slice(pending.length - keep);
            }

            if (controller.signal.aborted) return;
            if (pending && !pending.includes('#')) { this.sendText(pending, false); spoken += pending; }
            this.sendText('', true);
        } catch (err) {
            if (controller.signal.aborted) return;
            console.error(`[${this.callSid}] erreur modèle :`, err instanceof Error ? err.message : err);
            const fallback = "Pardon, je n'ai pas bien entendu. Pouvez-vous répéter ?";
            this.sendText(fallback, true);
            spoken = fallback;
        } finally {
            if (this.generation === controller) this.generation = null;
        }

        if (spoken.trim()) {
            this.turns.push({ role: 'bot', message: spoken.trim(), time: Date.now() });
        }

        if (this.endRequested) {
            // Laisser la voix finir la phrase d'au revoir avant de couper.
            const ms = Math.min(12000, 1500 + spoken.length * 60);
            setTimeout(() => void this.end('assistant-ended-call'), ms);
        }
    }

    private chatMessages(): ChatMessage[] {
        const history: ChatMessage[] = this.turns.map((t) => ({
            role: t.role === 'bot' ? 'assistant' : 'user',
            content: t.message,
        }));
        return [{ role: 'system', content: this.plan.systemPrompt }, ...history];
    }

    private abortGeneration(): void {
        if (this.generation) {
            this.generation.abort();
            this.generation = null;
        }
    }

    // ------------------------------------------------------------
    // Silence et fin
    // ------------------------------------------------------------

    private armSilenceTimer(): void {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceNudged = false;
        this.silenceTimer = setTimeout(() => void this.onSilence(), config.limits.silenceSeconds * 1000);
    }

    private async onSilence(): Promise<void> {
        if (this.finished) return;
        if (!this.silenceNudged) {
            this.silenceNudged = true;
            const nudge = 'Je suis toujours là. Prenez votre temps.';
            this.sendText(nudge, true);
            this.turns.push({ role: 'bot', message: nudge, time: Date.now() });
            this.silenceTimer = setTimeout(() => void this.onSilence(), config.limits.silenceSeconds * 1000);
            return;
        }
        await this.sayAndEnd('Je vous laisse. Rappelez-moi quand vous voulez, je serai là. À bientôt !', 'silence-timeout');
    }

    private async sayAndEnd(text: string, reason: string): Promise<void> {
        if (this.finished) return;
        this.abortGeneration();
        this.sendText(text, true);
        this.turns.push({ role: 'bot', message: text, time: Date.now() });
        setTimeout(() => void this.end(reason), 1500 + text.length * 60);
    }

    private async end(reason: string): Promise<void> {
        if (this.finished) return;
        this.send({ type: 'end' });
        await this.finish(reason);
    }

    // ------------------------------------------------------------
    // Transport
    // ------------------------------------------------------------

    private sendText(token: string, last: boolean): void {
        this.send({ type: 'text', token, last });
    }

    private send(payload: Record<string, unknown>): void {
        if (!this.ws || this.ws.readyState !== this.ws.OPEN) return;
        this.ws.send(JSON.stringify(payload));
    }
}

function avg(values: number[]): number {
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

/** Longueur du suffixe de `text` qui pourrait être le début de END_MARKER. */
function partialMarkerLength(text: string): number {
    for (let len = Math.min(END_MARKER.length - 1, text.length); len > 0; len--) {
        if (END_MARKER.startsWith(text.slice(text.length - len))) return len;
    }
    return 0;
}
