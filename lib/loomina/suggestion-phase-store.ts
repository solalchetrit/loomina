import OpenAI from 'openai';
import { db } from './db';
import { PHASE_AXES } from './phase-plan';
import { isPhase, type Phase } from './phases';
import { withSuggestionPhase } from './suggestion-phase';

/**
 * Le rangement d'un sujet suggéré dans sa période de vie, côté serveur du site
 * (le serveur vocal n'en a pas besoin : il lit seulement le résultat).
 * Voir lib/loomina/suggestion-phase.ts.
 */

export const SUGGESTION_PHASE_MODEL = 'gpt-4.1-mini';
const PERIODS: Record<Phase, string> = {
    1: "Vue d'ensemble : l'identité, la naissance, les grandes lignes d'une vie (questions générales que l'on pose dès le premier appel)",
    2: "Racines et jeunesse : la famille d'origine, les parents et grands-parents, l'enfance, l'école, l'adolescence, le départ de la maison",
    3: "Vie adulte : le métier, la rencontre amoureuse, le mariage ou la vie à deux, les enfants, les maisons, les amis, les passions, les voyages, les épreuves, la retraite",
    4: "Regard sur la vie : le caractère, les leçons, les valeurs, les petits-enfants, les messages aux proches, la vie d'aujourd'hui, le livre lui-même",
};

function system(): string {
    return [
        "Tu ranges une question ou un souvenir, proposé par un proche pour une biographie, dans la période de vie qu'il concerne.",
        'Les quatre périodes, dans l\'ordre du livre :',
        ...([1, 2, 3, 4] as Phase[]).map((p) => `${p}. ${PERIODS[p]}. Sujets : ${PHASE_AXES[p].map((a) => a.label.split(/[:(]/)[0].trim()).join(' ; ')}.`),
        "Règles : une rencontre amoureuse, un mariage, un métier ou la naissance d'un enfant vont en 3. Les grands-parents, les parents, l'enfance vont en 2. Un message, une leçon de vie, les petits-enfants vont en 4. En cas de doute entre deux périodes, choisis la plus tardive.",
        'Réponds en JSON : {"phase": 1|2|3|4}.',
    ].join('\n');
}

let client: OpenAI | null = null;

/** La phase du sujet, ou null si le modèle ne répond pas (le sujet n'est alors pas bloqué). */
export async function classifySuggestion(topic: string): Promise<Phase | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !topic.trim()) return null;
    try {
        client ??= new OpenAI({ apiKey, maxRetries: 1 });
        const res = await client.chat.completions.create(
            {
                model: SUGGESTION_PHASE_MODEL,
                temperature: 0,
                max_tokens: 20,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: system() },
                    { role: 'user', content: topic.slice(0, 400) },
                ],
            },
            { timeout: 8000 }
        );
        const phase = Number((JSON.parse(res.choices[0]?.message?.content ?? '{}') as { phase?: unknown }).phase);
        return isPhase(phase) ? phase : null;
    } catch (err) {
        console.warn('[suggestion-phase] rangement impossible :', err instanceof Error ? err.message : err);
        return null;
    }
}

/**
 * Range le sujet et l'écrit dans `project_metadata.suggestion_phases`, relu
 * juste avant l'écriture. N'empêche jamais l'ajout du sujet : en cas d'échec,
 * le sujet reste simplement sans période.
 */
export async function rememberSuggestionPhase(projectId: string, topic: string, pending: string[]): Promise<void> {
    try {
        const phase = await classifySuggestion(topic);
        if (!phase) return;
        const { data, error } = await db().from('projects').select('project_metadata').eq('id', projectId).single();
        if (error) throw new Error(error.message);
        const meta = withSuggestionPhase(data.project_metadata as Record<string, unknown> | null, topic, phase, pending);
        const { error: upErr } = await db().from('projects').update({ project_metadata: meta }).eq('id', projectId);
        if (upErr) throw new Error(upErr.message);
    } catch (err) {
        console.warn('[suggestion-phase] rangement non enregistré :', err instanceof Error ? err.message : err);
    }
}
