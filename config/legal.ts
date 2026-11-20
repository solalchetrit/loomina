/**
 * Qui vend Loomina, en un seul endroit : mentions légales, CGV et
 * confidentialité lisent ces constantes.
 * Solal, 20/11/2026 : au début, Loomina est porté par son entreprise
 * individuelle (fiche annuaire-entreprises.data.gouv.fr, SIREN 987 711 884).
 */
export const SELLER = {
  /** Dénomination au RNE. */
  name: "Solal Chetrit (Sotchee)",
  brand: "Loomina",
  form: "entrepreneur individuel (EI)",
  siren: "987 711 884",
  siret: "987 711 884 00013",
  registry: "immatriculé au Registre national des entreprises (RNE) le 18 mars 2024",
  address: "10 rue Talma, 75016 Paris, France",
  email: "contact@loomina.eu",
  /** Solal, 20/11/2026 : son portable pour l’instant. null = non affiché. */
  phone: "07 81 31 12 98" as string | null,
  /** Pas de numéro de TVA : franchise en base. */
  vat: "TVA non applicable, article 293 B du Code général des impôts",
  director: "Solal Chetrit",
  /**
   * Médiateur de la consommation : obligatoire (art. L612-1 du Code de la
   * consommation). Solal, 20/11/2026 : pas encore de médiateur, rien n’est affiché
   * tant que c’est null. À remplir dès qu’il a adhéré.
   */
  mediator: null as { name: string; address: string; website: string } | null,
};

/** « Loomina, marque de Solal Chetrit (Sotchee), entrepreneur individuel… », pour les textes légaux. */
export const SELLER_LINE = `${SELLER.brand}, marque exploitée par ${SELLER.name}, ${SELLER.form}, SIRET ${SELLER.siret}, ${SELLER.address}`;
