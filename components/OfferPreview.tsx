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
      className="relative w-full overflow-hidden bg-[var(--loomina-black)] text-[var(--loomina-gray-light)] py-20 px-6 border-y border-[var(--loomina-gray-light)]/10"
      id="offres"
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-[var(--loomina-gold)]/20 blur-3xl" />
        <div className="absolute -right-16 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-40 w-[110%] -translate-x-1/2 bg-gradient-to-t from-black via-transparent" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" />Offre unique
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Le livre qui traverse le temps</h2>
            <p className="text-[var(--loomina-gray-light)]/90 leading-relaxed">
              Une seule édition premium, centrée sur le livre relié : accompagnement humain, mise en page artistique et
              exemplaires imprimés pour partager votre héritage.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--loomina-black)]">
              {["Récit fidèle", "Maquette artistique", "Livraison soignée"].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--loomina-gray-light)]/90 px-3 py-1 text-[var(--loomina-black)] shadow-[0_14px_45px_-32px_rgba(0,0,0,0.45)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-gold)]" />
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--loomina-gray-light)] border border-white/10 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.45)]">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" />
            Accompagnement sur-mesure avec équipe dédiée
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--loomina-gray-light)]/30 bg-[var(--loomina-gray-light)] p-8 flex flex-col gap-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.65)] ring-1 ring-[var(--loomina-gold)]/60">
            <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-[var(--loomina-black)]/15 to-transparent" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] border border-[var(--loomina-black)]/10 text-xs uppercase tracking-[0.16em] text-[var(--loomina-black)] font-semibold">
                  {offer.badge}
                </div>
                <h3 className="text-3xl font-semibold text-[var(--loomina-black)]">{offer.title}</h3>
                <p className="text-[var(--loomina-black)]/80 max-w-xl leading-relaxed">{offer.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right bg-white/70 px-4 py-3 rounded-2xl border border-[var(--loomina-black)]/5 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.45)]">
                <span className="text-sm text-[var(--loomina-black)]/60 line-through">{offer.originalPrice}</span>
                <div className="flex items-center gap-3">
                  <p className="text-5xl font-bold text-[var(--loomina-gold)] drop-shadow">{offer.price}</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] shadow-md">
                    Offre de lancement
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--loomina-black)]/70">
                  Impression et mise en page incluses
                </p>
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

            <div className="relative pt-4 flex flex-wrap items-center gap-3">
              <Link
                href={offer.href}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] font-semibold hover:brightness-110 transition-shadow shadow-md"
              >
                {offer.cta}
              </Link>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loomina-black)]/70">Réponse sous 48h</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
