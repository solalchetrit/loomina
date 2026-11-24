/**
 * Lectures de l'admin. Clé service role (lib/loomina/db.ts) : ces fonctions
 * ne s'appellent que depuis des pages serveur protégées par requireAdmin().
 * Lecture seule : l'admin ne modifie rien dans la base.
 */

import { extraCopiesOrders, type ExtraCopiesOrder } from '@/lib/loomina/extra-copies';
import { readShipping, shippingLines } from '@/lib/loomina/shipping';
import { db } from '@/lib/loomina/db';
import type { Profile, Project } from '@/lib/loomina/db';
import { readEditions } from '@/lib/loomina/book-edition';
import type { Edition } from '@/lib/loomina/book-edition';
import { normalizeCallMinutes } from '@/lib/loomina/call-length';
import { normalizeSchedule, describeSchedule } from '@/lib/loomina/schedule';
import { readFamilyMembers, readGiver } from '@/lib/loomina/giver';
import type { Giver } from '@/lib/loomina/giver';
import { isTestMeta } from '@/lib/loomina/test-flag';
import { readFulfillment, type Fulfillment } from '@/lib/loomina/fulfillment';

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
    /** Client de test : rangé à part, hors de tous les chiffres. */
    test: boolean;
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
            test: isTestMeta(meta),
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
        /** Exemplaires en plus du livre de l'auteur : à la commande ou depuis l'espace famille. */
        extraCopies: ExtraCopiesOrder[];
        giver: Giver | null;
        /** Les autres proches qui ouvrent l'espace famille. */
        family: { firstName: string | null; phone: string }[];
        stripeSessionId: string | null;
        paidAt: string | null;
        /** Adresse d'envoi du livre, donnée par l'auteur une fois le livre terminé. */
        shipping: string[] | null;
        refundedAt: string | null;
        refundAmount: number | null;
        relances: Array<{ at: string; to?: string }>;
        test: boolean;
        fulfillment: Fulfillment;
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
            extraCopies: extraCopiesOrders(meta),
            giver: readGiver(meta),
            family: readFamilyMembers(meta).map((m) => ({ firstName: m.firstName, phone: m.phone })),
            stripeSessionId: project?.stripe_session_id ?? null,
            paidAt: project?.created_at ?? null,
            shipping: readShipping(meta) ? shippingLines(readShipping(meta)!) : null,
            refundedAt: typeof meta.refunded_at === 'string' ? meta.refunded_at : null,
            refundAmount: typeof meta.refund_amount === 'number' ? meta.refund_amount : null,
            relances: Array.isArray(meta.relances) ? (meta.relances as Array<{ at: string; to?: string }>).filter((r) => typeof r?.at === 'string') : [],
            test: isTestMeta(meta),
            fulfillment: readFulfillment(project?.status, meta),
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

export interface BookLine {
    profileId: string;
    projectId: string;
    client: string;
    phone: string | null;
    isGift: boolean;
    completedAt: string | null;
    fulfillment: Fulfillment;
    hasAddress: boolean;
    refunded: boolean;
}

export interface Overview {
    clients: number;
    activeBooks: number;
    completedBooks: number;
    callsWeek: number;
    minutesWeek: number;
    ordersWeek: number;
    chapters: number;
    words: number;
    recentCalls: Array<Row & { client: string | null; profileId: string | null; test: boolean }>;
    problems: Array<Row & { client: string | null; profileId: string | null }>;
    /** Messages du formulaire de contact pas encore traités, le plus récent d'abord. */
    contacts: Row[];
    /** Combien ont déjà été traités (rangés dans un repli). */
    contactsHandled: Row[];
    stuckEditions: Row[];
    /** Les livres terminés qui attendent un geste de l'équipe (relire, imprimer, expédier). */
    booksToAct: BookLine[];
    /** Commandes des sept derniers jours, la plus récente d'abord (hors tests). */
    newOrders: Array<{ client: string | null; profileId: string | null; at: string; isGift: boolean }>;
}

