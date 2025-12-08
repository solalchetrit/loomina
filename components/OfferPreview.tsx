import MagicButton from "./ui/MagicButton";
import Reveal from "./ui/Reveal";

const offer = {
  title: "Lumina, livre & numérique",
  price: "222 €",
  originalPrice: "279 €",
  description:
    "Une formule unique : interviews guidés, réécriture attentive et maquette élégante. Nous livrons un livre relié et sa version numérique prête à partager.",
  highlights: [
    "5 exemplaires imprimés inclus (papier premium)",
    "Co-écriture et relectures illimitées avec l'équipe Loomina",
    "Mise en page lumineuse avec vos photos retouchées",
    "Version numérique protégée et prête à envoyer",
  ],
  cta: "Préparer mon livre Lumina",
  href: "/offres",
  badge: "Offre unique",
};

export default function OfferPreview() {
  return (
    <section className="relative w-full px-6 py-24" id="offres">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(234,191,119,0.06),transparent_35%)]" aria-hidden />
      <div className="mx-auto max-w-5xl space-y-12 relative">
        <div className="flex flex-col gap-4 text-center">
          <p className="inline-flex items-center gap-2 self-center rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm border border-white/15">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" /> Offre unique Loomina
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white">Une offre limpide pour se concentrer sur l'essentiel</h2>
          <p className="text-neutral-300 leading-relaxed max-w-3xl mx-auto text-lg">
            Nous avons réduit les options pour garder un parcours simple : un accompagnement humain, un livre relié, un PDF sécurisé et un suivi jusqu'à la livraison chez vous.
          </p>
        </div>

        <Reveal className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-[0.18em] font-semibold border border-white/20">
                {offer.badge}
              </div>
              <h3 className="text-3xl font-bold">{offer.title}</h3>
              <p className="text-neutral-200 leading-relaxed text-lg">{offer.description}</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] border border-white/20 text-white">
                Livraison moyenne : 3 semaines · Accompagnement humain garanti
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 self-start rounded-2xl bg-white/10 px-4 py-3 border border-white/15 shadow-sm">
              <span className="text-sm text-neutral-300 line-through">{offer.originalPrice}</span>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-[var(--loomina-amber-strong)]">{offer.price}</p>
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-amber)] text-black shadow-sm">
                  Offre de lancement
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-300">Impression incluse</p>
            </div>
          </div>

          <ul className="grid gap-3 text-white md:grid-cols-2 mt-8">
            {offer.highlights.map((highlight, index) => (
              <Reveal key={highlight} delay={index * 0.05}>
                <li className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-[var(--loomina-amber-strong)] text-lg">✦</span>
                  <span className="text-neutral-100 font-medium">{highlight}</span>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-white/10 mt-8">
            <MagicButton
              href={offer.href}
              className="bg-white text-black shadow-lg border border-white/20 hover:bg-neutral-200/90 px-6 py-3 text-base"
            >
              {offer.cta}
            </MagicButton>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">Réponse sous 48h</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
