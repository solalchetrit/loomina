/**
 * Les éditions du livre : composer par étapes, enregistrer, relire.
 *
 * Composer un livre prend plusieurs minutes (un appel au modèle pour le
 * plan, puis un par chapitre). Une fonction du site est limitée à 300 s :
 * chaque appel à `advanceEdition` ne fait donc qu'UNE étape, et l'étape
 * suivante est demandée par `kickEdition`. Si la chaîne casse, la lecture
 * de l'espace auteur la relance, et le rattrapage (toutes les 5 minutes,
 * `sweepEditions`) la reprend même si personne n'ouvre l'espace.
 *
 * QUAND LE LIVRE S'ÉCRIT (Solal, 26/11/2026) : à la fin de chaque étape de
 * Mémo, pas après chaque appel. L'auteur lit son livre dès qu'il a fini une
 * étape, et le livre va jusqu'à la fin de la dernière étape finie. L'écriture
 * a ainsi toute une période de vie sous les yeux, pas un appel isolé.
 */

import { db } from './db';
import type { Profile, Project } from './db';
import { normalizeContext } from './context';
import { toPhase } from './phases';
import { planBook, writeBookChapter, carryCorrection, polishBook, writePieces, chapterSignature, RECIPE, bookUsage, mergeUsage } from './book';
import type { UsageMap } from './book';
import type { PlannedChapter, BookChapter, Source, BookPieces } from './book';
import { readWishes } from './phase-plan';
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
    /** Ce qui entoure les chapitres (voir EditionExtras). Absent tant que la migration 20261119 n'est pas appliquée. */
    extras?: EditionExtras | null;
    /** Jetons OpenAI dépensés par la composition (migration 20261124). */
    usage?: UsageMap | null;
    error: string | null;
    claimed_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Ce qu'une édition garde en plus de son plan et de ses chapitres
 * (colonne `extras`, migration 20261119_book_extras.sql).
 */
export interface EditionExtras {
    /** Recette de composition (book.ts RECIPE) : une édition d'une autre recette n'est pas reprise. */
    recipe?: number;
    /** La dernière étape finie que ce livre raconte (1 à 4). Absent : édition d'avant le 26/11/2026, composée de tous les récits. */
    through?: number;
    /** Chapitres repris mot pour mot de l'édition précédente. */
    reused?: number;
    /** Leurs numéros : la relecture finale les lit mais n'y touche pas. */
    kept?: number[];
    /** La passe finale : faite (avec le nombre de retouches) ou sautée après un échec. */
    polish?: { applied: number; proposed: number; at: string; error?: string };
    /** Les pièces du livre : null si leur écriture a échoué (le livre reste lisible sans elles). */
    pieces?: BookPieces | null;
    pieces_at?: string;
}

/** Les paroles d'origine au-delà de cette taille sont coupées (un appel d'une heure et demie). */
const MAX_TRANSCRIPT_CHARS = 120_000;

/** Une étape réclamée depuis plus longtemps est tenue pour abandonnée (fonction tuée). */
const CLAIM_TTL_MS = 6 * 60 * 1000;

/**
 * Jusqu'où le livre peut être écrit : la dernière étape FINIE.
 * 0 tant que la première étape est en cours (pas encore de livre),
 * 4 quand le récit est complet (tout le livre).
 */
export function bookThrough(project: Pick<Project, 'phase' | 'status'>): number {
    return project.status === 'completed' ? 4 : toPhase(project.phase) - 1;
}

/**
 * Un récit entre dans le livre si son appel a eu lieu pendant une étape
 * finie. On regarde l'étape de l'APPEL, pas la période racontée : un
 * souvenir d'enfance dit pendant « Faire connaissance » est dans le livre dès
 * la fin de cette étape. Un récit sans appel connu suit sa période.
 */
export function inScope(row: { callPhase: number | null; phase: number | null }, through: number): boolean {
    if (through >= 4) return true;
    return (row.callPhase ?? row.phase ?? 1) <= through;
}

type SourceRow = { chapter_number: number; title: string | null; content_markdown: string | null; version: number | null; latest_interview_id: string | null; phase: number | null };

