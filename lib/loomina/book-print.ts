/**
 * Ce qu'il faut pour fabriquer le PDF du livre d'un projet : la dernière
 * édition prête, le titre, le prénom, et les photos téléchargées depuis le
 * stockage privé, remises au format de l'impression (JPEG, redressées selon
 * l'EXIF, 1 400 px de large au plus, soit 300 dpi sur la colonne de texte).
 */

import sharp from 'sharp';
import { db } from './db';
import type { Profile, Project } from './db';
import { readEditions } from './book-edition';
import type { Edition } from './book-edition';
import { PHOTO_BUCKET } from './photos';
import type { PhotoEntry } from './photos';
import { PRINT } from './book-pdf';
import type { PrintBook, PrintPhoto } from './book-pdf';

export async function preparePhoto(bytes: Uint8Array): Promise<{ bytes: Uint8Array; kind: 'jpg' } | null> {
    try {
        const out = await sharp(bytes)
            .rotate()
            .resize({ width: PRINT.photoPx, height: PRINT.photoPx, fit: 'inside', withoutEnlargement: true })
            .flatten({ background: '#ffffff' })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        return { bytes: new Uint8Array(out), kind: 'jpg' };
    } catch {
        return null;
    }
}

async function loadPhotos(entries: PhotoEntry[]): Promise<PrintPhoto[]> {
    const out: PrintPhoto[] = [];
    // Une à une : une quarantaine de photos au plus, et la mémoire d'une fonction est comptée.
    for (const e of entries) {
        const { data, error } = await db().storage.from(PHOTO_BUCKET).download(e.path);
        if (error || !data) {
            console.error(`[livre-pdf] photo ${e.id} illisible :`, error?.message);
            continue;
        }
        const ready = await preparePhoto(new Uint8Array(await data.arrayBuffer()));
        if (ready) out.push({ ...ready, caption: e.caption?.trim() || null, chapter: e.chapter ?? null });
    }
    return out;
}

/** Les titres posés d'office à la commande : ils cèdent la place au titre trouvé dans le livre. */
const DEFAULT_TITLE = /^(biographie de\b|mon livre de vie$)/i;

/**
 * Le titre du livre : celui du projet s'il a été choisi, sinon celui des
 * pièces du livre (demandé par la personne, ou tiré du manuscrit), sinon
 * « Biographie de… ».
 */
export function bookTitle(project: Pick<Project, 'title'> | null, firstName: string, pieceTitle?: string | null): string {
    const own = project?.title?.trim();
    if (own && !DEFAULT_TITLE.test(own)) return own;
    return pieceTitle?.trim() || own || `Biographie de ${firstName}`;
}

/** Le livre prêt à mettre en page, ou null s'il n'y a pas encore d'édition prête. */
export async function loadPrintBook(projectId: string, opts: { photos?: boolean } = {}): Promise<{ book: PrintBook; edition: Edition } | null> {
    const { ready } = await readEditions(projectId);
    if (!ready || ready.chapters.length === 0) return null;
    const { data: project, error } = await db().from('projects').select('*').eq('id', projectId).single();
    if (error || !project) throw new Error('Projet introuvable');
    const p = project as Project;
    const { data: profile } = await db().from('profiles').select('*').eq('id', p.user_id).single();
    const firstName = (profile as Profile | null)?.first_name?.trim() || 'vous';
    const meta = (p.project_metadata ?? {}) as Record<string, unknown>;
    const entries = Array.isArray(meta.photos) ? (meta.photos as PhotoEntry[]) : [];
    const photos = opts.photos === false ? [] : await loadPhotos(entries);
    const pieces = ready.extras?.pieces ?? null;
    return {
        edition: ready,
        book: {
            title: bookTitle(p, firstName, pieces?.title),
            author: firstName,
            chapters: ready.chapters.map((c) => ({ title: c.title, content: c.content })),
            photos,
            year: new Date(ready.updated_at).getFullYear(),
            cloth: 'lin',
            pieces,
        },
    };
}

/** Un nom de fichier propre : « Biographie-de-Suzanne-interieur.pdf ». */
export function pdfFileName(title: string, suffix?: string): string {
    const base = title
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'livre';
    return `${base}${suffix ? `-${suffix}` : ''}.pdf`;
}
