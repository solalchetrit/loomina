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
  badge: "Livre physique & numérique",
};

export default function OfferPreview() {
  return (
    <section className="relative w-full px-6 py-16" id="offres">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex flex-col gap-3 text-center">
          <p className="inline-flex items-center gap-2 self-center rounded-full bg-white/90 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--loomina-ink)] shadow-sm border border-black/5">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" /> Offre unique Loomina
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Un livre simple, un design cohérent</h2>
          <p className="text-[var(--loomina-muted)] leading-relaxed max-w-3xl mx-auto">
            Une seule offre lisible : mêmes couleurs, boutons sobres, et un parcours clair. Vous savez exactement ce que vous recevez et comment votre récit avance.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-white/90 p-8 shadow-[0_28px_90px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-cloud)] text-xs uppercase tracking-[0.18em] text-[var(--loomina-ink)] font-semibold border border-black/5">
                {offer.badge}
              </div>
              <h3 className="text-3xl font-semibold">{offer.title}</h3>
              <p className="text-[var(--loomina-muted)] leading-relaxed">{offer.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2 self-start rounded-2xl bg-[var(--loomina-cloud)] px-4 py-3 border border-black/5 shadow-sm">
              <span className="text-sm text-[var(--loomina-muted)] line-through">{offer.originalPrice}</span>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-[var(--loomina-amber-strong)]">{offer.price}</p>
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-amber)] text-[var(--loomina-ink)] shadow-sm">
                  Offre de lancement
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--loomina-muted)]">Impression incluse</p>
            </div>
          </div>

          <ul className="grid gap-3 text-[var(--loomina-ink)] md:grid-cols-2">
            {offer.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 rounded-2xl bg-[var(--loomina-cloud)] p-3 border border-black/5">
                <span className="text-[var(--loomina-amber-strong)]">✦</span>
                <span className="text-[var(--loomina-muted)]">{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={offer.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--loomina-amber)] px-6 py-3 font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
            >
              {offer.cta}
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loomina-muted)]">Réponse sous 48h</span>
          </div>
        </div>
      </div>
    </section>
  );
}
