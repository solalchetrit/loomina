/**
 * Le livre rangé par périodes de vie.
 *
 * Les chapitres naissent dans l'ordre des appels : un souvenir d'enfance
 * peut arriver après un chapitre sur la retraite. Pour l'impression, on
 * les regroupe en parties (« L'enfance à Roanne », « Les années Lyon »…)
 * dans l'ordre de la vie. Aucun texte n'est réécrit : seuls l'ordre et
 * les titres de parties sont proposés. Le plan est gardé dans
 * `projects.project_metadata.book_plan`.
 */

import OpenAI from 'openai';
import type { LoominaContext } from './context';
import { renderContext } from './context';

export interface BookPart {
    title: string;
    chapters: number[];
}

export interface BookPlan {
    parts: BookPart[];
    /** Nombre de chapitres au moment du plan : sert à dire s'il est à jour. */
    chapter_count: number;
    at: string;
}

const MODEL = 'gpt-5.5';

export async function buildBookPlan(params: {
    chapters: Array<{ chapter_number: number; title: string | null; content_markdown: string | null }>;
    context: LoominaContext;
}): Promise<BookPlan> {
    const numbers = params.chapters.map((c) => c.chapter_number);
    const list = params.chapters
        .map((c) => {
            const excerpt = (c.content_markdown ?? '').replace(/\s+/g, ' ').slice(0, 500);
            return `### ${c.chapter_number}. ${c.title ?? 'Sans titre'}\n${excerpt}`;
        })
        .join('\n\n');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: 90_000 });
    const completion = await client.chat.completions.create({
        model: MODEL,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `Tu prépares le plan d'une autobiographie avant impression. Les chapitres ont été écrits dans l'ordre des entretiens, pas dans l'ordre de la vie.
- Regroupe-les en 2 à 7 parties qui suivent la chronologie de la vie (enfance, jeunesse, vie adulte, aujourd'hui, messages…). Un chapitre de réflexion ou de messages aux proches va à la fin.
- Chaque chapitre apparaît exactement une fois. Dans une partie, range-les dans l'ordre chronologique.
- Titre de partie : court (2 à 6 mots), concret, tiré des chapitres (un lieu, une époque). Aucun fait qui n'y figure pas.
Réponds en JSON : { "parts": [ { "title": "…", "chapters": [3, 1] } ] }`,
            },
            { role: 'user', content: `# MÉMOIRE DU LIVRE\n${renderContext(params.context)}\n\n# CHAPITRES\n${list}` },
        ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '{}') as { parts?: unknown };
    return { parts: sanitizePlan(parsed.parts, numbers), chapter_count: numbers.length, at: new Date().toISOString() };
}

/**
 * Le modèle peut oublier ou doubler un chapitre : on garde chaque chapitre
 * une seule fois, et ceux qui manquent vont dans une dernière partie.
 */
export function sanitizePlan(raw: unknown, numbers: number[]): BookPart[] {
    const known = new Set(numbers);
    const seen = new Set<number>();
    const parts: BookPart[] = [];
    for (const p of Array.isArray(raw) ? raw : []) {
        const part = (p ?? {}) as Record<string, unknown>;
        const title = typeof part.title === 'string' ? part.title.trim().slice(0, 80) : '';
        const chapters = (Array.isArray(part.chapters) ? part.chapters : [])
            .map(Number)
            .filter((n) => known.has(n) && !seen.has(n));
        chapters.forEach((n) => seen.add(n));
        if (title && chapters.length) parts.push({ title, chapters });
    }
    const missing = numbers.filter((n) => !seen.has(n));
    if (missing.length) parts.push({ title: parts.length ? 'Autres souvenirs' : 'Mon histoire', chapters: missing });
    return parts;
}
