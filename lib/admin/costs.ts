/**
 * Ce que chaque appel a coûté à la société (demande de Solal, 17/11/2026).
 *
 * Quatre postes :
 *  - la ligne : prix RÉEL lu chez Twilio pour cet appel (repli : tarif à la minute) ;
 *  - la voix : ConversationRelay, tarif à la minute ;
 *  - l'IA de la conversation : jetons du rapport de fin d'appel × grille ;
 *  - l'analyse et l'écriture : jetons du Directeur et de l'Écrivain × grille
 *    (repli : forfait moyen pour les appels d'avant le suivi).
 *
 * Tout est converti en euros. « estimé » veut dire qu'au moins un poste
 * vient d'un repli.
 */

import { db } from '@/lib/loomina/db';
import { COSTS } from '@/config/costs';
import type { TokenUsage } from '@/lib/loomina/usage';

export interface CallCost {
    /** En euros hors taxes. */
    line: number;
    voice: number;
    conversation: number;
    writing: number;
    total: number;
    totalTtc: number;
    estimated: boolean;
    /** Le rapport d'appel qui porte un enregistrement audio (pour l'écouter dans l'admin). */
    recordingEventId?: string | null;
}

const eur = (usd: number) => usd * COSTS.usdToEur;

export function tokensCostUsd(u: Pick<TokenUsage, 'model' | 'input' | 'cached' | 'output'>): number {
    const p = COSTS.models[u.model] ?? COSTS.models[Object.keys(COSTS.models).find((k) => u.model.startsWith(k)) ?? ''] ?? COSTS.models[COSTS.defaultWritingModel];
    const fresh = Math.max(0, u.input - u.cached);
    return (fresh * p.input + u.cached * p.cached + u.output * p.output) / 1_000_000;
}

/** Prix réel de la ligne pour un appel Twilio, en euros (null si inconnu). */
async function twilioLinePrice(callSid: string): Promise<number | null> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token || !/^CA[0-9a-f]{32}$/i.test(callSid)) return null;
    try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls/${callSid}.json`, {
            headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
            signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return null;
        const call = (await res.json()) as { price?: string | null; price_unit?: string | null };
        if (call.price == null) return null;
        const amount = Math.abs(Number(call.price));
        if (!Number.isFinite(amount)) return null;
        return (call.price_unit ?? 'USD').toUpperCase() === 'EUR' ? amount : eur(amount);
    } catch {
        return null;
    }
}

interface InterviewRow {
    id?: unknown;
    duration_seconds?: unknown;
    call_event_id?: unknown;
    ai_analysis_log?: unknown;
}

/** Le coût de chaque appel d'un livre, par identifiant d'entretien. */
export async function callCosts(interviews: InterviewRow[]): Promise<Map<string, CallCost>> {
    const out = new Map<string, CallCost>();
    const eventIds = interviews.map((i) => i.call_event_id).filter((v): v is string => typeof v === 'string');
    const events = new Map<string, { sid: string | null; prompt: number; completion: number; model: string | null; recorded: boolean }>();
    if (eventIds.length) {
        const { data } = await db()
            .from('call_events')
            .select('id, vapi_call_id, tokens:payload->message->costBreakdown, model:payload->message->call->metadata->>model, rec:payload->message->call->metadata->>recordingSid')
            .in('id', eventIds);
        for (const e of (data ?? []) as Array<Record<string, unknown>>) {
            const t = (e.tokens ?? {}) as { llmPromptTokens?: number; llmCompletionTokens?: number };
            events.set(String(e.id), {
                sid: typeof e.vapi_call_id === 'string' ? e.vapi_call_id : null,
                prompt: Number(t.llmPromptTokens) || 0,
                completion: Number(t.llmCompletionTokens) || 0,
                model: typeof e.model === 'string' ? e.model : null,
                recorded: typeof e.rec === 'string' && e.rec.length > 0,
            });
        }
    }

    await Promise.all(
        interviews.map(async (i) => {
            const id = String(i.id);
            const minutes = (Number(i.duration_seconds) || 0) / 60;
            const event = typeof i.call_event_id === 'string' ? events.get(i.call_event_id) : undefined;
            let estimated = false;

            const real = event?.sid ? await twilioLinePrice(event.sid) : null;
            const line = real ?? eur(minutes * COSTS.lineFallbackPerMinute);
            if (real == null) estimated = true;

            // La voix (ConversationRelay), plus l'enregistrement quand l'appel en a un.
            const voice = eur(minutes * COSTS.conversationRelayPerMinute + (event?.recorded ? Math.ceil(minutes) * COSTS.recordingPerMinute : 0));

            let conversation = 0;
            if (event && (event.prompt || event.completion)) {
                conversation = eur(tokensCostUsd({ model: event.model ?? COSTS.defaultVoiceModel, input: event.prompt, cached: 0, output: event.completion }));
            } else if (minutes > 0) estimated = true;

            const usage = ((i.ai_analysis_log ?? {}) as { usage?: { director?: TokenUsage; writer?: TokenUsage } }).usage;
            let writing = 0;
            if (usage?.director || usage?.writer) {
                writing = eur((usage.director ? tokensCostUsd(usage.director) : 0) + (usage.writer ? tokensCostUsd(usage.writer) : 0));
            } else if (i.ai_analysis_log) {
                writing = eur(COSTS.writingFallbackPerCall);
                estimated = true;
            }

            const total = line + voice + conversation + writing;
            out.set(id, { line, voice, conversation, writing, total, totalTtc: total * (1 + COSTS.vat), estimated, recordingEventId: event?.recorded ? (i.call_event_id as string) : null });
        })
    );
    return out;
}

export function sumCosts(costs: Iterable<CallCost>): CallCost {
    const s: CallCost = { line: 0, voice: 0, conversation: 0, writing: 0, total: 0, totalTtc: 0, estimated: false };
    for (const c of costs) {
        s.line += c.line;
        s.voice += c.voice;
        s.conversation += c.conversation;
        s.writing += c.writing;
        s.total += c.total;
        s.totalTtc += c.totalTtc;
        s.estimated ||= c.estimated;
    }
    return s;
}

export const fmtEur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
