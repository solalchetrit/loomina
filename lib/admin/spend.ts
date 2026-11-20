/**
 * Tout ce que Loomina dépense sur un mois (demande de Solal, 20/11/2026 :
 * « voir tous les coûts en cours, chaque appel, chaque démo, l'automatique »).
 *
 * Deux regards complémentaires :
 *  - les FACTURES réelles des fournisseurs, lues en direct : Twilio (ligne,
 *    voix, SMS, enregistrements, numéro), OpenAI (si la clé d'administration
 *    OPENAI_ADMIN_KEY est posée), les frais Stripe ;
 *  - le DÉTAIL par usage, recalculé : chaque appel client (lib/admin/costs.ts),
 *    chaque démo, chaque composition automatique du livre.
 * Plus les abonnements fixes de config/costs.ts.
 *
 * Tout est en euros hors taxes. Chaque source peut manquer : la page dit
 * alors pourquoi, sans tomber.
 */

import { db } from '@/lib/loomina/db';
import { COSTS } from '@/config/costs';
import { stripe } from '@/lib/stripe';
import { demoUsage } from '@/lib/loomina/demo-story';
import { callCosts, sumCosts, tokensCostUsd, type CallCost } from './costs';

const eur = (usd: number) => usd * COSTS.usdToEur;
const toEur = (amount: number, currency: string) => (currency.toUpperCase() === 'EUR' ? amount : eur(amount));

export type Period = 'mois' | 'precedent';

export interface Range {
    period: Period;
    start: Date;
    end: Date;
    label: string;
    /** Jours écoulés dans la période (pour la projection du mois en cours). */
    elapsedDays: number;
    totalDays: number;
}

/** Le mois civil à Paris : en cours, ou le précédent. */
export function monthRange(period: Period, now = new Date()): Range {
    const paris = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const y = paris.getFullYear();
    const m = paris.getMonth() - (period === 'precedent' ? 1 : 0);
    const start = new Date(Date.UTC(y, m, 1));
    const end = new Date(Date.UTC(y, m + 1, 1));
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    const elapsedDays = period === 'mois' ? Math.max(1, paris.getDate()) : totalDays;
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start);
    return { period, start, end, label, elapsedDays, totalDays };
}

/* ───────────────────────── Twilio : la facture réelle ───────────────────────── */

export interface TwilioBill {
    total: number;
    lines: Array<{ label: string; amount: number; usage: string }>;
    balance: number | null;
}

const TWILIO_LABELS: Record<string, string> = {
    'calls-inbound': 'Appels reçus (ligne)',
    'calls-inbound-local': 'Appels reçus (ligne)',
    'calls-outbound': 'Appels passés (rendez-vous)',
    'calls-inbound-tollfree': 'Appels reçus (numéro vert)',
    'conversation-relay': 'Voix et écoute (ConversationRelay)',
    'conversationrelay': 'Voix et écoute (ConversationRelay)',
    'sms-outbound': 'SMS envoyés',
    'sms-outbound-longcode': 'SMS envoyés',
    'sms-inbound': 'SMS reçus',
    'recordings': 'Enregistrements',
    'recordingstorage': 'Stockage des enregistrements',
    'phonenumbers-local': 'Numéro de téléphone',
    'phonenumbers': 'Numéro de téléphone',
    'verify-sms': 'Codes de connexion',
};

async function twilio<T>(path: string): Promise<T | null> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${path}`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Twilio répond ${res.status}`);
    return (await res.json()) as T;
}

