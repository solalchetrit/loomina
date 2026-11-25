/**
 * La mise en page commune de tous les e-mails envoyés aux clients.
 *
 * Demande de Solal (25/11/2026) : la version bleutée du site, Mémo dedans, de
 * la joie. Couleurs reprises de app/globals.css (fond bleuté, bleu nuit, ambre),
 * logo bleu de l'en-tête du site. Des tableaux et des styles en ligne : c'est
 * ce que lisent Gmail, Outlook et Apple Mail.
 *
 * Un e-mail = une liste de blocs (titre, paragraphe, bouton, Mémo, encadré…).
 * Chaque bloc sait s'écrire en HTML et en texte brut : les deux versions
 * partent ensemble et disent toujours la même chose.
 */

import { SITE } from '../../config/site';
import { MEMO_STEPS, type MemoAge, type MemoPose } from './memo';

export const SITE_URL = SITE.url.replace(/\/$/, '');
export const HOST = SITE.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
export const DASHBOARD = `${HOST}/dashboard`;

/** Les couleurs du site (app/globals.css). */
export const C = {
    canvas: '#f2f5f8',
    surface: '#ffffff',
    mist: '#e8eef5',
    line: '#e4e7ec',
    night: '#171d2b',
    title: '#161616',
    text: '#283044',
    soft: '#61656e',
    amber: '#f1a843',
    amberSoft: '#fcebd2',
    amberInk: '#95580a',
} as const;

const FONT = "'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Un bloc : sa version HTML et sa version texte. */
export interface Block {
    html: string;
    text: string;
}

/** Le grand titre en haut de l'e-mail. */
export function titre(t: string): Block {
    return {
        html: `<h1 style="margin:0 0 18px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:800;color:${C.title};letter-spacing:-0.01em">${esc(t)}</h1>`,
        text: t,
    };
}

/** Un paragraphe. Les retours à la ligne sont gardés. */
export function p(t: string): Block {
    return { html: `<p style="margin:0 0 16px">${esc(t).replace(/\n/g, '<br>')}</p>`, text: t };
}

/** Plusieurs paragraphes d'un coup. */
export function ps(...ts: (string | null | false | undefined)[]): Block[] {
    return ts.filter((t): t is string => typeof t === 'string' && t.length > 0).map(p);
}

/** Le bouton bleu nuit, rond comme ceux du site. */
export function bouton(label: string, url: string): Block {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return {
        html:
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 24px"><tr><td style="border-radius:999px;background:${C.night}">` +
            `<a href="${esc(href)}" style="display:inline-block;padding:15px 30px;border-radius:999px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">${esc(label)}</a>` +
            '</td></tr></table>',
        text: `${label} : ${href}`,
    };
}

/**
 * Le bouton « Appeler Loomina » : pour les auteurs qui écrivent leur livre
 * (demande de Solal, 25/11/2026). Sur un téléphone, il lance l'appel.
 */
export function appeler(label = 'Appeler Loomina'): Block {
    return {
        html:
            `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px"><tr><td style="border-radius:999px;background:${C.amber}">` +
            `<a href="tel:${SITE.phone}" style="display:inline-block;padding:15px 30px;border-radius:999px;font-family:${FONT};font-size:16px;font-weight:700;color:${C.night};text-decoration:none">${esc(label)} · ${esc(SITE.phoneDisplay)}</a>` +
            '</td></tr></table>',
        text: `${label} : ${SITE.phoneDisplay}`,
    };
}

/** Un encadré ambre clair : un code, un numéro de suivi, une info à retrouver vite. */
export function encadre(lignes: string[]): Block {
    return {
        html:
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px"><tr><td style="background:${C.amberSoft};border-radius:16px;padding:16px 20px;color:${C.title}">` +
            lignes.map((l) => esc(l)).join('<br>') +
            '</td></tr></table>',
        text: lignes.join('\n'),
    };
}

/** Une liste numérotée (comment se passe un livre). */
export function etapes(items: string[]): Block {
    return {
        html:
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">' +
            items
                .map(
                    (t, i) =>
                        `<tr><td valign="top" style="width:36px;padding:0 0 12px"><div style="width:26px;height:26px;border-radius:13px;background:${C.night};color:#ffffff;font-size:13px;font-weight:700;line-height:26px;text-align:center">${i + 1}</div></td>` +
                        `<td valign="top" style="padding:2px 0 12px">${esc(t)}</td></tr>`
                )
                .join('') +
            '</table>',
        text: items.map((t, i) => `${i + 1}. ${t}`).join('\n'),
    };
}

/** La signature. */
export function signature(nom = 'L’équipe Loomina'): Block {
    return { html: `<p style="margin:8px 0 0;font-weight:700;color:${C.title}">${esc(nom)}</p>`, text: nom };
}

/**
 * Mémo en haut de l'e-mail : l'éléphant dans la pose du moment, sur un fond
 * bleuté, avec sa bulle. Les images sont dans public/email (PNG, lus partout).
 */
