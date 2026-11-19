/**
 * Ce qui fait avancer un livre d'une phase à la suivante.
 *
 * RÈGLE (Solal, 16/11/2026) : on change de phase selon la quantité
 * d'information reçue sur la phase en cours, jamais selon un nombre
 * d'appels, et seulement après l'avoir demandé à la personne.
 *
 * Chaque phase a une liste de sujets. Après chaque appel, le Directeur dit
 * lesquels sont couverts ; un sujet coché le reste. Quand tous le sont, le
 * code note que la question est à poser (`check: 'to_ask'`). Au début de
 * l'appel suivant, Loomina demande : « on ajoute quelque chose, ou on passe
 * à la suite ? ». La réponse, lue par le Directeur, décide.
 *
 * Avant : un pourcentage estimé par le modèle à chaque appel, sans mémoire
 * du précédent. Sur un livre simulé de huit appels, il a fait 62, 82, 68,
 * 86, 80, 92, 88, 88 % : le projet n'a jamais quitté la phase 1.
 *
 * L'état vit dans `projects.project_metadata.phase_state`.
 */

import type { Phase } from './phases';
import { isFinalPhase, isPhase } from './phases';

export interface Axis {
    key: string;
    label: string;
}

export const PHASE_AXES: Record<Phase, Axis[]> = {
    1: [
        { key: 'identite', label: 'Le nom et la naissance (année ou date, lieu)' },
        { key: 'famille', label: "Les personnes qui l'ont élevé et la fratrie s'il y en a une, au moins nommées" },
        { key: 'lieux', label: 'Les lieux où la personne a vécu' },
        { key: 'etapes', label: "Les grandes lignes de la vie adulte, au moins nommées : ce qui a occupé ses journées, les personnes avec qui elle a partagé sa vie" },
    ],
    2: [
        // Solal, 17/11/2026 : dans une biographie, les racines commencent par l'histoire de la famille.
        { key: 'heritage', label: "Le bagage familial : d'où vient la famille, l'histoire des parents avant sa naissance (leurs origines, leur rencontre, leur vie) et celle des grands-parents" },
        { key: 'maison', label: "La maison et les lieux de l'enfance : les pièces, la rue, le quartier ou le village, ce qu'on y voyait, entendait, sentait" },
        // 19/11/2026 : le portrait de chacun, comme le demande un biographe (questionnaire Nativ).
        { key: 'proches', label: "Le portrait des personnes de la maison (parents ou ceux qui l'ont élevé, grands-parents, frères et sœurs) : à quoi chacun ressemblait, son métier, un geste, une habitude, une expression qu'il ou elle répétait, ce qu'il ou elle a transmis" },
        { key: 'quotidien', label: "Le quotidien de l'enfance : les repas et les gourmandises, les jeux, les bêtises, les fêtes, les vacances, ce qu'on faisait quand on n'était pas à l'école" },
        { key: 'ecole', label: "L'école : le chemin, la classe, un maître ou une maîtresse, les camarades, ce qu'on aimait ou non, les premières fois" },
        { key: 'figures', label: 'Les personnes qui ont compté dans la jeunesse en dehors de la maison (un instituteur, un voisin, un ami)' },
        { key: 'depart', label: "L'adolescence, les relations avec les parents à cet âge, et le moment où l'on quitte la maison" },
    ],
    3: [
        { key: 'metier', label: "Ce qui a occupé ses journées : un métier, plusieurs, le foyer, un engagement, autre chose. Les débuts, une journée ordinaire du matin au soir, les personnes, un moment marquant, une fierté" },
        { key: 'couple', label: "La vie affective : les personnes aimées, la rencontre, la vie à deux quelle qu'en soit la forme, les premières années ensemble" },
        { key: 'enfants', label: "Les enfants, s'il y en a eu : l'arrivée de chacun, le caractère de chacun aux différents âges, des souvenirs de famille, ce qu'on a voulu leur transmettre" },
        { key: 'lieux_adulte', label: 'Les lieux de vie adulte, les maisons, les déménagements' },
        { key: 'amis', label: "Les amitiés d'adulte : qui, comment ils se sont rencontrés, ce qu'ils faisaient ensemble" },
        { key: 'passions', label: 'Les passions, les activités, les voyages' },
        { key: 'convictions', label: "La place de la foi, de la spiritualité ou des convictions dans sa vie (couvert aussi si la personne dit que cela n'en a pas, ou préfère ne pas en parler)" },
        { key: 'epreuves', label: "Les épreuves traversées (couvert aussi si la personne a dit ne pas vouloir en parler, ou qu'il n'y en a pas eu)" },
        { key: 'retraite', label: "La fin de la vie active ou le grand changement de rythme, si la personne l'a connu : ce que cela lui a fait, ce qu'elle a commencé à ce moment-là" },
    ],
    4: [
        { key: 'personnalite', label: "Son caractère avec ses mots : ses qualités et ses défauts, ce qui la révolte, ce qui la rend heureuse, un compliment qui lui a fait plaisir, une personne ou une œuvre qui l'a marquée" },
        { key: 'lecons', label: 'Ce que la vie lui a appris, ce que la personne referait ou non' },
        { key: 'valeurs', label: 'Les valeurs à transmettre' },
        { key: 'monde', label: "Comment la personne a vu le monde changer depuis sa jeunesse, en bien et en mal" },
        { key: 'descendance', label: "Les petits-enfants ou les plus jeunes de l'entourage, s'il y en a : qui ils sont, ce qu'ils partagent, ce qu'elle aimerait leur dire" },
        { key: 'messages', label: "Les messages aux proches (couvert aussi si la personne ne souhaite pas en laisser)" },
        { key: 'aujourdhui', label: "La vie d'aujourd'hui, et les envies et les projets pour la suite" },
        { key: 'fin', label: "Le livre lui-même : comment la personne aimerait qu'il se termine, à qui elle le dédie, qui elle veut remercier, le titre qu'elle lui donnerait (couvert aussi si elle préfère nous laisser choisir)" },
    ],
};

