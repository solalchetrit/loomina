/**
 * Le contexte structuré — la mémoire de Loomina.
 *
 * ANCIEN COMPORTEMENT
 *   global_context = global_context + "\n\n" + now + " Summary: " + résumé
 *
 * Un append pur. Après huit appels : 3 000 à 4 000 tokens de texte brut,
 * empilés chronologiquement, où l'information récente se noie dans
 * l'ancienne. Le modèle ne peut plus distinguer ce qui compte.
 * Mesuré en production le 27/07 : déjà 6 154 caractères.
 *
 * NOUVEAU COMPORTEMENT
 *   Le Directeur reçoit le contexte existant ET le nouveau transcript,
 *   puis renvoie le contexte COMPLET ET RÉÉCRIT. Il peut donc fusionner
 *   les doublons, corriger une date approximative devenue précise, et
 *   retirer une question qui a trouvé sa réponse.
 *
 * On plafonne ensuite côté code : un modèle qui déborde ne doit jamais
 * pouvoir faire grossir le contexte sans limite.
 */

export interface TimelineEntry {
    year: number | null;
    event: string;
}

export interface FamilyEntry {
    name: string;
    relation: string;
    deceased?: boolean;
    note?: string;
}

export interface LoominaContext {
    identity: {
        full_name?: string;
        birth?: string;
        places?: string[];
        /**
         * Orthographes certifiées : noms que le narrateur a épelés lettre
         * par lettre au téléphone (« Chetrit : C-H-E-T-R-I-T »). La
         * transcription vocale les écorche systématiquement ; l'Écrivain
         * doit reprendre ces graphies telles quelles.
         */
        spellings?: string[];
    };
    timeline: TimelineEntry[];
    family: FamilyEntry[];
    key_themes: string[];
    open_questions: string[];
    /**
     * Sujets proposés depuis l'espace auteur (« Suggérer un sujet ») par
     * l'auteur ou un proche. Gérés par le CODE, jamais réécrits par le
     * Directeur : il signale seulement ceux qui ont été abordés, et le
     * pipeline les retire (voir pipeline.ts). Sinon une suggestion ajoutée
     * pendant un appel serait écrasée par la réécriture du contexte.
     */
    suggested_topics?: string[];
    /**
     * Corrections écrites par l'auteur sur l'espace auteur (« Ma grand-mère
     * s'appelait Rose, pas Rosa »). Elles font foi sur le transcript et sur
     * la mémoire. Gérées par le code comme les sujets suggérés : le
     * Directeur les applique mais ne peut pas les effacer.
     */
    author_corrections?: string[];
    last_call?: {
        date?: string;
        summary?: string;
        topics?: number[];
    };
}

export const EMPTY_CONTEXT: LoominaContext = {
    identity: {},
    timeline: [],
    family: [],
    key_themes: [],
    open_questions: [],
};

// Plafonds. Volontairement généreux pour la vie d'un être humain,
// mais bornés : le contexte doit rester lisible même au 14ᵉ appel.
const MAX_TIMELINE = 60;
const MAX_FAMILY = 40;
const MAX_THEMES = 25;
const MAX_QUESTIONS = 15;
const MAX_PLACES = 20;
const MAX_SPELLINGS = 20;
const MAX_SUGGESTIONS = 10;
const MAX_CORRECTIONS = 30;
const MAX_TEXT = 600;

function str(v: unknown, max = MAX_TEXT): string | undefined {
    if (typeof v !== 'string') return undefined;
    const s = v.trim();
    return s === '' ? undefined : s.slice(0, max);
}

function strArray(v: unknown, max: number): string[] {
    if (!Array.isArray(v)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of v) {
        const s = str(item, 300);
        if (!s) continue;
        const k = s.toLowerCase();
        if (seen.has(k)) continue;   // déduplication
        seen.add(k);
        out.push(s);
        if (out.length >= max) break;
    }
    return out;
}

