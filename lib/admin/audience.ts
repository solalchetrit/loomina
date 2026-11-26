/**
 * L'audience du site, lue dans Google Analytics et la Search Console
 * (demandes de Solal, 17/11 et 20/11/2026 : « mieux voir les metrics »).
 *
 * Le site se présente à Google avec un « compte de service » (un compte
 * technique, en lecture seule). Sa clé est dans `GA_SERVICE_ACCOUNT_KEY`
 * (le fichier JSON téléchargé depuis Google Cloud, collé tel quel).
 *  - Analytics : le compte de service est lecteur de la propriété.
 *  - Search Console : il faut AUSSI l'ajouter comme utilisateur de la
 *    propriété loomina.eu (Paramètres → Utilisateurs et autorisations →
 *    Ajouter, droit « Restreint »), et activer l'API « Google Search
 *    Console » dans le projet Google Cloud de la clé.
 *
 * À savoir : depuis le bandeau cookies, Analytics ne compte que les
 * visiteurs qui ont accepté. La Search Console, elle, compte tout (ce sont
 * les recherches Google), avec deux ou trois jours de retard.
 */

import { importPKCS8, SignJWT } from 'jose';

const PROPERTY = process.env.GA_PROPERTY_ID?.trim() || '516095374';

export interface Audience {
    days: number;
    sessions: number;
    users: number;
    newUsers: number;
    pageViews: number;
    /** Durée moyenne d'engagement par visite, en secondes. */
    engagement: number;
    /** Part des visites « engagées » (plus de 10 s, ou 2 pages, ou une conversion), de 0 à 1. */
    engagedRate: number;
    /** Les mêmes chiffres sur la période précédente de même durée. */
    previous: { sessions: number; users: number; pageViews: number; demo: number; checkout: number; purchase: number };
    /** Événements clés : clics sur la démo, débuts de commande, achats, messages. */
    events: { demo: number; checkout: number; purchase: number; contact: number };
    pages: Array<{ path: string; views: number }>;
    sources: Array<{ source: string; sessions: number }>;
    devices: Array<{ device: string; sessions: number }>;
    cities: Array<{ city: string; sessions: number }>;
    daily: Array<{ date: string; sessions: number; users: number }>;
}

export interface SearchStats {
    days: number;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    previous: { clicks: number; impressions: number };
    queries: Array<{ query: string; clicks: number; impressions: number; position: number }>;
    pages: Array<{ page: string; clicks: number; impressions: number }>;
    daily: Array<{ date: string; clicks: number; impressions: number }>;
    site: string;
}

export function audienceConfigured(): boolean {
    return Boolean(process.env.GA_SERVICE_ACCOUNT_KEY?.trim());
}

const tokens = new Map<string, { token: string; until: number }>();

async function accessToken(scope: string): Promise<string> {
    const hit = tokens.get(scope);
    if (hit && hit.until > Date.now()) return hit.token;
    const raw = process.env.GA_SERVICE_ACCOUNT_KEY?.trim();
    if (!raw) throw new Error('GA_SERVICE_ACCOUNT_KEY manquante');
    const key = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!key.client_email || !key.private_key) throw new Error('clé Google illisible');
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(key.client_email)
        .setAudience('https://oauth2.googleapis.com/token')
        .setIssuedAt(now)
        .setExpirationTime(now + 600)
        .sign(await importPKCS8(key.private_key, 'RS256'));
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
        signal: AbortSignal.timeout(8000),
    });
    const body = (await res.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
    if (!res.ok || !body.access_token) throw new Error(`Google refuse la clé : ${body.error_description ?? res.status}`);
    tokens.set(scope, { token: body.access_token, until: Date.now() + 8 * 60_000 });
    return body.access_token;
}

/** L'adresse e-mail du compte de service, à ajouter dans la Search Console. */
export function serviceAccountEmail(): string | null {
    try {
        return (JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY ?? '{}') as { client_email?: string }).client_email ?? null;
    } catch {
        return null;
    }
}

interface Report {
    rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>;
}