/** Quand un sujet est-il couvert ? Injecté dans le prompt du Directeur. */
export const AXIS_RULE: Record<Phase, string> = {
    1: "Un sujet est couvert dès que le fait est connu (dit dans cet appel ou déjà en mémoire). Aucune anecdote n'est nécessaire : la phase 1 est une vue d'ensemble.",
    2: "Tu ne coches pas ces sujets toi-même : le code les coche à partir des scènes que tu relèves dans `scenes` (voir plus bas). Un sujet demande plusieurs scènes concrètes avant d'être couvert : un fait simplement nommé, ou une seule anecdote, ne suffit pas pour un livre.",
    3: "Tu ne coches pas ces sujets toi-même : le code les coche à partir des scènes que tu relèves dans `scenes` (voir plus bas). Un sujet demande plusieurs scènes concrètes avant d'être couvert : un fait simplement nommé, ou une seule anecdote, ne suffit pas pour un livre.",
    4: "Un sujet est couvert quand le narrateur s'est réellement exprimé dessus, avec ses mots, et pas seulement par un « oui » ou une phrase.",
};

/**
 * Combien de scènes concrètes avant qu'un sujet soit couvert.
 *
 * Avant (jusqu'au 19/11/2026) : une seule scène suffisait. Quarante ans de
 * métier étaient « couverts » en une anecdote, et un livre pouvait se
 * terminer en six à huit appels : trop court pour être un livre. Comme on
 * n'invente rien, le livre ne peut pas dépasser ce que la personne a dit.
 *
 * Les sujets délicats ou qui ne concernent pas tout le monde n'en demandent
 * qu'une : on n'insiste jamais sur une épreuve ou sur la foi.
 */
export const DEFAULT_DEPTH = 3;
const AXIS_DEPTH: Record<string, number> = {
    lieux_adulte: 2,
    amis: 2,
    depart: 2,
    convictions: 1,
    epreuves: 1,
    retraite: 1,
};

/** Les phases dont les sujets se cochent en comptant les scènes (les autres : au jugement du Directeur). */
export const countsScenes = (phase: Phase): boolean => phase === 2 || phase === 3;

