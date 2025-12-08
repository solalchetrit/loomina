import Reveal from "./ui/Reveal";

const testimonials = [
  {
    quote:
      "Ma grand-mère s'est livrée comme jamais. Le livre est devenu le centre de nos repas de famille.",
    name: "Julie, petite-fille",
    detail: "Livre remis en 5 jours",
  },
  {
    quote: "L'IA pose les bonnes questions, mais c'est la relecture humaine qui donne toute la chaleur.",
    name: "Marc, fils",
    detail: "Version audio + relié",
  },
  {
    quote: "On a envoyé un exemplaire à chacun des cousins. Tout le monde a découvert des souvenirs inédits.",
    name: "Sophie, nièce",
    detail: "10 copies imprimées",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-amber-strong)] font-semibold">
            Témoignages
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Des familles qui se redécouvrent
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Chaque projet est unique. Nous veillons à préserver les accents, les rires et les silences qui font la richesse d'une histoire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.08}>
              <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-6 shadow-lg flex flex-col gap-4 backdrop-blur">
                <div className="relative">
                  <p className="text-lg text-white leading-relaxed">“{item.quote}”</p>
                  <div className="pt-2 border-t border-white/15 mt-4">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-neutral-200">{item.detail}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
