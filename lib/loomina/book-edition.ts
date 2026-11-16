/**
 * Les éditions du livre : composer par étapes, enregistrer, relire.
 *
 * Composer un livre prend plusieurs minutes (un appel au modèle pour le
 * plan, puis un par chapitre). Une fonction du site est limitée à 300 s :
 * chaque appel à `advanceEdition` ne fait donc qu'UNE étape, et l'étape
 * suivante est demandée par `kickEdition`. Si la chaîne casse, la lecture
 * de l'espace auteur la relance : rien ne reste bloqué.
 */

import { db } from './db';
import type { Profile, Project } from './db';
import { normalizeContext } from './context';
import { planBook, writeBookChapter } from './book';
import type { PlannedChapter, BookChapter, Source } from './book';
import { countWords } from './writer';
import { SITE } from '../../config/site';

export type EditionStatus = 'planning' | 'writing' | 'ready' | 'failed';

export interface Edition {
    id: string;
    project_id: string;
    status: EditionStatus;
    plan: PlannedChapter[];
    chapters: BookChapter[];
    source_count: number;
    source_words: number;
    error: string | null;
    claimed_at: string | null;
    created_at: string;
    updated_at: string;
}

/** Une étape réclamée depuis plus longtemps est tenue pour abandonnée (fonction tuée). */
const CLAIM_TTL_MS = 6 * 60 * 1000;

async function readSources(projectId: string): Promise<Source[]> {
    const { data, error } = await db()
        .from('chapters')
        .select('chapter_number, title, content_markdown')
        .eq('project_id', projectId)
        .neq('status', 'archived')
        .order('chapter_number', { ascending: true });
    if (error) throw new Error(`Lecture chapters impossible : ${error.message}`);
    return (data ?? []).map((c) => ({ number: c.chapter_number as number, title: c.title as string | null, content: (c.content_markdown as string) ?? '' }));
}

/** La dernière édition prête, et celle en cours s'il y en a une. */
export async function readEditions(projectId: string): Promise<{ ready: Edition | null; running: Edition | null; failed: Edition | null }> {
    const { data, error } = await db().from('book_editions').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(10);
    if (error) throw new Error(`Lecture book_editions impossible : ${error.message}`);
    const rows = (data ?? []) as Edition[];
    const latest = rows[0] ?? null;
    return {
        ready: rows.find((r) => r.status === 'ready') ?? null,
        running: latest && (latest.status === 'planning' || latest.status === 'writing') ? latest : null,
        failed: latest?.status === 'failed' ? latest : null,
    };
}

/** Lance une composition (ou rend celle qui est déjà en cours). */
export async function startEdition(projectId: string): Promise<Edition> {
    const { running } = await readEditions(projectId);
    if (running) return running;
    const sources = await readSources(projectId);
    if (sources.length < 2) throw new Error('Il faut au moins deux appels racontés pour composer le livre.');
    const { data, error } = await db()
        .from('book_editions')
        .insert({ project_id: projectId, status: 'planning', source_count: sources.length, source_words: sources.reduce((a, s) => a + countWords(s.content), 0) })
        .select('*')
        .single();
    if (error) throw new Error(`Écriture book_editions impossible : ${error.message}`);
    return data as Edition;
}

/**
 * Fait UNE étape : le plan, ou le chapitre suivant. Un verrou optimiste
 * (`claimed_at`) empêche deux fonctions d'écrire le même chapitre.
 * Retourne l'édition après l'étape, ou null si quelqu'un d'autre y travaille.
 */
