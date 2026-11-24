/**
 * Les chiffres lents de l'admin, gardés quelques minutes (24/11/2026, Solal :
 * « la page admin est très lente »).
 *
 * Chaque ouverture d'Aujourd'hui interrogeait Twilio, OpenAI, Stripe et
 * Google avant d'afficher quoi que ce soit. Ces réponses changent peu : on
 * les garde dans le cache de Next, partagé entre toutes les fonctions du
 * site. Le bouton « Actualiser » de la barre du haut les vide
 * (/api/admin/rafraichir). La base de données, elle, est toujours lue en
 * direct : un appel ou une commande apparaît tout de suite.
 */

import { unstable_cache } from 'next/cache';
import { getSpend, type Period, type Spend } from './spend';
import { realRevenue, type Revenue } from './revenue';
import { getAudience, getSearch, type Audience, type SearchStats } from './audience';
import { callCosts, type CallCost } from './costs';
import { voiceHealth } from './data';

/** L'étiquette commune : la vider relit tout chez les fournisseurs. */
export const FIGURES_TAG = 'admin-chiffres';

// Le cache ne garde que du JSON : on marque les dates et les Map pour les retrouver telles quelles.
function encode(value: unknown): string {
    return JSON.stringify(value, function (this: Record<string, unknown>, key, val) {
        const raw = this[key];
        if (raw instanceof Date) return { __date: raw.toISOString() };
        if (raw instanceof Map) return { __map: [...raw.entries()] };
        return val;
    });
}

function decode<T>(text: string): T {
    return JSON.parse(text, (_key, val) => {
        if (val && typeof val === 'object') {
            if (typeof val.__date === 'string') return new Date(val.__date);
            if (Array.isArray(val.__map)) return new Map(val.__map);
        }
        return val;
    }) as T;
}

/** Une réponse à ne pas garder (un fournisseur n'a pas répondu) : on la rend, sans la mettre en cache. */
class Fresh<T> extends Error {
    constructor(readonly value: T) {
        super('réponse non gardée');
    }
}

/**
 * Garde le résultat de `run` pendant `seconds`. `keep` dit si la réponse
 * mérite d'être gardée : une panne ne doit pas rester affichée dix minutes.
 */
function kept<A extends unknown[], T>(name: string, seconds: number, run: (...args: A) => Promise<T>, keep: (value: T) => boolean = () => true): (...args: A) => Promise<T> {
    const cached = unstable_cache(
        async (...args: A) => {
            const value = await run(...args);
            if (!keep(value)) throw new Fresh(value);
            return encode(value);
        },
        ['admin', name],
        { revalidate: seconds, tags: [FIGURES_TAG] },
    );
    return async (...args: A) => {
        try {
            return decode<T>(await cached(...args));
        } catch (err) {
            if (err instanceof Fresh) return err.value as T;
            throw err;
        }
    };
}

/** Les dépenses du mois : factures Twilio, OpenAI et Stripe, coût de chaque appel. Dix minutes. */
export const getSpendKept: (period: Period) => Promise<Spend> = kept('depenses', 600, getSpend, (s) => s.errors.length === 0);

/** Le chiffre d'affaires lu dans Stripe. Dix minutes ; une nouvelle commande change la clé, donc se voit tout de suite. */
const revenueKept = kept(
    'recettes',
    600,
    (ids: string[], start: string | null, end: string | null) => realRevenue(ids, start && end ? { start: new Date(start), end: new Date(end) } : undefined),
    (r) => r !== null,
);
export function realRevenueKept(sessionIds: string[], range?: { start: Date; end: Date }): Promise<Revenue | null> {
    return revenueKept([...sessionIds].sort(), range ? range.start.toISOString() : null, range ? range.end.toISOString() : null);
}

/** Google Analytics et Search Console : leurs chiffres ont de toute façon plusieurs heures de retard. Trente minutes. */
export const getAudienceKept: (days?: number) => Promise<Audience> = kept('audience', 1800, (days: number = 28) => getAudience(days));
export const getSearchKept: (days?: number) => Promise<SearchStats> = kept('recherche', 1800, (days: number = 28) => getSearch(days));

/** L'état du serveur vocal, demandé sur chaque page par la colonne : trente secondes. */
export const voiceHealthKept = kept('serveur-vocal', 30, voiceHealth, (v) => v.ok);

/**
 * Le coût de chaque appel d'un client (un aller-retour chez Twilio par
 * appel). Dix minutes ; la clé contient les appels et leur état, donc un
 * nouvel appel ou une nouvelle écoute recalcule tout de suite.
 */
const costsKept = kept('couts-appels', 600, (interviews: Parameters<typeof callCosts>[0], phone: string | null, projectId: string | null, stamp: string) => (void stamp, callCosts(interviews, { phone, projectId })));
export function callCostsKept(interviews: Parameters<typeof callCosts>[0], detail: { phone: string | null; projectId: string | null }, stamp: string): Promise<Map<string, CallCost>> {
    // On ne passe au cache que ce dont le calcul a besoin : pas les transcripts.
    const light = interviews.map((i) => {
        const log = i.ai_analysis_log as { usage?: unknown } | null | undefined;
        return { id: i.id, created_at: i.created_at, duration_seconds: i.duration_seconds, call_event_id: i.call_event_id, ai_analysis_log: log ? { usage: log.usage ?? null } : null };
    });
    return costsKept(light, detail.phone, detail.projectId, stamp);
}
