/**
 * Ce que Loomina promet, en un seul endroit.
 * Accueil, offre, commande, FAQ et pied de page lisent ces constantes : une
 * promesse modifiée ici change partout, et rien ne peut diverger des CGV.
 * Tout ce qui est écrit ici figure aussi dans les CGV (app/cgv/page.tsx).
 */

export const OFFER = {
  name: "Votre livre de vie, tout compris",
  price: 449,
  currencySymbol: "€",
  /** Du premier appel au livre validé, en général. */
  delay: "6 à 8 semaines",
  /** Impression et acheminement une fois le livre validé. */
  printDelay: "2 à 3 semaines",
  demoMinutes: 3,
  /** Thèmes proposés au fil des appels, de l'enfance à aujourd'hui. */
  chapters: 14,
  format: "15 × 23 cm, couverture rigide",
  digital: "PDF et EPUB",
  delivery: "France métropolitaine, livraison incluse",
  /** Garantie : remboursement intégral si demandé sous 7 jours après le premier appel. */
  guaranteeDays: 7,
  /** Droit de rétractation légal. */
  withdrawalDays: 14,
};

/** Ce qui est inclus, dans l'ordre où le client le vit. */
export const INCLUDED: { title: string; detail: string }[] = [
  { title: "Les entretiens par téléphone", detail: "autant d’appels qu’il vous faut, quand vous voulez" },
  { title: "Un chapitre écrit après chaque appel", detail: "dans vos mots, à relire et corriger" },
  { title: "Une relecture humaine", detail: "notre équipe relit chaque page avant l’impression" },
  { title: "Vos photos dans le livre", detail: "envoyées par e-mail, nous les plaçons pour vous" },
  { title: "Le livre relié, livré chez vous", detail: `${OFFER.format}, avec sa version ${OFFER.digital} pour la famille` },
];

export const GUARANTEE = `Si le premier entretien ne vous convient pas, nous vous remboursons intégralement, sur simple demande dans les ${OFFER.guaranteeDays} jours qui suivent.`;

/** Les 14 thèmes proposés au fil des appels. Des points de départ, pas un questionnaire. */
export const THEMES: { title: string; desc: string }[] = [
  { title: "L’enfance", desc: "Les premiers souvenirs, la maison, l’école, les vacances." },
  { title: "L’adolescence", desc: "Les amitiés, les premières libertés, les grands moments." },
  { title: "Les premiers amours", desc: "Les rencontres et ce qu’elles ont appris." },
  { title: "Les études, la formation", desc: "Les années d’apprentissage, les maîtres, la voie choisie." },
  { title: "Les premiers emplois", desc: "Les débuts, les difficultés, les réussites." },
  { title: "Les rencontres marquantes", desc: "Les personnes qui ont compté." },
  { title: "La famille", desc: "Le couple, les enfants, le foyer construit." },
  { title: "La carrière", desc: "Les évolutions, les fiertés, l’œuvre d’une vie." },
  { title: "Les voyages", desc: "Les lieux, les aventures, les cultures découvertes." },
  { title: "Les épreuves", desc: "Les moments difficiles et comment ils ont été traversés." },
  { title: "Les passions", desc: "Ce qui fait vibrer au quotidien." },
  { title: "Les leçons", desc: "Ce que la vie a appris de plus précieux." },
  { title: "La transmission", desc: "Ce que l’on souhaite laisser aux siens." },
  { title: "Les projets", desc: "Ce qu’il reste à accomplir." },
];
