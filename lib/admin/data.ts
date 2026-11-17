/**
 * Lectures de l'admin. Clé service role (lib/loomina/db.ts) : ces fonctions
 * ne s'appellent que depuis des pages serveur protégées par requireAdmin().
 * Lecture seule : l'admin ne modifie rien dans la base.
 */

import { db } from '@/lib/loomina/db';
import type { Profile, Project } from '@/lib/loomina/db';
import { readEditions } from '@/lib/loomina/book-edition';
import type { Edition } from '@/lib/loomina/book-edition';
import { normalizeCallMinutes } from '@/lib/loomina/call-length';
import { normalizeSchedule, describeSchedule } from '@/lib/loomina/schedule';
import { readGiver } from '@/lib/loomina/giver';
import type { Giver } from '@/lib/loomina/giver';

export type Row = Record<string, unknown>;

function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
    if (res.error) throw new Error(`${what} : ${res.error.message}`);
    return (res.data ?? ([] as unknown)) as T;
}

export interface ClientSummary {
    profile: Profile & { created_at: string };
    project: (Project & { created_at: string; stripe_session_id: string | null }) | null;
    calls: number;
    lastCallAt: string | null;
    minutes: number;
    chapters: number;
    words: number;
    failedEvents: number;
    isGift: boolean;
    giverName: string | null;
}

/** Tous les clients, du plus récent au plus ancien, avec leurs chiffres. */
export async function listClients(): Promise<ClientSummary[]> {
    const supabase = db();
    const [profiles, projects, interviews, chapters, events] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('interviews').select('project_id, created_at, duration_seconds').limit(10000),
        supabase.from('chapters').select('project_id, word_count, status').limit(10000),
        supabase.from('call_events').select('project_id, status').eq('status', 'failed').limit(1000),
    ]);
    const P = must(profiles, 'profils') as ClientSummary['profile'][];
    const J = must(projects, 'projets') as NonNullable<ClientSummary['project']>[];
    const I = must(interviews, 'entretiens') as Row[];
    const C = must(chapters, 'chapitres') as Row[];
    const E = must(events, 'événements') as Row[];

    return P.map((profile) => {
        // Le projet le plus récent du profil (un client qui recommande en a plusieurs).
        const project = J.find((j) => j.user_id === profile.id) ?? null;
        const mine = project ? I.filter((i) => i.project_id === project.id) : [];
        const chaps = project ? C.filter((c) => c.project_id === project.id && c.status !== 'archived') : [];
        const meta = (project?.project_metadata ?? {}) as Row;
        const giver = readGiver(meta);
        return {
            profile,
            project,
            calls: mine.length,
            lastCallAt: mine.map((i) => String(i.created_at)).sort().at(-1) ?? null,
            minutes: Math.round(mine.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
            chapters: chaps.length,
            words: chaps.reduce((s, c) => s + (Number(c.word_count) || 0), 0),
            failedEvents: project ? E.filter((e) => e.project_id === project.id).length : 0,
            isGift: meta.is_gift === true,
            giverName: giver?.firstName ?? null,
        };
    });
}

export interface ClientDetail {
    profile: Profile & { created_at: string; updated_at?: string };
    projects: Array<Project & { created_at: string; stripe_session_id: string | null }>;
    project: (Project & { created_at: string; stripe_session_id: string | null }) | null;
    interviews: Row[];
    chapters: Row[];
    events: Row[];
    family: Row[];
    editions: { ready: Edition | null; running: Edition | null; failed: Edition | null };
    order: {
        isGift: boolean;
        buyerEmail: string | null;
        callMinutes: number;
        giver: Giver | null;
        stripeSessionId: string | null;
        paidAt: string | null;
    };
    settings: {
        schedule: ReturnType<typeof normalizeSchedule>;
        smsChapter: boolean;
        shareWithGiver: boolean;
        prefsSetAt: string | null;
        photos: number;
    };
}

