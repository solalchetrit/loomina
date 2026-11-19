/**
 * Test du PDF du livre, sans base ni modèle (gratuit) :
 *   npm run test:livre-pdf [dossier de sortie]
 * Fabrique trois livres : celui de Suzanne (simulé), un très court, un très
 * long, chacun en version imprimeur (intérieur + couverture) et lecture, et
 * vérifie les règles du livre imprimé.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { buildPrintPdfs, buildReadingPdf, toBlocks, frenchTypography } from '../../lib/loomina/book-pdf';
import type { PrintBook, PrintPhoto } from '../../lib/loomina/book-pdf';

const OUT = process.argv[2] ?? path.join(process.cwd(), 'tmp-livre-pdf');
const SUZANNE = '/mnt/project-files/Livre simulé de Suzanne (après corrections).md';

function chaptersFrom(md: string) {
    return md
        .split(/^## /m)
        .slice(1)
        .map((s) => {
            const [head, ...rest] = s.split('\n');
            return { title: head.replace(/^Chapitre \d+\s*[—–-]\s*/, '').trim(), content: rest.join('\n').trim() };
        });
}

async function photo(w: number, h: number, caption: string | null, chapter: string | null): Promise<PrintPhoto> {
    const sharp = (await import('sharp')).default;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a7a63"/><stop offset="1" stop-color="#3b3328"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w * 0.35}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.18}" fill="#d9cbb2"/></svg>`;
    const bytes = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
    return { bytes: new Uint8Array(bytes), kind: 'jpg', caption, chapter };
}

async function check(name: string, book: PrintBook): Promise<number> {
    const t0 = Date.now();
    const print = await buildPrintPdfs(book);
    const reading = await buildReadingPdf(book);
    const ms = Date.now() - t0;
    await fs.writeFile(path.join(OUT, `${name}-interieur.pdf`), print.interior);
    await fs.writeFile(path.join(OUT, `${name}-couverture.pdf`), print.cover);
    await fs.writeFile(path.join(OUT, `${name}-lecture.pdf`), reading.bytes);

    const inside = await PDFDocument.load(print.interior);
    assert.equal(inside.getPageCount(), print.pages);
    assert.equal(print.pages % 4, 0, `${name} : ${print.pages} pages, pas un multiple de 4`);
    const p = inside.getPage(0);
    const trim = p.getTrimBox();
    const mm = (v: number) => Math.round((v * 25.4) / 72 * 10) / 10;
    assert.deepEqual([mm(trim.width), mm(trim.height)], [148, 210], `${name} : format fini`);
    assert.deepEqual([mm(p.getWidth()), mm(p.getHeight())], [154, 216], `${name} : fonds perdus`);
    const cover = await PDFDocument.load(print.cover);
    const c = cover.getPage(0);
    assert.equal(mm(c.getTrimBox().width), Math.round((296 + print.spineMm) * 10) / 10, `${name} : largeur couverture`);
    const read = await PDFDocument.load(reading.bytes);
    // La lecture se referme sur la 4e de couverture quand elle a un texte.
    const back = book.pieces?.back_cover?.trim() ? 1 : 0;
    assert.equal(read.getPageCount(), print.pages + 1 + back, `${name} : lecture = couverture + intérieur${back ? ' + 4e de couverture' : ''}`);
    console.log(`✓ ${name} : ${print.pages} pages, dos ${print.spineMm} mm, ${(print.interior.length / 1024).toFixed(0)} Ko, ${ms} ms`);
    return print.pages;
}

async function main() {
    await fs.mkdir(OUT, { recursive: true });

    // Typographie française.
    assert.equal(frenchTypography('Vraiment ? Oui : « non » !'), 'Vraiment ? Oui : « non » !');
    assert.equal(frenchTypography("l'école"), 'l’école');
    const blocks = toBlocks('## Un titre\n\nUn *mot* en italique.\n\n**Gras seul**');
    assert.equal(blocks.length, 3);
    assert.equal(blocks[0].kind, 'h');
    assert.equal(blocks[2].kind, 'h');

    const md = await fs.readFile(SUZANNE, 'utf8');
    const chapters = chaptersFrom(md);
    assert.ok(chapters.length >= 8);
    const year = 2026;

    await check('suzanne', {
        title: 'Chez Marguerite, près de la fenêtre',
        author: 'Suzanne',
        year,
        chapters,
        photos: [
            await photo(1400, 1000, 'La place d’Armes, à Saint-Flour, vers 1950.', chapters[0].title),
            await photo(1000, 1300, 'L’école de Lavastrie.', chapters[1].title),
            await photo(1400, 900, null, chapters[6].title),
            await photo(1000, 1250, 'Bernard et Suzanne, le jour de leur mariage.', null),
        ],
    });

    // Le même livre avec ses pièces : sous-titre, dédicace, avant-propos, remerciements, texte du dos.
    const plain = await check('suzanne-sans-pieces', { title: 'Chez Marguerite, près de la fenêtre', author: 'Suzanne', year, chapters });
    const withPieces = await check('suzanne-pieces', {
        title: 'Chez Marguerite, près de la fenêtre',
        author: 'Suzanne',
        year,
        chapters: chapters.map((c, i) => (i === 0 ? { ...c, content: `## La place d'Armes\n\n${c.content.split('\n\n').slice(0, 3).join('\n\n')}\n\n## Le chemin de l'école\n\n${c.content.split('\n\n').slice(3).join('\n\n')}` } : c)),
        cloth: 'bordeaux',
        pieces: {
            subtitle: 'Souvenirs d’une institutrice du Cantal',
            dedication: 'À mes petits-enfants,\npour qu’ils sachent d’où ils viennent.',
            preface:
                'Suzanne est née à Saint-Flour, dans le Cantal, au-dessus de la place d’Armes. Elle y a grandi entre la boutique de sa mère et la ferme de ses grands-parents.\n\nCe livre suit le fil de sa vie : l’école de Lavastrie où elle a enseigné, Bernard, rencontré un soir de bal, les enfants, la maison de la rue des Lacs. On y croise Marguerite, sa grand-mère, qui disait : « On ne gaspille pas le pain. »\n\nElle l’a raconté pour ceux qui viennent après elle.',
            thanks: 'Je remercie ma fille Hélène, qui m’a offert ce livre, et mon amie Paulette, qui se souvient de tout mieux que moi.',
            back_cover:
                '« On ne gaspille pas le pain. » Chez Marguerite, près de la fenêtre, une petite fille de Saint-Flour apprend à lire, à coudre et à regarder les gens.\n\nSuzanne raconte ici son enfance dans le Cantal, ses années d’institutrice à Lavastrie, sa rencontre avec Bernard et la maison où ils ont élevé leurs enfants. Une vie simple, dite avec ses mots.',
        },
    });
    assert.ok(withPieces >= plain, 'les pièces ajoutent des pages, jamais moins');

    await check('court', {
        title: 'Une vie',
        author: 'Jean',
        year,
        chapters: [{ title: 'Le village', content: chapters[0].content.split('\n\n').slice(0, 2).join('\n\n') }],
    });

    const long = [...chapters, ...chapters, ...chapters, ...chapters].map((c, i) => ({ ...c, title: `${c.title} (${i + 1})` }));
    await check('long', {
        title: 'Les mille et une saisons d’une vie entière racontée au téléphone',
        author: 'Marie-Thérèse',
        year,
        chapters: long,
        cloth: 'bleu-nuit',
    });
    console.log(`Fichiers dans ${OUT}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