export function axisDepth(key: string): number {
    return AXIS_DEPTH[key] ?? DEFAULT_DEPTH;
}

/**
 * Une scène racontée par la personne, relevée par le Directeur après chaque
 * appel. La liste sert trois fois : compter ce qui a été raconté sur chaque
 * sujet, dire à la voix ce qui est déjà dans le livre (pour ne pas le
 * redemander et pour s'appuyer dessus), et suivre la matière du livre.
 * Gardée dans `project_metadata.book_told`.
 */
export interface ToldScene {
    /** Clé du sujet (toutes phases confondues), ou null si la scène n'entre dans aucun. */
    axis: string | null;
    what: string;
}

const MAX_TOLD = 240;
const ALL_AXIS_KEYS = new Set(Object.values(PHASE_AXES).flatMap((axes) => axes.map((a) => a.key)));

function cleanScene(item: unknown): ToldScene | null {
    const s = (item ?? {}) as Record<string, unknown>;
    const what = typeof s.what === 'string' ? s.what.trim().replace(/\s+/g, ' ').slice(0, 240) : '';
    if (!what) return null;
    const axis = typeof s.axis === 'string' && ALL_AXIS_KEYS.has(s.axis) ? s.axis : null;
    return { axis, what };
}

export function readTold(metadata: Record<string, unknown> | null | undefined): ToldScene[] {
    const raw = metadata?.book_told;
    if (!Array.isArray(raw)) return [];
    return raw.map(cleanScene).filter((s): s is ToldScene => s !== null).slice(-MAX_TOLD);
}

/** Ajoute les scènes d'un appel, sans doublon exact. Les plus anciennes sortent au-delà du plafond. */
export function mergeTold(existing: ToldScene[], update: unknown): ToldScene[] {
    const out = [...existing];
    const seen = new Set(out.map((s) => norm(s.what)));
    for (const item of Array.isArray(update) ? update.slice(0, 40) : []) {
        const s = cleanScene(item);
        if (!s || seen.has(norm(s.what))) continue;
        seen.add(norm(s.what));
        out.push(s);
    }
    return out.slice(-MAX_TOLD);
}

/** Nombre de scènes racontées par sujet. */
export function sceneCounts(told: ToldScene[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const s of told) if (s.axis) out[s.axis] = (out[s.axis] ?? 0) + 1;
    return out;
}

/**
 * Les sujets de la phase que les scènes racontées suffisent à couvrir, plus
 * ceux que la personne a épuisés (« je ne sais plus », « c'est tout ») :
 * un taiseux ne doit pas rester bloqué sur un sujet qu'il a vidé.
 */
export function axesCoveredByScenes(phase: Phase, told: ToldScene[], exhausted: unknown): string[] {
    const counts = sceneCounts(told);
    const done = new Set(validKeys(phase, exhausted));
    return PHASE_AXES[phase].filter((a) => done.has(a.key) || (counts[a.key] ?? 0) >= axisDepth(a.key)).map((a) => a.key);
}

/**
 * Une scène forte racontée trop vite : il y manque un visage, des mots
 * échangés, un détail. Le Directeur la note, la voix y revient à un appel
 * suivant. Gardée dans `project_metadata.book_deepen`.
 */
export interface DeepenItem {
    id: number;
    /** La scène et ce qui lui manque, en une phrase. */
    label: string;
    status: 'open' | 'done';
}

const MAX_DEEPEN = 40;

export function readDeepen(metadata: Record<string, unknown> | null | undefined): DeepenItem[] {
    const raw = metadata?.book_deepen;
    if (!Array.isArray(raw)) return [];
    const out: DeepenItem[] = [];
    for (const item of raw) {
        const d = (item ?? {}) as Record<string, unknown>;
        const label = typeof d.label === 'string' ? d.label.trim().slice(0, 300) : '';
        if (!label || !Number.isInteger(d.id)) continue;
        out.push({ id: d.id as number, label, status: d.status === 'done' ? 'done' : 'open' });
    }
    return out.slice(-MAX_DEEPEN);
}