export async function getOverview(): Promise<Overview> {
    const supabase = db();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [profiles, projects, interviews, chapters, problems, contacts, editions] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, phone_number').limit(1000),
        supabase.from('projects').select('id, user_id, status, project_metadata, created_at, updated_at').order('created_at', { ascending: false }).limit(1000),
        supabase
            .from('interviews')
            .select('id, project_id, created_at, duration_seconds, processing_status, topics_summary, phase')
            .order('created_at', { ascending: false })
            .limit(500),
        supabase.from('chapters').select('project_id, word_count, status').limit(10000),
        supabase
            .from('call_events')
            .select('id, project_id, created_at, status, attempts, error, event_type')
            .in('status', ['failed', 'pending', 'processing'])
            .order('created_at', { ascending: false })
            .limit(50),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(60),
        supabase.from('book_editions').select('id, project_id, status, error, updated_at').eq('status', 'failed').order('updated_at', { ascending: false }).limit(5),
    ]);
    const P = must(profiles, 'profils') as Row[];
    const allProjects = must(projects, 'projets') as Row[];
    const testIds = new Set(allProjects.filter((j) => isTestMeta(j.project_metadata as Row | null)).map((j) => j.id));
    // Les chiffres ne comptent que les vrais clients.
    const J = allProjects.filter((j) => !testIds.has(j.id));
    const I = must(interviews, 'entretiens') as Row[];
    const realI = I.filter((i) => !testIds.has(i.project_id));
    const C = (must(chapters, 'chapitres') as Row[]).filter((c) => c.status !== 'archived' && !testIds.has(c.project_id));

    const whose = (projectId: unknown) => {
        const project = allProjects.find((j) => j.id === projectId);
        const profile = project ? P.find((p) => p.id === project.user_id) : undefined;
        return {
            client: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || null : null,
            profileId: (profile?.id as string) ?? null,
        };
    };

    const week = realI.filter((i) => String(i.created_at) >= weekAgo);
    const allContacts = contacts.error ? [] : ((contacts.data ?? []) as Row[]);
    const books = booksFrom(J, P);
    return {
        clients: new Set(J.map((j) => j.user_id)).size,
        activeBooks: J.filter((j) => j.status === 'active').length,
        completedBooks: J.filter((j) => j.status === 'completed').length,
        callsWeek: week.length,
        minutesWeek: Math.round(week.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
        ordersWeek: J.filter((j) => String(j.created_at) >= weekAgo).length,
        chapters: C.length,
        words: C.reduce((s, c) => s + (Number(c.word_count) || 0), 0),
        recentCalls: I.slice(0, 12).map((i) => ({ ...i, ...whose(i.project_id), test: testIds.has(i.project_id) })),
        problems: (must(problems, 'événements') as Row[]).map((e) => ({ ...e, ...whose(e.project_id) })),
        // La table peut ne pas exister sur une base de test : on ne bloque pas la page.
        contacts: allContacts.filter((m) => !m.handled_at),
        contactsHandled: allContacts.filter((m) => !!m.handled_at).slice(0, 20),
        stuckEditions: editions.error ? [] : ((editions.data ?? []) as Row[]),
        newOrders: J.filter((j) => String(j.created_at) >= weekAgo)
            .map((j) => ({ ...whose(j.id), at: String(j.created_at), isGift: (j.project_metadata as Row | null)?.is_gift === true })),
        booksToAct: books.filter((b) => !b.refunded && ['completed', 'reviewed', 'printing'].includes(b.fulfillment.stage)),
    };
}

/** Les livres terminés (hors tests), du plus récent au plus ancien. */
function booksFrom(projects: Row[], profiles: Row[]): BookLine[] {
    return projects
        .filter((j) => j.status === 'completed')
        .map((j) => {
            const meta = (j.project_metadata ?? {}) as Row;
            const profile = profiles.find((p) => p.id === j.user_id);
            return {
                profileId: String(j.user_id),
                projectId: String(j.id),
                client: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Sans nom' : 'Client inconnu',
                phone: (profile?.phone_number as string | null) ?? null,
                isGift: meta.is_gift === true,
                completedAt: typeof meta.completed_at === 'string' ? meta.completed_at : ((j.updated_at as string | null) ?? null),
                fulfillment: readFulfillment(String(j.status), meta),
                hasAddress: readShipping(meta) !== null,
                refunded: typeof meta.refunded_at === 'string',
            };
        });
}

/** La page « Livres » : chaque livre terminé et son étape, de la relecture à l'arrivée. */
export async function listBooks(): Promise<BookLine[]> {
    const supabase = db();
    const [profiles, projects] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, phone_number').limit(1000),
        supabase.from('projects').select('id, user_id, status, project_metadata, created_at, updated_at').eq('status', 'completed').order('updated_at', { ascending: false }).limit(1000),
    ]);
    const J = (must(projects, 'projets') as Row[]).filter((j) => !isTestMeta(j.project_metadata as Row | null));
    return booksFrom(J, must(profiles, 'profils') as Row[]);
}

