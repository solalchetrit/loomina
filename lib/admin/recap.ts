/**
 * Le récap de 10 h et de 20 h, envoyé par e-mail (demande de Solal, 26/11/2026),
 * et celui de la semaine, le lundi à 9 h (même jour, deuxième demande).
 *
 * QUAND : le passage du serveur vocal (toutes les 5 minutes, /api/jobs/process)
 * appelle `sweepRecap`. Entre 10 h et 10 h 59 (heure de Paris), puis entre
 * 20 h et 20 h 59, le premier passage envoie le récap, une seule fois : la
 * place est réservée dans la table des compteurs (rate_hits, clé
 * « recap:AAAA-MM-JJ:HH »), donc deux passages simultanés n'envoient pas deux
 * mails. Le cron de Vercel (Hobby) ne passe qu'une fois par jour et n'est pas
 * précis à l'heure près : il ne sert pas ici.
 *
 * QUELLE PÉRIODE : le récap de 10 h couvre la veille 20 h → 10 h ; celui de
 * 20 h, 10 h → 20 h. Les bornes sont fixes, même si le mail part à 10 h 05 :
 * rien n'est compté deux fois, rien n'est oublié.
 *
 * À QUI : `LOOMINA_RECAP_EMAIL` (plusieurs adresses séparées par des
 * virgules), sinon l'adresse des alertes (contact@loomina.eu).
 * `LOOMINA_RECAP=off` coupe le récap.
 *
 * Les chiffres viennent des mêmes fonctions que l'admin : coût de chaque
 * appel (fiche client), coût des démos (page Argent), dépenses du mois
 * (factures Twilio, OpenAI, Stripe), encaissé (Stripe). Les clients de test
 * ne comptent nulle part. Une source qui ne répond pas n'empêche pas l'envoi :
 * le mail dit ce qui n'a pas été lu.
 */

import { db } from '@/lib/loomina/db';
import { isTestMeta } from '@/lib/loomina/test-flag';
import { sendEmail, brandEmailHtml, teamContacts } from '@/lib/loomina/notify';
import { COSTS } from '@/config/costs';
import { callLines, demoLines, monthRange, type Range } from './spend';
import { getSpendKept, realRevenueKept, voiceHealthKept } from './cached';
import { getAgenda, getCrm, getOverview, configWarnings, listOrders } from './data';
import { audienceConfigured, audienceDay } from './audience';
import { recapSubject, recapText, recapInnerHtml, dayLabel, at, type RecapData } from './recap-mail';

type Row = Record<string, unknown>;

/* ───────────────────────── l'heure de Paris ───────────────────────── */

const parisParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });

function paris(now: Date): { day: string; hour: number } {
    const parts = Object.fromEntries(parisParts.formatToParts(now).map((x) => [x.type, x.value]));
    return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

/** L'instant UTC où il est `hour` h pile à Paris, le jour `day` (AAAA-MM-JJ). */
export function parisInstant(day: string, hour: number): Date {
    const guess = new Date(`${day}T${String(hour).padStart(2, '0')}:00:00Z`);
    // Paris est en avance sur UTC d'une ou deux heures : on corrige de l'écart constaté.
    const seen = paris(guess);
    const diff = (seen.day === day ? seen.hour : seen.hour + 24) - hour;
    return new Date(guess.getTime() - diff * 3_600_000);
}

const shiftDay = (day: string, days: number) => new Date(new Date(`${day}T12:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10);
const previousDay = (day: string) => shiftDay(day, -1);
/** 1 = lundi … 7 = dimanche. */
const weekday = (day: string) => ((new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

export interface RecapSlot {
    key: string;
    kind: 'jour' | 'semaine';
    hour: 9 | 10 | 20;
    day: string;
    start: Date;
    end: Date;
}

/**
 * Les récaps dus à cet instant : celui du jour entre 10 h et 10 h 59, ou
 * 20 h et 20 h 59 ; celui de la semaine le lundi entre 9 h et 9 h 59.
 */
export function dueSlot(now = new Date()): RecapSlot | null {
    const { day, hour } = paris(now);
    if (hour === 9 && weekday(day) === 1) return weekSlotFor(day);
    if (hour !== 10 && hour !== 20) return null;
    return slotFor(day, hour);
}

/**
 * Le récap de la semaine (demande de Solal, 26/11/2026) : envoyé le lundi
 * `monday` à 9 h, il couvre la semaine passée, du lundi 0 h au dimanche
 * minuit, comparée à celle d'avant.
 */
export function weekSlotFor(monday: string): RecapSlot {
    const day = shiftDay(monday, -(weekday(monday) - 1));
    return { key: `recap:semaine:${day}`, kind: 'semaine', hour: 9, day, start: parisInstant(shiftDay(day, -7), 0), end: parisInstant(day, 0) };
}

/** Le récap d'un jour et d'une heure donnés (aperçu, envoi à la main). */
export function slotFor(day: string, hour: 10 | 20): RecapSlot {
    const end = parisInstant(day, hour);
    const start = hour === 10 ? parisInstant(previousDay(day), 20) : parisInstant(day, 10);
    return { key: `recap:${day}:${hour}`, kind: 'jour', hour, day, start, end };
}

/** Le dernier récap passé à cet instant (pour l'aperçu de l'admin). */
export function lastSlot(now = new Date()): RecapSlot {
    const { day, hour } = paris(now);
    if (hour >= 20) return slotFor(day, 20);
    if (hour >= 10) return slotFor(day, 10);
    return slotFor(previousDay(day), 20);
}

/* ───────────────────────── rassembler ───────────────────────── */

async function settle<T>(label: string, p: Promise<T>, errors: string[]): Promise<T | null> {
    try {
        return await p;
    } catch (err) {
        errors.push(`${label} (${err instanceof Error ? err.message : String(err)})`.slice(0, 160));
        return null;
    }
}

const fmtDay = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });
const isoDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });

export async function gatherRecap(slot: RecapSlot): Promise<RecapData> {
    const errors: string[] = [];
    const alerts: RecapData['alerts'] = [];
    const startIso = slot.start.toISOString();
    const endIso = slot.end.toISOString();
    const week = slot.kind === 'semaine';
    const range: Range = { period: 'mois', start: slot.start, end: slot.end, label: '', elapsedDays: 1, totalDays: 1 };
    const inWindow = (iso: unknown) => typeof iso === 'string' && iso >= startIso && iso < endIso;
    const supabase = db();

    const [projectsRes, profilesRes, interviewsRes, demosAll, contactsRes, eventsRes] = await Promise.all([
        supabase.from('projects').select('id, user_id, status, project_metadata, stripe_session_id, created_at').limit(2000),
        supabase.from('profiles').select('id, first_name, last_name, created_at').limit(2000),
        supabase.from('interviews').select('id, project_id, created_at, processing_status, duration_seconds').limit(10000),
        supabase.from('demo_stories').select('id, created_at, status, sms_sent_at, email').limit(1000),
        supabase.from('contact_messages').select('name, subject, created_at, handled_at').gte('created_at', startIso).lt('created_at', endIso).limit(50),
        supabase.from('call_events').select('id, project_id, status, created_at, error').in('status', ['failed', 'pending', 'processing']).limit(100),
    ]);
    if (projectsRes.error || profilesRes.error || interviewsRes.error) throw new Error(`base illisible : ${(projectsRes.error ?? profilesRes.error ?? interviewsRes.error)?.message}`);
    const projects = (projectsRes.data ?? []) as Row[];
    const profiles = (profilesRes.data ?? []) as Row[];
    const interviews = (interviewsRes.data ?? []) as Row[];
    const testProjects = new Set(projects.filter((j) => isTestMeta(j.project_metadata as Row | null)).map((j) => String(j.id)));
    const testUsers = new Set(projects.filter((j) => testProjects.has(String(j.id))).map((j) => String(j.user_id)));
    const status = new Map(interviews.map((i) => [String(i.id), String(i.processing_status ?? '')]));

    // Les appels de la période, avec le coût de l'admin.
    const lines = (await settle('appels', callLines(range), errors)) ?? [];
    const realLines = lines.filter((c) => !c.test);
    const projectOf = new Map(interviews.map((i) => [String(i.id), String(i.project_id)]));
    const earlier = (projectId: string, iso: string) =>
        interviews.some((i) => String(i.project_id) === projectId && String(i.created_at) < iso && i.processing_status !== 'too_short');
    const calls: RecapData['calls'] = realLines
        .map((c) => ({
            client: c.client,
            profileId: c.profileId,
            at: c.at,
            seconds: c.seconds,
            status: status.get(c.id) ?? 'pending',
            costHt: c.cost.total,
            costTtc: c.cost.totalTtc,
            estimated: c.cost.estimated,
            first: status.get(c.id) !== 'too_short' && !earlier(projectOf.get(c.id) ?? '', c.at),
        }))
        .sort((a, b) => a.at.localeCompare(b.at));

    // Les démos, avec leur coût (page Argent).
    const demoRows = (await settle('démos', demoLines(range), errors)) ?? [];
    const demoMeta = new Map(((demosAll.data ?? []) as Row[]).map((d) => [String(d.id), d]));
    const demos: RecapData['demos'] = demoRows
        .map((x) => {
            const m = demoMeta.get(x.id);
            return {
                name: x.name,
                at: x.at,
                seconds: x.seconds,
                status: x.status,
                smsSent: Boolean(m?.sms_sent_at),
                email: Boolean(m?.email),
                costHt: x.total,
                costTtc: x.total * (1 + COSTS.vat),
                estimated: x.estimated,
            };
        })
        .sort((a, b) => a.at.localeCompare(b.at));

    // Inscrits et commandes.
    const projectByUser = new Map(projects.map((j) => [String(j.user_id), j]));
    const name = (p: Row | undefined) => (p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Sans nom' : 'Client inconnu');
    const signups = profiles
        .filter((p) => inWindow(p.created_at) && !testUsers.has(String(p.id)))
        .map((p) => {
            const j = projectByUser.get(String(p.id));
            return { name: name(p), at: String(p.created_at), paid: Boolean(j?.stripe_session_id), isGift: (j?.project_metadata as Row | null)?.is_gift === true };
        })
        .sort((a, b) => a.at.localeCompare(b.at));

    const allOrders = ((await settle('commandes', listOrders(), errors)) ?? []).filter((o) => !o.test);
    const windowOrders = allOrders.filter((o) => inWindow(o.at));
    const month = monthRange('mois', slot.end);
    const monthOrders = allOrders.filter((o) => o.at >= month.start.toISOString() && o.at < month.end.toISOString());
    const [windowRevenue, monthRevenue, spend] = await Promise.all([
        windowOrders.length ? settle('Stripe', realRevenueKept(windowOrders.map((o) => o.sessionId), { start: slot.start, end: slot.end }), errors) : Promise.resolve(null),
        settle('Stripe', realRevenueKept(monthOrders.map((o) => o.sessionId), { start: month.start, end: month.end }), errors),
        settle('dépenses du mois', getSpendKept('mois'), errors),
    ]);
    const orders: RecapData['orders'] = windowOrders
        .map((o) => {
            const r = windowRevenue?.sessions.get(o.sessionId);
            return { client: o.client, at: o.at, isGift: o.isGift, paid: r ? r.paid : null, discount: r && r.discount ? r.discount : null };
        })
        .sort((a, b) => a.at.localeCompare(b.at));

    const contacts = ((contactsRes.data ?? []) as Row[]).map((m) => ({ name: String(m.name ?? 'Sans nom'), subject: (m.subject as string | null) ?? null, at: String(m.created_at) }));

    // Les prochains rendez-vous, jusqu'au récap suivant (et un peu après) ; la semaine qui commence pour le récap du lundi.
    const until = new Date(slot.end.getTime() + (week ? 7 * 24 : 14) * 3_600_000).toISOString();
    const agendaNow = (await settle('agenda', getAgenda(slot.end.getTime() - (week ? 60_000 : 0)), errors)) ?? [];
    const agendaNext = (await settle('agenda', getAgenda(slot.end.getTime() + 7 * 86_400_000), errors)) ?? [];
    const slotAt = (s: { day: string; time: string }) => parisInstant(s.day, Number(s.time.slice(0, 2))).getTime() + Number(s.time.slice(3, 5)) * 60_000;
    const seenSlot = new Set<string>();
    const upcoming = [...agendaNow, ...agendaNext]
        .filter((s) => s.state === 'planned' && slotAt(s) >= Math.max(slot.end.getTime(), Date.now() - 3_600_000) && new Date(slotAt(s)).toISOString() < until)
        .filter((s) => {
            const k = `${s.day} ${s.time} ${s.profileId}`;
            if (seenSlot.has(k)) return false;
            seenSlot.add(k);
            return true;
        })
        .sort((a, b) => slotAt(a) - slotAt(b))
        .map((s) => ({ day: s.day === isoDay.format(slot.end) ? 'aujourd’hui' : fmtDay.format(new Date(`${s.day}T12:00:00Z`)), time: s.time, client: s.client, first: s.first }));

    // Les rendez-vous manqués de la période.
    for (const s of agendaNow.filter((x) => x.state === 'missed')) {
        const t = slotAt(s);
        if (t >= slot.start.getTime() && t < slot.end.getTime()) alerts.push({ level: 'orange', text: `Appel prévu à ${s.time.replace(':', ' h ')} avec ${s.client} : pas eu lieu.` });
    }

    // Le site.
    let audience: RecapData['audience'] = null;
    if (audienceConfigured()) {
        const [from, to, label] = week ? ['7daysAgo', 'yesterday', 'sur la semaine'] : slot.hour === 10 ? ['yesterday', 'yesterday', 'hier sur la journée'] : ['today', 'today', 'aujourd’hui jusqu’ici'];
        const a = await settle('Google Analytics', audienceDay(from, to), errors);
        if (a) audience = { label, ...a };
    }

    // Le cumul.
    const realProjects = projects.filter((j) => !testProjects.has(String(j.id)));
    const realInterviews = interviews.filter((i) => !testProjects.has(String(i.project_id)) && i.processing_status !== 'too_short');
    const overview = await settle('vue d’ensemble', getOverview(), errors);
    const thirty = new Date(slot.end.getTime() - 30 * 86_400_000).toISOString();
    const totals: RecapData['totals'] = {
        clients: new Set(realProjects.map((j) => String(j.user_id))).size,
        activeBooks: realProjects.filter((j) => j.status === 'active').length,
        completedBooks: realProjects.filter((j) => j.status === 'completed').length,
        realCalls: realInterviews.length,
        minutes: realInterviews.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60,
        words: overview?.words ?? 0,
        demos30: ((demosAll.data ?? []) as Row[]).filter((d) => String(d.created_at) >= thirty).length,
    };

    // Ce qui demande un geste.
    const voice = await settle('serveur vocal', voiceHealthKept(), errors);
    if (voice && !voice.ok) alerts.unshift({ level: 'rouge', text: `Le serveur vocal ne répond pas (${voice.detail}) : personne ne peut appeler.` });
    for (const w of configWarnings()) alerts.unshift({ level: 'rouge', text: `${w.problem} (variable ${w.variable} manquante sur Vercel)` });
    const twBalance = spend?.twilio.value?.balance;
    if (twBalance != null && twBalance < 20) alerts.push({ level: 'rouge', text: `Il ne reste que ${twBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} sur le compte Twilio : à recharger avant que les appels et SMS s’arrêtent.` });
    const events = (eventsRes.data ?? []) as Row[];
    const failed = events.filter((e) => e.status === 'failed' && String(e.created_at) >= new Date(slot.end.getTime() - 7 * 86_400_000).toISOString());
    if (failed.length) alerts.push({ level: 'rouge', text: `${failed.length > 1 ? `${failed.length} appels n’ont` : 'Un appel n’a'} pas pu être transformé en récit (page Aujourd’hui de l’admin, « Relancer le traitement »).` });
    const stuck = events.filter((e) => e.status !== 'failed' && String(e.created_at) < new Date(slot.end.getTime() - 30 * 60_000).toISOString());
    if (stuck.length) alerts.push({ level: 'orange', text: `${stuck.length > 1 ? `${stuck.length} appels attendent` : 'Un appel attend'} leur traitement depuis plus de 30 minutes.` });
    const tooShort = calls.filter((c) => c.status === 'too_short');
    if (tooShort.length) alerts.push({ level: 'orange', text: `${tooShort.length > 1 ? `${tooShort.length} appels clients trop courts` : `Un appel client trop court`} (${tooShort.map((c) => `${c.client} à ${at(c.at)}`).join(', ')}) : raccroché tôt, à vérifier.` });
    for (const x of demos) {
        if (x.status === 'failed') alerts.push({ level: 'rouge', text: `La démo de ${x.name} (${at(x.at)}) n’a pas pu être écrite.` });
        else if (x.status === 'written' && !x.smsSent) alerts.push({ level: 'orange', text: `La démo de ${x.name} (${at(x.at)}) est écrite mais son SMS n’est pas parti.` });
    }
    const unusable = demos.filter((x) => x.status === 'unusable').length;
    if (unusable) alerts.push({ level: 'orange', text: `${unusable > 1 ? `${unusable} démos trop courtes` : 'Une démo trop courte'} pour en faire un récit (la personne a raccroché vite).` });
    if (overview) {
        const pending = overview.contacts.length;
        if (pending) alerts.push({ level: 'orange', text: `${pending > 1 ? `${pending} messages de contact attendent` : 'Un message de contact attend'} une réponse.` });
        if (overview.booksToAct.length) alerts.push({ level: 'orange', text: `${overview.booksToAct.length > 1 ? `${overview.booksToAct.length} livres terminés attendent` : 'Un livre terminé attend'} un geste (relire, imprimer, expédier).` });
        if (overview.stuckEditions.length) alerts.push({ level: 'orange', text: `La composition automatique d’un livre a échoué récemment.` });
    }
    const crm = await settle('suivi client', getCrm(slot.end.getTime()), errors);
    const toRelance = (crm?.clients ?? []).filter((c) => !c.test && (c.health === 'relancer' || c.health === 'inactif'));
    if (toRelance.length) alerts.push({ level: 'orange', text: `À relancer : ${toRelance.map((c) => c.name).join(', ')}.` });

    // La semaine : comparée à celle d'avant, et jour par jour.
    let previous: RecapData['previous'] = null;
    let byDay: RecapData['byDay'] = null;
    if (week) {
        const pStart = new Date(slot.start.getTime() - (slot.end.getTime() - slot.start.getTime())).toISOString();
        const inPrev = (iso: unknown) => typeof iso === 'string' && iso >= pStart && iso < startIso;
        const prevCalls = interviews.filter((i) => inPrev(i.created_at) && !testProjects.has(String(i.project_id)) && i.processing_status !== 'too_short');
        const { data: prevDemos } = await supabase.from('demo_stories').select('id').gte('created_at', pStart).lt('created_at', startIso).limit(1000);
        const prevSessions = audienceConfigured() ? await settle('Google Analytics', audienceDay('14daysAgo', '8daysAgo'), errors) : null;
        previous = {
            demos: (prevDemos ?? []).length,
            calls: prevCalls.length,
            minutes: Math.round(prevCalls.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0) / 60),
            recits: prevCalls.filter((i) => i.processing_status === 'processed').length,
            signups: profiles.filter((p) => inPrev(p.created_at) && !testUsers.has(String(p.id))).length,
            orders: allOrders.filter((o) => inPrev(o.at)).length,
            sessions: prevSessions ? prevSessions.sessions : null,
        };
        byDay = Array.from({ length: 7 }, (_, i) => {
            const d0 = parisInstant(shiftDay(slot.day, i - 7), 0).toISOString();
            const d1 = parisInstant(shiftDay(slot.day, i - 6), 0).toISOString();
            const within = (iso: string) => iso >= d0 && iso < d1;
            const dayCalls = calls.filter((c) => c.status !== 'too_short' && within(c.at));
            return {
                label: fmtDay.format(new Date(`${shiftDay(slot.day, i - 7)}T12:00:00Z`)).replace(/ \S+$/, ''),
                demos: demos.filter((x) => within(x.at)).length,
                calls: dayCalls.length,
                minutes: Math.round(dayCalls.reduce((s, c) => s + c.seconds, 0) / 60),
                orders: orders.filter((o) => within(o.at)).length,
            };
        });
    }
    const lastSunday = new Date(slot.end.getTime() - 3_600_000).toISOString();
    const short = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long' });

    return {
        slot: {
            kind: slot.kind,
            hour: slot.hour,
            start: startIso,
            end: endIso,
            dayLabel: week ? `lundi ${short.format(slot.end)}` : dayLabel(endIso),
            since: week ? `la semaine du ${short.format(slot.start).replace(/ \S+$/, '')} au ${short.format(new Date(lastSunday))}` : slot.hour === 10 ? 'depuis hier 20 h' : 'depuis ce matin 10 h',
        },
        previous,
        byDay,
        demos,
        calls,
        testCalls: lines.length - realLines.length,
        signups,
        orders,
        contacts,
        upcoming,
        totals,
        month: {
            label: month.label,
            spendHt: spend ? spend.total : null,
            spendTtc: spend ? spend.total * (1 + COSTS.vat) : null,
            collected: monthRevenue ? monthRevenue.net : null,
            orders: monthOrders.length,
        },
        audience,
        alerts,
        errors: [...new Set(errors)],
    };
}

/* ───────────────────────── envoyer ───────────────────────── */

export function recapRecipients(): string[] {
    const list = (process.env.LOOMINA_RECAP_EMAIL ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s));
    return list.length ? list : [teamContacts().email];
}

export function renderRecap(d: RecapData): { subject: string; text: string; html: string } {
    return { subject: recapSubject(d), text: recapText(d), html: brandEmailHtml(recapInnerHtml(d)) };
}

export async function sendRecap(slot: RecapSlot, to = recapRecipients()): Promise<{ ok: boolean; subject: string; to: string[] }> {
    const mail = renderRecap(await gatherRecap(slot));
    const results = await Promise.all(to.map((address) => sendEmail({ to: address, subject: mail.subject, text: mail.text, html: mail.html })));
    return { ok: results.some(Boolean), subject: mail.subject, to };
}

/** Appelé toutes les 5 minutes : envoie le récap de 10 h ou de 20 h, une seule fois. */
export async function sweepRecap(now = new Date()): Promise<string | null> {
    if (process.env.LOOMINA_RECAP?.trim().toLowerCase() === 'off') return null;
    const slot = dueSlot(now);
    if (!slot) return null;
    // Une seule place par récap, réservée dans la base (24 h de fenêtre). Si la
    // base ne répond pas, on n'envoie rien : mieux vaut un récap manqué que
    // douze récaps dans l'heure.
    const { data: claimed, error } = await db().rpc('hit_rate_limit', { p_key: slot.key, p_window_seconds: 86_400, p_max: 1 });
    if (error || claimed !== true) return null;
    try {
        const r = await sendRecap(slot);
        if (!r.ok) console.warn(`[récap] ${slot.key} : e-mail non parti`);
        return r.ok ? r.subject : null;
    } catch (err) {
        console.error(`[récap] ${slot.key} impossible :`, err instanceof Error ? err.message : String(err));
        return null;
    }
}