/** Nouvelles scènes à approfondir (trois au plus par appel), scènes approfondies. Une scène approfondie le reste. */
export function mergeDeepen(existing: DeepenItem[], update: unknown): DeepenItem[] {
    const u = (update ?? {}) as Record<string, unknown>;
    const done = new Set(Array.isArray(u.done) ? u.done.map(Number).filter(Number.isInteger) : []);
    const items = existing.map((d) => ({ ...d, status: d.status === 'done' || done.has(d.id) ? ('done' as const) : ('open' as const) }));
    let nextId = items.reduce((m, d) => Math.max(m, d.id), 0) + 1;
    let added = 0;
    for (const raw of Array.isArray(u.add) ? u.add : []) {
        const label = typeof raw === 'string' ? raw.trim().slice(0, 300) : '';
        if (!label || added >= 3) continue;
        if (items.some((d) => norm(d.label) === norm(label))) continue;
        items.push({ id: nextId++, label, status: 'open' });
        added += 1;
    }
    return items.slice(-MAX_DEEPEN);
}

export const openDeepen = (items: DeepenItem[]): DeepenItem[] => items.filter((d) => d.status === 'open');

/**
 * Ce que la personne a demandé pour le livre lui-même, avec ses mots : un
 * titre, une dédicace, des remerciements, une fin. Ce ne sont pas des
 * souvenirs (ils n'entrent dans aucun chapitre), mais les pièces du livre
 * en sont tirées. Gardé dans `project_metadata.book_wishes`.
 */
export interface BookWishes {
    title?: string;
    dedication?: string;
    thanks?: string;
    ending?: string;
}

const WISH_KEYS = ['title', 'dedication', 'thanks', 'ending'] as const;

export function readWishes(metadata: Record<string, unknown> | null | undefined): BookWishes {
    return mergeWishes({}, metadata?.book_wishes);
}

/** Un souhait exprimé remplace le précédent ; un champ vide ne l'efface pas. */
export function mergeWishes(existing: BookWishes, update: unknown): BookWishes {
    const u = (update ?? {}) as Record<string, unknown>;
    const out: BookWishes = { ...existing };
    for (const k of WISH_KEYS) {
        const v = typeof u[k] === 'string' ? (u[k] as string).trim().slice(0, 800) : '';
        if (v && v.toLowerCase() !== 'null') out[k] = v;
    }
    return out;
}

/** La phase telle que Loomina la nomme au téléphone. */
export function spokenPhase(phase: Phase, tu: boolean): string {
    const p = tu ? 'ta' : 'votre';
    const t = tu ? 'tu veux' : 'vous voulez';
    return {
        1: `les grandes lignes de ${p} vie`,
        2: `${tu ? 'ton' : 'votre'} enfance et ${p} jeunesse`,
        3: `${p} vie d'adulte`,
        4: `ce que ${t} transmettre`,
    }[phase];
}

export interface PhaseState {
    phase: Phase;
    /** Clés des sujets couverts dans la phase en cours. */
    covered: string[];
    /** Clés des sujets qui ne concernent pas cette personne (jamais mariée, pas d'enfants…). */
    skipped: string[];
    /**
     * `to_ask` : tous les sujets sont couverts, Loomina doit demander à la
     *            personne si elle veut ajouter quelque chose ou passer à la suite.
     * `wait`   : la personne vient de dire qu'elle voulait ajouter ; on ne
     *            repose pas la question à l'appel d'après.
     */
    check: 'to_ask' | 'wait' | null;
}

export type PhaseAnswer = 'advance' | 'stay' | 'none';

const validKeys = (phase: Phase, keys: unknown): string[] => {
    const known = new Set(PHASE_AXES[phase].map((a) => a.key));
    return Array.isArray(keys) ? [...new Set(keys.map(String).filter((k) => known.has(k)))] : [];
};