/** Les récits qui entrent dans le livre, avec l'appel dont chacun est tiré. */
async function scopedRows(projectId: string, through: number, withTranscripts: boolean): Promise<{ rows: SourceRow[]; calls: Map<string, { phase: number | null; transcript: string | null }> }> {
    const { data, error } = await db()
        .from('chapters')
        .select(withTranscripts ? 'chapter_number, title, content_markdown, version, latest_interview_id, phase' : 'chapter_number, version, latest_interview_id, phase')
        .eq('project_id', projectId)
        .neq('status', 'archived')
        .order('chapter_number', { ascending: true });
    if (error) throw new Error(`Lecture chapters impossible : ${error.message}`);
    const all = (data ?? []) as unknown as SourceRow[];
    const ids = [...new Set(all.map((c) => c.latest_interview_id).filter((id): id is string => Boolean(id)))];
    const calls = new Map<string, { phase: number | null; transcript: string | null }>();
    if (ids.length) {
        const { data: found, error: callErr } = await db().from('interviews').select(withTranscripts ? 'id, phase, transcript' : 'id, phase').in('id', ids);
        // Sans les appels, le livre se compose quand même : chaque récit suit sa période, sans paroles d'origine.
        if (callErr) console.warn('[livre] appels illisibles :', callErr.message);
        for (const i of (found ?? []) as unknown as Array<{ id: string; phase: number | null; transcript?: string | null }>) {
            calls.set(i.id, { phase: i.phase ?? null, transcript: typeof i.transcript === 'string' && i.transcript.trim() ? i.transcript : null });
        }
    }
    const rows = all.filter((c) => inScope({ callPhase: c.latest_interview_id ? calls.get(c.latest_interview_id)?.phase ?? null : null, phase: c.phase }, through));
    return { rows, calls };
}

/** Combien de récits entrent dans le livre aujourd'hui (lecture légère, sans les textes). */
export async function countSources(projectId: string, through: number): Promise<number> {
    if (through < 1) return 0;
    return (await scopedRows(projectId, through, false)).rows.length;
}

async function readSources(projectId: string, through: number): Promise<Source[]> {
    const { rows, calls } = await scopedRows(projectId, through, true);

    // Les paroles d'origine : la transcription de l'appel dont chaque récit
    // est tiré. Jamais pour un récit que l'auteur a corrigé (version > 1) :
    // le récit fait alors foi, et la transcription réintroduirait ce qu'il
    // a retiré ou rectifié.
    return rows.map((c) => ({
        number: c.chapter_number,
        title: c.title,
        content: c.content_markdown ?? '',
        transcript: (c.version ?? 1) <= 1 && c.latest_interview_id ? calls.get(c.latest_interview_id)?.transcript?.slice(0, MAX_TRANSCRIPT_CHARS) ?? null : null,
    }));
}

/** Le texte d'erreur d'une composition remplacée par une autre : ce n'est pas un échec à montrer. */
const REPLACED = 'Remplacée';

async function projectThrough(projectId: string): Promise<number> {
    const { data, error } = await db().from('projects').select('phase, status').eq('id', projectId).single();
    if (error || !data) throw new Error('Projet introuvable');
    return bookThrough(data as Pick<Project, 'phase' | 'status'>);
}

/** Cette édition raconte-t-elle exactement ce que le livre doit raconter aujourd'hui ? */
export function upToDate(edition: Pick<Edition, 'source_count' | 'extras'>, through: number, count: number): boolean {
    return edition.extras?.through === through && edition.source_count === count;
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
        failed: latest?.status === 'failed' && !latest.error?.startsWith(REPLACED) ? latest : null,
    };
}