export function memo(m: { age: MemoAge; pose: MemoPose; bulle: string }): Block {
    const src = `${SITE_URL}/email/memo-${m.age}-${m.pose}.png`;
    return {
        html:
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px"><tr><td style="background:${C.mist};border-radius:22px;padding:22px 22px 0">` +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
            `<td valign="bottom" style="width:124px"><img src="${src}" width="116" alt="Mémo" style="display:block;border:0;width:116px;height:auto"></td>` +
            '<td valign="middle" style="padding:0 0 22px 10px">' +
            `<div style="background:#ffffff;border-radius:18px 18px 18px 4px;padding:13px 16px;font-size:15px;line-height:1.5;color:${C.title};font-weight:600">${esc(m.bulle)}</div>` +
            `<div style="font-size:12px;color:${C.soft};margin:6px 0 0 4px">Mémo, l’éléphant qui n’oublie rien</div>` +
            '</td></tr></table></td></tr></table>',
        text: `Mémo : « ${m.bulle} »`,
    };
}

/**
 * Une frise de cinq étapes : faites (bleu nuit, coche), en cours (ambre),
 * à venir (blanc). `courante` = l'index de l'étape en cours ; au-delà de la
 * dernière, tout est fait.
 */
export function frise(noms: string[], courante: number, titreLigne: string): Block {
    const cells = noms
        .map((nom, i) => {
            const done = i < courante;
            const now = i === courante;
            const bg = done ? C.night : now ? C.amber : '#ffffff';
            const border = done ? C.night : now ? C.amber : C.line;
            const fg = done ? '#ffffff' : now ? C.title : C.soft;
            return (
                `<td align="center" valign="top" style="width:${Math.floor(100 / noms.length)}%;padding:0 2px">` +
                `<div style="width:30px;height:30px;border-radius:17px;background:${bg};border:2px solid ${border};color:${fg};font-size:13px;font-weight:800;line-height:30px;text-align:center;margin:0 auto">${done ? '✓' : i + 1}</div>` +
                `<div style="font-size:11.5px;line-height:1.3;margin-top:7px;color:${now ? C.title : C.soft};font-weight:${now ? 700 : 500}">${esc(nom)}</div>` +
                '</td>'
            );
        })
        .join('');
    const etat = noms.map((nom, i) => `${i < courante ? '✓' : i === courante ? '→' : '·'} ${nom}`).join('   ');
    return {
        html:
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px"><tr><td style="border:1px solid ${C.line};border-radius:20px;padding:18px 10px 16px">` +
            `<div style="font-size:14px;font-weight:700;color:${C.title};margin:0 8px 14px">${esc(titreLigne)}</div>` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>` +
            '</td></tr></table>',
        text: `${titreLigne}\n${etat}`,
    };
}

/** Où en est le récit : les cinq âges de Mémo (5 = récit complet, tout est coché). */
export function progression(age: MemoAge, titreLigne: string): Block {
    return frise(MEMO_STEPS.map((s) => s.court), age === 5 ? 5 : age - 1, titreLigne);
}

/** Après « terminé » : où en est le livre imprimé (lib/loomina/fulfillment.ts). */
export const SUIVI_LIVRE = ['Terminé', 'Relu', 'Impression', 'En route', 'Livré'];

export interface RenderedEmail {
    subject: string;
    /** La phrase que la boîte de réception montre sous l'objet. */
    preheader: string;
    text: string;
    html: string;
}

/** Assemble un e-mail complet à partir de ses blocs. */
export function renderEmail(e: { subject: string; preheader: string; blocks: Block[]; /** La ligne de désinscription, tout en bas sous le pied de page. */ optOut?: string | null }): RenderedEmail {
    // Le lien de désinscription devient cliquable dans la version HTML.
    const optOutHtml = e.optOut ? esc(e.optOut).replace(/(https?:\/\/\S+)/, `<a href="$1" style="color:${C.soft};text-decoration:underline">$1</a>`) : '';
    const inner = e.blocks.map((b) => b.html).join('');
    const html =
        '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">' +
        `<title>${esc(e.subject)}</title>` +
        '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">' +
        '</head>' +
        `<body style="margin:0;padding:0;background:${C.canvas}">` +
        // La phrase d'aperçu, invisible dans l'e-mail ouvert.
        `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.canvas}">${esc(e.preheader)}${'&#8203;&nbsp;'.repeat(40)}</div>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas}">` +
        '<tr><td align="center" style="padding:32px 14px 40px">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px">' +
        `<tr><td style="padding:0 10px 22px"><a href="${SITE_URL}" style="text-decoration:none"><img src="${SITE_URL}/header-logo-bleu.png" width="124" alt="Loomina" style="display:block;border:0;width:124px;height:auto"></a></td></tr>` +
        `<tr><td style="background:${C.surface};border:1px solid ${C.line};border-radius:28px;padding:32px 30px 30px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.text}">` +
        inner +
        '</td></tr>' +
        `<tr><td align="center" style="padding:24px 10px 0;font-family:${FONT};font-size:13px;line-height:1.7;color:${C.soft}">` +
        `Une question, une idée, un souvenir ? Répondez à cet e-mail, on lit tout.<br>` +
        `Loomina · ${SITE.phoneDisplay} · <a href="${SITE_URL}" style="color:${C.soft};text-decoration:underline">${HOST}</a>` +
        (optOutHtml ? `<br><br>${optOutHtml}` : '') +
        '</td></tr></table></td></tr></table></body></html>';
    const text = e.blocks.map((b) => b.text).join('\n\n') + `\n\n—\nUne question, une idée, un souvenir ? Répondez à cet e-mail, on lit tout.\nLoomina · ${SITE.phoneDisplay} · ${HOST}` + (e.optOut ? `\n\n${e.optOut}` : '');
    return { subject: e.subject, preheader: e.preheader, text, html };
}