/** L'état de la phase en cours ; vide si rien n'est enregistré ou s'il date d'une autre phase. */
export function readPhaseState(metadata: Record<string, unknown> | null | undefined, phase: Phase): PhaseState {
    const raw = (metadata?.phase_state ?? null) as Record<string, unknown> | null;
    if (!raw || !isPhase(raw.phase) || raw.phase !== phase) return { phase, covered: [], skipped: [], check: null };
    return {
        phase,
        covered: validKeys(phase, raw.covered),
        skipped: validKeys(phase, raw.skipped),
        check: raw.check === 'to_ask' || raw.check === 'wait' ? raw.check : null,
    };
}

/**
 * Un sujet propre à la personne (« la boulangerie de ses parents », « son
 * service en Algérie », « la chorale »). La liste de base ne suffit pas :
 * chaque vie a les siens (Solal, 16/11/2026). Le Directeur les ajoute quand
 * la personne les évoque, dans la phase où ils devront être racontés, même
 * si elle en parle bien avant : un métier nommé en phase 1 attend la phase 3.
 */
export interface Topic {
    id: number;
    phase: Phase;
    label: string;
    /** open : évoqué, à raconter. done : raconté. skip : la personne ne souhaite pas en parler. */
    status: 'open' | 'done' | 'skip';
}

const MAX_TOPICS = 60;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function readTopics(metadata: Record<string, unknown> | null | undefined): Topic[] {
    const raw = metadata?.book_topics;
    if (!Array.isArray(raw)) return [];
    const out: Topic[] = [];
    for (const item of raw) {
        const t = (item ?? {}) as Record<string, unknown>;
        const label = typeof t.label === 'string' ? t.label.trim().slice(0, 160) : '';
        if (!label || !isPhase(t.phase) || !Number.isInteger(t.id)) continue;
        out.push({ id: t.id as number, phase: t.phase, label, status: t.status === 'done' || t.status === 'skip' ? t.status : 'open' });
    }
    return out.slice(0, MAX_TOPICS);
}

/**
 * Applique ce que le Directeur a relevé : nouveaux sujets (sans doublon),
 * sujets racontés, sujets refusés. Un sujet raconté ou refusé le reste.
 */
export function mergeTopics(existing: Topic[], update: unknown): Topic[] {
    const u = (update ?? {}) as Record<string, unknown>;
    const ids = (v: unknown) => new Set(Array.isArray(v) ? v.map(Number).filter(Number.isInteger) : []);
    const done = ids(u.done);
    const skip = ids(u.skip);
    const topics = existing.map((t) => ({
        ...t,
        status: t.status !== 'open' ? t.status : done.has(t.id) ? ('done' as const) : skip.has(t.id) ? ('skip' as const) : ('open' as const),
    }));
    let nextId = topics.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    for (const item of Array.isArray(u.add) ? u.add : []) {
        const a = (item ?? {}) as Record<string, unknown>;
        const label = typeof a.label === 'string' ? a.label.trim().slice(0, 160) : '';
        // La phase 1 est une vue d'ensemble : elle n'a pas de sujets à raconter.
        if (!label || !isPhase(a.phase) || a.phase === 1 || topics.length >= MAX_TOPICS) continue;
        const key = norm(label);
        if (topics.some((t) => t.phase === a.phase && (norm(t.label) === key || norm(t.label).includes(key) || key.includes(norm(t.label))))) continue;
        topics.push({ id: nextId++, phase: a.phase, label, status: 'open' });
    }
    return topics;
}

/** Sujets du socle commun ni racontés ni écartés : à aborder, en demandant d'abord s'ils concernent la personne. */
export function pendingAxes(state: PhaseState): Axis[] {
    return PHASE_AXES[state.phase].filter((a) => !state.covered.includes(a.key) && !state.skipped.includes(a.key));
}

/** Sujets déjà entamés mais pas encore assez racontés pour un livre : il manque des scènes. */
export function shallowAxes(state: PhaseState, told: ToldScene[]): Array<Axis & { scenes: number }> {
    if (!countsScenes(state.phase)) return [];
    const counts = sceneCounts(told);
    return pendingAxes(state)
        .filter((a) => (counts[a.key] ?? 0) > 0 && (counts[a.key] ?? 0) < axisDepth(a.key))
        .map((a) => ({ ...a, scenes: counts[a.key] ?? 0 }));
}