export async function twilioBill(period: Period): Promise<TwilioBill | null> {
    type Rec = { category: string; description: string; price: string | null; price_unit: string | null; usage: string; usage_unit: string };
    const [records, balance] = await Promise.all([
        twilio<{ usage_records: Rec[] }>(`/Usage/Records/${period === 'mois' ? 'ThisMonth' : 'LastMonth'}.json?PageSize=1000`),
        twilio<{ balance: string; currency: string }>('/Balance.json').catch(() => null),
    ]);
    if (!records) return null;
    const priced = records.usage_records
        .map((r) => ({ ...r, amount: Math.abs(Number(r.price) || 0), unit: r.price_unit ?? 'USD' }))
        .filter((r) => r.amount > 0);
    const totalRec = priced.find((r) => r.category === 'totalprice');
    // Twilio range ses catégories en arbre (« calls » contient « calls-inbound ») : on garde les feuilles.
    const leaves = priced.filter((r) => r.category !== 'totalprice' && !priced.some((o) => o !== r && o.category.startsWith(`${r.category}-`)));
    const lines = new Map<string, { label: string; amount: number; usage: string }>();
    for (const r of leaves) {
        const label = TWILIO_LABELS[r.category] ?? r.description;
        const prev = lines.get(label);
        const amount = toEur(r.amount, r.unit);
        const usage = `${Number(r.usage).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${r.usage_unit}`;
        lines.set(label, prev ? { ...prev, amount: prev.amount + amount } : { label, amount, usage });
    }
    const list = [...lines.values()].sort((a, b) => b.amount - a.amount);
    return {
        total: totalRec ? toEur(totalRec.amount, totalRec.unit) : list.reduce((s, l) => s + l.amount, 0),
        lines: list,
        balance: balance ? toEur(Number(balance.balance) || 0, balance.currency) : null,
    };
}

/* ───────────────────────── OpenAI : la facture réelle ───────────────────────── */

export interface OpenAiBill {
    total: number;
    lines: Array<{ label: string; amount: number }>;
}

export function openAiBillConfigured(): boolean {
    return Boolean(process.env.OPENAI_ADMIN_KEY?.trim());
}

