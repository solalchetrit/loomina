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
import { buildEndOfCallReport, deliverReport } from './report.ts';
import type { TurnRecord } from './report.ts';
import { timeNote } from '../../lib/loomina/call-length';

const END_MARKER = '##END_CALL##';

/** Délai sans premier mot au bout duquel la question est reposée à OpenAI, une fois. */
const FIRST_WORD_TIMEOUT_MS = 3000;

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
    // Au téléphone, mieux vaut « Pardon, pouvez-vous répéter ? » au bout de
    // 8 s qu'un silence de plusieurs minutes (délai par défaut du SDK : 10 min).
    private readonly openai = new OpenAI({ apiKey: config.openai.apiKey, timeout: 8000, maxRetries: 0 });
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
    /** Texte déjà envoyé à la voix pour la réponse en cours. */
    private spokenSoFar = '';

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

    get attached(): boolean {
        return this.ws !== null;
    }

    get active(): boolean {
        return !this.finished;
    }

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
        if (this.finished) return;
        // Le narrateur parle encore : ce n'est pas un silence.
        if (!last) return this.armSilenceTimer();
        const clean = text.trim();
        if (!clean) return;

        this.armSilenceTimer();
        // D'abord clore la réponse en cours (gardée telle que dite), puis
        // la phrase du narrateur : l'historique reste dans l'ordre.
        this.abortGeneration();
        this.turns.push({ role: 'user', message: clean, time: Date.now() });
        await this.generate();
    }

    onInterrupt(utteranceUntilInterrupt: string): void {
        this.interruptions += 1;
        const heard = utteranceUntilInterrupt.trim();
        if (this.generation) {
            // Réponse encore en cours : elle n'est pas dans l'historique.
            // On l'y ajoute, réduite à ce qui a été entendu.
            this.abortGeneration(heard);
            return;
        }
        // Réponse déjà complète mais en train d'être lue : on la tronque.
        const lastBot = [...this.turns].reverse().find((t) => t.role === 'bot');
        if (lastBot && heard) lastBot.message = heard;
    }



    /** Fin de session, quelle qu'en soit la cause. Idempotent. */
    async finish(reason: string): Promise<void> {
        if (this.finished) return;
        this.finished = true;
        this.abortGeneration();
        // Fermer le WebSocket peu après (le temps du dernier « end ») : sans
        // ça, un tunnel à moitié ouvert laissait la session ouverte.
        setTimeout(() => this.ws?.terminate(), 3000);
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
            if (await deliverReport(this.callSid, report)) {
                console.info(`[${this.callSid}] rapport envoyé au site`);
            } else {
                console.error(`[${this.callSid}] rapport gardé sur disque, nouvel envoi plus tard`);
            }
        } catch (err) {
            // Disque plein, droits… : on le dit fort, mais le serveur continue.
            console.error(`[${this.callSid}] RAPPORT PERDU :`, err instanceof Error ? err.message : err);
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
        // Une seule question par réplique : après le premier point
        // d'interrogation, le reste de la réponse n'est plus lu (on continue
        // seulement à guetter le marqueur de fin d'appel).
        let asked = false;
        const say = (text: string) => {
            if (asked || !text) return;
            let out = text;
            const q = out.indexOf('?');
            if (config.limits.oneQuestion && q >= 0) {
                // Garder les guillemets ou l'espace qui ferment la question.
                const tail = /^[\s»"”]*/.exec(out.slice(q + 1))?.[0] ?? '';
                out = out.slice(0, q + 1) + tail.trimEnd();
                asked = true;
            }
            this.sendText(out, false);
            spoken += out;
            this.spokenSoFar = spoken;
        };
        this.spokenSoFar = '';
        // Le délai du client OpenAI ne couvre que l'arrivée de la réponse :
        // un flux qui s'arrête en route n'était jamais coupé. Sans nouveau
        // morceau pendant 8 s, on abandonne et on s'excuse.
        //
        // Premier essai : si aucun mot n'est arrivé au bout de 3 s, on repose
        // la question à OpenAI une fois, sans rien dire. Avant, une requête
        // qui calait (environ une sur cent) laissait 8 s de blanc au
        // téléphone, puis « je n'ai pas bien entendu ».
        let stalled = false;
        let idle: NodeJS.Timeout | null = null;
        let attempt = 0;
        let attemptCtl = new AbortController();
        const onAbort = () => attemptCtl.abort();
        controller.signal.addEventListener('abort', onAbort);
        const watch = () => {
            if (idle) clearTimeout(idle);
            const ms = attempt === 0 && firstTokenAt === null ? FIRST_WORD_TIMEOUT_MS : 8000;
            idle = setTimeout(() => { stalled = true; attemptCtl.abort(); }, ms);
        };

        try {
            for (;;) {
                stalled = false;
                attemptCtl = new AbortController();
                watch();
                try {
                    const stream = await this.openai.chat.completions.create(
                        {
                            model: config.openai.model,
                            // Famille gpt-5 : modèles à raisonnement. Au téléphone on
                            // coupe le raisonnement (latence) et la température n'est
                            // pas acceptée.
                            ...(config.openai.model.startsWith('gpt-5')
                                ? { reasoning_effort: 'none' as const, max_completion_tokens: 300 }
                                : { temperature: 0.6, max_tokens: 300 }),
                            stream: true,
                            stream_options: { include_usage: true },
                            messages: this.chatMessages(),
                        },
                        { signal: attemptCtl.signal }
                    );

                    for await (const chunk of stream) {
                        watch();
                        if (attemptCtl.signal.aborted) break;
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
                            say(before);
                            pending = '';
                            break;
                        }
                        // Garder un éventuel début de marqueur ("##END") en attente.
                        const keep = partialMarkerLength(pending);
                        const emit = pending.slice(0, pending.length - keep);
                        say(emit);
                        pending = pending.slice(pending.length - keep);
                    }
                    if (!stalled) break;
                } catch (err) {
                    if (!stalled) throw err;
                }
                // Calé. Le narrateur a-t-il coupé entre-temps ?
                if (controller.signal.aborted) return;
                if (attempt === 0 && firstTokenAt === null) {
                    attempt = 1;
                    console.warn(`[${this.callSid}] OpenAI muet depuis ${FIRST_WORD_TIMEOUT_MS} ms, nouvel essai`);
                    continue;
                }
                throw new Error('flux OpenAI muet depuis 8 s');
            }

            if (controller.signal.aborted) return;
            if (pending && !pending.includes('#')) say(pending);
            this.sendText('', true);
        } catch (err) {
            if (controller.signal.aborted) return;
            console.error(`[${this.callSid}] erreur modèle :`, err instanceof Error ? err.message : err);
            const fallback = "Pardon, je n'ai pas bien entendu. Pouvez-vous répéter ?";
            this.sendText(spoken ? ` ${fallback}` : fallback, true);
            spoken = spoken ? `${spoken} ${fallback}` : fallback;
        } finally {
            if (idle) clearTimeout(idle);
            controller.signal.removeEventListener('abort', onAbort);
            if (this.generation === controller) {
                this.generation = null;
                this.spokenSoFar = '';
            }
        }

        if (spoken.trim()) {
            this.turns.push({ role: 'bot', message: spoken.trim(), time: Date.now() });
            // Le silence se compte à partir de la fin de la voix de Loomina,
            // pas de la dernière phrase du narrateur (~60 ms par caractère).
            if (!this.endRequested) this.armSilenceTimer(spoken.length * 60);
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
        const messages: ChatMessage[] = [{ role: 'system', content: this.plan.systemPrompt }, ...history];
        // Le modèle ne voit pas l'heure. La note va en dernier : le début de
        // la conversation reste identique d'une réplique à l'autre (cache).
        if (this.plan.targetMinutes) {
            const elapsed = (Date.now() - this.startedAt.getTime()) / 1000;
            messages.push({ role: 'system', content: timeNote(elapsed, this.plan.targetMinutes) });
        }
        return messages;
    }

    /**
     * Coupe la réponse en cours et l'inscrit dans l'historique telle que le
     * narrateur l'a entendue (ou telle qu'envoyée à la voix). Avant, une
     * réponse coupée disparaissait et l'interruption écrasait la réponse
     * précédente.
     */
    private abortGeneration(heard?: string): void {
        if (!this.generation) return;
        this.generation.abort();
        this.generation = null;
        const said = (heard || this.spokenSoFar).trim();
        this.spokenSoFar = '';
        if (said) this.turns.push({ role: 'bot', message: said, time: Date.now() });
    }

    // ------------------------------------------------------------
    // Silence et fin
    // ------------------------------------------------------------

    private armSilenceTimer(extraMs = 0): void {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceNudged = false;
        this.silenceTimer = setTimeout(() => void this.onSilence(), config.limits.silenceSeconds * 1000 + extraMs);
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
