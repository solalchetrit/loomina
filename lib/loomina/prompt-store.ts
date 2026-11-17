/**
 * Les prompts modifiés depuis l'admin (demande de Solal, 17/11/2026).
 *
 * Le texte d'origine de chaque prompt vit dans le code. L'admin peut le
 * réécrire en entier : la nouvelle version est gardée dans la table
 * `prompt_overrides` et prend la place de l'original partout. « Revenir
 * au texte d'origine » supprime la ligne.
 *
 * Fonctionnement : les points d'entrée (début d'un appel, traitement d'un
 * appel, composition du livre…) appellent `refreshPrompts()`, qui relit
 * la table au plus une fois par minute. Le reste du code lit ensuite la
 * version en mémoire avec `promptText(clé, original)`, sans attendre.
 * Une base injoignable ne bloque rien : on garde la dernière version lue,
 * ou les textes d'origine.
 */

import { db } from './db';

const TTL_MS = 60_000;
let cache: Record<string, string> = {};
let loadedAt = 0;
let loading: Promise<void> | null = null;

/** Le texte en vigueur : la version de l'admin si elle existe, sinon l'original. */
export function promptText(key: string, original: string): string {
    const edited = cache[key];
    return edited && edited.trim() ? edited : original;
}

/** Relit les versions de l'admin si la dernière lecture a plus d'une minute. */
export async function refreshPrompts(force = false): Promise<void> {
    if (!force && Date.now() - loadedAt < TTL_MS) return;
    loading ??= (async () => {
        try {
            const { data, error } = await db().from('prompt_overrides').select('key, content');
            if (error) throw new Error(error.message);
            const next: Record<string, string> = {};
            for (const row of data ?? []) if (typeof row.key === 'string' && typeof row.content === 'string') next[row.key] = row.content;
            cache = next;
        } catch (err) {
            console.warn('[prompts] lecture des versions de l’admin impossible :', err instanceof Error ? err.message : String(err));
        } finally {
            loadedAt = Date.now();
            loading = null;
        }
    })();
    await loading;
}

/** Les clés réécrites dans l'admin (pour l'affichage). */
export function editedKeys(): Set<string> {
    return new Set(Object.keys(cache).filter((k) => cache[k]?.trim()));
}

/** Les variables `{{…}}` d'un texte. */
export function templateVars(text: string): string[] {
    return [...new Set([...text.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/g)].map((m) => m[1]))].sort();
}

/**
 * Ce qu'un texte réécrit doit garder de l'original : ses variables `{{…}}`
 * et, s'il y en a, ses marqueurs techniques (fin d'appel, format JSON).
 * Renvoie la liste de ce qui manque (vide = le texte est acceptable).
 */
export function missingFromEdit(original: string, edited: string): string[] {
    const missing = templateVars(original).filter((v) => !templateVars(edited).includes(v)).map((v) => `{{${v}}}`);
    for (const marker of ['##END_CALL##']) if (original.includes(marker) && !edited.includes(marker)) missing.push(marker);
    if (/\bJSON\b/.test(original) && !/\bJSON\b/.test(edited)) missing.push('la consigne de réponse en JSON');
    return missing;
}

export async function savePrompt(key: string, content: string): Promise<void> {
    const { error } = await db().from('prompt_overrides').upsert({ key, content, updated_at: new Date().toISOString() });
    if (error) throw new Error(`Enregistrement du prompt impossible : ${error.message}`);
    await refreshPrompts(true);
}

export async function resetPrompt(key: string): Promise<void> {
    const { error } = await db().from('prompt_overrides').delete().eq('key', key);
    if (error) throw new Error(`Retour au texte d'origine impossible : ${error.message}`);
    await refreshPrompts(true);
}