export async function getClient(profileId: string): Promise<ClientDetail | null> {
    const supabase = db();
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();
    if (error) throw new Error(`profil : ${error.message}`);
    if (!profile) return null;

    const projects = must(
        await supabase.from('projects').select('*').eq('user_id', profileId).order('created_at', { ascending: false }),
        'projets'
    ) as ClientDetail['projects'];
    const project = projects[0] ?? null;
    const pid = project?.id ?? '00000000-0000-0000-0000-000000000000';

    const [interviews, chapters, events, family, editions] = await Promise.all([
        supabase
            .from('interviews')
            .select('id, created_at, started_at, duration_seconds, phase, processing_status, topics_summary, transcript, sentiment_score, ai_analysis_log, call_event_id')
            .eq('project_id', pid)
            .order('created_at', { ascending: false })
            .limit(200),
        supabase
            .from('chapters')
            .select('id, chapter_number, phase, title, content_markdown, word_count, status, version, created_at, updated_at, latest_interview_id')
            .eq('project_id', pid)
            .order('chapter_number', { ascending: true })
            .limit(500),
        supabase
            .from('call_events')
            .select('id, created_at, event_type, status, attempts, error, processed_at, vapi_call_id')
            .eq('project_id', pid)
            .order('created_at', { ascending: false })
            .limit(100),
        supabase.from('family_members').select('full_name, relation, is_deceased, notes').eq('project_id', pid).limit(200),
        project ? readEditions(project.id) : Promise.resolve({ ready: null, running: null, failed: null }),
    ]);

    const meta = (project?.project_metadata ?? {}) as Row;
    const photos = Array.isArray(meta.photos) ? meta.photos.length : 0;

    return {
        profile: profile as ClientDetail['profile'],
        projects,
        project,
        interviews: must(interviews, 'entretiens') as Row[],
        chapters: must(chapters, 'chapitres') as Row[],
        events: must(events, 'événements') as Row[],
        family: must(family, 'proches') as Row[],
        editions,
        order: {
            isGift: meta.is_gift === true,
            buyerEmail: typeof meta.buyer_email === 'string' ? meta.buyer_email : null,
            callMinutes: normalizeCallMinutes(meta.call_minutes),
            giver: readGiver(meta),
            stripeSessionId: project?.stripe_session_id ?? null,
            paidAt: project?.created_at ?? null,
        },
        settings: {
            schedule: normalizeSchedule(meta.call_schedule),
            smsChapter: meta.sms_chapter !== false,
            shareWithGiver: meta.share_with_giver === true,
            prefsSetAt: typeof meta.prefs_set_at === 'string' ? meta.prefs_set_at : null,
            photos,
        },
    };
}

export interface Overview {
    clients: number;
    activeBooks: number;
    completedBooks: number;
    callsWeek: number;
    minutesWeek: number;
    chapters: number;
    words: number;
    recentCalls: Array<Row & { client: string | null; profileId: string | null }>;
    problems: Array<Row & { client: string | null; profileId: string | null }>;
    contacts: Row[];
    stuckEditions: Row[];
}

export async function getOverview(): Promise<Overview> {
    const supabase = db();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [profiles, projects, interviews, chapters, problems, contacts, editions] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name').limit(1000),
        supabase.from('projects').select('id, user_id, status').limit(1000),
        supabase
            .from('interviews')
            .select('id, project_id, created_at, duration_seconds, processing_status, topics_summary, phase')
            .order('created_at', { ascending: false })
            .limit(500),
        supabase.from('chapters').select('word_count, status').limit(10000),
        supabase
            .from('call_events')
            .select('id, project_id, created_at, status, attempts, error, event_type')
            .in('status', ['failed', 'pending', 'processing'])
            .order('created_at', { ascending: false })
            .limit(50),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('book_editions').select('id, project_id, status, error, updated_at').eq('status', 'failed').order('updated_at', { ascending: false }).limit(5),
    ]);
    const P = must(profiles, 'profils') as Row[];
    const J = must(projects, 'projets') as Row[];
    const I = must(interviews, 'entretiens') as Row[];
    const C = (must(chapters, 'chapitres') as Row[]).filter((c) => c.status !== 'archived');

    const whose = (projectId: unknown) => {
        const project = J.find((j) => j.id === projectId);
        const profile = project ? P.find((p) => p.id === project.user_id) : undefined;
        return {
            client: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || null : null,
            profileId: (profile?.id as string) ?? null,
        };
    };

    const week = I.filter((i) => String(i.created_at) >= weekAgo);
    return {
        clients: P.length,
        activeBooks: J.filter((j) => j.status === 'active').length,
        completedBooks: J.filter((j) => j.status === 'completed').length,
        callsWeek: week.length,
        minutesWeek: Math.round(week.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
        chapters: C.length,
        words: C.reduce((s, c) => s + (Number(c.word_count) || 0), 0),
        recentCalls: I.slice(0, 12).map((i) => ({ ...i, ...whose(i.project_id) })),
        problems: (must(problems, 'événements') as Row[]).map((e) => ({ ...e, ...whose(e.project_id) })),
        // La table peut ne pas exister sur une base de test : on ne bloque pas la page.
        contacts: contacts.error ? [] : ((contacts.data ?? []) as Row[]),
        stuckEditions: editions.error ? [] : ((editions.data ?? []) as Row[]),
    };
}

