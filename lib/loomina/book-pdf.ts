/**
 * Le livre Loomina en PDF, prêt à imprimer.
 *
 * Mise en page : la maquette v3 validée par Solal le 17/11/2026
 * (mise-en-page-livre/REFERENCE-mise-en-page-livre-v3.html), calquée sur la
 * biographie d'exemple de masaga : A5, Times 12 pt sur 15, marges de 2 cm,
 * texte justifié, intertitres en gras, numéro de page en bas à droite,
 * « Chapitre N » centré et titre en italique, photos avec légende en
 * italique, table des chapitres à la fin.
 *
 * Deux sorties :
 *  - « imprimeur » : l'intérieur avec 3 mm de fonds perdus (TrimBox et
 *    BleedBox posées), et la couverture à plat à part (4e de couverture,
 *    dos, 1re de couverture). Format standard, sans imprimeur choisi
 *    (décision de Solal, 18/11/2026) : les réglages propres à un imprimeur
 *    (épaisseur du papier, rabats) se changent dans PRINT ci-dessous.
 *  - « lecture » : un seul fichier A5 à feuilleter, couverture comprise,
 *    pour le bouton « Télécharger mon livre » de l'espace auteur.
 *
 * Typographie de livre : coupure des mots à la française (motifs TeX via
 * `hyphen`, jamais sur un nom propre ni sur le dernier mot d'un paragraphe),
 * espaces insécables devant « ; : ! ? » et dans les guillemets, ni ligne
 * seule en bas de page (orpheline) ni en haut (veuve), intertitre jamais
 * seul en bas de page, nombre de pages multiple de 4 (cahiers).
 *
 * Polices EMBARQUÉES (un imprimeur refuse un PDF qui ne les contient pas) :
 * Liberation Serif, même dessin et mêmes chasses que Times New Roman, et
 * Liberation Sans pour la couverture. Licence SIL OFL 1.1 (lib/fonts).
 *
 * Aucun appel à un modèle : fabriquer le PDF ne coûte rien.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import type { PDFFont, PDFPage, PDFImage, RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { hyphenateSync } from 'hyphen/fr';
import { SITE } from '../../config/site';

// ── Dimensions ────────────────────────────────────────────────────────────
const MM = 72 / 25.4;
/** 1 % de la largeur de page, l'unité de la maquette (cqw). */
const CQ = (148 * MM) / 100;

export const PRINT = {
    /** Format fini : A5. */
    widthMm: 148,
    heightMm: 210,
    /** Fonds perdus, standard des imprimeurs français. */
    bleedMm: 3,
    /**
     * Épaisseur du dos par page : papier offset 90 g (≈ 0,11 mm la feuille,
     * soit 0,055 mm la page), arrondi. À régler sur la fiche de l'imprimeur.
     */
    spineMmPerPage: 0.06,
    /** Épaisseur ajoutée par la couverture elle-même (carton, toile). */
    spineExtraMm: 1,
    /** En dessous, le dos est trop fin pour y écrire. */
    spineTextMinMm: 7,
    /** Photos : 300 dpi à la largeur de la colonne de texte. */
    photoPx: 1400,
};

const W = PRINT.widthMm * MM;
const H = PRINT.heightMm * MM;
const BLEED = PRINT.bleedMm * MM;

// Marges de la maquette (.in : 13,8 / 13,5 / 14 / 13,5 cqw) : 2 cm tout autour.
const M_TOP = 13.8 * CQ;
const M_SIDE = 13.5 * CQ;
const M_BOTTOM = 14 * CQ;
const TEXT_W = W - 2 * M_SIDE;
const FOLIO_Y = 7.5 * CQ;

const SIZE = 12;
const LEAD = 15;
const PARA = SIZE * 0.75;
const HEAD_BEFORE = SIZE * 1.4;
const OPEN_SIZE = 3.3 * CQ; // « Chapitre N » et son titre
const CAP_SIZE = 2.4 * CQ; // légendes des photos
const SMALL = 2.3 * CQ;

const INK = rgb(0.078, 0.075, 0.071);
const INK_SOFT = rgb(0.353, 0.333, 0.306);

/** Les quatre toiles des photos du livre. Lin par défaut (le choix par l'auteur viendra plus tard). */
export const CLOTHS = {
    lin: { label: 'Lin', color: rgb(0.796, 0.722, 0.612), dark: false },
    'bleu-nuit': { label: 'Bleu nuit', color: rgb(0.133, 0.188, 0.302), dark: true },
    vert: { label: 'Vert', color: rgb(0.184, 0.29, 0.22), dark: true },
    bordeaux: { label: 'Bordeaux', color: rgb(0.42, 0.122, 0.165), dark: true },
} as const;
export type Cloth = keyof typeof CLOTHS;
const COVER_INK = rgb(0.106, 0.098, 0.086);
const COVER_INK_LIGHT = rgb(0.937, 0.914, 0.875);

