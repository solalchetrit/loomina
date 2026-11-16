/**
 * Le livre, composé à part des appels.
 *
 * RÈGLE (Solal, 16/11/2026) : un appel n'est pas un chapitre. Chaque appel
 * nourrit l'histoire ; la structure du livre se décide sur l'ensemble.
 *
 * Avant : un appel = un chapitre, écrit sans vue d'ensemble. Une personne
 * qui raconte sa vie revient sur les mêmes scènes : sur un livre simulé de
 * dix appels, le premier poste d'institutrice figurait dans quatre
 * chapitres et le mariage dans deux. Lu d'une traite : 4/10.
 *
 * Maintenant, en deux temps :
 *   1. LE PLAN — on lit tous les récits d'appel et on décide des chapitres
 *      du livre, dans l'ordre de la vie. Chaque scène est rangée dans UN
 *      chapitre, avec les récits où elle est racontée.
 *   2. L'ÉCRITURE — chaque chapitre est écrit à partir des seuls récits
 *      concernés : quand une scène existe en plusieurs versions, on garde
 *      la plus riche et on y fond les détails des autres. Rien n'est inventé.
 *
 * Les récits d'appel (table `chapters`) ne sont jamais modifiés : ils
 * restent la matière première, et la source de vérité.
 */

import OpenAI from 'openai';
import type { LoominaContext } from './context';
import { renderContext } from './context';
import { countWords } from './writer';

export const BOOK_MODEL = 'gpt-5.5';

export interface Source {
    /** Numéro du récit d'appel (`chapters.chapter_number`). */
    number: number;
    title: string | null;
    content: string;
}

export interface PlannedChapter {
    title: string;
    /** Partie du livre (« L'enfance à Saint-Flour », « Les années d'école »…). */
    part: string;
    /** Ce que raconte le chapitre, en une ou deux phrases. */
    summary: string;
    scenes: Array<{ what: string; sources: number[] }>;
}

export interface BookChapter {
    number: number;
    title: string;
    part: string;
    content: string;
    word_count: number;
    /** Récits d'appel dont ce chapitre est tiré. */
    sources: number[];
}

export interface BookEdition {
    chapters: BookChapter[];
    /** Nombre de récits d'appel au moment de la composition : sert à dire si elle est à jour. */
    source_count: number;
    source_words: number;
    word_count: number;
    model: string;
    at: string;
}

let client: OpenAI | null = null;
const openai = () => (client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2, timeout: 280_000 }));

