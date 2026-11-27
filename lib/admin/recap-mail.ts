/**
 * Le récap de 10 h et de 20 h (demande de Solal, 26/11/2026 : « un mail récap
 * tous les jours, à 10 h et à 20 h : les démos, les utilisateurs, le nombre
 * d'appels… un truc complet et intelligent »).
 *
 * Ce fichier ne fait que la mise en forme : il reçoit les chiffres déjà
 * rassemblés (lib/admin/recap.ts) et rend le sujet, le texte brut et le
 * HTML. Rien n'y lit la base : on peut donc l'essayer avec des chiffres
 * inventés (scripts/recap/apercu.ts) et le tester sans réseau.
 *
 * Ordre du mail, du plus utile au détail :
 *  1. la phrase du jour (ce qui s'est passé, en une ligne) ;
 *  2. ce qui demande un geste (alertes), s'il y en a ;
 *  3. les cinq chiffres de la période : démos, appels, récits, inscrits, commandes ;
 *  4. le détail : chaque démo, chaque appel avec son coût, chaque commande ;
 *  5. les prochains appels prévus ;
 *  6. le site (visites, d'où elles viennent, LinkedIn en tête) ;
 *  7. le cumul : clients, livres, et le mois en cours (dépenses et encaissé).
 *
 * Les coûts sont ceux de l'admin (fiche client, « Ce que cet appel a
 * coûté », et page Argent) : jamais recalculés ici. Toujours dits HT et TTC.
 */

import { SITE } from '../../config/site';

export interface RecapDemo {
    name: string;
    /** Le numéro qui a appelé (demande de Solal, 26/11/2026), lisible : 06 12 34 56 78. */
    phone: string | null;
    at: string;
    seconds: number;
    /** written, unusable, failed, pending… (table demo_stories). */
    status: string;
    smsSent: boolean;
    /** La personne a laissé son e-mail pour recevoir le PDF. */
    email: boolean;
    costHt: number;
    costTtc: number;
    estimated: boolean;
}

export interface RecapCall {
    client: string;
    profileId: string | null;
    at: string;
    seconds: number;
    /** processed (récit écrit), too_short, pending, failed… */
    status: string;
    costHt: number;
    costTtc: number;
    estimated: boolean;
    /** Premier vrai appel de ce client. */
    first: boolean;
}

export interface RecapData {
    slot: {
        /** Le récap de 10 h ou 20 h, ou celui du lundi 9 h pour la semaine passée. */
        kind: 'jour' | 'semaine';
        hour: number;
        start: string;
        end: string;
        /** « jeudi 26 novembre ». */
        dayLabel: string;
        /** « depuis hier 20 h », « depuis ce matin 10 h » ou « la semaine du 23 au 29 novembre ». */
        since: string;
    };
    /** La période d'avant, de même durée (récap de la semaine) : pour comparer. */
    previous: { demos: number; calls: number; minutes: number; recits: number; signups: number; orders: number; sessions: number | null } | null;
    /** Jour par jour (récap de la semaine). */
    byDay: Array<{ label: string; demos: number; calls: number; minutes: number; orders: number }> | null;
    demos: RecapDemo[];
    /** Les appels des vrais clients (les tests sont comptés à part). */
    calls: RecapCall[];
    testCalls: number;
    signups: Array<{ name: string; at: string; paid: boolean; isGift: boolean }>;
    orders: Array<{ client: string; at: string; isGift: boolean; paid: number | null; discount: number | null }>;
    contacts: Array<{ name: string; subject: string | null; at: string }>;
    upcoming: Array<{ day: string; time: string; client: string; first: boolean }>;
    totals: { clients: number; activeBooks: number; completedBooks: number; realCalls: number; minutes: number; words: number; demos30: number };
    month: { label: string; spendHt: number | null; spendTtc: number | null; collected: number | null; orders: number };
    audience: {
        label: string;
        sessions: number;
        users: number;
        sources: Array<{ source: string; sessions: number }>;
        linkedin: number;
        demoClicks: number;
        checkouts: number;
    } | null;
    alerts: Array<{ level: 'rouge' | 'orange'; text: string }>;
    /** Les sources qui n'ont pas répondu : le mail part quand même et le dit. */
    errors: string[];
}

/* ───────────────────────── petits outils ───────────────────────── */

const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clock = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
const dayShort = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });
export const at = (iso: string) => clock.format(new Date(iso)).replace(':', ' h ');

