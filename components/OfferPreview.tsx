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
    <section className="relative w-full px-6 py-24 bg-white" id="offres">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="flex flex-col gap-4 text-center">
          <p className="inline-flex items-center gap-2 self-center rounded-full bg-neutral-100 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black shadow-sm border border-black/5">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" /> Offre unique Loomina
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-black">Une offre limpide pour se concentrer sur l'essentiel</h2>
          <p className="text-neutral-600 leading-relaxed max-w-3xl mx-auto text-lg">
            Nous avons réduit les options pour garder un parcours simple : un accompagnement humain, un livre relié, un PDF sécurisé et un suivi jusqu'à la livraison chez vous.
          </p>
        </div>

        <Reveal className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 text-xs uppercase tracking-[0.18em] text-black font-semibold border border-black/5">
                {offer.badge}
              </div>
              <h3 className="text-3xl font-bold text-black">{offer.title}</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">{offer.description}</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black border border-black/5">
                Livraison moyenne : 3 semaines · Accompagnement humain garanti
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 self-start rounded-2xl bg-neutral-50 px-4 py-3 border border-black/5 shadow-sm">
              <span className="text-sm text-neutral-400 line-through">{offer.originalPrice}</span>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-bold text-[var(--loomina-amber-strong)]">{offer.price}</p>
                <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-amber)] text-black shadow-sm">
                  Offre de lancement
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-500">Impression incluse</p>
            </div>
          </div>

          <ul className="grid gap-3 text-black md:grid-cols-2 mt-8">
            {offer.highlights.map((highlight, index) => (
              <Reveal key={highlight} delay={index * 0.05}>
                <li className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4 border border-black/5 hover:bg-neutral-100 transition-colors">
                  <span className="text-[var(--loomina-amber-strong)] text-lg">✦</span>
                  <span className="text-neutral-700 font-medium">{highlight}</span>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-black/5 mt-8">
            <MagicButton
              href={offer.href}
              className="bg-black text-white shadow-lg border border-black hover:bg-neutral-800 px-6 py-3 text-base"
            >
              {offer.cta}
            </MagicButton>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Réponse sous 48h</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