/**
 * Normalise ce que renvoie le modèle.
 *
 * Ne lève jamais : une sortie LLM malformée ne doit pas faire perdre
 * l'appel d'un client. On garde ce qui est exploitable, on jette le reste.
 */
export function normalizeContext(input: unknown): LoominaContext {
    if (!input || typeof input !== 'object') return { ...EMPTY_CONTEXT };
    const raw = input as Record<string, unknown>;

    const identityRaw = (raw.identity ?? {}) as Record<string, unknown>;
    const lastCallRaw = (raw.last_call ?? {}) as Record<string, unknown>;

    const timeline: TimelineEntry[] = Array.isArray(raw.timeline)
        ? (raw.timeline as unknown[])
              .map((e) => {
                  const entry = (e ?? {}) as Record<string, unknown>;
                  const event = str(entry.event, 300);
                  if (!event) return null;
                  const yearNum = Number(entry.year);
                  return {
                      year: Number.isFinite(yearNum) && yearNum > 1850 && yearNum < 2100 ? yearNum : null,
                      event,
                  };
              })
              .filter((e): e is TimelineEntry => e !== null)
              .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
              .slice(0, MAX_TIMELINE)
        : [];

    const family: FamilyEntry[] = Array.isArray(raw.family)
        ? (raw.family as unknown[])
              .map((e): FamilyEntry | null => {
                  const entry = (e ?? {}) as Record<string, unknown>;
                  const name = str(entry.name, 120);
                  if (!name) return null;
                  return {
                      name,
                      relation: str(entry.relation, 120) ?? 'inconnu',
                      deceased: entry.deceased === true,
                      note: str(entry.note, 300),
                  };
              })
              .filter((e): e is FamilyEntry => e !== null)
              .slice(0, MAX_FAMILY)
        : [];

    const topics = Array.isArray(lastCallRaw.topics)
        ? (lastCallRaw.topics as unknown[])
              .map((t) => Number(t))
              .filter((t) => Number.isInteger(t))
              .slice(0, 20)
        : [];

    return {
        identity: {
            full_name: str(identityRaw.full_name, 160),
            birth: str(identityRaw.birth, 160),
            places: strArray(identityRaw.places, MAX_PLACES),
            spellings: strArray(identityRaw.spellings, MAX_SPELLINGS),
        },
        timeline,
        family,
        key_themes: strArray(raw.key_themes, MAX_THEMES),
        open_questions: strArray(raw.open_questions, MAX_QUESTIONS),
        suggested_topics: strArray(raw.suggested_topics, MAX_SUGGESTIONS),
        author_corrections: strArray(raw.author_corrections, MAX_CORRECTIONS),
        last_call: {
            date: str(lastCallRaw.date, 40),
            summary: str(lastCallRaw.summary, 1200),
            topics,
        },
    };
}

/**
 * Rend le contexte lisible pour un modèle.
 *
 * Du texte plat plutôt que du JSON brut : à taille de prompt égale,
 * GPT-4o suit nettement mieux une note structurée qu'un objet sérialisé.
 */