function duration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)} s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s ? `${m} min ${String(s).padStart(2, '0')}` : `${m} min`;
}

function plural(n: number, one: string, many = `${one}s`): string {
    return `${n.toLocaleString('fr-FR')} ${n > 1 ? many : one}`;
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const DEMO_STATUS: Record<string, string> = {
    written: 'récit écrit',
    unusable: 'trop court pour un récit',
    failed: 'récit en échec',
    pending: 'récit en cours',
    processing: 'récit en cours',
};

const CALL_STATUS: Record<string, string> = {
    processed: 'récit écrit',
    too_short: 'trop court, pas de récit',
    pending: 'en cours de traitement',
    processing: 'en cours de traitement',
    failed: 'traitement en échec',
};

const recits = (d: RecapData) => d.calls.filter((c) => c.status === 'processed').length;
const realCalls = (d: RecapData) => d.calls.filter((c) => c.status !== 'too_short');
const sum = <T>(list: T[], f: (x: T) => number) => list.reduce((s, x) => s + f(x), 0);

/** La phrase du jour : ce qui s'est passé, sans détour. */
export function headline(d: RecapData): string {
    const calls = realCalls(d);
    const parts = [
        d.demos.length ? plural(d.demos.length, 'démo') : 'aucune démo',
        calls.length ? `${plural(calls.length, 'appel client')} (${Math.max(1, Math.round(sum(calls, (c) => c.seconds) / 60))} min)` : 'aucun appel client',
        recits(d) ? plural(recits(d), 'récit écrit', 'récits écrits') : null,
        d.signups.length ? plural(d.signups.length, 'nouvel inscrit', 'nouveaux inscrits') : null,
        d.orders.length ? plural(d.orders.length, 'commande') : 'aucune commande',
    ].filter(Boolean);
    const since = d.slot.since.charAt(0).toUpperCase() + d.slot.since.slice(1);
    return `${since} : ${parts.join(', ')}.`;
}

export function recapSubject(d: RecapData): string {
    const calls = realCalls(d).length;
    const bits = [plural(d.demos.length, 'démo'), plural(calls, 'appel'), plural(d.orders.length, 'commande')];
    const red = d.alerts.filter((a) => a.level === 'rouge').length;
    const flag = red ? ` · ${plural(red, 'alerte')}` : d.alerts.length ? ` · ${plural(d.alerts.length, 'point')} à voir` : '';
    return `${title(d).replace('Récap', 'Récap Loomina')} : ${bits.join(', ')}${flag}`;
}

/** « Récap de 10 h » ou « Récap de la semaine ». */
export function title(d: RecapData): string {
    return d.slot.kind === 'semaine' ? 'Récap de la semaine' : `Récap de ${d.slot.hour} h`;
}

/** « (3 la semaine d'avant) », pour comparer. */
function before(n: number | null | undefined): string {
    return n == null ? '' : ` (${n.toLocaleString('fr-FR')} la semaine d’avant)`;
}

/* ───────────────────────── texte brut ───────────────────────── */

export function recapText(d: RecapData): string {
    const L: string[] = [];
    const calls = d.calls;
    const callHt = sum(calls, (c) => c.costHt);
    const callTtc = sum(calls, (c) => c.costTtc);
    L.push(`${title(d)}, ${d.slot.dayLabel}`, '', headline(d), '');
    if (d.previous) {
        const v = d.previous;
        L.push('COMPARÉ À LA SEMAINE D’AVANT');
        L.push(`Démos : ${d.demos.length}${before(v.demos)}`);
        L.push(`Appels clients : ${realCalls(d).length}${before(v.calls)}, ${Math.round(sum(realCalls(d), (c) => c.seconds) / 60)} min${before(v.minutes)}`);
        L.push(`Inscrits : ${d.signups.length}${before(v.signups)} · Commandes : ${d.orders.length}${before(v.orders)}`);
        if (d.audience) L.push(`Visites : ${d.audience.sessions}${before(v.sessions)}`);
        L.push('');
    }
    if (d.byDay) {
        L.push('JOUR PAR JOUR');
        for (const x of d.byDay) L.push(`- ${x.label} : ${plural(x.demos, 'démo')}, ${plural(x.calls, 'appel')} (${x.minutes} min), ${plural(x.orders, 'commande')}`);
        L.push('');
    }
    if (d.alerts.length) {
        L.push('À REGARDER');
        for (const a of d.alerts) L.push(`${a.level === 'rouge' ? '[!] ' : '- '}${a.text}`);
        L.push('');
    } else L.push('Rien d’anormal.', '');

    L.push(`DÉMOS (${d.demos.length})`);
    if (!d.demos.length) L.push('Aucune.');
    for (const x of d.demos)
        L.push(`- ${at(x.at)} · ${x.name} · ${x.phone ?? 'numéro masqué'} · ${duration(x.seconds)} · ${DEMO_STATUS[x.status] ?? x.status}${x.smsSent ? ' · SMS parti' : ''}${x.email ? ' · e-mail laissé' : ''} · ${eur(x.costTtc)} TTC`);
    L.push('');

    L.push(`APPELS CLIENTS (${calls.length})`);
    if (!calls.length) L.push('Aucun.');
    for (const c of calls) L.push(`- ${at(c.at)} · ${c.client}${c.first ? ' (premier appel)' : ''} · ${duration(c.seconds)} · ${CALL_STATUS[c.status] ?? c.status} · ${eur(c.costHt)} HT, ${eur(c.costTtc)} TTC${c.estimated ? ' (estimé)' : ''}`);
    if (calls.length) L.push(`Total : ${eur(callHt)} HT, ${eur(callTtc)} TTC.`);
    if (d.testCalls) L.push(`Plus ${plural(d.testCalls, 'appel de test')}, hors chiffres.`);
    L.push('');

    L.push(`INSCRITS ET COMMANDES`);
    if (!d.signups.length && !d.orders.length) L.push('Aucun nouvel inscrit, aucune commande.');
    for (const s of d.signups.filter((x) => !x.paid)) L.push(`- Inscrit ${at(s.at)} · ${s.name}${s.isGift ? ' (livre offert)' : ''} (sans commande)`);
    for (const o of d.orders) L.push(`- Commande ${at(o.at)} · ${o.client}${o.isGift ? ' (cadeau)' : ''}${o.paid != null ? ` · ${eur(o.paid)} encaissés` : ''}${o.discount ? ` (réduction ${eur(o.discount)})` : ''}`);
    L.push('');

    if (d.contacts.length) {
        L.push(`MESSAGES DE CONTACT (${d.contacts.length})`);
        for (const m of d.contacts) L.push(`- ${at(m.at)} · ${m.name}${m.subject ? ` : ${m.subject}` : ''}`);
        L.push('');
    }

    L.push(d.slot.kind === 'semaine' ? 'APPELS PRÉVUS CETTE SEMAINE' : 'PROCHAINS APPELS PRÉVUS');
    if (!d.upcoming.length) L.push(d.slot.kind === 'semaine' ? 'Aucun.' : 'Aucun d’ici le prochain récap.');
    for (const u of d.upcoming) L.push(`- ${u.day} à ${u.time.replace(':', ' h ')} · ${u.client}${u.first ? ' (premier appel)' : ''}`);
    L.push('');

    if (d.audience) {
        L.push(`LE SITE (${d.audience.label})`);
        L.push(`${plural(d.audience.sessions, 'visite')}, ${plural(d.audience.users, 'visiteur')}, dont ${plural(d.audience.linkedin, 'visite')} depuis LinkedIn. ${plural(d.audience.demoClicks, 'clic')} sur la démo, ${plural(d.audience.checkouts, 'début')} de commande.`);
        if (d.audience.sources.length) L.push(`D'où : ${d.audience.sources.map((s) => `${s.source} ${s.sessions}`).join(', ')}.`);
        L.push('');
    }

    L.push('EN TOUT');
    L.push(`${plural(d.totals.clients, 'client')} · ${plural(d.totals.activeBooks, 'livre')} en cours · ${plural(d.totals.completedBooks, 'livre')} terminé${d.totals.completedBooks > 1 ? 's' : ''} · ${plural(d.totals.realCalls, 'vrai appel', 'vrais appels')} (${Math.round(d.totals.minutes)} min) · ${d.totals.words.toLocaleString('fr-FR')} mots écrits · ${plural(d.totals.demos30, 'démo')} sur 30 jours.`);
    const m = d.month;
    L.push(`${m.label} : ${m.spendHt != null ? `${eur(m.spendHt)} HT dépensés (${eur(m.spendTtc ?? 0)} TTC)` : 'dépenses illisibles'}, ${m.collected != null ? `${eur(m.collected)} encaissés` : 'encaissé illisible'} pour ${plural(m.orders, 'commande')}.`);
    if (d.errors.length) L.push('', `Pas lu cette fois : ${d.errors.join(' ; ')}.`);
    L.push('', `L'admin : ${SITE.url}/admin`);
    return L.join('\n');
}

/* ───────────────────────── HTML ───────────────────────── */

const INK = '#161616';
const MUTED = '#66665f';
const LINE = '#e7e6e1';
const BLUE = '#1f3a8a';
const SOFT = '#f3f5fb';

const h2 = (t: string) => `<h2 style="margin:28px 0 10px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};font-weight:600">${esc(t)}</h2>`;
const p = (html: string, style = '') => `<p style="margin:0 0 10px;${style}">${html}</p>`;
const muted = (t: string) => `<span style="color:${MUTED}">${esc(t)}</span>`;

function rows(items: Array<{ left: string; right?: string; sub?: string }>): string {
    if (!items.length) return '';
    return (
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:15px">` +
        items
            .map(
                (r) =>
                    `<tr><td style="padding:9px 0;border-top:1px solid ${LINE};vertical-align:top">${r.left}${r.sub ? `<div style="font-size:13px;color:${MUTED};margin-top:2px">${r.sub}</div>` : ''}</td>` +
                    `<td style="padding:9px 0 9px 12px;border-top:1px solid ${LINE};text-align:right;vertical-align:top;white-space:nowrap">${r.right ?? ''}</td></tr>`
            )
            .join('') +
        `</table>`
    );
}

function tiles(list: Array<{ n: string; label: string; was?: string }>): string {
    const cell = (t: { n: string; label: string; was?: string }) =>
        `<td width="33%" style="padding:4px"><div style="background:${SOFT};border-radius:12px;padding:12px 10px;text-align:center">` +
        `<div style="font-size:24px;font-weight:700;color:${BLUE};line-height:1.2">${esc(t.n)}</div>` +
        `<div style="font-size:12px;color:${MUTED};line-height:1.3;margin-top:2px">${esc(t.label)}</div>` +
        (t.was ? `<div style="font-size:11px;color:${MUTED};margin-top:3px">${esc(t.was)}</div>` : '') +
        `</div></td>`;
    const lines: string[] = [];
    for (let i = 0; i < list.length; i += 3) lines.push(`<tr>${list.slice(i, i + 3).map(cell).join('')}${'<td width="33%"></td>'.repeat(Math.max(0, 3 - list.slice(i, i + 3).length))}</tr>`);
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -4px">${lines.join('')}</table>`;
}

const pill = (text: string, color: string) => `<span style="display:inline-block;font-size:12px;padding:1px 8px;border-radius:99px;background:${color}1a;color:${color};margin-left:6px">${esc(text)}</span>`;

export function recapInnerHtml(d: RecapData): string {
    const site = SITE.url.replace(/\/$/, '');
    const calls = d.calls;
    const real = realCalls(d);
    const out: string[] = [];

    out.push(`<div style="font-size:13px;color:${MUTED};margin:0 0 6px">${title(d)} · ${esc(d.slot.dayLabel)}</div>`);
    out.push(`<h1 style="margin:0 0 18px;font-size:21px;line-height:1.35;font-weight:700;color:${INK}">${esc(headline(d))}</h1>`);

    // Ce qui demande un geste.
    if (d.alerts.length) {
        out.push(
            `<div style="border:1px solid #f1c27d;background:#fff8ec;border-radius:12px;padding:14px 16px;margin:0 0 8px">` +
                `<div style="font-weight:600;margin:0 0 6px">À regarder</div>` +
                d.alerts.map((a) => `<div style="margin:4px 0;font-size:15px">${a.level === 'rouge' ? '🔴' : '🟠'} ${esc(a.text)}</div>`).join('') +
                `</div>`
        );
    } else {
        out.push(`<div style="border:1px solid #cfe7d6;background:#f1faf3;border-radius:12px;padding:12px 16px;margin:0 0 8px;font-size:15px">🟢 Rien d’anormal : appels, démos, serveur vocal et réglages vont bien.</div>`);
    }

    // Les chiffres de la période.
    const costHt = sum(calls, (c) => c.costHt) + sum(d.demos, (x) => x.costHt);
    const costTtc = sum(calls, (c) => c.costTtc) + sum(d.demos, (x) => x.costTtc);
    out.push(h2(d.slot.kind === 'semaine' ? d.slot.since : `Depuis ${d.slot.since.replace(/^depuis /, '')}`));
    const v = d.previous;
    const was = (n: number | undefined, unit = '') => (v && n != null ? `${n.toLocaleString('fr-FR')}${unit} la semaine d’avant` : undefined);
    out.push(
        tiles([
            { n: String(d.demos.length), label: d.demos.length > 1 ? 'démos' : 'démo', was: was(v?.demos) },
            { n: String(real.length), label: real.length > 1 ? 'appels clients' : 'appel client', was: was(v?.calls) },
            { n: `${Math.round(sum(real, (c) => c.seconds) / 60)} min`, label: 'au téléphone', was: was(v?.minutes, ' min') },
            { n: String(recits(d) + d.demos.filter((x) => x.status === 'written').length), label: 'récits écrits', was: was(v?.recits) },
            { n: String(d.signups.length), label: d.signups.length > 1 ? 'nouveaux inscrits' : 'nouvel inscrit', was: was(v?.signups) },
            { n: String(d.orders.length), label: d.orders.length > 1 ? 'commandes' : 'commande', was: was(v?.orders) },
        ])
    );
    if (d.byDay) {
        out.push(h2('Jour par jour'));
        out.push(
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:14px">` +
                `<tr style="color:${MUTED};font-size:12px"><td style="padding:4px 0"></td><td align="right">démos</td><td align="right">appels</td><td align="right">minutes</td><td align="right">commandes</td></tr>` +
                d.byDay
                    .map((x) => `<tr><td style="padding:7px 0;border-top:1px solid ${LINE}">${esc(x.label)}</td>${[x.demos, x.calls, x.minutes, x.orders].map((n) => `<td align="right" style="padding:7px 0 7px 8px;border-top:1px solid ${LINE};${n ? 'font-weight:600' : `color:${MUTED}`}">${n}</td>`).join('')}</tr>`)
                    .join('') +
                `</table>`
        );
    }
    out.push(p(muted(`Coût des appels et démos de la période : ${eur(costHt)} HT, ${eur(costTtc)} TTC.`), 'margin-top:10px;font-size:14px'));

    // Les démos.
    out.push(h2(`Démos (${d.demos.length})`));
    out.push(
        d.demos.length
            ? rows(
                  d.demos.map((x) => ({
                      left: `<strong>${esc(x.name)}</strong> · ${x.phone ? `<a href="tel:${esc(x.phone.replace(/\s/g, ''))}" style="color:${INK};text-decoration:none;font-variant-numeric:tabular-nums">${esc(x.phone)}</a>` : muted('numéro masqué')} ${muted(`à ${at(x.at)}, ${duration(x.seconds)}`)}`,
                      sub: [DEMO_STATUS[x.status] ?? x.status, x.smsSent ? 'SMS parti' : x.status === 'written' ? 'SMS pas parti' : null, x.email ? 'e-mail laissé, PDF envoyé' : null].filter(Boolean).join(' · '),
                      right: `${eur(x.costTtc)} <span style="color:${MUTED};font-size:12px">TTC</span>`,
                  }))
              )
            : p(muted('Aucune démo.'))
    );

    // Les appels.
    out.push(h2(`Appels clients (${calls.length})`));
    if (calls.length) {
        out.push(
            rows(
                calls.map((c) => ({
                    left: `<a href="${site}/admin/clients/${c.profileId ?? ''}?onglet=appels" style="color:${INK};font-weight:600;text-decoration:none">${esc(c.client)}</a>${c.first ? pill('premier appel', BLUE) : ''} ${muted(`à ${at(c.at)}, ${duration(c.seconds)}`)}`,
                    sub: CALL_STATUS[c.status] ?? c.status,
                    right: `${eur(c.costHt)} <span style="color:${MUTED};font-size:12px">HT</span><div style="font-size:12px;color:${MUTED}">${eur(c.costTtc)} TTC${c.estimated ? ', estimé' : ''}</div>`,
                }))
            )
        );
        out.push(p(muted(`Total : ${eur(sum(calls, (c) => c.costHt))} HT, ${eur(sum(calls, (c) => c.costTtc))} TTC. Chiffres de la fiche client, « Ce que cet appel a coûté ».`), 'margin-top:8px;font-size:13px'));
    } else out.push(p(muted('Aucun appel client.')));
    if (d.testCalls) out.push(p(muted(`Plus ${plural(d.testCalls, 'appel de test')}, hors chiffres.`), 'font-size:13px'));

    // Inscrits, commandes, messages.
    if (d.signups.length || d.orders.length || d.contacts.length) {
        out.push(h2('Inscrits, commandes, messages'));
        out.push(
            rows([
                ...d.orders.map((o) => ({
                    left: `🎉 <strong>Commande</strong> de ${esc(o.client)}${o.isGift ? pill('cadeau', '#b45309') : ''} ${muted(`à ${at(o.at)}`)}`,
                    sub: o.discount ? `réduction de ${eur(o.discount)}` : undefined,
                    right: o.paid != null ? eur(o.paid) : '',
                })),
                ...d.signups.filter((s) => !s.paid).map((s) => ({ left: `Inscrit : <strong>${esc(s.name)}</strong> ${muted(`à ${at(s.at)}, sans commande`)}` })),
                ...d.contacts.map((m) => ({ left: `✉️ Message de <strong>${esc(m.name)}</strong> ${muted(`à ${at(m.at)}`)}`, sub: m.subject ? esc(m.subject) : undefined })),
            ])
        );
    }

    // Les prochains appels.
    out.push(h2(d.slot.kind === 'semaine' ? 'Appels prévus cette semaine' : 'Prochains appels prévus'));
    out.push(
        d.upcoming.length
            ? rows(d.upcoming.map((u) => ({ left: `<strong>${esc(u.client)}</strong>${u.first ? pill('premier appel', BLUE) : ''}`, right: `${esc(u.day)} à ${u.time.replace(':', ' h ')}` })))
            : p(muted(d.slot.kind === 'semaine' ? 'Aucun pour l’instant.' : 'Aucun d’ici le prochain récap.'))
    );

    // Le site.
    if (d.audience) {
        const a = d.audience;
        out.push(h2(`Le site, ${a.label}`));
        out.push(p(`<strong>${plural(a.sessions, 'visite')}</strong>${v?.sessions != null ? muted(before(v.sessions)) : ''}, ${plural(a.users, 'visiteur')}. <strong>${plural(a.linkedin, 'visite')} depuis LinkedIn</strong>. ${plural(a.demoClicks, 'clic')} sur « essayer la démo », ${plural(a.checkouts, 'début')} de commande.`));
        if (a.sources.length) out.push(p(muted(`D’où viennent les visites : ${a.sources.map((s) => `${s.source} (${s.sessions})`).join(', ')}.`), 'font-size:14px'));
        out.push(p(muted('Google Analytics ne compte que les visiteurs qui ont accepté les cookies.'), 'font-size:12px'));
    }

    // Le cumul.
    const t = d.totals;
    const m = d.month;
    out.push(h2('En tout'));
    out.push(
        rows([
            { left: 'Clients', right: String(t.clients) },
            { left: 'Livres en cours / terminés', right: `${t.activeBooks} / ${t.completedBooks}` },
            { left: 'Vrais appels depuis le début', right: `${t.realCalls} (${Math.round(t.minutes)} min)` },
            { left: 'Mots écrits dans les livres', right: t.words.toLocaleString('fr-FR') },
            { left: 'Démos sur 30 jours', right: String(t.demos30) },
            { left: `Dépensé en ${esc(m.label)}`, right: m.spendHt != null ? `${eur(m.spendHt)} HT<div style="font-size:12px;color:${MUTED}">${eur(m.spendTtc ?? 0)} TTC</div>` : muted('illisible') },
            { left: `Encaissé en ${esc(m.label)}`, sub: plural(m.orders, 'commande'), right: m.collected != null ? eur(m.collected) : muted('illisible') },
        ])
    );
    if (d.errors.length) out.push(p(muted(`Pas lu cette fois : ${d.errors.join(' ; ')}.`), 'margin-top:12px;font-size:13px'));

    out.push(
        `<p style="margin:26px 0 0"><a href="${site}/admin" style="display:inline-block;background:${BLUE};color:#fff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:99px;font-size:15px">Ouvrir l’admin</a></p>`
    );
    return out.join('');
}

/** « jeudi 26 novembre », pour le titre. */
export function dayLabel(iso: string): string {
    return dayShort.format(new Date(iso));
}