/** Réglages de production qui méritent une alerte sur la page d'accueil de l'admin. */
export function configWarnings(): string[] {
    const w: string[] = [];
    if (process.env.LOOMINA_OPEN_AUTHOR_PROFILE_ID?.trim()) {
        w.push("LOOMINA_OPEN_AUTHOR_PROFILE_ID est posée : l'espace auteur s'ouvre pour tout visiteur, sans code SMS, sur un profil de test. À retirer avant le premier vrai client.");
    }
    const need: Array<[string, string]> = [
        ['SUPABASE_SERVICE_ROLE_KEY', 'base de données'],
        ['OPENAI_API_KEY', 'Directeur, Écrivain et livre'],
        ['VAPI_WEBHOOK_SECRET', 'réception des rapports d’appel'],
        ['STRIPE_SECRET_KEY', 'paiement'],
        ['STRIPE_WEBHOOK_SECRET', 'création des comptes après paiement'],
        ['TWILIO_ACCOUNT_SID', 'SMS'],
        ['TWILIO_VERIFY_SERVICE_SID', 'code de connexion par SMS'],
        ['JWT_SECRET', 'sessions de l’espace auteur'],
    ];
    for (const [name, role] of need) if (!process.env[name]?.trim()) w.push(`${name} absente (${role}).`);
    if (!process.env.CRON_SECRET?.trim()) w.push('CRON_SECRET absente : le rattrapage de 3 h par le site ne passe pas (celui du serveur vocal, toutes les 5 minutes, continue).');
    return w;
}

/** État du serveur vocal (Render). Ne lève jamais. */
export async function voiceHealth(): Promise<{ ok: boolean; detail: string }> {
    const url = (process.env.VOICE_SERVER_URL?.trim() || 'https://loomina-voice.onrender.com').replace(/\/$/, '');
    try {
        const res = await fetch(`${url}/health`, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; sessions?: number; model?: string };
        if (!res.ok || !body.ok) return { ok: false, detail: `répond ${res.status}` };
        return { ok: true, detail: `${body.sessions ?? 0} appel(s) en cours · modèle ${body.model ?? '?'}` };
    } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.message : String(err) };
    }
}

// ------------------------------------------------------------------
// Suivi client
// ------------------------------------------------------------------

export type CrmStage = 'commande' | 'onboarde' | 'recit' | 'avance' | 'termine';
export type CrmHealth = 'attente' | 'relancer' | 'actif' | 'inactif' | 'termine';

export interface CrmClient {
    id: string;
    name: string;
    phone: string | null;
    orderedAt: string;
    isGift: boolean;
    paid: boolean;
    phase: number | null;
    progress: number;
    realCalls: number;
    shortCalls: number;
    minutes: number;
    chapters: number;
    words: number;
    firstCallAt: string | null;
    lastCallAt: string | null;
    daysSinceOrder: number;
    daysSinceLastCall: number | null;
    daysToFirstCall: number | null;
    schedule: string | null;
    stage: CrmStage;
    health: CrmHealth;
    failedEvents: number;
}

export interface Crm {
    clients: CrmClient[];
    weeks: Array<{ label: string; calls: number; minutes: number }>;
    months: Array<{ label: string; orders: number }>;
}

/** Sans premier vrai appel au bout de ce délai, le client est « à relancer ». */
export const RELANCE_AFTER_DAYS = 3;
/** Sans appel depuis ce délai, un livre en cours est « inactif ». */
export const INACTIVE_AFTER_DAYS = 14;

const DAY = 24 * 3600 * 1000;

