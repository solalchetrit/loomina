/**
 * Un récit mis en page comme dans le livre Loomina, en PDF.
 *
 * Mêmes réglages que la maquette validée par Solal (mise-en-page-livre,
 * v3, d'après la biographie d'exemple) : A5, Times 12 pt, marges de 2 cm,
 * texte justifié, intertitres en gras, numéro de page en bas à droite,
 * « Chapitre 1 » centré et titre en italique. Couverture en toile de lin
 * avec le titre en capitales, le prénom dessous et le logo en bas.
 *
 * pdf-lib, sans police à embarquer : les polices Times et Helvetica du
 * standard PDF couvrent le français (accents, guillemets, apostrophes).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFFont, PDFPage, PDFImage } from 'pdf-lib';
import { SITE } from '../../config/site';

const MM = 72 / 25.4;
const W = 148 * MM;
const H = 210 * MM;
const MARGIN = 20 * MM;
const SIZE = 12;
const LEAD = SIZE * 1.25;
const PARA = SIZE * 0.75;
const INK = rgb(0.078, 0.075, 0.071);
const CLOTH = rgb(0.796, 0.722, 0.612);
const COVER_INK = rgb(0.106, 0.098, 0.086);

type Block = { kind: 'p' | 'h'; text: string };

/** Le markdown de l'Écrivain : paragraphes et intertitres, sans balises. */
export function toBlocks(markdown: string): Block[] {
    return markdown
        .replace(/\r/g, '')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
            const heading = p.match(/^#{1,6}\s+(.+)$/) ?? p.match(/^\*\*([^*]+)\*\*$/);
            if (heading) return { kind: 'h' as const, text: clean(heading[1]) };
            return { kind: 'p' as const, text: clean(p.replace(/\n/g, ' ')) };
        });
}

function clean(s: string): string {
    return s
        .replace(/\*\*|__/g, '')
        .replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, '$1$2')
        .replace(/[    ]/g, ' ')
        .replace(/[‐‑‒]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Retire les caractères que la police standard ne sait pas écrire. */
function encodable(font: PDFFont, text: string): string {
    let out = '';
    for (const ch of text) {
        try {
            font.encodeText(ch);
            out += ch;
        } catch {
            out += ch === '−' ? '-' : '';
        }
    }
    return out;
}

/** Découpe en lignes ; chaque ligne garde ses mots pour la justification. */
function wrap(font: PDFFont, size: number, text: string, width: number): string[][] {
    const words = text.split(' ').filter(Boolean);
    const lines: string[][] = [];
    let line: string[] = [];
    for (const word of words) {
        const next = [...line, word].join(' ');
        if (line.length && font.widthOfTextAtSize(next, size) > width) {
            lines.push(line);
            line = [word];
        } else {
            line.push(word);
        }
    }
    if (line.length) lines.push(line);
    return lines;
}

function drawJustified(page: PDFPage, font: PDFFont, words: string[], y: number, width: number, last: boolean) {
    if (last || words.length === 1) {
        page.drawText(words.join(' '), { x: MARGIN, y, size: SIZE, font, color: INK });
        return;
    }
    const wordsWidth = words.reduce((n, w) => n + font.widthOfTextAtSize(w, SIZE), 0);
    const gap = (width - wordsWidth) / (words.length - 1);
    let x = MARGIN;
    for (const w of words) {
        page.drawText(w, { x, y, size: SIZE, font, color: INK });
        x += font.widthOfTextAtSize(w, SIZE) + gap;
    }
}

/** Texte centré, avec un espacement des lettres (capitales de couverture). */
function drawTracked(page: PDFPage, font: PDFFont, size: number, text: string, y: number, tracking: number, color = COVER_INK) {
    const chars = [...text];
    const width = chars.reduce((n, c) => n + font.widthOfTextAtSize(c, size), 0) + tracking * (chars.length - 1);
    let x = (W - width) / 2;
    for (const c of chars) {
        page.drawText(c, { x, y, size, font, color });
        x += font.widthOfTextAtSize(c, size) + tracking;
    }
}

function wrapTracked(font: PDFFont, size: number, text: string, width: number, tracking: number): string[] {
    const measure = (s: string) => [...s].reduce((n, c) => n + font.widthOfTextAtSize(c, size), 0) + tracking * Math.max(0, [...s].length - 1);
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && measure(next) > width) {
            lines.push(line);
            line = word;
        } else line = next;
    }
    if (line) lines.push(line);
    return lines;
}

