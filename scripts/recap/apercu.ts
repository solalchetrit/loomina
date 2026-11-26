/**
 * Aperçu du récap de 10 h / 20 h, avec des chiffres d'EXEMPLE (aucune base,
 * aucun réseau) : `voice/node_modules/.bin/tsx --tsconfig tsconfig.json scripts/recap/apercu.ts [sortie.html]`.
 * Le vrai récap, avec les vrais chiffres, se voit dans l'admin : bouton « Récap du jour ».
 */
import { writeFileSync } from 'node:fs';
import { brandEmailHtml } from '../../lib/loomina/notify';
import { recapInnerHtml, recapSubject, recapText, type RecapData } from '../../lib/admin/recap-mail';

const example: RecapData = {
    slot: { kind: 'jour', hour: 10, start: '2026-11-25T19:00:00Z', end: '2026-11-26T09:00:00Z', dayLabel: 'jeudi 26 novembre', since: 'depuis hier 20 h' },
    previous: null,
    byDay: null,
    demos: [
        { name: 'Prénom inconnu', at: '2026-11-25T20:25:12Z', seconds: 16, status: 'unusable', smsSent: false, email: false, costHt: 0.02, costTtc: 0.024, estimated: false },
        { name: 'Joana', at: '2026-11-26T07:42:00Z', seconds: 312, status: 'written', smsSent: true, email: true, costHt: 0.41, costTtc: 0.49, estimated: false },
    ],
    calls: [{ client: 'Jeanne Martin', profileId: 'exemple', at: '2026-11-26T08:20:00Z', seconds: 1382, status: 'processed', costHt: 1.12, costTtc: 1.34, estimated: false, first: false }],
    testCalls: 1,
    signups: [{ name: 'Marie Dupont', at: '2026-11-26T08:12:00Z', paid: true, isGift: true }],
    orders: [{ client: 'Marie Dupont', at: '2026-11-26T08:12:00Z', isGift: true, paid: 199, discount: null }],
    contacts: [{ name: 'Jean', subject: 'Question sur le livre offert', at: '2026-11-26T06:30:00Z' }],
    upcoming: [
        { day: 'aujourd’hui', time: '10:00', client: 'Jeanne Martin', first: false },
        { day: 'aujourd’hui', time: '18:30', client: 'Marie Dupont', first: true },
    ],
    totals: { clients: 3, activeBooks: 3, completedBooks: 0, realCalls: 4, minutes: 71, words: 6420, demos30: 8 },
    month: { label: 'novembre 2026', spendHt: 84.3, spendTtc: 101.16, collected: 199, orders: 1 },
    audience: { label: 'hier sur la journée', sessions: 142, users: 118, linkedin: 64, demoClicks: 9, checkouts: 2, sources: [{ source: 'linkedin.com', sessions: 58 }, { source: 'direct', sessions: 41 }, { source: 'google', sessions: 22 }, { source: 'lnkd.in', sessions: 6 }] },
    alerts: [
        { level: 'orange', text: 'Une démo trop courte pour en faire un récit (la personne a raccroché vite).' },
        { level: 'orange', text: 'Un message de contact attend une réponse.' },
    ],
    errors: [],
};

const weekly: RecapData = {
    ...example,
    slot: { kind: 'semaine', hour: 9, start: '2026-11-22T23:00:00Z', end: '2026-11-29T23:00:00Z', dayLabel: 'lundi 30 novembre', since: 'la semaine du 23 au 29 novembre' },
    previous: { demos: 3, calls: 2, minutes: 41, recits: 2, signups: 0, orders: 0, sessions: 380 },
    byDay: ['lundi 23', 'mardi 24', 'mercredi 25', 'jeudi 26', 'vendredi 27', 'samedi 28', 'dimanche 29'].map((label, i) => ({ label, demos: [0, 1, 1, 2, 0, 1, 0][i], calls: [0, 1, 0, 1, 1, 0, 0][i], minutes: [0, 22, 0, 23, 19, 0, 0][i], orders: [0, 0, 0, 1, 0, 0, 0][i] })),
    audience: example.audience && { ...example.audience, label: 'sur la semaine', sessions: 812, users: 640, linkedin: 402 },
};

const out = process.argv[2] ?? 'recap-apercu.html';
const banner = '<div style="background:#fff3cd;color:#7a5b00;font:13px system-ui;padding:8px 16px;text-align:center">Aperçu avec des chiffres d’exemple · sujet : « ' + recapSubject(example) + ' »</div>';
writeFileSync(out, brandEmailHtml(recapInnerHtml(example)).replace(/<body([^>]*)>/, `<body$1>${banner}`));
writeFileSync(out.replace(/\.html$/, '.txt'), recapText(example));
const weekBanner = banner.replace(recapSubject(example), recapSubject(weekly));
writeFileSync(out.replace(/\.html$/, '-semaine.html'), brandEmailHtml(recapInnerHtml(weekly)).replace(/<body([^>]*)>/, `<body$1>${weekBanner}`));
writeFileSync(out.replace(/\.html$/, '-semaine.txt'), recapText(weekly));
console.log(`écrit : ${out}`);