// ── Ce qu'on met en page ──────────────────────────────────────────────────
export interface PrintChapter {
    title: string;
    content: string;
}

export interface PrintPhoto {
    /** JPEG ou PNG (les autres formats sont convertis avant, voir book-print.ts). */
    bytes: Uint8Array;
    kind: 'jpg' | 'png';
    caption: string | null;
    /** Titre du chapitre où l'auteur veut la voir ; sinon elle va dans les pages de photos de la fin. */
    chapter: string | null;
}

export interface PrintBook {
    /** Titre du livre (couverture, page de titre). */
    title: string;
    /** Le prénom de la personne qui raconte, comme sur la maquette. */
    author: string;
    chapters: PrintChapter[];
    photos?: PrintPhoto[];
    year?: number;
    cloth?: Cloth;
}

export interface BookPdfs {
    /** Intérieur, avec fonds perdus. */
    interior: Uint8Array;
    /** Couverture à plat : 4e, dos, 1re, avec fonds perdus. */
    cover: Uint8Array;
    pages: number;
    spineMm: number;
}

// ── Polices et fichiers ───────────────────────────────────────────────────
async function asset(rel: string): Promise<Uint8Array> {
    // Les fichiers sont joints aux fonctions par outputFileTracingIncludes (next.config.ts).
    const local = path.join(/*turbopackIgnore: true*/ process.cwd(), rel);
    try {
        return await fs.readFile(local);
    } catch {
        // En ligne, les fichiers de public/ sont servis par le site.
        if (rel.startsWith('public/')) {
            const res = await fetch(`${SITE.url}/${rel.slice(7)}`, { signal: AbortSignal.timeout(10_000) });
            if (res.ok) return new Uint8Array(await res.arrayBuffer());
        }
        throw new Error(`Fichier introuvable : ${rel}`);
    }
}

interface Fonts {
    roman: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
    sans: PDFFont;
    sansBold: PDFFont;
}

async function embedFonts(doc: PDFDocument): Promise<Fonts> {
    doc.registerFontkit(fontkit);
    const load = (f: string) => asset(`lib/fonts/${f}`).then((b) => doc.embedFont(b, { subset: false }));
    const [roman, bold, italic, sans, sansBold] = await Promise.all([
        load('LiberationSerif-Regular.ttf'),
        load('LiberationSerif-Bold.ttf'),
        load('LiberationSerif-Italic.ttf'),
        load('LiberationSans-Regular.ttf'),
        load('LiberationSans-Bold.ttf'),
    ]);
    return { roman, bold, italic, sans, sansBold };
}

async function embedLogos(doc: PDFDocument): Promise<{ black: PDFImage | null; white: PDFImage | null }> {
    const one = (f: string) =>
        asset(`public/${f}`)
            .then((b) => doc.embedPng(b))
            .catch(() => null);
    const [black, white] = await Promise.all([one('header-logo-trimmed.png'), one('logo-loomina-blanc.png')]);
    return { black, white };
}

// ── Le texte : blocs, mots, typographie française ─────────────────────────
type Word = { text: string; italic: boolean };
type Block = { kind: 'p'; words: Word[] } | { kind: 'h'; text: string };

const NBSP = ' ';
const SHY = '­';

/** Espaces insécables à la française, guillemets droits en chevrons, apostrophes courbes. */
export function frenchTypography(s: string): string {
    return s
        .replace(/[   ]/g, NBSP)
        .replace(/'/g, '’')
        .replace(/"([^"]+)"/g, '«$1»')
        .replace(/«\s*/g, `«${NBSP}`)
        .replace(/\s*»/g, `${NBSP}»`)
        .replace(/\s+([;:!?])/g, `${NBSP}$1`)
        .replace(/(\d)\s+(%|€)/g, `$1${NBSP}$2`)
        .replace(/[ \t]+/g, ' ')
        .trim();
}

function stripMarks(s: string): string {
    return s.replace(/\*\*|__/g, '').replace(/[*_]/g, '').trim();
}

/** Les mots d'un paragraphe, avec l'italique du markdown (*…* ou _…_). */
function words(paragraph: string): Word[] {
    const out: Word[] = [];
    const text = frenchTypography(paragraph.replace(/\*\*/g, '').replace(/\n/g, ' '));
    const re = /(\*[^*]+\*|(?<![\p{L}\d])_[^_]+_(?![\p{L}\d]))/gu;
    let last = 0;
    const push = (chunk: string, italic: boolean) => {
        for (const w of chunk.split(' ')) if (w) out.push({ text: w, italic });
    };
    for (const m of text.matchAll(re)) {
        push(text.slice(last, m.index), false);
        push(m[0].slice(1, -1), true);
        last = (m.index ?? 0) + m[0].length;
    }
    push(text.slice(last), false);
    return out;
}

