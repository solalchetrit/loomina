/**
 * Les clients de test (demande de Solal, 20/11/2026).
 *
 * Un livre est « de test » quand `project_metadata.test === true` (bouton
 * « Client de test » de l'admin, ou commande payée 0 € avec un code promo
 * à 100 %, classée toute seule par le webhook Stripe). `banc` désigne les
 * profils créés par le banc d'essai des appels simulés.
 *
 * Un client de test reste visible dans l'admin (rangé à part) mais ne
 * compte dans aucun chiffre : clients, commandes, chiffre d'affaires,
 * parcours, moyennes.
 */
export function isTestMeta(meta: Record<string, unknown> | null | undefined): boolean {
    return meta?.test === true || meta?.test === 'true' || meta?.banc === true;
}
