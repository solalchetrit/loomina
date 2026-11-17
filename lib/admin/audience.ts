/**
 * L'audience du site, lue dans Google Analytics (demande de Solal, 17/11/2026).
 *
 * Le site se présente à Google avec un « compte de service » (un compte
 * technique, en lecture seule sur la propriété Analytics de Loomina). Sa clé
 * est dans `GA_SERVICE_ACCOUNT_KEY` (le fichier JSON téléchargé depuis
 * Google Cloud, collé tel quel). Sans elle, l'admin affiche seulement un
 * lien vers Google Analytics.
 *
 * À savoir : depuis le bandeau cookies, Analytics ne compte que les
 * visiteurs qui ont accepté.
 */

import { importPKCS8, SignJWT } from 'jose';

const PROPERTY = process.env.GA_PROPERTY_ID?.trim() || '516095374';

export interface Audience {
    days: number;
    sessions: number;
    users: number;
    pageViews: number;
    /** Événements clés : clics sur la démo, débuts de commande, achats, messages. */
    events: { demo: number; checkout: number; purchase: number; contact: number };
    pages: Array<{ path: string; views: number }>;
    sources: Array<{ source: string; sessions: number }>;
    daily: Array<{ date: string; sessions: number }>;
}

export function audienceConfigured(): boolean {
    return Boolean(process.env.GA_SERVICE_ACCOUNT_KEY?.trim());
}

async function accessToken(): Promise<string> {
    const raw = process.env.GA_SERVICE_ACCOUNT_KEY?.trim();
    if (!raw) throw new Error('GA_SERVICE_ACCOUNT_KEY manquante');
    const key = JSON.parse(raw) as { client_email?: string; private_key?: string };
    if (!key.client_email || !key.private_key) throw new Error('clé Google illisible');
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/analytics.readonly' })
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
    return body.access_token;
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

/** Les chiffres des `days` derniers jours. Lève une erreur lisible si Google ne répond pas. */
export async function getAudience(days = 28): Promise<Audience> {
    const token = await accessToken();
    const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'today' }];
    const [totals, events, pages, sources, daily] = await Promise.all([
        report(token, { dateRanges, metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }] }),
        report(token, { dateRanges, dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }] }),
        report(token, { dateRanges, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 8 }),
        report(token, { dateRanges, dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 8 }),
        report(token, { dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
    ]);
    const t = totals.rows?.[0]?.metricValues ?? [];
    const count = (name: string) => num(events.rows?.find((r) => r.dimensionValues?.[0]?.value === name)?.metricValues?.[0]?.value);
    return {
        days,
        sessions: num(t[0]?.value),
        users: num(t[1]?.value),
        pageViews: num(t[2]?.value),
        events: { demo: count('clic_demo'), checkout: count('begin_checkout'), purchase: count('purchase'), contact: count('generate_lead') },
        pages: (pages.rows ?? []).map((r) => ({ path: r.dimensionValues?.[0]?.value ?? '', views: num(r.metricValues?.[0]?.value) })),
        sources: (sources.rows ?? []).map((r) => ({ source: r.dimensionValues?.[0]?.value ?? '', sessions: num(r.metricValues?.[0]?.value) })),
        daily: (daily.rows ?? []).map((r) => ({ date: r.dimensionValues?.[0]?.value ?? '', sessions: num(r.metricValues?.[0]?.value) })),
    };
}
