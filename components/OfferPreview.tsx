import Link from "next/link";

const offer = {
  title: "Édition Signature",
  price: "222 €",
  originalPrice: "279 €",
  description:
    "Un ouvrage d'art relié, conçu pour traverser le temps. L'expérience complète : de l'entretien guidé à l'impression de vos mémoires.",
  highlights: [
    "5 exemplaires imprimés inclus (Papier Premium)",
    "Accompagnement éditorial humain complet",
    "Mise en page artistique & insertion photos",
    "Version numérique du livre offerte (PDF)",
  ],
  cta: "Préparer mon livre",
  href: "/offres",
  badge: "Livre Physique",
};

export default function OfferPreview() {
  return (
    <section
      className="w-full bg-[var(--loomina-black)] text-[var(--loomina-gray-light)] py-20 px-6 border-y border-[var(--loomina-gray-light)]/10"
      id="offres"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Offre unique</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight mt-2">Le livre qui traverse le temps</h2>
          </div>
          <p className="text-[var(--loomina-gray-light)] max-w-xl leading-relaxed">
            Une seule édition premium, centrée sur le livre relié : accompagnement humain, mise en page artistique et
            exemplaires imprimés pour partager votre héritage.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--loomina-gray-light)]/30 bg-[var(--loomina-gray-light)] p-8 flex flex-col gap-6 shadow-lg ring-1 ring-[var(--loomina-gold)]/60">
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] border border-[var(--loomina-black)]/10 text-xs uppercase tracking-[0.16em] text-[var(--loomina-black)] font-semibold">
                  {offer.badge}
                </div>
                <h3 className="text-3xl font-semibold text-[var(--loomina-black)]">{offer.title}</h3>
                <p className="text-[var(--loomina-black)]/80 max-w-xl leading-relaxed">{offer.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-sm text-[var(--loomina-black)]/60 line-through">{offer.originalPrice}</span>
                <div className="flex items-center gap-3">
                  <p className="text-5xl font-bold text-[var(--loomina-gold)]">{offer.price}</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] shadow-md">
                    Offre de lancement
                  </span>
                </div>
              </div>
            </div>

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
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] font-semibold hover:brightness-110 transition-shadow shadow-md"
              >
                {offer.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
