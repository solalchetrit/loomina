import Link from "next/link";

const offers = [
  {
    title: "Écho Numérique",
    price: "118 €",
    description:
      "Un jumeau mémoriel vivant, prêt à recueillir vos souvenirs et à les partager en privé avec vos proches.",
    highlights: [
      "Relances personnalisées par l'IA + relecture d'un éditeur",
      "Espace sécurisé pour inviter la famille",
      "Synthèse mensuelle pour suivre l'avancée",
    ],
    cta: "Voir le détail",
    href: "/offres",
    badge: "Numérique",
  },
  {
    title: "Héritage Complet",
    price: "248 €",
    description:
      "Un livre relié accompagné du jumeau numérique. Mise en page artistique, photos et relectures illimitées.",
    highlights: [
      "Direction éditoriale et validations à chaque chapitre",
      "5 exemplaires inclus + impressions à la demande",
      "Coffret numérique pour continuer à échanger",
    ],
    cta: "Préparer mon livre",
    href: "/offres",
    badge: "Livre + IA",
    featured: true,
  },
];

export default function OfferPreview() {
  return (
    <section className="w-full bg-[var(--loomina-black)] text-[var(--loomina-gray-light)] py-20 px-6 border-y border-[var(--loomina-gray-light)]/10">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Avant-goût des offres</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight mt-2">
              Choisissez le format qui vous ressemble
            </h2>
          </div>
          <p className="text-[var(--loomina-gray-light)] max-w-xl leading-relaxed">
            Deux formules, la même promesse : une histoire fidèle, relue par un humain et protégée dans le temps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className={`relative overflow-hidden rounded-3xl border border-[var(--loomina-gray-light)]/30 bg-[var(--loomina-gray-light)] p-8 flex flex-col gap-5 shadow-lg transition-transform duration-300 hover:-translate-y-1 ${
                offer.featured ? "ring-1 ring-[var(--loomina-gold)]/60" : ""
              }`}
            >
              <div className="relative flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] border border-[var(--loomina-black)]/10 text-xs uppercase tracking-[0.16em] text-[var(--loomina-black)] font-semibold">
                    {offer.badge}
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--loomina-black)]">{offer.title}</h3>
                  <p className="text-4xl font-bold text-[var(--loomina-gold)]">{offer.price}</p>
                </div>
                {offer.featured && (
                  <span className="relative inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] shadow-md">
                    Recommandé
                  </span>
                )}
              </div>

              <p className="relative text-[var(--loomina-black)] leading-relaxed">{offer.description}</p>

              <ul className="relative space-y-3 text-[var(--loomina-black)]">
                {offer.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="text-[var(--loomina-gold)]">✦</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <div className="relative pt-2">
                <Link
                  href={offer.href}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] font-semibold hover:brightness-110 transition-shadow shadow-md"
                >
                  {offer.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