export interface ConfigWarning {
    /** Ce qui ne marche pas, en clair. */
    problem: string;
    /** Ce qu'il faut faire. */
    fix: string;
    /** Le nom technique, en petit, pour Vercel. */
    variable: string;
}

/** Réglages de production qui manquent, dits en clair (audit du 20/11/2026). */
export function configWarnings(): ConfigWarning[] {
    const vercel = 'Dans Vercel (projet loomina, Settings, Environment Variables), ajouter la variable';
    const need: Array<[string, string, string]> = [
        ['SUPABASE_SERVICE_ROLE_KEY', 'Le site ne peut plus lire la base de données : espaces auteur et admin vides.', 'la clé « service_role » de Supabase'],
        ['OPENAI_API_KEY', 'Les appels ne sont plus transformés en récits, et le livre ne se compose plus.', 'la clé OpenAI'],
        ['VAPI_WEBHOOK_SECRET', 'Le site refuse les comptes rendus d’appel envoyés par le serveur vocal.', 'le secret partagé avec le serveur vocal'],
        ['STRIPE_SECRET_KEY', 'Plus personne ne peut commander : le paiement ne s’ouvre pas.', 'la clé secrète Stripe'],
        ['STRIPE_WEBHOOK_SECRET', 'Un client qui paie ne reçoit ni compte ni livre.', 'le secret du webhook Stripe'],
        ['TWILIO_ACCOUNT_SID', 'Aucun SMS ne part (codes, récits prêts, alertes).', 'l’identifiant du compte Twilio'],
        ['TWILIO_VERIFY_SERVICE_SID', 'Les clients ne reçoivent plus de code pour ouvrir leur espace.', 'le service Verify de Twilio'],
        ['JWT_SECRET', 'Personne ne peut rester connecté à son espace auteur.', 'une longue phrase secrète'],
        ['SMTP_PASS', 'Aucun e-mail ne part de contact@loomina.eu (bienvenue, étapes du livre, alertes).', 'le mot de passe de la boîte contact@loomina.eu'],
        ['LOOMINA_ALERT_PHONE', 'Vous ne recevez plus les alertes par SMS (seulement par e-mail).', 'votre numéro de portable'],
        ['CRON_SECRET', 'Le rattrapage de nuit ne passe pas (celui du serveur vocal, toutes les 5 minutes, continue).', 'une phrase secrète pour la tâche de nuit'],
    ];
    return need
        .filter(([name]) => !process.env[name]?.trim())
        .map(([variable, problem, what]) => ({ problem, fix: `${vercel} ${variable} avec ${what}, puis redéployer.`, variable }));
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
    /** Le paiement Stripe lié au livre (pour lire le montant réel). */
    stripeSessionId: string | null;
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
    test: boolean;
    /** Livre terminé : son étape, de la relecture à l'arrivée. */
    fulfillment: Fulfillment;
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
            stripeSessionId: (project?.stripe_session_id as string | null | undefined) ?? null,
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
            test: isTestMeta(meta),
            fulfillment: readFulfillment(project?.status, meta),
        };
    });

    // Les graphiques ne comptent que les vrais clients.
    const testProjects = new Set(J.filter((j) => isTestMeta(j.project_metadata as Row | null)).map((j) => j.id));
    const realOrders = J.filter((j) => !testProjects.has(j.id));
    const realInterviews = I.filter((i) => !testProjects.has(i.project_id as string));

    // Huit dernières semaines d'appels (lundi → dimanche, heure de Paris approchée par UTC).
    const weeks: Crm['weeks'] = [];
    const monday = new Date(now);
    monday.setUTCHours(0, 0, 0, 0);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    for (let w = 7; w >= 0; w--) {
        const start = monday.getTime() - w * 7 * DAY;
        const inWeek = realInterviews.filter((i) => {
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
            orders: realOrders.filter((j) => {
                const t = new Date(j.created_at).getTime();
                return t >= start.getTime() && t < end.getTime();
            }).length,
        });
    }

    return { clients, weeks, months };
}

/** Les démonstrations de cinq minutes (table demo_stories, effacée après 30 jours). */
export async function listDemos(): Promise<Row[]> {
    return must(
        await db()
            .from('demo_stories')
            .select('id, created_at, first_name, phone, duration_seconds, status, title, content, transcript, error, sms_sent_at, email, email_count, promo_code, token, recording_sid')
            .order('created_at', { ascending: false })
            .limit(200),
        'demo_stories'
    );
}