export async function getCrm(now = Date.now()): Promise<Crm> {
    const supabase = db();
    const [profiles, projects, interviews, chapters, events] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('interviews').select('project_id, created_at, duration_seconds, processing_status').limit(10000),
        supabase.from('chapters').select('project_id, word_count, status').limit(10000),
        supabase.from('call_events').select('project_id').eq('status', 'failed').limit(1000),
    ]);
    const P = must(profiles, 'profils') as ClientSummary['profile'][];
    const J = must(projects, 'projets') as NonNullable<ClientSummary['project']>[];
    const I = must(interviews, 'entretiens') as Row[];
    const C = (must(chapters, 'chapitres') as Row[]).filter((c) => c.status !== 'archived');
    const E = must(events, 'événements') as Row[];

    const clients: CrmClient[] = P.map((profile) => {
        const project = J.find((j) => j.user_id === profile.id) ?? null;
        const mine = project ? I.filter((i) => i.project_id === project.id) : [];
        const real = mine.filter((i) => i.processing_status !== 'too_short').sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
        const chaps = project ? C.filter((c) => c.project_id === project.id) : [];
        const meta = (project?.project_metadata ?? {}) as Row;
        const orderedAt = String(project?.created_at ?? profile.created_at);
        const firstCallAt = real[0] ? String(real[0].created_at) : null;
        const lastCallAt = real.length ? String(real[real.length - 1].created_at) : null;
        const daysSinceOrder = Math.floor((now - new Date(orderedAt).getTime()) / DAY);
        const daysSinceLastCall = lastCallAt ? Math.floor((now - new Date(lastCallAt).getTime()) / DAY) : null;
        const phase = project ? Number(project.phase) : null;
        const completed = project?.status === 'completed';

        const stage: CrmStage = completed ? 'termine' : (phase ?? 1) >= 2 ? 'avance' : chaps.length > 0 ? 'recit' : real.length > 0 ? 'onboarde' : 'commande';
        const health: CrmHealth = completed
            ? 'termine'
            : real.length === 0
              ? daysSinceOrder > RELANCE_AFTER_DAYS
                  ? 'relancer'
                  : 'attente'
              : (daysSinceLastCall ?? 0) > INACTIVE_AFTER_DAYS
                ? 'inactif'
                : 'actif';

        return {
            id: profile.id,
            name: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.full_name || 'Sans nom',
            phone: profile.phone_number,
            orderedAt,
            isGift: meta.is_gift === true,
            paid: Boolean(project?.stripe_session_id),
            phase,
            progress: Number(project?.phase_progress ?? 0),
            realCalls: real.length,
            shortCalls: mine.length - real.length,
            minutes: Math.round(real.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
            chapters: chaps.length,
            words: chaps.reduce((s, c) => s + (Number(c.word_count) || 0), 0),
            firstCallAt,
            lastCallAt,
            daysSinceOrder,
            daysSinceLastCall,
            daysToFirstCall: firstCallAt ? Math.max(0, Math.floor((new Date(firstCallAt).getTime() - new Date(orderedAt).getTime()) / DAY)) : null,
            schedule: describeSchedule(normalizeSchedule(meta.call_schedule)),
            stage,
            health,
            failedEvents: project ? E.filter((e) => e.project_id === project.id).length : 0,
        };
    });

    // Huit dernières semaines d'appels (lundi → dimanche, heure de Paris approchée par UTC).
    const weeks: Crm['weeks'] = [];
    const monday = new Date(now);
    monday.setUTCHours(0, 0, 0, 0);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    for (let w = 7; w >= 0; w--) {
        const start = monday.getTime() - w * 7 * DAY;
        const inWeek = I.filter((i) => {
            const t = new Date(String(i.created_at)).getTime();
            return t >= start && t < start + 7 * DAY && i.processing_status !== 'too_short';
        });
        weeks.push({
            label: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(start)),
            calls: inWeek.length,
            minutes: Math.round(inWeek.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
        });
    }

    // Six derniers mois de commandes.
    const months: Crm['months'] = [];
    const d = new Date(now);
    for (let m = 5; m >= 0; m--) {
        const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - m, 1));
        const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - m + 1, 1));
        months.push({
            label: new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(start),
            orders: J.filter((j) => {
                const t = new Date(j.created_at).getTime();
                return t >= start.getTime() && t < end.getTime();
            }).length,
        });
    }

    return { clients, weeks, months };
}
