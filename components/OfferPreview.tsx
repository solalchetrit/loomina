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
    <section className="w-full bg-[#0a1224] py-20 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Avant-goût des offres</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight mt-2">
              Choisissez le format qui vous ressemble
            </h2>
          </div>
          <p className="text-[var(--loomina-text-light)] max-w-xl leading-relaxed">
            Deux formules, la même promesse : une histoire fidèle, relue par un humain et protégée dans le temps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.title}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 flex flex-col gap-5 shadow-[0_30px_80px_-60px_rgba(34,211,238,0.75)] transition-transform duration-300 hover:-translate-y-1 ${
                offer.featured ? "ring-1 ring-[var(--loomina-gold)]/50" : ""
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(124,58,237,0.12),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.12),transparent_50%)]" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs uppercase tracking-[0.16em] text-[var(--loomina-gold-light)] font-semibold">
                    {offer.badge}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{offer.title}</h3>
                  <p className="text-4xl font-bold text-[var(--loomina-gold)]">{offer.price}</p>
                </div>
                {offer.featured && (
                  <span className="relative inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] rounded-full bg-[var(--loomina-gold)] text-[#051226] shadow-[0_10px_30px_-20px_rgba(34,211,238,0.9)]">
                    Recommandé
                  </span>
                )}
              </div>

              <p className="relative text-[var(--loomina-text-light)] leading-relaxed">{offer.description}</p>

              <ul className="relative space-y-3 text-white/90">
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
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-gold)] text-[#051226] font-semibold hover:brightness-110 transition-shadow shadow-[0_16px_50px_-35px_rgba(34,211,238,0.9)]"
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