/** Lance une composition (ou rend celle qui est déjà en cours). */
export async function startEdition(projectId: string): Promise<Edition> {
    const { running } = await readEditions(projectId);
    if (running) return running;
    const through = await projectThrough(projectId);
    if (through < 1) throw new Error('Votre livre s’écrit à la fin de la première étape.');
    const sources = await readSources(projectId, through);
    if (sources.length < 1) throw new Error('Il n’y a pas encore de récit à mettre dans le livre.');
    const { data, error } = await db()
        .from('book_editions')
        .insert({ project_id: projectId, status: 'planning', source_count: sources.length, source_words: sources.reduce((a, s) => a + countWords(s.content), 0), extras: { through } })
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

    // Les jetons de cette étape, ajoutés à ceux de l'édition à chaque écriture.
    const spent: UsageMap = {};
    bookUsage.enterWith(spent);
    let usageBase = edition.usage ?? null;
    const save = async (input: Partial<Edition>): Promise<Edition> => {
        let patch = input;
        const withUsage = Object.keys(spent).length > 0;
        if (withUsage) patch = { ...patch, usage: mergeUsage(usageBase, spent) };
        const write = (p: Partial<Edition>) =>
            supabase
                .from('book_editions')
                .update({ ...p, claimed_at: null, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select('*')
                .single();
        let { data, error } = await write(patch);
        // Base sans la colonne `extras` (migration pas encore appliquée) : le
        // livre se compose quand même, sans passe finale ni pièces.
        if (error && 'extras' in patch && /extras/.test(error.message)) {
            const { extras: _dropped, ...rest } = patch;
            void _dropped;
            ({ data, error } = await write(rest));
        }
        // Base sans la colonne `usage` (migration 20261124 pas encore appliquée).
        if (error && 'usage' in patch && /usage/.test(error.message)) {
            const { usage: _u, ...rest } = patch;
            void _u;
            ({ data, error } = await write(rest));
        }
        if (error) throw new Error(`Écriture book_editions impossible : ${error.message}`);
        if (withUsage && patch.usage) {
            usageBase = patch.usage;
            for (const k of Object.keys(spent)) delete spent[k];
        }
        return data as Edition;
    };

    try {
        const { data: project, error: pErr } = await supabase.from('projects').select('*').eq('id', edition.project_id).single();
        if (pErr || !project) throw new Error('Projet introuvable');
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', (project as Project).user_id).single();
        // Une édition d'avant le 26/11/2026 n'a pas d'étape notée : elle prend tous les récits, comme avant.
        const sources = await readSources(edition.project_id, edition.extras?.through ?? 4);
        const context = normalizeContext((project as Project).context);
        const wishes = readWishes((project as Project).project_metadata);
        // L'édition précédente, si elle a été composée avec la même recette :
        // son plan est gardé, et ses chapitres inchangés sont repris mot pour mot.
        const { ready } = await readEditions(edition.project_id);
        const previous = ready && ready.id !== edition.id && ready.extras?.recipe === RECIPE ? ready : null;
        const hasExtras = 'extras' in edition;
        const extras: EditionExtras = { ...(edition.extras ?? {}), recipe: RECIPE };

        if (edition.status === 'planning') {
            const plan = await planBook(sources, context, (profile as Profile | null)?.sensitive_topics, { previous: previous?.plan, ending: wishes.ending });
            return await save({ status: 'writing', plan, chapters: [], extras });
        }

        if (edition.chapters.length < edition.plan.length) {
            const chapters = [...edition.chapters];
            const sourcesOf = (c: PlannedChapter) => [...new Set(c.scenes.flatMap((s) => s.sources))].sort((x, y) => x - y);
            const previousOf = (planned: PlannedChapter): { chapter: BookChapter; same: boolean } | null => {
                if (!previous) return null;
                const at = previous.plan.findIndex((c) => c.title.trim().toLowerCase() === planned.title.trim().toLowerCase());
                const chapter = at >= 0 ? previous.chapters[at] : undefined;
                return chapter ? { chapter, same: chapterSignature(previous.plan[at]) === chapterSignature(planned) } : null;
            };

            // Les chapitres dont la matière n'a pas changé sont recopiés sans
            // appel au modèle, autant qu'il s'en présente à la suite.
            let reused = extras.reused ?? 0;
            const kept = [...(extras.kept ?? [])];
            while (chapters.length < edition.plan.length) {
                const planned = edition.plan[chapters.length];
                const prev = previousOf(planned);
                if (!prev?.same) break;
                chapters.push({ ...prev.chapter, number: chapters.length + 1, part: planned.part, sources: sourcesOf(planned) });
                reused += 1;
                kept.push(chapters.length);
            }
            if (chapters.length < edition.plan.length) {
                const planned = edition.plan[chapters.length];
                const written = await writeBookChapter({
                    chapter: planned,
                    plan: edition.plan,
                    sources,
                    context,
                    sensitiveTopics: (profile as Profile | null)?.sensitive_topics,
                    writingStyle: (profile as Profile | null)?.writing_style,
                    written: chapters.map((c) => ({ title: c.title, content: c.content })),
                    previousVersion: previousOf(planned)?.chapter.content,
                });
                chapters.push({
                    number: chapters.length + 1,
                    title: written.title,
                    part: planned.part,
                    content: written.content,
                    word_count: countWords(written.content),
                    sources: sourcesOf(planned),
                });
            }
            const done = chapters.length >= edition.plan.length;
            // Sans la colonne `extras`, rien ne peut noter que la finition est faite : on s'arrête aux chapitres.
            return await save({ chapters, extras: { ...extras, reused, kept }, status: done && !hasExtras ? 'ready' : 'writing' });
        }

        if (!hasExtras) return await save({ status: 'ready' });

        // La passe finale : une relecture du livre entier, par petites retouches.
        // Un échec ne coûte pas le livre : il reste tel que les chapitres l'ont écrit.
        if (!extras.polish) {
            const at = new Date().toISOString();
            try {
                const polished = await polishBook(edition.chapters, context, extras.kept ?? []);
                const chapters = polished.chapters.map((c) => ({ ...c, word_count: countWords(c.content) }));
                return await save({ chapters, extras: { ...extras, polish: { applied: polished.applied, proposed: polished.proposed, at } } });
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.error(`[livre] passe finale de l'édition ${id} sautée :`, message);
                return await save({ extras: { ...extras, polish: { applied: 0, proposed: 0, at, error: message.slice(0, 300) } } });
            }
        }

        // Les pièces du livre, puis le livre est prêt.
        let pieces: BookPieces | null = null;
        try {
            const firstName = (profile as Profile | null)?.first_name?.trim() || 'la personne';
            pieces = await writePieces({ chapters: edition.chapters, firstName, wishes, currentTitle: previous?.extras?.pieces?.title ?? null, current: previous?.extras?.pieces ?? null });
        } catch (err) {
            console.error(`[livre] pièces de l'édition ${id} non écrites :`, err instanceof Error ? err.message : String(err));
            pieces = previous?.extras?.pieces ?? null;
        }
        const finished = await save({ status: 'ready', extras: { ...extras, pieces, pieces_at: new Date().toISOString() } });
        // Une étape de plus dans le livre : l'auteur est prévenu que sa nouvelle partie est prête à lire
        // (pas pour une simple remise à jour de la même étape, ni pour la fin du livre, qui a son propre message).
        const through = finished.extras?.through;
        const before = ready && ready.id !== edition.id ? ready.extras?.through : 0;
        if (profile && typeof through === 'number' && through >= 1 && through <= 3 && typeof before === 'number' && before < through) {
            const { notifyStageBookReady } = await import('./notify');
            await notifyStageBookReady(profile as Profile, (project as Project).project_metadata, through, finished.chapters.length);
        }
        return finished;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[livre] édition ${id} en échec :`, message);
        return await save({ status: 'failed', error: message.slice(0, 1000) });
    }
}

/**
 * Appelé après chaque appel, et à l'ouverture de l'espace auteur : compose le
 * livre SI une étape vient d'être finie (ou si le livre a pris du retard sur
 * ce qu'il doit raconter). Entre deux fins d'étape, il ne fait rien : le
 * livre que l'auteur a lu ne bouge pas.
 *
 * `legacy: false` laisse en place un livre composé avant le 26/11/2026 (sans
 * étape notée) : l'ouverture de l'espace ne le réécrit pas, seul un appel le fait.
 *
 * Ne lève jamais : un livre non composé ne doit pas faire échouer le
 * traitement d'un appel. `LOOMINA_AUTO_BOOK=off` coupe ce comportement
 * (batterie de tests, poste local).
 */
export async function autoCompose(projectId: string, origin: string = SITE.url, opts: { legacy?: boolean } = {}): Promise<'started' | 'running' | 'nothing'> {
    if (process.env.LOOMINA_AUTO_BOOK === 'off') return 'nothing';
    try {
        const through = await projectThrough(projectId);
        const count = await countSources(projectId, through);
        const { ready, running } = await readEditions(projectId);
        if (running) {
            if (through >= 1 && upToDate(running, through, count)) {
                await kickEdition(running.id, origin);
                return 'running';
            }
            // Elle ne raconte plus ce qu'il faut (une étape s'est finie entre-temps, ou elle date d'avant les étapes).
            await db()
                .from('book_editions')
                .update({ status: 'failed', error: `${REPLACED} : le livre s'écrit maintenant à la fin de chaque étape.`, claimed_at: null, updated_at: new Date().toISOString() })
                .eq('id', running.id);
        }
        if (through < 1 || count < 1) return 'nothing';
        if (ready && upToDate(ready, through, count)) return 'nothing';
        if (ready && ready.extras?.through === undefined && opts.legacy === false) return 'nothing';
        const edition = await startEdition(projectId);
        await kickEdition(edition.id, origin);
        console.info(`[livre] composition lancée pour le projet ${projectId} (jusqu'à l'étape ${through}, ${count} récit(s))`);
        return 'started';
    } catch (err) {
        console.info('[livre] pas de composition automatique :', err instanceof Error ? err.message : String(err));
        return 'nothing';
    }
}

/** Une composition sans nouvelle depuis ce délai est tenue pour arrêtée. */
export const STALE_EDITION_MS = 3 * 60 * 1000;

/**
 * Le rattrapage (toutes les 5 minutes, /api/jobs/process) : reprend les
 * compositions arrêtées en route. La chaîne d'étapes peut casser (Vercel
 * refuse parfois qu'une fonction en appelle une autre, erreur 508 ; un
 * déploiement coupe la fonction en cours) : sans cela, un livre restait à
 * moitié écrit jusqu'à ce que quelqu'un ouvre l'espace auteur.
 *
 * Fait UNE étape lui-même (pas d'appel du site à lui-même), puis redemande la
 * suite. Si la chaîne casse encore, le passage suivant reprend.
 */
export async function sweepEditions(origin: string = SITE.url, limit = 2): Promise<{ resumed: number }> {
    const stale = new Date(Date.now() - STALE_EDITION_MS).toISOString();
    const { data, error } = await db()
        .from('book_editions')
        .select('id, project_id, source_count, extras')
        .in('status', ['planning', 'writing'])
        .lt('updated_at', stale)
        .order('updated_at', { ascending: true })
        .limit(limit);
    if (error) throw new Error(`Lecture book_editions impossible : ${error.message}`);
    let resumed = 0;
    for (const row of (data ?? []) as Array<Pick<Edition, 'id' | 'project_id' | 'source_count' | 'extras'>>) {
        try {
            const through = await projectThrough(row.project_id);
            // Elle ne raconte plus ce que le livre doit raconter : autoCompose la remplace (ou l'arrête).
            if (through < 1 || !upToDate(row, through, await countSources(row.project_id, through))) {
                await autoCompose(row.project_id, origin);
                resumed += 1;
                continue;
            }
            const edition = await advanceEdition(row.id);
            if (!edition) continue;
            resumed += 1;
            if (edition.status === 'planning' || edition.status === 'writing') await kickEdition(edition.id, origin);
        } catch (err) {
            console.error(`[livre] reprise de l'édition ${row.id} impossible :`, err instanceof Error ? err.message : String(err));
        }
    }
    return { resumed };
}

/**
 * L'auteur a corrigé un récit d'appel : la correction est reportée dans le
 * livre composé, dans les seuls chapitres tirés de ce récit. Tout le reste
 * du livre est recopié tel quel dans une nouvelle édition.
 *
 * Une composition en cours est relancée (elle a pu lire le récit avant la
 * correction). Sans livre composé, on en lance un. Ne lève jamais.
 */
export async function carryIntoBook(params: {
    projectId: string;
    source: number;
    before: string;
    after: string;
    correction?: string | null;
    origin?: string;
}): Promise<void> {
    try {
        const { ready, running } = await readEditions(params.projectId);
        if (running || !ready) {
            await autoCompose(params.projectId, params.origin);
            return;
        }
        // Un récit qui n'est pas encore dans le livre (son étape n'est pas finie) : rien à reporter.
        if (!ready.chapters.some((c) => c.sources.includes(params.source))) return;
        const chapters: BookChapter[] = [];
        let touched = 0;
        for (const c of ready.chapters) {
            if (!c.sources.includes(params.source)) {
                chapters.push(c);
                continue;
            }
            const content = await carryCorrection({ chapter: c.content, before: params.before, after: params.after, correction: params.correction });
            if (content !== c.content) touched += 1;
            chapters.push({ ...c, content, word_count: countWords(content) });
        }
        const row = {
            project_id: params.projectId,
            status: 'ready',
            plan: ready.plan,
            chapters,
            source_count: ready.source_count,
            source_words: ready.source_words,
        };
        // Le titre, la dédicace et les autres pièces suivent le livre (si la base a la colonne).
        const { error } = await db().from('book_editions').insert('extras' in ready ? { ...row, extras: ready.extras ?? {} } : row);
        if (error) throw new Error(error.message);
        console.info(`[livre] correction du récit ${params.source} reportée dans ${touched} chapitre(s)`);
    } catch (err) {
        console.error('[livre] correction non reportée dans le livre :', err instanceof Error ? err.message : String(err));
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
        pieces: e.extras?.pieces ?? null,
        through: e.extras?.through ?? null,
    };
}
