/**
 * Les jetons consommés par un appel au modèle, pour suivre ce que coûte
 * chaque appel téléphonique (demande de Solal, 17/11/2026). Rangés dans
 * `interviews.ai_analysis_log.usage`, lus par l'admin (lib/admin/costs.ts).
 */

export interface TokenUsage {
    model: string;
    /** Jetons envoyés au modèle, dont ceux déjà en cache (moins chers). */
    input: number;
    cached: number;
    /** Jetons produits, réflexion comprise. */
    output: number;
}

interface RawUsage {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_tokens_details?: { cached_tokens?: number } | null;
}

export function tokenUsage(model: string, usage: RawUsage | null | undefined): TokenUsage | undefined {
    if (!usage) return undefined;
    return {
        model,
        input: usage.prompt_tokens ?? 0,
        cached: usage.prompt_tokens_details?.cached_tokens ?? 0,
        output: usage.completion_tokens ?? 0,
    };
}
