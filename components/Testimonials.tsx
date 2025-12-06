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
    <section className="w-full bg-[var(--loomina-gray-light)] py-20 px-6 border-t border-[var(--loomina-black)]/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">
            Témoignages
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--loomina-black)] leading-tight">
            Des familles qui se redécouvrent
          </h2>
          <p className="text-[var(--loomina-black)] leading-relaxed">
            Chaque projet est unique. Nous veillons à préserver les accents, les rires et les silences qui font la richesse d'une histoire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden bg-white border border-[var(--loomina-black)]/10 rounded-3xl p-6 shadow-lg flex flex-col gap-4"
            >
              <div className="relative">
                <p className="text-lg text-[var(--loomina-black)] leading-relaxed">“{item.quote}”</p>
                <div className="pt-2 border-t border-[var(--loomina-black)]/15 mt-4">
                  <p className="font-semibold text-[var(--loomina-black)]">{item.name}</p>
                  <p className="text-sm text-[var(--loomina-black)]">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
