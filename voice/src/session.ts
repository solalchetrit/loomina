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
import { forVoice } from './speech.ts';
import type { CallPlan } from './plan.ts';
import { buildEndOfCallReport, deliverReport } from './report.ts';
import type { TurnRecord } from './report.ts';
import { timeNote } from '../../lib/loomina/call-length';
import { demoTimeNote } from '../../lib/loomina/assistant';

const END_MARKER = '##END_CALL##';

/** Une réplique qui se termine par un au revoir. */
const GOODBYE = /(à (très )?bientôt|au revoir|bonne (fin de )?(journée|soirée)|prends soin de toi|prenez soin de vous)[^?]{0,40}$/i;

function words(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Temps d'attente après la fin d'une phrase du narrateur avant que Loomina
 * réponde. La transcription déclare une phrase finie dès une petite pause :
 * au premier vrai appel (16/11/2026), Loomina a repris la parole 12 fois
 * alors que le narrateur n'avait pas fini. S'il reprend pendant ce délai,
 * sa suite est ajoutée à la même réplique et l'attente recommence.
 */
// 1,2 s (demande de Solal, 19/11/2026, après la démo de sa mère) : un peu
// plus de temps pour réfléchir avant que Loomina reprenne. Était 0,8 s.
const REPLY_DELAY_MS = Number(process.env.VOICE_REPLY_DELAY_MS ?? 1200);
/**
 * Le modèle est interrogé tout de suite : l'attente ci-dessus et le temps
 * de réflexion du modèle (environ 1 s) se chevauchent au lieu de
 * s'additionner. Rien n'est dit avant la fin de l'attente ; si le
 * narrateur reprend entre-temps, la réponse préparée est jetée.
 * Une question (« Ça va, et toi ? ») attend une réponse : pas d'attente.
 */
/** Note ajoutée quand la dernière réplique de Loomina a été coupée (voir onInterrupt). */
// Reformulée le 20/11/2026 (appel test de Solal) : « reprends TOUT » donnait
// de longs résumés (« Tu racontais ce loup-garou géant, avec les deux
// canapés noirs, et… »). On veut tenir compte de tout, sans le redire.
export const CUT_NOTE = "Ta dernière réplique a été coupée : la personne a continué à parler et n'en a entendu que le début. Ne la répète pas et ne résume rien. Tiens compte de tout ce qu'elle vient de raconter, pas seulement de sa dernière phrase : un écho très court sur UN détail nouveau, puis ta question.";

/**
 * Phrase sans doute pas finie : la transcription n'a pas mis de point final
 * (« Donc, j'étais plutôt dans ma », « Qui est »), ou elle s'arrête sur un
 * mot qui annonce une suite (« et », « parce que », « en fait »).
 */
const UNFINISHED_END = /(?:^|[\s,])(?:et|mais|donc|alors|parce|que|qui|où|de|du|des|le|la|les|un|une|en|à|au|aux|avec|pour|sur|dans|si|comme|euh|enfin|bon|bah|ben|genre|fait|vois|veux|dire)\s*[,.]?\s*$/i;
export function looksUnfinished(text: string): boolean {
    const t = text.trim();
    if (!t) return false;
    if (!/[.!?…»")]$/.test(t)) return true;
    return UNFINISHED_END.test(t);
}

/** Attente plus longue quand la phrase n'est pas finie ou très courte. */
const UNFINISHED_DELAY_MS = Number(process.env.VOICE_UNFINISHED_DELAY_MS ?? 2600);
const SHORT_DELAY_MS = Number(process.env.VOICE_SHORT_DELAY_MS ?? 1900);

// Appel test de Solal (20/11/2026, 24 coupures en 17 min) : Loomina
// reprenait la parole dès une petite pause au milieu d'une idée (« En fait,
// si tu veux, c'était à ce moment-là. » puis la suite). Une phrase pas
// finie attend 2,6 s, une phrase très courte (8 mots au plus) 1,9 s.
export function holdFor(text: string): number {
    if (/\?\s*$/.test(text)) return 0;
    if (looksUnfinished(text)) return UNFINISHED_DELAY_MS;
    if (words(text) <= 8) return SHORT_DELAY_MS;
    return REPLY_DELAY_MS;
}

/**
 * Durée estimée de la voix pour un texte. La voix (ElevenLabs, vitesse 0,92)
 * lit environ 12 caractères par seconde en français. Avant (19/11/2026) on
 * comptait 60 ms par caractère avec un plafond de 12 s : la clôture de la
 * démo (environ 560 caractères, 40 s de voix) était coupée net au bout de
 * 12 s, et l'appel raccrochait au milieu d'une phrase.
 */
function speechMs(text: string): number {
    return 2000 + text.length * 75;
}

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
    private replyTimer: NodeJS.Timeout | null = null;
    /** Moment où la dernière phrase du narrateur a été reçue (mesure du délai). */
    private heardAt = 0;
    private readonly replyDelaysMs: number[] = [];
    private silenceNudged = false;
    private finished = false;
    private endRequested = false;
    /** Loomina a dit au revoir sans marqueur de fin : on attend un dernier mot. */
    private closingSaid = false;
    /** La toute petite phrase d'au revoir a été dite (une seule fois). */
    private farewellSaid = false;
    /** Minuteur qui raccroche après la clôture. */
    private endTimer: NodeJS.Timeout | null = null;
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

    /** L'enregistrement audio de l'appel chez Twilio, s'il a démarré. */
    recordingSid: string | null = null;

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
        this.warmUp();
        this.maxTimer = setTimeout(() => {
            console.info(`[${this.callSid}] durée maximale atteinte`);
            const goodbye = this.plan.demo
                ? this.plan.metadata.can_text === true
                    ? "Nous arrivons au bout des cinq minutes. Merci pour ce beau moment : je vais écrire votre récit, et vous le recevrez par SMS dans quelques minutes. À bientôt !"
                    : "Nous arrivons au bout des cinq minutes. Merci pour ce beau moment. Tout est expliqué sur loomina point e u. À bientôt !"
                : "Nous avons bien travaillé aujourd'hui. Reprenons la prochaine fois. À bientôt !";
            void this.sayAndEnd(goodbye, 'max-duration');
        }, this.plan.maxSeconds * 1000);
    }

    /**
     * Pendant que Twilio dit le bonjour, une requête d'un seul mot avec le
     * même prompt : OpenAI garde ce début en cache, et la première vraie
     * réponse (« Ça va, et toi ? ») part sans la lenteur d'un premier appel.
     */
    private warmUp(): void {
        if (process.env.VOICE_WARMUP === 'off') return;
        const t0 = Date.now();
        this.openai.chat.completions
            .create({
                model: config.openai.model,
                ...(config.openai.model.startsWith('gpt-5')
                    ? { reasoning_effort: 'none' as const, max_completion_tokens: 1 }
                    : { max_tokens: 1 }),
                messages: this.chatMessages(),
            })
            .then((r) => console.info(`[${this.callSid}] préchauffage ${Date.now() - t0} ms (${r.usage?.prompt_tokens ?? '?'} jetons)`))
            .catch(() => {});
    }

    async onPrompt(text: string, last: boolean): Promise<void> {
        if (this.finished) return;
        // Le narrateur parle encore : ce n'est pas un silence, et la
        // réponse prévue attend qu'il ait fini.
        if (!last) {
            this.cancelPendingReply();
            // Réponse en préparation mais encore muette : on la laisse tomber,
            // elle sera refaite avec la suite de ce qu'il dit.
            if (this.generation && !this.spokenSoFar.trim()) this.abortGeneration();
            return this.armSilenceTimer();
        }
        const clean = text.trim();
        if (!clean) return;

        // Après l'au revoir de Loomina, la personne dit « merci, au revoir » :
        // démo d'Ethan (20/11/2026), Loomina lui a refait toute la clôture.
        // Une toute petite phrase, puis on raccroche, sans repasser par le modèle.
        // Si la personne se remet à raconter (longue phrase), on reprend normalement.
        if (this.endRequested || this.closingSaid) {
            if (this.endRequested || words(clean) <= 12) return this.farewell(clean);
            this.closingSaid = false;
        }

        this.armSilenceTimer();
        // D'abord clore la réponse en cours (gardée telle que dite), puis
        // la phrase du narrateur : l'historique reste dans l'ordre.
        this.abortGeneration();
        const previous = this.turns[this.turns.length - 1];
        if (previous?.role === 'user') {
            // Loomina n'a encore rien dit : c'est la suite de la même réplique.
            previous.message = `${previous.message} ${clean}`;
            previous.time = Date.now();
        } else {
            this.turns.push({ role: 'user', message: clean, time: Date.now() });
        }
        this.cancelPendingReply();
        this.heardAt = Date.now();
        void this.generate(this.heardAt + holdFor(clean));
    }

    private cancelPendingReply(): void {
        if (this.replyTimer) clearTimeout(this.replyTimer);
        this.replyTimer = null;
    }

    onInterrupt(utteranceUntilInterrupt: string): void {
        this.interruptions += 1;
        const heard = utteranceUntilInterrupt.trim();
        // Démo de Fabrice (20/11/2026) : la personne a continué à raconter,
        // la réponse de Loomina n'a jamais été dite, mais elle restait en
        // entier dans l'historique. Le modèle croyait avoir posé ses
        // questions et ne revenait pas sur ce qui avait été raconté entre-temps.
        // Maintenant : rien d'entendu = la réponse disparaît (les phrases
        // de la personne se recollent) ; un bout entendu = on garde ce bout,
        // marqué comme coupé.
        if (this.generation) {
            this.abortGeneration(heard, true);
            return;
        }
        const last = this.turns[this.turns.length - 1];
        if (last?.role !== 'bot') return;
        if (!heard) this.turns.pop();
        else {
            last.message = heard;
            last.cut = true;
        }
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
        if (this.endTimer) clearTimeout(this.endTimer);
        this.cancelPendingReply();

        const endedAt = new Date();
        const seconds = Math.round((endedAt.getTime() - this.startedAt.getTime()) / 1000);
        console.info(
            `[${this.callSid}] fin (${reason}) — ${seconds}s, ${this.turns.length} tours, ` +
            `latence modèle moy. ${avg(this.modelLatenciesMs)} ms, délai de réponse moy. ${avg(this.replyDelaysMs)} ms ` +
            `(max ${this.replyDelaysMs.length ? Math.max(...this.replyDelaysMs) : 0} ms), ${this.interruptions} interruption(s)`
        );

        // Démonstration : le transcript part au site, qui écrit le récit et
        // l'envoie par SMS. Sans portable, ou sans échange, rien n'est envoyé,
        // sauf s'il y a un enregistrement : le site le garde pour l'admin.
        if (this.plan.demo && !this.recordingSid && (this.plan.metadata.can_text !== true || !this.turns.some((t) => t.role === 'user'))) {
            console.info(`[${this.callSid}] démo sans envoi possible : rien n'est conservé`);
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
            metadata: { ...this.plan.metadata, ...(this.recordingSid ? { recordingSid: this.recordingSid } : {}) },
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

    private async generate(releaseAt = 0): Promise<void> {
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
        // La voix reçoit des bouts de phrase entiers, pas des morceaux de mot :
        // envoyés mot à mot, ElevenLabs hachait la voix (« achures » entendues
        // à la démo du 19/11/2026). On envoie jusqu'à la dernière ponctuation,
        // ou par blocs de mots quand la phrase est longue.
        let voiceBuf = '';
        const queue = (text: string, flush: boolean) => {
            voiceBuf += text;
            if (flush) {
                say(voiceBuf);
                voiceBuf = '';
                return;
            }
            // Démo (20/11/2026) : des phrases entières seulement. Coupée à
            // chaque virgule, chaque morceau repartait avec une intonation
            // neuve et la voix sonnait « robot ».
            const demo = this.plan.demo;
            let cut = -1;
            const re = demo ? /[.!?…](?=\s)/g : /[.!?;:,…»)](?=\s)/g;
            for (let m = re.exec(voiceBuf); m; m = re.exec(voiceBuf)) cut = m.index + 1;
            if (cut < 0 && voiceBuf.length > (demo ? 220 : 90)) cut = voiceBuf.lastIndexOf(' ');
            if (cut <= 0) return;
            say(voiceBuf.slice(0, cut));
            voiceBuf = voiceBuf.slice(cut);
        };
        this.spokenSoFar = '';
        // Ne rien dire avant `releaseAt` (voir holdFor). La lecture du flux
        // est suspendue pendant ce temps ; les morceaux attendent.
        let released = releaseAt <= Date.now();
        const hold = async () => {
            if (released) return;
            const wait = releaseAt - Date.now();
            if (wait > 0) await new Promise((r) => setTimeout(r, wait));
            released = true;
            if (this.heardAt) this.replyDelaysMs.push(Date.now() - this.heardAt);
        };
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
                            await hold();
                            if (controller.signal.aborted) return;
                            queue(before, true);
                            pending = '';
                            break;
                        }
                        // Garder un éventuel début de marqueur ("##END") en attente.
                        const keep = partialMarkerLength(pending);
                        const emit = pending.slice(0, pending.length - keep);
                        if (emit && !released) {
                            await hold();
                            if (controller.signal.aborted) return;
                        }
                        queue(emit, false);
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
            await hold();
            if (controller.signal.aborted) return;
            queue(pending && !pending.includes('#') ? pending : '', true);
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
            if (!this.endRequested) this.armSilenceTimer(speechMs(spoken));
        }

        // Au revoir dit, mais le modèle a oublié ##END_CALL## : le prochain
        // « merci » de la personne ne doit pas relancer une réponse.
        if (!this.endRequested && GOODBYE.test(spoken)) this.closingSaid = true;

        if (this.endRequested) {
            // Laisser la voix finir la phrase d'au revoir avant de couper.
            const ms = Math.min(90_000, speechMs(spoken));
            if (!this.farewellSaid) this.endTimer = setTimeout(() => void this.end('assistant-ended-call'), ms);
        }
    }

    private chatMessages(): ChatMessage[] {
        const history: ChatMessage[] = this.turns.map((t) => ({
            role: t.role === 'bot' ? 'assistant' : 'user',
            content: t.message,
        }));
        const messages: ChatMessage[] = [{ role: 'system', content: this.plan.systemPrompt }, ...history];
        // Après une réponse coupée, le modèle doit revenir sur tout ce que la
        // personne a raconté depuis, pas seulement sur sa dernière phrase.
        const lastBot = [...this.turns].reverse().find((t) => t.role === 'bot');
        if (lastBot?.cut) {
            messages.push({ role: 'system', content: CUT_NOTE });
        }
        // Le modèle ne voit pas l'heure. La note va en dernier : le début de
        // la conversation reste identique d'une réplique à l'autre (cache).
        if (this.plan.demo) {
            messages.push({ role: 'system', content: demoTimeNote((Date.now() - this.startedAt.getTime()) / 1000) });
        } else if (this.plan.targetMinutes) {
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
    private abortGeneration(heard?: string, interrupted = false): void {
        if (!this.generation) return;
        this.generation.abort();
        this.generation = null;
        // Coupée par la personne : seul ce qu'elle a entendu compte.
        const said = (interrupted ? heard ?? '' : heard || this.spokenSoFar).trim();
        this.spokenSoFar = '';
        if (said) this.turns.push({ role: 'bot', message: said, time: Date.now(), ...(interrupted ? { cut: true } : {}) });
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
            const nudge = this.plan.metadata.politeness === 'tu' ? 'Je suis toujours là. Prends ton temps.' : 'Je suis toujours là. Prenez votre temps.';
            this.sendText(nudge, true);
            this.turns.push({ role: 'bot', message: nudge, time: Date.now() });
            this.silenceTimer = setTimeout(() => void this.onSilence(), config.limits.hangupSilenceSeconds * 1000);
            return;
        }
        await this.sayAndEnd('Je vous laisse. Rappelez-moi quand vous voulez, je serai là. À bientôt !', 'silence-timeout');
    }

    private async sayAndEnd(text: string, reason: string): Promise<void> {
        if (this.finished) return;
        this.abortGeneration();
        this.sendText(text, true);
        this.turns.push({ role: 'bot', message: text, time: Date.now() });
        setTimeout(() => void this.end(reason), speechMs(text));
    }

    /** Dernier mot de la personne après l'au revoir : une phrase courte, puis on raccroche. */
    private farewell(heard: string): void {
        this.turns.push({ role: 'user', message: heard, time: Date.now() });
        if (this.farewellSaid) return;
        this.farewellSaid = true;
        this.endRequested = true;
        this.cancelPendingReply();
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        // L'ancien minuteur de la clôture couperait la petite phrase.
        if (this.endTimer) clearTimeout(this.endTimer);
        // Prénom du profil, sinon (démo) celui que Loomina vient de dire dans sa clôture.
        const known = typeof this.plan.metadata.first_name_spoken === 'string' ? this.plan.metadata.first_name_spoken.trim() : '';
        const name = known || closingName(this.turns);
        const text = name ? `À bientôt, ${name}. C'était un plaisir.` : "À bientôt. C'était un plaisir.";
        this.sendText(text, true);
        this.turns.push({ role: 'bot', message: text, time: Date.now() });
        setTimeout(() => void this.end('assistant-ended-call'), speechMs(text));
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
        // Tout ce qui part vers la voix passe par forVoice (speech.ts).
        this.send({ type: 'text', token: forVoice(token), last });
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

/** Le prénom employé dans la clôture (« Merci, Ethan, à bientôt ! »), ou ''. */
export function closingName(turns: { role: string; message: string }[]): string {
    for (let i = turns.length - 1; i >= Math.max(0, turns.length - 4); i--) {
        if (turns[i].role !== 'bot') continue;
        const found = [...turns[i].message.matchAll(/(?:Merci|Au revoir|À bientôt),\s+([A-ZÀ-Ý][\p{L}'’-]{1,30})\s*[,.!]/gu)];
        if (found.length) return found[found.length - 1][1];
    }
    return '';
}
