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
import { twilioJson } from '@/lib/admin/recording';

/** Un poste de dépense d'un appel, chez un fournisseur (fiche client, demande de Solal du 24/11/2026). */
export interface CostItem {
    provider: 'Twilio' | 'OpenAI';
    label: string;
    /** Ce que le poste recouvre, en une phrase. */
    detail: string;
    /** En euros hors taxes. */
    amount: number;
    /** `réel` : lu chez le fournisseur ou calculé sur les jetons comptés ; `tarif` : minutes × tarif public ; `estimé` : forfait de repli. */
    source: 'réel' | 'tarif' | 'estimé';
}

export interface CallCost {
    /** Le détail poste par poste. */
    items: CostItem[];
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

/** Prix réel d'une ressource Twilio (`price` négatif, en dollars), en euros, ou null. */
function twilioPrice(r: { price?: string | null; price_unit?: string | null } | null): number | null {
    if (r?.price == null) return null;
    const amount = Math.abs(Number(r.price));
    if (!Number.isFinite(amount)) return null;
    return (r.price_unit ?? 'USD').toUpperCase() === 'EUR' ? amount : eur(amount);
}

/** Les SMS envoyés à un numéro entre deux instants (rappel avant l'appel, « récit prêt » après), prix réel. */
async function smsAround(phone: string, from: Date, to: Date): Promise<{ count: number; amount: number; pending: number }> {
    const day = from.toISOString().slice(0, 10);
    const page = await twilioJson<{ messages: Array<{ date_sent: string | null; date_created: string; price: string | null; price_unit: string | null; direction: string }> }>(
        `/Messages.json?To=${encodeURIComponent(phone)}&DateSent%3E=${day}&PageSize=100`
    );
    let count = 0;
    let amount = 0;
    let pending = 0;
    for (const m of page?.messages ?? []) {
        if (!m.direction.startsWith('outbound')) continue;
        const at = new Date(m.date_sent ?? m.date_created).getTime();
        if (at < from.getTime() || at > to.getTime()) continue;
        count += 1;
        const p = twilioPrice(m);
        if (p == null) pending += 1;
        else amount += p;
    }
    return { count, amount, pending };
}

interface InterviewRow {
    id?: unknown;
    created_at?: unknown;
    duration_seconds?: unknown;
    call_event_id?: unknown;
    ai_analysis_log?: unknown;
}

/**
 * Le coût de chaque appel d'un livre, par identifiant d'entretien.
 *
 * `detail` (fiche client) ajoute ce que l'appel a déclenché ensuite : les SMS
 * envoyés au narrateur, la recomposition du livre et l'écoute de l'appel.
 * L'onglet Argent ne le demande pas : il compte déjà les compositions à part.
 */
export async function callCosts(interviews: InterviewRow[], detail?: { phone: string | null; projectId: string | null }): Promise<Map<string, CallCost>> {
    const out = new Map<string, CallCost>();
    const eventIds = interviews.map((i) => i.call_event_id).filter((v): v is string => typeof v === 'string');
    const events = new Map<string, { sid: string | null; prompt: number; completion: number; model: string | null; rec: string | null }>();
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
                rec: typeof e.rec === 'string' && e.rec.length > 0 ? e.rec : null,
            });
        }
    }

    // Pour le détail : compositions du livre et écoutes, rattachées à l'appel qui les a déclenchées.
    const ids = interviews.map((i) => String(i.id));
    const reviews = new Map<string, number>();
    let editions: Array<{ created_at: string; usage: Record<string, { input: number; cached: number; output: number }> | null }> = [];
    if (detail) {
        const [r, e] = await Promise.all([
            ids.length ? db().from('call_reviews').select('interview_id, cost_usd').in('interview_id', ids) : Promise.resolve({ data: [] }),
            detail.projectId ? db().from('book_editions').select('created_at, usage').eq('project_id', detail.projectId).limit(500) : Promise.resolve({ data: [] }),
        ]);
        for (const row of (r.data ?? []) as Array<{ interview_id: string; cost_usd: number | null }>) if (row.cost_usd != null) reviews.set(row.interview_id, Number(row.cost_usd));
        editions = ((e.data ?? []) as typeof editions) ?? [];
        // Sans la colonne `usage` (migration pas encore passée), on relit sans elle.
        if ('error' in e && e.error && detail.projectId) {
            const { data } = await db().from('book_editions').select('created_at').eq('project_id', detail.projectId).limit(500);
            editions = ((data ?? []) as Array<{ created_at: string }>).map((x) => ({ created_at: x.created_at, usage: null }));
        }
    }
    const byTime = [...interviews].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

    await Promise.all(
        interviews.map(async (i) => {
            const id = String(i.id);
            const minutes = (Number(i.duration_seconds) || 0) / 60;
            const event = typeof i.call_event_id === 'string' ? events.get(i.call_event_id) : undefined;
            const items: CostItem[] = [];

            const [realLine, recording] = await Promise.all([
                event?.sid && /^CA[0-9a-f]{32}$/i.test(event.sid) ? twilioJson<{ price?: string | null; price_unit?: string | null }>(`/Calls/${event.sid}.json`) : Promise.resolve(null),
                event?.rec && /^RE[0-9a-f]{32}$/i.test(event.rec) ? twilioJson<{ price?: string | null; price_unit?: string | null }>(`/Recordings/${event.rec}.json`) : Promise.resolve(null),
            ]);
            const line = twilioPrice(realLine);
            items.push({
                provider: 'Twilio',
                label: 'Ligne téléphonique',
                detail: `${Math.ceil(minutes)} min d’appel vers un mobile français`,
                amount: line ?? eur(minutes * COSTS.lineFallbackPerMinute),
                source: line == null ? 'estimé' : 'réel',
            });
            items.push({
                provider: 'Twilio',
                label: 'Écoute et voix (ConversationRelay)',
                detail: `transcription Deepgram et voix ElevenLabs comprises, ${COSTS.conversationRelayPerMinute} $ la minute (Twilio ne donne pas ce prix appel par appel)`,
                amount: eur(minutes * COSTS.conversationRelayPerMinute),
                source: 'tarif',
            });
            if (event?.rec) {
                const rec = twilioPrice(recording);
                items.push({
                    provider: 'Twilio',
                    label: 'Enregistrement',
                    detail: 'le son de l’appel, en deux pistes',
                    amount: rec ?? eur(Math.ceil(minutes) * COSTS.recordingPerMinute),
                    source: rec == null ? 'tarif' : 'réel',
                });
            }
            if (event && (event.prompt || event.completion)) {
                const model = event.model ?? COSTS.defaultVoiceModel;
                items.push({
                    provider: 'OpenAI',
                    label: 'IA de la conversation',
                    detail: `${model}, ${fmtTokens(event.prompt)} jetons lus, ${fmtTokens(event.completion)} écrits`,
                    amount: eur(tokensCostUsd({ model, input: event.prompt, cached: 0, output: event.completion })),
                    source: 'réel',
                });
            } else if (minutes > 0) {
                items.push({ provider: 'OpenAI', label: 'IA de la conversation', detail: 'jetons non comptés pour cet appel', amount: eur(minutes * COSTS.conversationFallbackPerMinute), source: 'estimé' });
            }

            const usage = ((i.ai_analysis_log ?? {}) as { usage?: { director?: TokenUsage; writer?: TokenUsage } }).usage;
            if (usage?.director) items.push({ provider: 'OpenAI', label: 'Directeur (analyse de l’appel)', detail: `${usage.director.model}, ${fmtTokens(usage.director.input)} jetons lus, ${fmtTokens(usage.director.output)} écrits`, amount: eur(tokensCostUsd(usage.director)), source: 'réel' });
            if (usage?.writer) items.push({ provider: 'OpenAI', label: 'Écrivain (le récit)', detail: `${usage.writer.model}, ${fmtTokens(usage.writer.input)} jetons lus, ${fmtTokens(usage.writer.output)} écrits`, amount: eur(tokensCostUsd(usage.writer)), source: 'réel' });
            if (!usage?.director && !usage?.writer && i.ai_analysis_log) {
                items.push({ provider: 'OpenAI', label: 'Analyse et écriture du récit', detail: 'appel d’avant le suivi des jetons', amount: eur(COSTS.writingFallbackPerCall), source: 'estimé' });
            }

            if (detail) {
                const startedAt = new Date(String(i.created_at ?? Date.now()));
                const callStart = new Date(startedAt.getTime() - minutes * 60_000);
                const next = byTime[byTime.findIndex((x) => String(x.id) === id) + 1];
                const until = next ? new Date(String(next.created_at)) : new Date(8.64e15);

                if (detail.phone) {
                    const sms = await smsAround(detail.phone, new Date(callStart.getTime() - 45 * 60_000), new Date(startedAt.getTime() + 3 * 3600_000));
                    if (sms.count) {
                        items.push({
                            provider: 'Twilio',
                            label: 'SMS',
                            detail: `${sms.count} SMS au narrateur (rappel avant l’appel, « récit prêt » après)${sms.pending ? `, dont ${sms.pending} pas encore facturé(s)` : ''}`,
                            amount: sms.amount,
                            source: 'réel',
                        });
                    }
                }

                const mine = editions.filter((e) => {
                    const t = new Date(e.created_at).getTime();
                    return t >= startedAt.getTime() - 10 * 60_000 && t < until.getTime() - 10 * 60_000;
                });
                if (mine.length) {
                    const counted = mine.filter((e) => e.usage && Object.keys(e.usage).length);
                    const amount =
                        counted.reduce((s, e) => s + Object.entries(e.usage ?? {}).reduce((a, [model, u]) => a + eur(tokensCostUsd({ model, ...u })), 0), 0) +
                        (mine.length - counted.length) * eur(COSTS.compositionFallbackPerEdition);
                    items.push({
                        provider: 'OpenAI',
                        label: 'Recomposition du livre',
                        detail: `${mine.length} composition(s) du livre après cet appel${counted.length < mine.length ? ', jetons non comptés avant le 24/11/2026' : ''}`,
                        amount,
                        source: counted.length === mine.length ? 'réel' : 'estimé',
                    });
                }

                const review = reviews.get(id);
                if (review != null) items.push({ provider: 'OpenAI', label: 'Écoute de l’appel', detail: 'réécoute de la voix du narrateur et comparaison au transcript', amount: eur(review), source: 'réel' });
            }

            const sum = (pred: (x: CostItem) => boolean) => items.filter(pred).reduce((s, x) => s + x.amount, 0);
            const lineAmount = sum((x) => x.label === 'Ligne téléphonique');
            const voice = sum((x) => x.label.startsWith('Écoute et voix') || x.label === 'Enregistrement');
            const conversation = sum((x) => x.label === 'IA de la conversation');
            const writing = sum((x) => x.label.startsWith('Directeur') || x.label.startsWith('Écrivain') || x.label.startsWith('Analyse et écriture'));
            const totalAll = sum(() => true);
            out.set(id, {
                items,
                line: lineAmount,
                voice,
                conversation,
                writing,
                total: totalAll,
                totalTtc: totalAll * (1 + COSTS.vat),
                estimated: items.some((x) => x.source === 'estimé'),
                recordingEventId: event?.rec ? (i.call_event_id as string) : null,
            });
        })
    );
    return out;
}

const fmtTokens = (n: number) => n.toLocaleString('fr-FR');

export function sumCosts(costs: Iterable<CallCost>): CallCost {
    const s: CallCost = { items: [], line: 0, voice: 0, conversation: 0, writing: 0, total: 0, totalTtc: 0, estimated: false };
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
