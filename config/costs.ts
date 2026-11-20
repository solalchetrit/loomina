/**
 * Grille de prix pour estimer ce que coûte un appel à Loomina.
 *
 * Tarifs publics relevés le 17/11/2026, en dollars hors taxes. À corriger
 * ici quand un fournisseur change ses prix : l'admin recalcule tout seul.
 * Le prix de la ligne téléphonique, lui, est lu directement chez Twilio
 * appel par appel (prix réel) ; la valeur ci-dessous ne sert que de repli.
 */
export const COSTS = {
    /** Dollar → euro. */
    usdToEur: 0.92,
    /** TVA française, pour afficher un montant TTC. */
    vat: 0.2,
    /** Prix par million de jetons : entrée, entrée en cache, sortie. */
    models: {
        'gpt-4.1': { input: 2, cached: 0.5, output: 8 },
        'gpt-4o': { input: 2.5, cached: 1.25, output: 10 },
        'gpt-5.5': { input: 5, cached: 0.5, output: 30 },
    } as Record<string, { input: number; cached: number; output: number }>,
    /** Modèle supposé quand le journal ne le dit pas. */
    defaultVoiceModel: 'gpt-4.1',
    defaultWritingModel: 'gpt-5.5',
    /** Twilio ConversationRelay (écoute + voix de synthèse), par minute d'appel. */
    conversationRelayPerMinute: 0.07,
    /** Enregistrement audio de l'appel chez Twilio, par minute entamée (0,005 $ constaté pour 97 s le 18/11/2026). */
    recordingPerMinute: 0.0025,
    /** Repli si Twilio ne donne pas le prix de la ligne : par minute. */
    lineFallbackPerMinute: 0.01,
    /**
     * Repli pour les appels traités avant le suivi des jetons (17/11/2026) :
     * coût moyen de l'analyse et de l'écriture d'un récit.
     */
    writingFallbackPerCall: 0.25,
    /**
     * Repli pour l'IA de la conversation d'une démo d'avant le suivi des
     * jetons (20/11/2026), par minute d'appel.
     */
    conversationFallbackPerMinute: 0.02,
    /**
     * Repli pour une composition automatique du livre (plan, chapitres, passe
     * finale), tant que la clé d'administration OpenAI n'est pas posée.
     */
    compositionFallbackPerEdition: 0.6,
    /**
     * Les abonnements fixes de Loomina, par mois, dans leur devise. `null` :
     * montant à renseigner. Relevés le 20/11/2026 : Supabase est sur l'offre
     * gratuite, Render sur Starter. Le numéro Twilio est déjà dans la facture
     * Twilio lue en direct.
     */
    subscriptions: [
        { name: 'Render, serveur vocal (Starter)', amount: 7, currency: 'USD' },
        { name: 'Vercel, le site', amount: 0, currency: 'USD', note: 'offre Hobby à confirmer' },
        { name: 'Supabase, la base', amount: 0, currency: 'USD', note: 'offre gratuite' },
        { name: 'o2switch, les e-mails', amount: null, currency: 'EUR' },
        { name: 'Nom de domaine loomina.eu', amount: null, currency: 'EUR' },
    ] as Array<{ name: string; amount: number | null; currency: 'USD' | 'EUR'; note?: string }>,
};
