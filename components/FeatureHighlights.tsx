const features = [
  {
    title: "Interviews guidées",
    description: "Une IA empathique accompagne vos proches, reformule et relance pour capturer les détails précieux.",
    tag: "Empathie augmentée",
  },
  {
    title: "Montage sur-mesure",
    description: "Nos éditeurs harmonisent les souvenirs, sélectionnent les photos et composent un livre qui vous ressemble.",
    tag: "Œil humain",
  },
  {
    title: "Partage simple",
    description: "Livre relié, version numérique, extrait audio… choisissez les formats qui conviennent à votre famille.",
    tag: "Multi-supports",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="w-full bg-[var(--loomina-gray-light)] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Fonctionnalités clés</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--loomina-black)] leading-tight mt-2">
              Un parcours pensé pour les familles
            </h2>
          </div>
          <p className="text-[var(--loomina-gray-dark)] max-w-xl leading-relaxed">
            Nous combinons la technologie et le regard éditorial pour préserver les voix, les silences et les images qui font une vie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-lg border border-[var(--loomina-gray-dark)]/10"
            >
              <div className="relative space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] border border-[var(--loomina-gray-dark)]/20 text-xs uppercase tracking-[0.14em] text-[var(--loomina-black)] font-semibold">
                  {feature.tag}
                </span>
                <h3 className="text-2xl font-semibold text-[var(--loomina-black)]">{feature.title}</h3>
                <p className="text-[var(--loomina-gray-dark)] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