export async function advanceEdition(id: string): Promise<Edition | null> {
    const supabase = db();
    const stale = new Date(Date.now() - CLAIM_TTL_MS).toISOString();
    const { data: claimed, error: claimErr } = await supabase
        .from('book_editions')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', id)
        .in('status', ['planning', 'writing'])
        .or(`claimed_at.is.null,claimed_at.lt.${stale}`)
        .select('*');
    if (claimErr) throw new Error(`Verrouillage book_editions impossible : ${claimErr.message}`);
    const edition = (claimed?.[0] as Edition | undefined) ?? null;
    if (!edition) return null;

    const save = async (patch: Partial<Edition>): Promise<Edition> => {
        const { data, error } = await supabase
            .from('book_editions')
            .update({ ...patch, claimed_at: null, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw new Error(`Écriture book_editions impossible : ${error.message}`);
        return data as Edition;
    };

    try {
        const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', edition.project_id).single();
        if (pErr || !project) throw new Error('Projet introuvable');
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', (project as Project).user_id).single();
        const sources = await readSources(edition.project_id);
        const context = normalizeContext((project as Project).context);

        if (edition.status === 'planning') {
            const plan = await planBook(sources, context);
            return await save({ status: 'writing', plan, chapters: [] });
        }

        const index = edition.chapters.length;
        const planned = edition.plan[index];
        if (!planned) return await save({ status: 'ready' });
        const written = await writeBookChapter({
            chapter: planned,
            plan: edition.plan,
            sources,
            context,
            sensitiveTopics: (profile as Profile | null)?.sensitive_topics,
            writingStyle: (profile as Profile | null)?.writing_style,
            written: edition.chapters.map((c) => ({ title: c.title, content: c.content })),
        });
        const chapter: BookChapter = {
            number: index + 1,
            title: written.title,
            part: planned.part,
            content: written.content,
            word_count: countWords(written.content),
            sources: [...new Set(planned.scenes.flatMap((s) => s.sources))].sort((a, b) => a - b),
        };
        const chapters = [...edition.chapters, chapter];
        return await save({ chapters, status: chapters.length >= edition.plan.length ? 'ready' : 'writing' });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[livre] édition ${id} en échec :`, message);
        return await save({ status: 'failed', error: message.slice(0, 1000) });
    }
}

/**
 * Après chaque appel raconté : le livre se recompose tout seul, en
 * arrière-plan. L'auteur n'a pas à savoir qu'il faut cliquer (Solal,
 * 16/11/2026). Une composition en cours est remplacée : elle ne contenait
 * pas le récit qui vient d'arriver.
 *
 * Ne lève jamais : un livre non recomposé ne doit pas faire échouer le
 * traitement d'un appel. `LOOMINA_AUTO_BOOK=off` coupe ce comportement
 * (batterie de tests, poste local).
 */
export async function autoCompose(projectId: string, origin: string = SITE.url): Promise<void> {
    if (process.env.LOOMINA_AUTO_BOOK === 'off') return;
    try {
        const { running } = await readEditions(projectId);
        if (running) {
            await db()
                .from('book_editions')
                .update({ status: 'failed', error: 'Remplacée : un nouvel appel est arrivé pendant la composition.', claimed_at: null, updated_at: new Date().toISOString() })
                .eq('id', running.id);
        }
        const edition = await startEdition(projectId);
        await kickEdition(edition.id, origin);
        console.info(`[livre] recomposition lancée pour le projet ${projectId}`);
    } catch (err) {
        // Moins de deux récits, base indisponible… : le bouton de l'espace auteur reste là.
        console.info('[livre] pas de recomposition automatique :', err instanceof Error ? err.message : String(err));
    }
}

/** Le secret des appels internes : le même que celui du webhook, déjà posé partout. */
export const internalSecret = () => process.env.VAPI_WEBHOOK_SECRET?.trim() ?? '';

/**
 * Demande l'étape suivante à une autre fonction du site. Celle-ci répond
 * aussitôt et travaille ensuite, avec ses propres 300 s.
 */
export async function kickEdition(id: string, origin: string = SITE.url): Promise<void> {
    try {
        const res = await fetch(`${origin.replace(/\/$/, '')}/api/jobs/book`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-loomina-internal': internalSecret() },
            body: JSON.stringify({ id }),
            signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) console.error(`[livre] étape suivante refusée (${res.status}) pour l'édition ${id}`);
    } catch (err) {
        // La lecture de l'espace auteur relancera une composition restée sans nouvelle.
        console.error(`[livre] étape suivante injoignable pour l'édition ${id} :`, err instanceof Error ? err.message : err);
    }
}

/** Ce que l'espace auteur affiche. */
export function publicEdition(e: Edition) {
    return {
        id: e.id,
        status: e.status,
        chapters: e.chapters.map((c) => ({ number: c.number, title: c.title, part: c.part, content: c.content, sources: c.sources })),
        done: e.chapters.length,
        total: e.plan.length,
        sourceCount: e.source_count,
        at: e.updated_at,
    };
}