/** Les commandes payées par Stripe (un livre = une commande), pour la page Argent. */
export async function listOrders(): Promise<Array<{ sessionId: string; client: string; profileId: string; isGift: boolean; at: string; test: boolean }>> {
    const supabase = db();
    const [profiles, projects] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name').limit(1000),
        supabase.from('projects').select('user_id, stripe_session_id, project_metadata, created_at').not('stripe_session_id', 'is', null).order('created_at', { ascending: false }).limit(1000),
    ]);
    const P = must(profiles, 'profils') as Row[];
    return (must(projects, 'projets') as Row[]).map((j) => {
        const p = P.find((x) => x.id === j.user_id);
        const meta = (j.project_metadata ?? {}) as Row;
        return {
            sessionId: String(j.stripe_session_id),
            client: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Sans nom' : 'Client inconnu',
            profileId: String(j.user_id),
            isGift: meta.is_gift === true,
            at: String(j.created_at),
            test: isTestMeta(meta),
        };
    });
}

// ------------------------------------------------------------------
// Les appels de la semaine (page Aujourd'hui)
// ------------------------------------------------------------------

export interface AgendaSlot {
    /** Jour à Paris, « AAAA-MM-JJ ». */
    day: string;
    /** « HH:MM », heure de Paris. */
    time: string;
    client: string;
    profileId: string;
    /** fait : un appel a eu lieu ce jour-là ; manqué : l'heure est passée sans appel ; à venir sinon. */
    state: 'done' | 'missed' | 'planned';
    /** Durée de l'appel du jour, en minutes, s'il a eu lieu. */
    minutes: number | null;
    /** Le prochain rendez-vous de la liste. */
    next: boolean;
    /** L'auteur n'a encore jamais eu de vrai appel. */
    first: boolean;
}

const parisDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
const parisClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false });

/**
 * Les rendez-vous réglés par les auteurs pour la semaine en cours (lundi à
 * dimanche, heure de Paris), avec ce que chaque appel a donné. Hors tests
 * et hors livres terminés.
 */
export async function getAgenda(now = Date.now()): Promise<AgendaSlot[]> {
    const supabase = db();
    const today = parisDay.format(new Date(now));
    const clock = parisClock.format(new Date(now));
    // Le lundi de la semaine, en jours pleins (midi UTC : aucun risque de changer de jour).
    const noon = new Date(`${today}T12:00:00Z`);
    const monday = noon.getTime() - ((noon.getUTCDay() + 6) % 7) * DAY;
    const days = Array.from({ length: 7 }, (_, i) => new Date(monday + i * DAY).toISOString().slice(0, 10));

    const [profiles, projects, interviews] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name').limit(1000),
        supabase.from('projects').select('id, user_id, status, project_metadata').limit(1000),
        supabase.from('interviews').select('project_id, created_at, duration_seconds, processing_status').limit(10000),
    ]);
    const P = must(profiles, 'profils') as Row[];
    const I = (must(interviews, 'entretiens') as Row[]).filter((i) => i.processing_status !== 'too_short');

    const slots: AgendaSlot[] = [];
    for (const j of must(projects, 'projets') as Row[]) {
        const meta = (j.project_metadata ?? {}) as Row;
        if (j.status === 'completed' || isTestMeta(meta)) continue;
        const schedule = normalizeSchedule(meta.call_schedule);
        if (!schedule.active) continue;
        const p = P.find((x) => x.id === j.user_id);
        const mine = I.filter((i) => i.project_id === j.id);
        const first = mine.length === 0;
        days.forEach((day, i) => {
            if (!schedule.days.includes(i + 1)) return;
            const call = mine.find((c) => parisDay.format(new Date(String(c.created_at))) === day);
            const passed = day < today || (day === today && schedule.time < clock);
            slots.push({
                day,
                time: schedule.time,
                client: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Sans nom' : 'Client inconnu',
                profileId: String(j.user_id),
                state: call ? 'done' : passed ? 'missed' : 'planned',
                minutes: call ? Math.round((Number(call.duration_seconds) || 0) / 60) : null,
                next: false,
                first,
            });
        });
    }
    slots.sort((a, b) => `${a.day} ${a.time}`.localeCompare(`${b.day} ${b.time}`));
    const next = slots.find((s) => s.state === 'planned');
    if (next) next.next = true;
    return slots;
}