/** Ce qu'OpenAI facture sur la période (clé d'administration requise, lecture seule). */
export async function openAiBill(range: Range): Promise<OpenAiBill | null> {
    const key = process.env.OPENAI_ADMIN_KEY?.trim();
    if (!key) return null;
    const lines = new Map<string, number>();
    let page: string | null = null;
    for (let i = 0; i < 5; i++) {
        const q = new URLSearchParams({
            start_time: String(Math.floor(range.start.getTime() / 1000)),
            end_time: String(Math.floor(Math.min(range.end.getTime(), Date.now()) / 1000)),
            bucket_width: '1d',
            limit: '31',
        });
        q.append('group_by', 'line_item');
        if (page) q.set('page', page);
        const res = await fetch(`https://api.openai.com/v1/organization/costs?${q}`, {
            headers: { Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(10000),
            cache: 'no-store',
        });
        if (!res.ok) throw new Error(`OpenAI répond ${res.status}`);
        const body = (await res.json()) as {
            data?: Array<{ results?: Array<{ amount?: { value?: number; currency?: string }; line_item?: string | null }> }>;
            has_more?: boolean;
            next_page?: string | null;
        };
        for (const b of body.data ?? []) {
            for (const r of b.results ?? []) {
                const v = toEur(Number(r.amount?.value) || 0, r.amount?.currency ?? 'usd');
                const label = r.line_item || 'Autre';
                lines.set(label, (lines.get(label) ?? 0) + v);
            }
        }
        if (!body.has_more || !body.next_page) break;
        page = body.next_page;
    }
    const list = [...lines.entries()].map(([label, amount]) => ({ label, amount })).filter((l) => l.amount >= 0.005).sort((a, b) => b.amount - a.amount);
    return { total: list.reduce((s, l) => s + l.amount, 0), lines: list };
}

/* ───────────────────────── Stripe : les frais ───────────────────────── */

export async function stripeFees(range: Range): Promise<number | null> {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    try {
        let fees = 0;
        for await (const t of stripe().balanceTransactions.list({ created: { gte: Math.floor(range.start.getTime() / 1000), lt: Math.floor(range.end.getTime() / 1000) }, limit: 100 })) {
            fees += (t.fee ?? 0) / 100;
        }
        return fees;
    } catch (err) {
        console.warn('[admin] frais Stripe illisibles :', err instanceof Error ? err.message : String(err));
        return null;
    }
}

/* ───────────────────────── Le détail par usage ───────────────────────── */

export interface CallLine {
    id: string;
    at: string;
    client: string;
    profileId: string | null;
    seconds: number;
    cost: CallCost;
}

export interface DemoLine {
    id: string;
    at: string;
    name: string;
    seconds: number;
    status: string;
    line: number;
    voice: number;
    conversation: number;
    writing: number;
    total: number;
    estimated: boolean;
}

export interface CompositionLine {
    projectId: string;
    client: string;
    profileId: string | null;
    count: number;
    total: number;
}

/** Prix réel de la ligne pour un appel Twilio, en euros (null si inconnu). */
async function twilioCallPrice(callSid: string): Promise<number | null> {
    if (!/^CA[0-9a-f]{32}$/i.test(callSid)) return null;
    try {
        const call = await twilio<{ price?: string | null; price_unit?: string | null }>(`/Calls/${callSid}.json`);
        if (call?.price == null) return null;
        const amount = Math.abs(Number(call.price));
        return Number.isFinite(amount) ? toEur(amount, call.price_unit ?? 'USD') : null;
    } catch {
        return null;
    }
}

async function clientNames(projectIds: string[]): Promise<Map<string, { name: string; profileId: string | null }>> {
    const out = new Map<string, { name: string; profileId: string | null }>();
    if (!projectIds.length) return out;
    const { data: projects } = await db().from('projects').select('id, user_id').in('id', projectIds);
    const userIds = [...new Set((projects ?? []).map((p) => p.user_id as string).filter(Boolean))];
    const { data: profiles } = userIds.length ? await db().from('profiles').select('id, first_name, last_name').in('id', userIds) : { data: [] };
    const byId = new Map((profiles ?? []).map((p) => [p.id as string, `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()]));
    for (const p of projects ?? []) out.set(p.id as string, { name: byId.get(p.user_id as string) || 'Client sans nom', profileId: (p.user_id as string) ?? null });
    return out;
}

export async function callLines(range: Range): Promise<CallLine[]> {
    const { data, error } = await db()
        .from('interviews')
        .select('id, created_at, project_id, duration_seconds, call_event_id, ai_analysis_log')
        .gte('created_at', range.start.toISOString())
        .lt('created_at', range.end.toISOString())
        .order('created_at', { ascending: false })
        .limit(400);
    if (error) throw new Error(`entretiens : ${error.message}`);
    const rows = data ?? [];
    const [costs, names] = await Promise.all([callCosts(rows), clientNames([...new Set(rows.map((r) => r.project_id as string).filter(Boolean))])]);
    return rows.map((r) => {
        const who = names.get(r.project_id as string);
        return {
            id: String(r.id),
            at: String(r.created_at),
            client: who?.name ?? 'Client inconnu',
            profileId: who?.profileId ?? null,
            seconds: Number(r.duration_seconds) || 0,
            cost: costs.get(String(r.id)) ?? { line: 0, voice: 0, conversation: 0, writing: 0, total: 0, totalTtc: 0, estimated: true },
        };
    });
}

export async function demoLines(range: Range): Promise<DemoLine[]> {
    const { data, error } = await db()
        .from('demo_stories')
        .select('id, created_at, call_id, first_name, duration_seconds, status, usage, recording_sid')
        .gte('created_at', range.start.toISOString())
        .lt('created_at', range.end.toISOString())
        .order('created_at', { ascending: false })
        .limit(300);
    if (error) throw new Error(`démos : ${error.message}`);
    return Promise.all(
        (data ?? []).map(async (d) => {
            const seconds = Number(d.duration_seconds) || 0;
            const minutes = seconds / 60;
            let estimated = false;
            const real = typeof d.call_id === 'string' ? await twilioCallPrice(d.call_id) : null;
            const line = real ?? eur(minutes * COSTS.lineFallbackPerMinute);
            if (real == null) estimated = true;
            const voice = eur(minutes * COSTS.conversationRelayPerMinute + (d.recording_sid ? Math.ceil(minutes) * COSTS.recordingPerMinute : 0));
            const u = demoUsage(d.usage);
            let conversation: number;
            if (u.voice) conversation = eur(tokensCostUsd(u.voice));
            else {
                conversation = eur(minutes * COSTS.conversationFallbackPerMinute);
                estimated = true;
            }
            const writing = u.writer ? eur(tokensCostUsd(u.writer)) : 0;
            return {
                id: String(d.id),
                at: String(d.created_at),
                name: (d.first_name as string | null) || 'Prénom inconnu',
                seconds,
                status: String(d.status),
                line,
                voice,
                conversation,
                writing,
                total: line + voice + conversation + writing,
                estimated,
            };
        })
    );
}

/** Les compositions automatiques du livre lancées sur la période, par client. */
export async function compositionLines(range: Range): Promise<CompositionLine[]> {
    const { data, error } = await db()
        .from('book_editions')
        .select('project_id, status, error')
        .gte('created_at', range.start.toISOString())
        .lt('created_at', range.end.toISOString())
        .limit(2000);
    if (error) throw new Error(`compositions : ${error.message}`);
    const counts = new Map<string, number>();
    for (const e of data ?? []) counts.set(e.project_id as string, (counts.get(e.project_id as string) ?? 0) + 1);
    const names = await clientNames([...counts.keys()]);
    return [...counts.entries()]
        .map(([projectId, count]) => ({
            projectId,
            client: names.get(projectId)?.name ?? 'Client inconnu',
            profileId: names.get(projectId)?.profileId ?? null,
            count,
            total: eur(count * COSTS.compositionFallbackPerEdition),
        }))
        .sort((a, b) => b.count - a.count);
}

export function subscriptionsMonthly(): { lines: Array<{ name: string; amount: number | null; note?: string }>; total: number; missing: number } {
    const lines = COSTS.subscriptions.map((s) => ({ name: s.name, amount: s.amount == null ? null : toEur(s.amount, s.currency), note: s.note }));
    return { lines, total: lines.reduce((t, l) => t + (l.amount ?? 0), 0), missing: lines.filter((l) => l.amount == null).length };
}

/* ───────────────────────── Le tout ───────────────────────── */

async function settle<T>(p: Promise<T>): Promise<{ value: T | null; error: string | null }> {
    try {
        return { value: await p, error: null };
    } catch (err) {
        return { value: null, error: err instanceof Error ? err.message : String(err) };
    }
}

export interface Spend {
    range: Range;
    twilio: { value: TwilioBill | null; error: string | null };
    openai: { value: OpenAiBill | null; error: string | null };
    stripe: number | null;
    calls: CallLine[];
    demos: DemoLine[];
    compositions: CompositionLine[];
    subs: ReturnType<typeof subscriptionsMonthly>;
    /** Sommes du détail recalculé. */
    sums: { calls: CallCost; demos: number; demosAi: number; compositions: number; callsAi: number };
    /** Le total du mois : factures réelles quand on les a, sinon le détail. */
    total: number;
    /** Projection à la fin du mois en cours (null pour un mois fini). */
    projected: number | null;
    errors: string[];
}

export async function getSpend(period: Period): Promise<Spend> {
    const range = monthRange(period);
    const [tw, oa, fees, calls, demos, comps] = await Promise.all([
        settle(twilioBill(period)),
        settle(openAiBill(range)),
        stripeFees(range),
        settle(callLines(range)),
        settle(demoLines(range)),
        settle(compositionLines(range)),
    ]);
    const callSum = sumCosts((calls.value ?? []).map((c) => c.cost));
    const demoList = demos.value ?? [];
    const compList = comps.value ?? [];
    const sums = {
        calls: callSum,
        demos: demoList.reduce((s, d) => s + d.total, 0),
        demosAi: demoList.reduce((s, d) => s + d.conversation + d.writing, 0),
        compositions: compList.reduce((s, c) => s + c.total, 0),
        callsAi: callSum.conversation + callSum.writing,
    };
    const subs = subscriptionsMonthly();
    // Factures réelles d'abord ; à défaut, la part recalculée de chaque fournisseur.
    const twilioPart = tw.value?.total ?? callSum.line + callSum.voice + demoList.reduce((s, d) => s + d.line + d.voice, 0);
    const openaiPart = oa.value?.total ?? sums.callsAi + sums.demosAi + sums.compositions;
    const variable = twilioPart + openaiPart + (fees ?? 0);
    const total = variable + subs.total;
    const projected = period === 'mois' ? (variable / range.elapsedDays) * range.totalDays + subs.total : null;
    const errors = [
        tw.error && `Twilio : ${tw.error}`,
        oa.error && `OpenAI : ${oa.error}`,
        calls.error && `Appels : ${calls.error}`,
        demos.error && `Démos : ${demos.error}`,
        comps.error && `Compositions : ${comps.error}`,
    ].filter((e): e is string => !!e);
    return { range, twilio: tw, openai: oa, stripe: fees, calls: calls.value ?? [], demos: demoList, compositions: compList, subs, sums, total, projected, errors };
}