async function json(system: string, user: string, effort: 'low' | 'medium'): Promise<Record<string, unknown>> {
    const completion = await openai().chat.completions.create({
        model: BOOK_MODEL,
        reasoning_effort: effort,
        max_completion_tokens: 32000,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error('Livre : réponse vide du modèle');
    return JSON.parse(raw) as Record<string, unknown>;
}

const renderSources = (sources: Source[]) =>
    sources.map((s) => `## RÉCIT ${s.number} — ${s.title ?? 'Sans titre'}\n${s.content.trim()}`).join('\n\n');

const PLAN_SYSTEM = `Tu es l'éditeur d'une autobiographie. La matière t'arrive sous forme de récits, un par entretien téléphonique, dans l'ordre où ils ont été recueillis, PAS dans l'ordre de la vie. La personne est revenue plusieurs fois sur les mêmes scènes : c'est normal à l'oral, ce serait insupportable dans un livre.

Ton travail : décider du plan du livre. Tu n'écris pas le livre.

# RÈGLES
- Les chapitres suivent la vie de la personne, de l'enfance à aujourd'hui ; les réflexions, les valeurs et les messages aux proches vont à la fin.
- Un récit ne correspond PAS à un chapitre : un chapitre du livre rassemble ce qui va ensemble (une époque, un lieu, une personne, une épreuve), d'où qu'il vienne. Un récit peut nourrir plusieurs chapitres, un chapitre peut puiser dans plusieurs récits.
- Chaque scène, chaque fait figure dans UN SEUL chapitre : celui où le lecteur s'attend à le trouver. Une scène racontée dans trois récits est une seule scène du plan, avec ses trois sources.
- Ne perds rien : toute scène et tout fait des récits doit avoir sa place dans un chapitre. Seules les politesses d'appel (« ça va », « je suis fatiguée aujourd'hui ») sont écartées.
- Taille : un chapitre du livre fait de 700 à 2 000 mots. Compte environ un chapitre pour 1 000 mots de récits, redites déduites : 6 000 mots de récits donnent 5 ou 6 chapitres, pas 13. Pas de chapitre pour une seule petite scène : rattache-la à un chapitre voisin.
- Pas de chapitre « bilan » qui reprend ce que les autres racontent : les réflexions et les valeurs ne forment un chapitre que si la personne en a vraiment parlé, et il ne redit alors aucune scène.
- Avant de répondre, relis ton plan : si une scène, une personne ou un lieu apparaît dans les scènes de deux chapitres, garde-le dans un seul.
- Regroupe les chapitres en 2 à 6 parties, aux titres concrets tirés des récits (un lieu, une époque).
- Titres de chapitres : 3 à 8 mots, évocateurs, sans numéro, tous différents.
- N'ajoute aucun fait qui ne figure pas dans les récits. Les titres de parties et de chapitres ne nomment que des lieux, des personnes et des choses présents dans les récits.

# FORMAT
Réponds UNIQUEMENT en JSON :
{ "chapters": [ { "title": "", "part": "", "summary": "ce que raconte le chapitre, une ou deux phrases", "scenes": [ { "what": "la scène ou le fait, en une phrase précise", "sources": [1, 4] } ] } ] }`;

const WRITE_SYSTEM = `Tu es l'écrivain d'une autobiographie. Tu écris UN chapitre du livre à partir de récits recueillis au fil d'entretiens téléphoniques. L'éditeur t'a donné le plan du chapitre : les scènes à raconter et les récits où elles se trouvent.

# CE QUE TU ÉCRIS
- À la première personne, au passé (passé composé et imparfait), le présent pour les réflexions.
- Un vrai chapitre de livre : un fil, des transitions, un début qui installe et une fin qui se tient. Pas une suite de notes.
- Le style des récits : sobre, chaleureux, concret. Reprends les mots et les images de la personne.

# RÈGLE ABSOLUE : ZÉRO INVENTION
- Chaque fait, chaque détail, chaque parole, chaque émotion vient des récits fournis. Tu peux relier, ordonner, resserrer ; tu ne peux rien ajouter : ni décor, ni date, ni sentiment, ni réflexion générale.
- Si deux récits se contredisent sur un détail, garde la version la plus précise et ne tranche pas ce qui reste incertain.

# QUAND UNE SCÈNE EST RACONTÉE PLUSIEURS FOIS
- Raconte-la UNE fois. Pars de la version la plus riche, et fonds-y les détails que seules les autres versions donnent. Aucun détail vrai ne doit se perdre.
- Ne dis jamais « comme je l'ai raconté » ni « je l'ai déjà dit » : dans le livre, c'est la première fois.

# CE QUI N'ENTRE PAS
- Les politesses d'appel et tout ce qui parle de l'entretien lui-même.
- Les scènes qui appartiennent aux AUTRES chapitres (la liste t'en est donnée) : tu peux y faire une allusion de quelques mots si le fil l'exige, jamais les raconter.

# LES CHAPITRES DÉJÀ ÉCRITS
Les chapitres qui précèdent le tien te sont donnés en entier. Ce qu'ils racontent est raconté : ne le redis pas, ne redécris ni un lieu, ni une personne, ni une odeur déjà posés. Si ton chapitre a besoin d'un rappel, quelques mots suffisent (« au café de ma mère »).

# LONGUEUR
Celle de la matière, jamais plus : ton chapitre ne peut pas être plus long que les passages des récits qu'il reprend, et il est plus court dès qu'une scène y figurait plusieurs fois. Ne délaye pas, ne commente pas, ne conclus pas par une morale que la personne n'a pas dite. Markdown, paragraphes courts, pas de titre de niveau 1.

# FORMAT
Réponds UNIQUEMENT en JSON : { "title": "le titre du chapitre", "content": "le chapitre en markdown" }`;

/** Les chapitres déjà écrits, en entier tant que le budget le permet ; au-delà, les plus anciens sont raccourcis. */
function renderWritten(written: Array<{ title: string; content: string }>): string {
    if (!written.length) return '(aucun : ce chapitre ouvre le livre)';
    const BUDGET = 120_000;
    let total = written.reduce((a, c) => a + c.content.length, 0);
    return written
        .map((c, i) => {
            let body = c.content;
            if (total > BUDGET && i < written.length - 2) {
                total -= body.length - 1500;
                body = `${body.slice(0, 1500)}…`;
            }
            return `### ${c.title}\n${body}`;
        })
        .join('\n\n');
}

/** Premier temps : le plan du livre. */
export async function planBook(sources: Source[], context: LoominaContext): Promise<PlannedChapter[]> {
    const known = new Set(sources.map((s) => s.number));
    // Le plan ne voit que les récits : la mémoire du projet contient des faits
    // que la personne a dits sans les raconter, et le plan en faisait des titres.
    void context;
    const total = sources.reduce((a, s) => a + countWords(s.content), 0);
    const parsed = await json(PLAN_SYSTEM, `# LES RÉCITS (${sources.length} récits, ${total} mots au total)\n${renderSources(sources)}`, 'medium');
    const out: PlannedChapter[] = [];
    for (const item of Array.isArray(parsed.chapters) ? parsed.chapters : []) {
        const c = (item ?? {}) as Record<string, unknown>;
        const title = typeof c.title === 'string' ? c.title.trim().slice(0, 120) : '';
        const scenes = (Array.isArray(c.scenes) ? c.scenes : [])
            .map((s) => {
                const scene = (s ?? {}) as Record<string, unknown>;
                const what = typeof scene.what === 'string' ? scene.what.trim().slice(0, 400) : '';
                const refs = (Array.isArray(scene.sources) ? scene.sources : []).map(Number).filter((n) => known.has(n));
                return what && refs.length ? { what, sources: [...new Set(refs)] } : null;
            })
            .filter((s): s is { what: string; sources: number[] } => s !== null);
        if (!title || !scenes.length) continue;
        out.push({
            title,
            part: typeof c.part === 'string' && c.part.trim() ? c.part.trim().slice(0, 80) : 'Mon histoire',
            summary: typeof c.summary === 'string' ? c.summary.trim().slice(0, 500) : '',
            scenes,
        });
    }
    if (!out.length) throw new Error('Livre : le plan est vide');
    return out;
}

/** Second temps : un chapitre du livre, écrit à partir des seuls récits concernés. */
export async function writeBookChapter(params: {
    chapter: PlannedChapter;
    plan: PlannedChapter[];
    sources: Source[];
    context: LoominaContext;
    sensitiveTopics?: string | null;
    writingStyle?: string | null;
    /** Chapitres du livre déjà écrits, dans l'ordre. */
    written?: Array<{ title: string; content: string }>;
}): Promise<{ title: string; content: string }> {
    const needed = new Set(params.chapter.scenes.flatMap((s) => s.sources));
    const others = params.plan
        .filter((c) => c !== params.chapter)
        .map((c) => `- « ${c.title} » : ${c.scenes.map((s) => s.what).join(' ; ')}`)
        .join('\n');
    const user = `# STYLE DEMANDÉ
${params.writingStyle?.trim() || 'Naturel et sobre'}
${params.sensitiveTopics?.trim() ? `\n# SUJETS QUE LA PERSONNE NE VEUT PAS VOIR DÉVELOPPÉS\n${params.sensitiveTopics.trim()}\nN'en écris rien de plus que ce que les récits en disent, avec retenue.\n` : ''}
# CE QU'ON SAIT DE LA PERSONNE (pour la cohérence des noms et des dates, PAS pour inventer)
${renderContext(params.context)}

# LE CHAPITRE À ÉCRIRE
Partie : ${params.chapter.part}
Titre proposé : ${params.chapter.title}
Propos : ${params.chapter.summary}
Scènes à raconter, dans l'ordre qui te semble le meilleur :
${params.chapter.scenes.map((s) => `- ${s.what} (récits ${s.sources.join(', ')})`).join('\n')}

# CE QUE RACONTENT LES AUTRES CHAPITRES (à ne pas raconter ici)
${others || '(aucun autre chapitre)'}

# LES CHAPITRES DÉJÀ ÉCRITS (ne rien en redire)
${renderWritten(params.written ?? [])}

# LES RÉCITS OÙ SE TROUVE LA MATIÈRE
${renderSources(params.sources.filter((s) => needed.has(s.number)))}`;
    const parsed = await json(WRITE_SYSTEM, user, 'medium');
    const content = typeof parsed.content === 'string' ? parsed.content.trim() : '';
    if (!content) throw new Error(`Livre : chapitre « ${params.chapter.title} » vide`);
    return { title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 120) : params.chapter.title, content };
}

/** Compose le livre entier à partir des récits d'appel. Rien n'est écrit en base ici. */
export async function composeBook(params: {
    sources: Source[];
    context: LoominaContext;
    sensitiveTopics?: string | null;
    writingStyle?: string | null;
    /** Appelé après chaque chapitre écrit (suivi de l'avancement). */
    onChapter?: (done: number, total: number) => void;
}): Promise<BookEdition> {
    const sources = params.sources.filter((s) => s.content.trim());
    if (!sources.length) throw new Error('Livre : aucun récit à composer');
    const plan = await planBook(sources, params.context);

    // L'un après l'autre : chaque chapitre est écrit en ayant sous les yeux
    // ceux qui le précèdent. Écrits en parallèle, ils se répétaient entre eux.
    const written: Array<{ title: string; content: string }> = [];
    for (const chapter of plan) {
        written.push(await writeBookChapter({ chapter, plan, sources, context: params.context, sensitiveTopics: params.sensitiveTopics, writingStyle: params.writingStyle, written }));
        params.onChapter?.(written.length, plan.length);
    }

    const chapters: BookChapter[] = plan.map((c, i) => ({
        number: i + 1,
        title: written[i].title,
        part: c.part,
        content: written[i].content,
        word_count: countWords(written[i].content),
        sources: [...new Set(c.scenes.flatMap((s) => s.sources))].sort((a, b) => a - b),
    }));
    return {
        chapters,
        source_count: sources.length,
        source_words: sources.reduce((a, s) => a + countWords(s.content), 0),
        word_count: chapters.reduce((a, c) => a + c.word_count, 0),
        model: BOOK_MODEL,
        at: new Date().toISOString(),
    };
}

/** Le livre composé, en un seul texte (export, lecture d'une traite). */
export function renderBook(edition: BookEdition): string {
    const lines: string[] = [];
    let part = '';
    for (const c of edition.chapters) {
        if (c.part !== part) {
            part = c.part;
            lines.push(`# ${part}`, '');
        }
        lines.push(`## ${c.title}`, '', c.content, '');
    }
    return lines.join('\n');
}
