/**
 * Ce que Loomina promet, en un seul endroit.
 * Accueil, offre, commande et FAQ lisent ces listes : une promesse modifiée
 * ici change partout, et rien ne peut diverger des CGV par accident.
 */

export const OFFER = {
  name: "Votre biographie, tout compris",
  price: 449,
  currencySymbol: "€",
  delay: "6 à 8 semaines",
  demoMinutes: 3,
  chapters: 14,
};

/** Ce qui est inclus, dans l'ordre où le client le vit. */
export const INCLUDED: { title: string; detail: string }[] = [
  { title: "Les entretiens par téléphone", detail: "autant d’appels qu’il vous faut, quand vous voulez" },
  { title: "Un chapitre écrit après chaque appel", detail: "dans vos mots, à relire et corriger" },
  { title: "Une relecture humaine", detail: "notre équipe relit chaque page avant l’impression" },
  { title: "Vos photos dans le livre", detail: "envoyées par e-mail, nous les plaçons pour vous" },
  { title: "Le livre relié, livré chez vous", detail: "et sa version numérique pour la famille" },
];

export const GUARANTEE =
  "Si le premier entretien ne vous convient pas, nous vous remboursons intégralement (demande sous 7 jours).";