async function report(token: string, body: Record<string, unknown>): Promise<Report> {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Google Analytics répond ${res.status} : ${(await res.text().catch(() => '')).slice(0, 200)}`);
    return (await res.json()) as Report;
}

const num = (v: string | undefined) => Number(v) || 0;
const dim = (r: NonNullable<Report['rows']>[number], i = 0) => r.dimensionValues?.[i]?.value ?? '';
const met = (r: NonNullable<Report['rows']>[number], i = 0) => num(r.metricValues?.[i]?.value);

const KEY_EVENTS = { demo: 'clic_demo', checkout: 'begin_checkout', purchase: 'purchase', contact: 'generate_lead' } as const;

/** Les chiffres des `days` derniers jours, comparés aux `days` d'avant. Lève une erreur lisible si Google ne répond pas. */
export async function getAudience(days = 28): Promise<Audience> {
    const token = await accessToken('https://www.googleapis.com/auth/analytics.readonly');
    const now = { startDate: `${days - 1}daysAgo`, endDate: 'today' };
    const before = { startDate: `${2 * days - 1}daysAgo`, endDate: `${days}daysAgo` };
    const top = (name: string, metric = 'sessions', limit = 8) => ({ dateRanges: [now], dimensions: [{ name }], metrics: [{ name: metric }], orderBys: [{ metric: { metricName: metric }, desc: true }], limit });
    const [totals, prevTotals, events, prevEvents, pages, sources, devices, cities, daily] = await Promise.all([
        report(token, { dateRanges: [now], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'newUsers' }, { name: 'screenPageViews' }, { name: 'userEngagementDuration' }, { name: 'engagementRate' }] }),
        report(token, { dateRanges: [before], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }] }),
        report(token, { dateRanges: [now], dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }] }),
        report(token, { dateRanges: [before], dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }] }),
        report(token, top('pagePath', 'screenPageViews', 10)),
        report(token, top('sessionSource')),
        report(token, top('deviceCategory', 'sessions', 4)),
        report(token, top('city', 'sessions', 8)),
        report(token, { dateRanges: [now], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
    ]);
    const t = totals.rows?.[0];
    const p = prevTotals.rows?.[0];
    const count = (r: Report, name: string) => {
        const row = r.rows?.find((x) => dim(x) === name);
        return row ? met(row) : 0;
    };
    const sessions = t ? met(t, 0) : 0;
    // Toutes les dates de la période, même sans visite, pour une courbe continue.
    const seen = new Map((daily.rows ?? []).map((r) => [dim(r), { sessions: met(r, 0), users: met(r, 1) }]));
    const series: Audience['daily'] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000);
        const key = d.toISOString().slice(0, 10).replace(/-/g, '');
        series.push({ date: key, ...(seen.get(key) ?? { sessions: 0, users: 0 }) });
    }
    return {
        days,
        sessions,
        users: t ? met(t, 1) : 0,
        newUsers: t ? met(t, 2) : 0,
        pageViews: t ? met(t, 3) : 0,
        engagement: sessions && t ? met(t, 4) / sessions : 0,
        engagedRate: t ? met(t, 5) : 0,
        previous: {
            sessions: p ? met(p, 0) : 0,
            users: p ? met(p, 1) : 0,
            pageViews: p ? met(p, 2) : 0,
            demo: count(prevEvents, KEY_EVENTS.demo),
            checkout: count(prevEvents, KEY_EVENTS.checkout),
            purchase: count(prevEvents, KEY_EVENTS.purchase),
        },
        events: { demo: count(events, KEY_EVENTS.demo), checkout: count(events, KEY_EVENTS.checkout), purchase: count(events, KEY_EVENTS.purchase), contact: count(events, KEY_EVENTS.contact) },
        pages: (pages.rows ?? []).map((r) => ({ path: dim(r), views: met(r) })),
        sources: (sources.rows ?? []).map((r) => ({ source: dim(r), sessions: met(r) })),
        devices: (devices.rows ?? []).map((r) => ({ device: dim(r), sessions: met(r) })),
        cities: (cities.rows ?? []).map((r) => ({ city: dim(r), sessions: met(r) })).filter((c) => c.city && c.city !== '(not set)'),
        daily: series,
    };
}

/**
 * Les visites d'une période courte, pour le récap de 10 h (hier), de 20 h
 * (aujourd'hui jusqu'ici) et du lundi (les 7 derniers jours). LinkedIn compté à part : c'est là que Solal publie
 * avant le lancement (« linkedin.com », « lnkd.in », « linkedin » en utm_source).
 */
export async function audienceDay(startDate: string, endDate = startDate): Promise<{ sessions: number; users: number; sources: Array<{ source: string; sessions: number }>; linkedin: number; demoClicks: number; checkouts: number }> {
    const token = await accessToken('https://www.googleapis.com/auth/analytics.readonly');
    const range = { startDate, endDate };
    const [totals, sources, events] = await Promise.all([
        report(token, { dateRanges: [range], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }] }),
        report(token, { dateRanges: [range], dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 20 }),
        report(token, { dateRanges: [range], dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }] }),
    ]);
    const t = totals.rows?.[0];
    const list = (sources.rows ?? []).map((r) => ({ source: dim(r) === '(direct)' ? 'direct' : dim(r), sessions: met(r) }));
    const count = (name: string) => met((events.rows ?? []).find((x) => dim(x) === name) ?? {});
    return {
        sessions: t ? met(t, 0) : 0,
        users: t ? met(t, 1) : 0,
        sources: list.slice(0, 6),
        linkedin: list.filter((s) => /linkedin|lnkd/i.test(s.source)).reduce((n, s) => n + s.sessions, 0),
        demoClicks: count(KEY_EVENTS.demo),
        checkouts: count(KEY_EVENTS.checkout),
    };
}

/* ───────────────────────── Search Console ───────────────────────── */

/** La propriété Search Console : domaine entier d'abord, puis l'adresse du site. */
const SITES = [process.env.GSC_SITE_URL?.trim(), 'sc-domain:loomina.eu', 'https://www.loomina.eu/', 'https://loomina.eu/'].filter((s): s is string => !!s);

type GscRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };

async function gsc(token: string, site: string, body: Record<string, unknown>): Promise<GscRow[]> {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
        const text = (await res.text().catch(() => '')).slice(0, 200);
        const err = new Error(`Search Console répond ${res.status} : ${text}`) as Error & { status?: number };
        err.status = res.status;
        throw err;
    }
    return ((await res.json()) as { rows?: GscRow[] }).rows ?? [];
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

/** Les recherches Google des `days` derniers jours (la Search Console a ~3 jours de retard). */
export async function getSearch(days = 28): Promise<SearchStats> {
    const token = await accessToken('https://www.googleapis.com/auth/webmasters.readonly');
    const end = new Date(Date.now() - 2 * 86_400_000);
    const start = new Date(end.getTime() - (days - 1) * 86_400_000);
    const prevEnd = new Date(start.getTime() - 86_400_000);
    const prevStart = new Date(prevEnd.getTime() - (days - 1) * 86_400_000);
    const range = { startDate: ymd(start), endDate: ymd(end) };

    let lastErr: unknown = null;
    for (const site of SITES) {
        try {
            const [totals, prev, queries, pages, daily] = await Promise.all([
                gsc(token, site, range),
                gsc(token, site, { startDate: ymd(prevStart), endDate: ymd(prevEnd) }),
                gsc(token, site, { ...range, dimensions: ['query'], rowLimit: 12 }),
                gsc(token, site, { ...range, dimensions: ['page'], rowLimit: 8 }),
                gsc(token, site, { ...range, dimensions: ['date'] }),
            ]);
            const t = totals[0] ?? {};
            const seen = new Map(daily.map((r) => [r.keys?.[0] ?? '', r]));
            const series: SearchStats['daily'] = [];
            for (let i = 0; i < days; i++) {
                const key = ymd(new Date(start.getTime() + i * 86_400_000));
                const r = seen.get(key);
                series.push({ date: key, clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0 });
            }
            return {
                days,
                site,
                clicks: t.clicks ?? 0,
                impressions: t.impressions ?? 0,
                ctr: t.ctr ?? 0,
                position: t.position ?? 0,
                previous: { clicks: prev[0]?.clicks ?? 0, impressions: prev[0]?.impressions ?? 0 },
                queries: queries.map((r) => ({ query: r.keys?.[0] ?? '', clicks: r.clicks ?? 0, impressions: r.impressions ?? 0, position: r.position ?? 0 })),
                pages: pages.map((r) => ({ page: (r.keys?.[0] ?? '').replace(/^https?:\/\/(www\.)?loomina\.eu/, '') || '/', clicks: r.clicks ?? 0, impressions: r.impressions ?? 0 })),
                daily: series,
            };
        } catch (err) {
            lastErr = err;
            // 403 / 404 : ce n'est pas la bonne propriété (ou pas d'accès) : on essaie la suivante.
            const status = (err as { status?: number }).status;
            if (status !== 403 && status !== 404) break;
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error('Search Console injoignable');
}