function centered(page: PDFPage, font: PDFFont, size: number, text: string, y: number, color = INK) {
    page.drawText(text, { x: (W - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
}

async function logoBytes(): Promise<Uint8Array | null> {
    try {
        return await fs.readFile(path.join(process.cwd(), 'public', 'header-logo-trimmed.png'));
    } catch {
        try {
            const res = await fetch(`${SITE.url}/header-logo-trimmed.png`, { signal: AbortSignal.timeout(8000) });
            return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
        } catch {
            return null;
        }
    }
}

function frenchDate(d: Date): string {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}

export async function buildRecitPdf(params: { title: string; author: string | null; content: string; date: Date }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    doc.setTitle(params.title);
    doc.setAuthor(params.author ?? 'Loomina');
    doc.setCreator('Loomina');
    doc.setProducer('Loomina');
    doc.setLanguage('fr-FR');

    const roman = await doc.embedFont(StandardFonts.TimesRoman);
    const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
    const sans = await doc.embedFont(StandardFonts.HelveticaBold);
    const sansLight = await doc.embedFont(StandardFonts.Helvetica);
    const logoData = await logoBytes();
    const logo: PDFImage | null = logoData ? await doc.embedPng(logoData).catch(() => null) : null;

    const title = encodable(roman, clean(params.title));
    const author = params.author ? encodable(roman, clean(params.author)) : null;

    // 1. Couverture : toile de lin, titre en capitales, prénom, logo en bas.
    const cover = doc.addPage([W, H]);
    cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CLOTH });
    for (let y = 0; y < H; y += 3) cover.drawLine({ start: { x: 0, y }, end: { x: W, y }, thickness: 0.4, color: rgb(1, 1, 1), opacity: 0.07 });
    for (let x = 0; x < W; x += 3) cover.drawLine({ start: { x, y: 0 }, end: { x, y: H }, thickness: 0.4, color: rgb(0, 0, 0), opacity: 0.05 });
    const titleSize = 19;
    const titleLines = wrapTracked(sans, titleSize, encodable(sans, title.toLocaleUpperCase('fr-FR')), W - 2 * 15 * MM, 1.2);
    let cy = H - 0.3 * W - titleSize;
    for (const line of titleLines) {
        drawTracked(cover, sans, titleSize, line, cy, 1.2);
        cy -= titleSize * 1.15;
    }
    if (author) drawTracked(cover, sansLight, 10, encodable(sansLight, author.toLocaleUpperCase('fr-FR')), cy - 14, 1.6);
    if (logo) {
        const lw = 0.22 * W;
        const lh = (lw * logo.height) / logo.width;
        cover.drawImage(logo, { x: (W - lw) / 2, y: 0.09 * W + 4, width: lw, height: lh });
    }

    // 2. Le chapitre : « Chapitre 1 » centré, titre en italique, texte justifié.
    const width = W - 2 * MARGIN;
    const bottom = MARGIN + 6;
    let pageNo = 1;
    let page = doc.addPage([W, H]);
    pageNo++;
    const folio = (p: PDFPage, n: number) => {
        const t = String(n);
        p.drawText(t, { x: W - MARGIN - roman.widthOfTextAtSize(t, SIZE), y: 0.075 * W, size: SIZE, font: roman, color: INK });
    };
    let y = H - MARGIN - 0.06 * W - SIZE;
    centered(page, roman, 13.5, 'Chapitre 1', y);
    y -= 0.03 * W + 13.5;
    for (const line of wrap(italic, 13.5, title, width * 0.85)) {
        centered(page, italic, 13.5, line.join(' '), y);
        y -= 13.5 * 1.3;
    }
    y -= 0.09 * W - 13.5 * 1.3 + SIZE;

    const blocks = toBlocks(params.content);
    blocks.forEach((block, i) => {
        const font = block.kind === 'h' ? bold : roman;
        const lines = wrap(font, SIZE, encodable(font, block.text), width);
        if (block.kind === 'h') {
            if (i > 0) y -= SIZE * 0.65;
            // Un intertitre ne reste jamais seul en bas de page.
            if (y - LEAD * 2 < bottom) {
                folio(page, pageNo);
                page = doc.addPage([W, H]);
                pageNo++;
                y = H - MARGIN - SIZE;
            }
        }
        lines.forEach((words, j) => {
            if (y < bottom) {
                folio(page, pageNo);
                page = doc.addPage([W, H]);
                pageNo++;
                y = H - MARGIN - SIZE;
            }
            if (block.kind === 'h') page.drawText(words.join(' '), { x: MARGIN, y, size: SIZE, font: bold, color: INK });
            else drawJustified(page, roman, words, y, width, j === lines.length - 1);
            y -= LEAD;
        });
        y -= PARA;
    });
    folio(page, pageNo);

    // 3. La dernière page : d'où vient ce récit, et la suite possible.
    const end = doc.addPage([W, H]);
    let ey = H * 0.42;
    const note = [
        `Ce récit a été écrit par Loomina`,
        `à partir de votre appel du ${frenchDate(params.date)}.`,
    ];
    for (const l of note) {
        centered(end, italic, 11, encodable(italic, l), ey);
        ey -= 15;
    }
    ey -= 22;
    for (const l of ['Toute une vie, racontée ainsi,', 'devient un livre relié à transmettre.']) {
        centered(end, roman, 12, encodable(roman, l), ey);
        ey -= 16;
    }
    ey -= 10;
    centered(end, bold, 12, SITE.url.replace(/^https?:\/\/(www\.)?/, ''), ey);
    if (logo) {
        const lw = 0.24 * W;
        const lh = (lw * logo.height) / logo.width;
        end.drawImage(logo, { x: (W - lw) / 2, y: MARGIN + 8, width: lw, height: lh });
    }

    return doc.save();
}