/** Sujets dont on ne sait encore rien du tout. */
export function untouchedAxes(state: PhaseState, told: ToldScene[]): Axis[] {
    const counts = sceneCounts(told);
    return pendingAxes(state).filter((a) => !countsScenes(state.phase) || (counts[a.key] ?? 0) === 0);
}

export const openTopics = (topics: Topic[], phase: Phase): Topic[] => topics.filter((t) => t.phase === phase && t.status === 'open');

/**
 * Part des sujets traités : sujets de base qui concernent la personne, plus
 * ses sujets propres. Avec les scènes racontées (`told`), un sujet entamé
 * compte pour sa part (une scène sur trois = un tiers) : l'avancement
 * affiché à l'auteur bouge à chaque appel, pas seulement quand un sujet
 * est bouclé.
 */
export function coverage(phase: Phase, state: Pick<PhaseState, 'covered' | 'skipped'>, topics: Topic[] = [], told: ToldScene[] = []): number {
    const skipped = new Set(validKeys(phase, state.skipped));
    const base = PHASE_AXES[phase].filter((a) => !skipped.has(a.key));
    const covered = new Set(validKeys(phase, state.covered));
    const own = topics.filter((t) => t.phase === phase);
    const total = base.length + own.length;
    if (!total) return 100;
    const counts = countsScenes(phase) ? sceneCounts(told) : {};
    const part = (key: string) => (covered.has(key) ? 1 : Math.min(1, (counts[key] ?? 0) / axisDepth(key)));
    const done = base.reduce((sum, a) => sum + part(a.key), 0) + own.filter((t) => t.status !== 'open').length;
    const pct = Math.round((100 * done) / total);
    // 100 % veut dire « tout est couvert » : jamais par arrondi.
    const complete = base.every((a) => covered.has(a.key)) && own.every((t) => t.status !== 'open');
    return complete ? 100 : Math.min(99, pct);
}

export interface PhaseStep {
    /** État à enregistrer (celui de la phase suivante si on avance). */
    state: PhaseState;
    nextPhase: Phase;
    /** Part des sujets couverts dans la phase qui sera en cours après cet appel. */
    progress: number;
    /** La personne a confirmé que le livre est complet (phase 4). */
    completed: boolean;
}

/**
 * Applique un appel à l'état de la phase. Décidé par le CODE : le modèle
 * ne fournit que les sujets couverts et la réponse de la personne.
 */
export function stepPhase(
    before: PhaseState,
    now: { covered?: unknown; skipped?: unknown },
    answer: PhaseAnswer,
    topics: Topic[] = [],
    told: ToldScene[] = []
): PhaseStep {
    const phase = before.phase;
    const covered = [...new Set([...before.covered, ...validKeys(phase, now.covered)])];
    // Un sujet raconté n'est plus « sans objet », quoi qu'on ait cru avant.
    const skipped = [...new Set([...before.skipped, ...validKeys(phase, now.skipped)])].filter((k) => !covered.includes(k));
    const complete =
        PHASE_AXES[phase].every((a) => covered.includes(a.key) || skipped.includes(a.key)) && openTopics(topics, phase).length === 0;
    const stay = (check: PhaseState['check']): PhaseStep => ({
        state: { phase, covered, skipped, check },
        nextPhase: phase,
        progress: coverage(phase, { covered, skipped }, topics, told),
        completed: false,
    });

    if (before.check === 'to_ask') {
        if (answer === 'advance') {
            if (isFinalPhase(phase)) return { ...stay(null), completed: true };
            const next = (phase + 1) as Phase;
            const state: PhaseState = { phase: next, covered: [], skipped: [], check: null };
            return { state, nextPhase: next, progress: coverage(next, state, topics, told), completed: false };
        }
        // « J'ai encore des choses à dire » : on reste, et on ne repose pas
        // la question à l'appel d'après. Sans réponse, elle reste à poser.
        return stay(answer === 'stay' ? 'wait' : 'to_ask');
    }
    return stay(complete ? 'to_ask' : null);
}