/** Le markdown de l'Écrivain : paragraphes et intertitres (« ## … » ou une ligne en gras seule). */
export function toBlocks(markdown: string): Block[] {
    return markdown
        .replace(/\r/g, '')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p): Block => {
            const heading = p.match(/^#{1,6}\s+(.+)$/) ?? p.match(/^\*\*([^*]+)\*\*$/);
            if (heading) return { kind: 'h', text: frenchTypography(stripMarks(heading[1])) };
            return { kind: 'p', words: words(p) };
        })
        .filter((b) => (b.kind === 'h' ? b.text.length > 0 : b.words.length > 0));
}

/** Ne garde que les caractères que la police sait écrire (sinon pdf-lib lève une erreur). */
function encodable(font: PDFFont, text: string): string {
    const set = font.getCharacterSet();
    let out = '';
    for (const ch of text) {
        const cp = ch.codePointAt(0) ?? 0;
        if (set.includes(cp)) out += ch;
        else if (ch === '−' || ch === '‐' || ch === '‑') out += '-';
        else if (ch === '…') out += '...';
    }
    return out;
}

/** Points de coupure possibles d'un mot (positions dans le mot), à la française. */
function breakPoints(word: string): number[] {
    // Pas de coupure : nom propre, sigle, nombre, mot court, mot avec trait d'union (on coupe déjà au trait).
    if (word.length < 7 || /^[\p{Lu}]/u.test(word) || /[\d@/]/.test(word)) return [];
    if (word.includes('-')) {
        const out: number[] = [];
        for (let i = 2; i < word.length - 2; i++) if (word[i] === '-') out.push(i + 1);
        return out;
    }
    const core = word.match(/^([«(]*)([\p{L}’]+)(.*)$/u);
    if (!core) return [];
    const [, lead, letters] = core;
    const parts = hyphenateSync(letters, { hyphenChar: SHY }).split(SHY);
    const out: number[] = [];
    let at = lead.length;
    for (let i = 0; i < parts.length - 1; i++) {
        at += parts[i].length;
        const before = at - lead.length;
        const after = letters.length - before;
        // Au moins deux lettres avant la coupure, trois après, et jamais juste après une apostrophe.
        if (before >= 2 && after >= 3 && letters[before - 1] !== '’') out.push(at);
    }
    return out;
}

type Line = { words: Word[]; hyphen: boolean; last: boolean };

/** Coupe un paragraphe en lignes justifiables, avec coupure des mots si besoin. */
function setParagraph(f: Fonts, ws: Word[], width: number): Line[] {
    const fontOf = (w: Word) => (w.italic ? f.italic : f.roman);
    const wordW = (w: Word) => fontOf(w).widthOfTextAtSize(encodable(fontOf(w), w.text), SIZE);
    const space = f.roman.widthOfTextAtSize(' ', SIZE);
    const hyphenW = f.roman.widthOfTextAtSize('-', SIZE);
    const lines: Line[] = [];
    let line: Word[] = [];
    let lineW = 0;
    const queue = [...ws];
    while (queue.length) {
        const w = queue.shift()!;
        const ww = wordW(w);
        const add = line.length ? space + ww : ww;
        if (lineW + add <= width || !line.length) {
            line.push(w);
            lineW += add;
            continue;
        }
        // Le mot dépasse : on essaie de le couper (sauf le dernier mot du paragraphe).
        let split = false;
        if (queue.length > 0) {
            const points = breakPoints(w.text);
            for (let i = points.length - 1; i >= 0; i--) {
                const head = w.text.slice(0, points[i]);
                const endsWithDash = head.endsWith('-');
                const headW = fontOf(w).widthOfTextAtSize(encodable(fontOf(w), head), SIZE) + (endsWithDash ? 0 : hyphenW);
                if (lineW + space + headW <= width) {
                    line.push({ text: head, italic: w.italic });
                    lines.push({ words: line, hyphen: !endsWithDash, last: false });
                    queue.unshift({ text: w.text.slice(points[i]), italic: w.italic });
                    line = [];
                    lineW = 0;
                    split = true;
                    break;
                }
            }
        }
        if (!split) {
            lines.push({ words: line, hyphen: false, last: false });
            line = [w];
            lineW = ww;
        }
    }
    if (line.length) lines.push({ words: line, hyphen: false, last: true });
    return lines;
}

// ── Pages ────────────────────────────────────────────────────────────────
interface Ctx {
    doc: PDFDocument;
    f: Fonts;
    /** Décalage des fonds perdus (0 en lecture). */
    bleed: number;
}

function newPage(ctx: Ctx): PDFPage {
    const b = ctx.bleed;
    const page = ctx.doc.addPage([W + 2 * b, H + 2 * b]);
    if (b > 0) {
        page.setBleedBox(0, 0, W + 2 * b, H + 2 * b);
        page.setTrimBox(b, b, W, H);
    }
    return page;
}

/** Écrit du texte en coordonnées de la page finie (le décalage des fonds perdus est ajouté ici). */
function text(ctx: Ctx, page: PDFPage, s: string, x: number, y: number, font: PDFFont, size: number, color: RGB = INK) {
    const t = encodable(font, s);
    if (t) page.drawText(t, { x: x + ctx.bleed, y: y + ctx.bleed, size, font, color });
}

function centered(ctx: Ctx, page: PDFPage, s: string, y: number, font: PDFFont, size: number, color: RGB = INK, cx = W / 2) {
    const t = encodable(font, s);
    text(ctx, page, t, cx - font.widthOfTextAtSize(t, size) / 2, y, font, size, color);
}

/** Lignes simples (sans justification) pour les titres centrés. */
function wrapPlain(font: PDFFont, size: number, s: string, width: number): string[] {
    const out: string[] = [];
    let line = '';
    for (const w of encodable(font, s).split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (line && font.widthOfTextAtSize(next, size) > width) {
            out.push(line);
            line = w;
        } else line = next;
    }
    if (line) out.push(line);
    return out;
}

function drawLine(ctx: Ctx, page: PDFPage, line: Line, y: number) {
    const { f } = ctx;
    const items = line.words.map((w, i) => {
        const font = w.italic ? f.italic : f.roman;
        const t = encodable(font, w.text) + (line.hyphen && i === line.words.length - 1 ? '-' : '');
        return { t, font, w: font.widthOfTextAtSize(t, SIZE) };
    });
    const space = f.roman.widthOfTextAtSize(' ', SIZE);
    const natural = items.reduce((n, it) => n + it.w, 0);
    // Dernière ligne d'un paragraphe : au fer à gauche. Les autres : justifiées.
    const gap = line.last || items.length < 2 ? space : (TEXT_W - natural) / (items.length - 1);
    let x = M_SIDE;
    for (const it of items) {
        text(ctx, page, it.t, x, y, it.font, SIZE);
        x += it.w + gap;
    }
}

/** Une photo dans la colonne de texte, à `top` ; renvoie la hauteur occupée (légende comprise). */
function photoHeight(ctx: Ctx, img: PDFImage, caption: string | null, maxH: number): { w: number; h: number; capLines: string[]; total: number } {
    let w = TEXT_W;
    let h = (w * img.height) / img.width;
    if (h > maxH) {
        h = maxH;
        w = (h * img.width) / img.height;
    }
    const capLines = caption ? wrapPlain(ctx.f.italic, CAP_SIZE, frenchTypography(caption), TEXT_W) : [];
    const total = h + (capLines.length ? 1.8 * CQ + capLines.length * CAP_SIZE * 1.35 : 0);
    return { w, h, capLines, total };
}

function drawPhoto(ctx: Ctx, page: PDFPage, img: PDFImage, caption: string | null, top: number, maxH: number): number {
    const m = photoHeight(ctx, img, caption, maxH);
    page.drawImage(img, { x: (W - m.w) / 2 + ctx.bleed, y: top - m.h + ctx.bleed, width: m.w, height: m.h });
    let y = top - m.h - 1.8 * CQ - CAP_SIZE;
    for (const l of m.capLines) {
        centered(ctx, page, l, y, ctx.f.italic, CAP_SIZE, INK_SOFT);
        y -= CAP_SIZE * 1.35;
    }
    return m.total;
}

const TEXT_TOP = H - M_TOP - SIZE * 0.8; // ligne de base de la première ligne
const TEXT_BOTTOM = M_BOTTOM; // la dernière ligne de base reste au-dessus
const TEXT_H = TEXT_TOP - TEXT_BOTTOM;

type PlacedPhoto = { img: PDFImage; caption: string | null };

/**
 * Le flux du texte d'un chapitre : lignes, intertitres, photos, sauts de page
 * sans veuve ni orpheline.
 */
class Flow {
    page!: PDFPage;
    y = 0;
    /** Photos à placer en haut de la page suivante (pas la place ici). */
    pending: PlacedPhoto[] = [];
    constructor(
        private ctx: Ctx,
        private onPage: (page: PDFPage) => void
    ) {}

    start(page: PDFPage, y: number) {
        this.page = page;
        this.y = y;
    }

    private atTop(): boolean {
        return this.y >= TEXT_TOP - 0.5;
    }

    /** Combien de lignes de texte tiennent encore sur la page. */
    private room(): number {
        return this.y < TEXT_BOTTOM - 0.5 ? 0 : Math.floor((this.y - TEXT_BOTTOM) / LEAD + 0.001) + 1;
    }

    breakPage() {
        this.page = newPage(this.ctx);
        this.onPage(this.page);
        this.y = TEXT_TOP;
        const waiting = this.pending;
        this.pending = [];
        for (const p of waiting) this.photo(p.img, p.caption);
    }

    heading(t: string) {
        const lines = wrapPlain(this.ctx.f.bold, SIZE, t, TEXT_W);
        const before = this.atTop() ? 0 : HEAD_BEFORE - PARA;
        // L'intertitre et au moins deux lignes du paragraphe qui suit.
        if (this.y - before - (lines.length + 2 - 1) * LEAD - PARA < TEXT_BOTTOM) this.breakPage();
        else this.y -= before;
        for (const l of lines) {
            text(this.ctx, this.page, l, M_SIDE, this.y, this.ctx.f.bold, SIZE);
            this.y -= LEAD;
        }
        this.y -= PARA;
    }

    paragraph(lines: Line[]) {
        let rest = lines;
        while (rest.length) {
            let fit = this.room();
            if (rest.length <= fit) {
                this.draw(rest);
                break;
            }
            // Pas de ligne seule en bas de page (orpheline)…
            if (fit < 2) {
                this.breakPage();
                continue;
            }
            // … ni en haut de la suivante (veuve).
            if (rest.length - fit < 2) fit = rest.length - 2;
            if (fit < 2) {
                this.breakPage();
                continue;
            }
            this.draw(rest.slice(0, fit));
            rest = rest.slice(fit);
            this.breakPage();
        }
        this.y -= PARA;
    }

    private draw(lines: Line[]) {
        for (const l of lines) {
            drawLine(this.ctx, this.page, l, this.y);
            this.y -= LEAD;
        }
    }

    /** Une photo dans le texte ; si elle ne tient pas, elle passe en haut de la page suivante. */
    photo(img: PDFImage, caption: string | null) {
        const maxH = TEXT_H * 0.55;
        const m = photoHeight(this.ctx, img, caption, maxH);
        const top = this.y + SIZE * 0.8; // haut de la ligne courante
        const gapBefore = this.atTop() ? 0 : 0.4 * SIZE;
        if (top - gapBefore - m.total < TEXT_BOTTOM - SIZE * 0.3) {
            this.pending.push({ img, caption });
            return;
        }
        const used = drawPhoto(this.ctx, this.page, img, caption, top - gapBefore, maxH);
        this.y = top - gapBefore - used - 1.1 * SIZE - SIZE * 0.8;
    }

    /** Fin du chapitre : les photos encore en attente prennent la page suivante. */
    finish() {
        if (this.pending.length) this.breakPage();
    }
}

function folio(ctx: Ctx, page: PDFPage, n: number) {
    const t = String(n);
    text(ctx, page, t, W - M_SIDE - ctx.f.roman.widthOfTextAtSize(t, SIZE), FOLIO_Y, ctx.f.roman, SIZE);
}

const norm = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[’']/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

/** L'intérieur du livre. `bleed` : 0 pour la lecture, 3 mm pour l'imprimeur. */
async function buildInterior(book: PrintBook, opts: { bleed: number; withCover: boolean }): Promise<{ bytes: Uint8Array; pages: number }> {
    const doc = await PDFDocument.create();
    const title = frenchTypography(book.title);
    const author = frenchTypography(book.author);
    doc.setTitle(title);
    doc.setAuthor(author);
    doc.setCreator('Loomina');
    doc.setProducer('Loomina');
    doc.setLanguage('fr-FR');
    const f = await embedFonts(doc);
    const logos = await embedLogos(doc);
    const ctx: Ctx = { doc, f, bleed: opts.bleed };
    const year = book.year ?? new Date().getFullYear();

    if (opts.withCover) drawFront(ctx, newPage(ctx), book, logos, 0);

    // Les pages comptent à partir de la page de titre (la couverture n'est pas numérotée).
    const pages: PDFPage[] = [];
    const add = (p: PDFPage) => pages.push(p);
    const pageNo = (p: PDFPage) => pages.indexOf(p) + 1;

    // 1. Page de titre : le prénom, le titre en italique, le logo en bas.
    const tp = newPage(ctx);
    add(tp);
    centered(ctx, tp, author, H * 0.6, f.roman, 5.7 * CQ);
    let ty = H * 0.6 - 5.7 * CQ * 1.6;
    for (const l of wrapPlain(f.italic, 4.3 * CQ, title, TEXT_W)) {
        centered(ctx, tp, l, ty, f.italic, 4.3 * CQ);
        ty -= 4.3 * CQ * 1.3;
    }
    if (logos.black) {
        const lw = 24 * CQ;
        const lh = (lw * logos.black.height) / logos.black.width;
        tp.drawImage(logos.black, { x: (W - lw) / 2 + ctx.bleed, y: M_BOTTOM + ctx.bleed, width: lw, height: lh });
    }

    // 2. Son verso : la mention d'éditeur, en bas.
    const verso = newPage(ctx);
    add(verso);
    centered(ctx, verso, `© Loomina, Paris, ${year}`, M_BOTTOM + SMALL * 1.6, f.roman, SIZE);
    centered(ctx, verso, `Écrit à partir des souvenirs de ${author}`, M_BOTTOM, f.roman, SMALL, INK_SOFT);

    // 3. Les chapitres.
    const photos = book.photos ?? [];
    const embedded = await Promise.all(
        photos.map(async (p) => ({
            ...p,
            img: await (p.kind === 'png' ? doc.embedPng(p.bytes) : doc.embedJpg(p.bytes)).catch(() => null),
        }))
    );
    const usable = embedded.filter((p): p is typeof p & { img: PDFImage } => p.img !== null);
    const chapterKeys = book.chapters.map((c) => norm(c.title));
    const inChapter = (i: number) => usable.filter((p) => p.chapter && norm(p.chapter) === chapterKeys[i]);
    const loose = usable.filter((p) => !p.chapter || !chapterKeys.includes(norm(p.chapter)));

    const toc: { title: string; page: number }[] = [];
    const flow = new Flow(ctx, add);
    book.chapters.forEach((ch, i) => {
        const opener = newPage(ctx);
        add(opener);
        toc.push({ title: frenchTypography(ch.title), page: pageNo(opener) });

        // « Chapitre N » centré, le titre en italique dessous (maquette : .chap .head).
        let y = H - M_TOP - 6 * CQ - OPEN_SIZE;
        centered(ctx, opener, `Chapitre ${i + 1}`, y, f.roman, OPEN_SIZE);
        y -= 3 * CQ + OPEN_SIZE;
        for (const l of wrapPlain(f.italic, OPEN_SIZE, frenchTypography(ch.title), TEXT_W * 0.85)) {
            centered(ctx, opener, l, y, f.italic, OPEN_SIZE);
            y -= OPEN_SIZE * 1.3;
        }
        y -= 9 * CQ - OPEN_SIZE * 0.3;
        flow.start(opener, y);

        const blocks = toBlocks(ch.content);
        const paras = blocks.map((b, j) => (b.kind === 'p' ? j : -1)).filter((j) => j >= 0);
        // Les photos du chapitre : réparties dans le texte, après un paragraphe sur deux environ.
        const mine = inChapter(i);
        const after = new Map<number, typeof mine>();
        mine.forEach((p, k) => {
            const at = paras[Math.min(paras.length - 1, Math.floor(((k + 1) * paras.length) / (mine.length + 1)))] ?? -1;
            after.set(at, [...(after.get(at) ?? []), p]);
        });

        blocks.forEach((b, j) => {
            if (b.kind === 'h') flow.heading(b.text);
            else flow.paragraph(setParagraph(f, b.words, TEXT_W));
            for (const p of after.get(j) ?? []) flow.photo(p.img, p.caption);
        });
        for (const p of after.get(-1) ?? []) flow.photo(p.img, p.caption);
        flow.finish();
    });

    // 4. Les photos sans chapitre : une par page, centrées, légende dessous (maquette : .fullphoto).
    for (const p of loose) {
        const page = newPage(ctx);
        add(page);
        const m = photoHeight(ctx, p.img, p.caption, TEXT_H * 0.85);
        drawPhoto(ctx, page, p.img, p.caption, TEXT_BOTTOM + (TEXT_H + m.total) / 2, TEXT_H * 0.85);
    }
    const lastText = pages.length;

    // 5. La fin : la page qui dit comment le livre a été écrit (verso), puis la table (recto).
    const tocTitleW = TEXT_W - 4 * CQ - f.roman.widthOfTextAtSize('000', SIZE);
    const tocEntries = toc.map((t) => ({ ...t, lines: wrapPlain(f.roman, SIZE, t.title, tocTitleW) }));
    const tocLines = tocEntries.reduce((n, e) => n + e.lines.length, 0);
    const perTocPage = Math.max(1, Math.floor((TEXT_H - 8 * CQ - OPEN_SIZE) / LEAD) - tocEntries.length * 0.9);
    const tocPages = Math.max(1, Math.ceil(tocLines / perTocPage));
    // Colophon sur une page paire (verso), la table en face (recto), total multiple de 4 :
    // les pages blanches vont par deux avant le colophon, une de plus à la fin si la table en a un nombre impair.
    let blanks = (lastText + 1) % 2;
    const tail = tocPages % 2;
    while ((lastText + blanks + 1 + tocPages + tail) % 4 !== 0) blanks += 2;
    for (let k = 0; k < blanks; k++) add(newPage(ctx));

    const colophon = newPage(ctx);
    add(colophon);
    let cy = H / 2 + 6 * CQ;
    if (logos.black) {
        const lw = 24 * CQ;
        const lh = (lw * logos.black.height) / logos.black.width;
        colophon.drawImage(logos.black, { x: (W - lw) / 2 + ctx.bleed, y: cy + ctx.bleed, width: lw, height: lh });
    }
    cy -= 4 * CQ + SMALL;
    for (const l of wrapPlain(f.roman, SMALL, `Ce livre a été écrit à partir des souvenirs que ${author} a confiés au téléphone.`, TEXT_W * 0.8)) {
        centered(ctx, colophon, l, cy, f.roman, SMALL, INK_SOFT);
        cy -= SMALL * 1.45;
    }

    let tp2 = newPage(ctx);
    add(tp2);
    let y = H - M_TOP - OPEN_SIZE;
    centered(ctx, tp2, 'Table', y, f.roman, OPEN_SIZE);
    y -= 8 * CQ + SIZE;
    for (const e of tocEntries) {
        if (y - (e.lines.length - 1) * LEAD < TEXT_BOTTOM) {
            tp2 = newPage(ctx);
            add(tp2);
            y = TEXT_TOP;
        }
        const n = String(e.page);
        e.lines.forEach((l, k) => {
            text(ctx, tp2, l, M_SIDE, y, f.roman, SIZE);
            if (k === e.lines.length - 1) text(ctx, tp2, n, W - M_SIDE - f.roman.widthOfTextAtSize(n, SIZE), y, f.roman, SIZE);
            y -= LEAD;
        });
        y -= 3.2 * CQ - (LEAD - SIZE);
    }
    // Une table plus longue que prévu ajoute ses pages : on recale sur un multiple de 4.
    while (pages.length % 4 !== 0) add(newPage(ctx));

    // Numéros de page : sur les pages de texte des chapitres, pas sur les pages de titre, blanches ou de fin.
    pages.forEach((p, k) => {
        const n = k + 1;
        if (n > 2 && n <= lastText) folio(ctx, p, n);
    });

    return { bytes: await doc.save(), pages: pages.length };
}

// ── Couverture ───────────────────────────────────────────────────────────
function drawTracked(ctx: Ctx, page: PDFPage, font: PDFFont, size: number, s: string, y: number, tracking: number, color: RGB, cx: number) {
    const chars = [...encodable(font, s)];
    const width = chars.reduce((n, c) => n + font.widthOfTextAtSize(c, size), 0) + tracking * (chars.length - 1);
    let x = cx - width / 2;
    for (const c of chars) {
        page.drawText(c, { x: x + ctx.bleed, y: y + ctx.bleed, size, font, color });
        x += font.widthOfTextAtSize(c, size) + tracking;
    }
}

function wrapTracked(font: PDFFont, size: number, s: string, width: number, tracking: number): string[] {
    const measure = (t: string) => [...t].reduce((n, c) => n + font.widthOfTextAtSize(c, size), 0) + tracking * Math.max(0, [...t].length - 1);
    const out: string[] = [];
    let line = '';
    for (const w of encodable(font, s).split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (line && measure(next) > width) {
            out.push(line);
            line = w;
        } else line = next;
    }
    if (line) out.push(line);
    return out;
}

/** La 1re de couverture, dans un cadre A5 dont le bord gauche est à `x0` (maquette : .cover). */
function drawFront(ctx: Ctx, page: PDFPage, book: PrintBook, logos: { black: PDFImage | null; white: PDFImage | null }, x0: number, fill = true) {
    const cloth = CLOTHS[book.cloth ?? 'lin'];
    const ink = cloth.dark ? COVER_INK_LIGHT : COVER_INK;
    if (fill) page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: cloth.color });
    const cx = x0 + W / 2;
    const { sansBold, sans } = ctx.f;
    const upper = (s: string) => frenchTypography(s).toLocaleUpperCase('fr-FR');
    // Titre en capitales espacées ; plus petit si c'est long, trois lignes au plus.
    let size = 6.4 * CQ;
    let lines = wrapTracked(sansBold, size, upper(book.title), W - 20 * CQ, size * 0.06);
    while (lines.length > 3 && size > 4 * CQ) {
        size -= 0.3 * CQ;
        lines = wrapTracked(sansBold, size, upper(book.title), W - 20 * CQ, size * 0.06);
    }
    let y = H - 30 * CQ - size;
    for (const l of lines) {
        drawTracked(ctx, page, sansBold, size, l, y, size * 0.06, ink, cx);
        y -= size * 1.15;
    }
    drawTracked(ctx, page, sans, 3.4 * CQ, upper(book.author), y - 4 * CQ + size * 0.15, 3.4 * CQ * 0.16, ink, cx);
    const logo = cloth.dark ? logos.white : logos.black;
    if (logo) {
        const lw = 22 * CQ;
        const lh = (lw * logo.height) / logo.width;
        page.drawImage(logo, { x: cx - lw / 2 + ctx.bleed, y: 9 * CQ + ctx.bleed, width: lw, height: lh });
    }
}

