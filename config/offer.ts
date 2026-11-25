/**
 * Ce que Loomina promet, en un seul endroit.
 * Accueil, offre, commande, FAQ et pied de page lisent ces constantes : une
 * promesse modifiée ici change partout, et rien ne peut diverger des CGV.
 * Tout ce qui est écrit ici figure aussi dans les CGV (app/cgv/page.tsx).
 */

/**
 * Site vitrine avant le lancement (Solal, 25/11/2026) : aucun prix affiché,
 * le prix est fixé juste avant l'ouverture. Passer à true le jour du lancement,
 * après avoir mis le bon montant dans OFFER.price.
 */
export const SHOW_PRICE = false;

/** Le lien vers /offre, dans le menu et le pied de page. */
export const OFFER_PAGE_LABEL = SHOW_PRICE ? "Le livre et le prix" : "Le livre";

export const OFFER = {
  name: "Votre livre de vie, tout compris",
  price: 449,
  currencySymbol: "€",
  /** Du premier appel au livre validé, en général. */
  delay: "6 à 8 semaines",
  /** Impression et acheminement une fois le livre validé. */
  printDelay: "2 à 3 semaines",
  demoMinutes: 5,
  /** Thèmes proposés au fil des appels, de l'enfance à aujourd'hui. */
  chapters: 14,
  /** Le format du PDF d'impression (lib/loomina/book-pdf.ts) : A5. */
  format: "14,8 × 21 cm, couverture rigide",
  /** Solal, 19/11/2026 : seulement le PDF, l'EPUB n'existe pas. */
  digital: "PDF",
  delivery: "France métropolitaine, livraison incluse",
  /** Garantie : remboursement intégral si demandé sous 7 jours après le premier appel. */
  guaranteeDays: 7,
  /** Droit de rétractation légal. */
  withdrawalDays: 14,
};

/**
 * Les exemplaires en plus du livre de l'auteur, pour la famille
 * (Solal, 24/11/2026 : 25 € pièce, « on verra pour changer le prix par la suite »).
 * Le prix se change ici seulement : commande, espace famille et Stripe le lisent.
 * Même livre, même format ; imprimés et envoyés avec le livre de l'auteur.
 */
export const EXTRA_COPY = {
  price: 25,
  /** Au plus, par commande. */
  max: 20,
};

/** « 1 exemplaire en plus », « 3 exemplaires en plus ». */
export function extraCopiesLabel(n: number): string {
  return `${n} exemplaire${n > 1 ? "s" : ""} en plus`;
}

/** Un nombre d'exemplaires reçu d'un formulaire ou de Stripe, ramené entre 0 et le maximum. */
export function normalizeExtraCopies(raw: unknown): number {
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? Math.min(EXTRA_COPY.max, Math.max(0, Math.floor(n))) : 0;
}

/**
 * La réduction offerte dans l'e-mail du récit de démonstration : un code
 * personnel, utilisable une fois, créé dans Stripe sur ce coupon.
 * Le coupon est créé une fois dans Stripe avec cet identifiant.
 */
export const DEMO_PROMO = {
  couponId: "loomina-recit-demo-10",
  /** Réduction en pourcentage (Solal, 18/11/2026 : 10 %). */
  percentOff: 10,
  days: 14,
};

/** Ce qui est inclus, dans l'ordre où le client le vit. */
export const INCLUDED: { title: string; detail: string }[] = [
  { title: "Les entretiens par téléphone", detail: "autant d’appels qu’il vous faut, quand vous voulez" },
  { title: "Le récit de chaque appel", detail: "dans vos mots, à relire et corriger" },
  { title: "Une relecture humaine", detail: "notre équipe relit votre livre avant l’impression" },
  { title: "Vos photos dans le livre", detail: "ajoutées dans votre espace auteur ou envoyées par e-mail, nous les plaçons pour vous" },
  { title: "Le livre imprimé, livré chez vous", detail: `${OFFER.format}, avec sa version ${OFFER.digital}` },
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

/**
 * Ouverture des commandes (Solal, 25/11/2026 : le site reste une vitrine
 * jusqu'au lancement du 1er décembre). Avant cette date, la page de commande
 * annonce l'ouverture et l'API de paiement refuse toute nouvelle commande.
 * Le jour venu, tout s'ouvre tout seul, sans redéploiement.
 */
export const LAUNCH = {
  opensAt: "2026-12-01T00:00:00+01:00",
  label: "mardi 1er décembre",
};

export function isOrderOpen(now: number = Date.now()): boolean {
  return now >= new Date(LAUNCH.opensAt).getTime();
}