export function renderContext(ctx: LoominaContext): string {
    const parts: string[] = [];

    const { full_name, birth, places, spellings } = ctx.identity ?? {};
    if (full_name || birth || places?.length || spellings?.length) {
        const bits = [
            full_name ? `Nom : ${full_name}` : null,
            birth ? `Naissance : ${birth}` : null,
            places?.length ? `Lieux : ${places.join(', ')}` : null,
            spellings?.length
                ? `Orthographes certifiées (épelées par le narrateur, à reprendre telles quelles) : ${spellings.join(' ; ')}`
                : null,
        ].filter(Boolean);
        parts.push(`## Identité\n${bits.join('\n')}`);
    }

    if (ctx.author_corrections?.length) {
        parts.push(
            "## Corrections de l'auteur (elles font foi sur tout le reste, transcript compris)\n" +
                ctx.author_corrections.map((c) => `- ${c}`).join('\n')
        );
    }

    if (ctx.timeline?.length) {
        parts.push(
            '## Repères chronologiques\n' +
                ctx.timeline
                    .map((t) => (t.year ? `- ${t.year} : ${t.event}` : `- (année non précisée) ${t.event}`))
                    .join('\n')
        );
    }

    if (ctx.family?.length) {
        parts.push(
            '## Proches cités\n' +
                ctx.family
                    .map((f) => {
                        const dead = f.deceased ? ' — décédé(e), à évoquer au passé' : '';
                        const note = f.note ? ` (${f.note})` : '';
                        return `- ${f.name} — ${f.relation}${dead}${note}`;
                    })
                    .join('\n')
        );
    }

    if (ctx.key_themes?.length) {
        parts.push('## Thèmes déjà abordés\n' + ctx.key_themes.map((t) => `- ${t}`).join('\n'));
    }

    if (ctx.open_questions?.length) {
        parts.push('## Questions encore ouvertes\n' + ctx.open_questions.map((q) => `- ${q}`).join('\n'));
    }

    if (ctx.last_call?.summary) {
        parts.push(`## Dernier appel\n${ctx.last_call.date ?? ''}\n${ctx.last_call.summary}`.trim());
    }

    return parts.length ? parts.join('\n\n') : '(Aucun contexte : il s\'agit du premier appel.)';
}

/**
 * Les sujets suggérés depuis le site, numérotés pour que le Directeur
 * puisse dire lesquels ont été abordés. Vide si rien n'est en attente.
 */
export function renderSuggestions(ctx: LoominaContext): string {
    const list = ctx.suggested_topics ?? [];
    return list.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

/**
 * Ce que l'espace auteur montre sous « Ce que Loomina garde en tête » :
 * d'abord les sujets proposés par la famille, puis les points que le
 * Directeur veut éclaircir.
 */
export function pendingTopics(ctx: LoominaContext): string[] {
    const seen = new Set<string>();
    return [...(ctx.suggested_topics ?? []), ...(ctx.open_questions ?? [])].filter((q) => {
        const k = q.trim().toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/**
 * Retire les sujets suggérés que le Directeur a marqués comme abordés.
 *
 * `shown` est la liste présentée au Directeur (numérotée à partir de 1),
 * `latest` celle relue en base juste avant l'écriture : une suggestion
 * ajoutée pendant l'appel n'a pas été montrée, elle reste.
 */
export function remainingSuggestions(shown: string[], covered: number[], latest: string[]): string[] {
    const done = new Set(
        covered
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= shown.length)
            .map((n) => shown[n - 1].trim().toLowerCase())
    );
    return latest.filter((t) => !done.has(t.trim().toLowerCase()));
}

/**
 * Reprise de l'historique : convertit l'ancien `global_context` textuel
 * en contexte structuré minimal, pour ne rien perdre lors de la bascule.
 */
export function contextFromLegacy(globalContext: string | null): LoominaContext {
    if (!globalContext?.trim()) return { ...EMPTY_CONTEXT };
    return {
        ...EMPTY_CONTEXT,
        last_call: {
            summary: globalContext.trim().slice(-4000),
        },
    };
}

/**
 * Le projet a-t-il déjà une mémoire d'appel ? Un contexte qui ne contient
 * qu'un sujet suggéré depuis le site n'est PAS une mémoire : le narrateur
 * n'a encore jamais parlé à Loomina, il ne faut pas le « retrouver ».
 */
export function hasCallMemory(ctx: LoominaContext): boolean {
    const id = ctx.identity ?? {};
    return Boolean(
        id.full_name ||
            id.birth ||
            id.places?.length ||
            ctx.timeline?.length ||
            ctx.family?.length ||
            ctx.key_themes?.length ||
            ctx.last_call?.summary
    );
}

export function isEmptyContext(ctx: unknown): boolean {
    if (!ctx || typeof ctx !== 'object') return true;
    return Object.keys(ctx as object).length === 0;
}