export function spineMm(pages: number): number {
    return Math.round((pages * PRINT.spineMmPerPage + PRINT.spineExtraMm) * 10) / 10;
}

/** La couverture à plat : 4e de couverture à gauche, le dos, la 1re à droite, fonds perdus autour. */
async function buildCover(book: PrintBook, pages: number): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    doc.setTitle(`${frenchTypography(book.title)} : couverture`);
    doc.setAuthor(frenchTypography(book.author));
    doc.setCreator('Loomina');
    doc.setProducer('Loomina');
    doc.setLanguage('fr-FR');
    const f = await embedFonts(doc);
    const logos = await embedLogos(doc);
    const ctx: Ctx = { doc, f, bleed: BLEED };
    const spine = spineMm(pages) * MM;
    const fullW = 2 * W + spine;
    const page = doc.addPage([fullW + 2 * BLEED, H + 2 * BLEED]);
    page.setBleedBox(0, 0, fullW + 2 * BLEED, H + 2 * BLEED);
    page.setTrimBox(BLEED, BLEED, fullW, H);
    const cloth = CLOTHS[book.cloth ?? 'lin'];
    const ink = cloth.dark ? COVER_INK_LIGHT : COVER_INK;
    page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: cloth.color });

    // 1re de couverture, à droite.
    drawFront(ctx, page, book, logos, W + spine, false);

    // 4e de couverture : la toile seule, le logo discret en bas.
    const logo = cloth.dark ? logos.white : logos.black;
    if (logo) {
        const lw = 14 * CQ;
        const lh = (lw * logo.height) / logo.width;
        page.drawImage(logo, { x: W / 2 - lw / 2 + BLEED, y: 9 * CQ + BLEED, width: lw, height: lh });
    }

    // Le dos : titre et prénom, de bas en haut (usage français), s'il est assez épais.
    if (spineMm(pages) >= PRINT.spineTextMinMm) {
        const up = (v: string) => frenchTypography(v).toLocaleUpperCase('fr-FR');
        const room = H - 50 * MM; // 25 mm de toile en haut et en bas du dos
        const fit = (label: string) => {
            const t = encodable(f.sansBold, label);
            let size = Math.min(spine * 0.42, 2.6 * CQ);
            while (size > 5 && f.sansBold.widthOfTextAtSize(t, size) > room) size -= 0.25;
            return { t, size, ok: f.sansBold.widthOfTextAtSize(t, size) <= room };
        };
        // Titre et prénom ; si le titre est trop long, le prénom seul.
        let s = fit(`${up(book.title)}   ·   ${up(book.author)}`);
        if (!s.ok || s.size < Math.min(spine * 0.42, 2.6 * CQ) * 0.75) s = fit(up(book.author));
        if (s.ok) {
            const tw = f.sansBold.widthOfTextAtSize(s.t, s.size);
            const x = W + spine / 2 + s.size * 0.35 + BLEED;
            page.drawText(s.t, { x, y: (H - tw) / 2 + BLEED, size: s.size, font: f.sansBold, color: ink, rotate: degrees(90) });
        }
    }
    return doc.save();
}

// ── Entrées ──────────────────────────────────────────────────────────────
/** Les deux fichiers pour l'imprimeur. */
export async function buildPrintPdfs(book: PrintBook): Promise<BookPdfs> {
    const interior = await buildInterior(book, { bleed: BLEED, withCover: false });
    const cover = await buildCover(book, interior.pages);
    return { interior: interior.bytes, cover, pages: interior.pages, spineMm: spineMm(interior.pages) };
}

/** Le livre à lire à l'écran : A5, sans fonds perdus, couverture en première page. */
export async function buildReadingPdf(book: PrintBook): Promise<{ bytes: Uint8Array; pages: number }> {
    return buildInterior(book, { bleed: 0, withCover: true });
}
