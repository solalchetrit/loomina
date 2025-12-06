import Link from "next/link";

const offer = {
  title: "Édition Signature",
  price: "222 €",
  originalPrice: "279 €",
  description:
    "Une édition unique pour vos souvenirs : entretiens guidés, mise en page soignée et exemplaires prêts à offrir.",
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
      className="relative w-full bg-white text-[var(--loomina-black)] py-16 px-6 border-y border-[var(--loomina-black)]/5"
      id="offres"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col gap-3 text-center">
          <p className="inline-flex items-center gap-2 self-center rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--loomina-black)] shadow-[0_10px_40px_-32px_rgba(0,0,0,0.35)]">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" /> Offre unique
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Un livre simple et précieux</h2>
          <p className="text-[var(--loomina-gray-dark)] leading-relaxed max-w-3xl mx-auto">
            Une seule édition claire : on vous accompagne, on enregistre, on met en page et on imprime. Vous recevez un ouvrage prêt à transmettre.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[var(--loomina-black)]/10 bg-white p-8 flex flex-col gap-6 shadow-[0_26px_80px_-60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] text-xs uppercase tracking-[0.16em] text-[var(--loomina-black)] font-semibold">
                {offer.badge}
              </div>
              <h3 className="text-3xl font-semibold">{offer.title}</h3>
              <p className="text-[var(--loomina-gray-dark)] leading-relaxed">{offer.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2 self-start rounded-2xl bg-[var(--loomina-gray-light)] px-4 py-3 border border-[var(--loomina-black)]/5 shadow-[0_14px_45px_-32px_rgba(0,0,0,0.35)]">
              <span className="text-sm text-[var(--loomina-black)]/60 line-through">{offer.originalPrice}</span>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-[var(--loomina-gold)]">{offer.price}</p>
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] shadow-md">
                  Offre de lancement
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--loomina-black)]/70">Impression incluse</p>
            </div>
          </div>

          <ul className="grid gap-3 text-[var(--loomina-black)] md:grid-cols-2">
            {offer.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 rounded-2xl bg-[var(--loomina-gray-light)]/60 p-3 border border-[var(--loomina-black)]/5">
                <span className="text-[var(--loomina-gold)]">✦</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={offer.href}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] font-semibold hover:brightness-110 transition-shadow shadow-md"
            >
              {offer.cta}
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loomina-gray-dark)]">Réponse sous 48h</span>
          </div>
        </div>
      </div>
    </section>
  );
}
