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
    <section className="w-full bg-[var(--loomina-cream)] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Fonctionnalités clés</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--loomina-text)] leading-tight mt-2">
              Un parcours pensé pour les familles
            </h2>
          </div>
          <p className="text-[var(--loomina-text-light)] max-w-xl leading-relaxed">
            Nous combinons la technologie et le regard éditorial pour préserver les voix, les silences et les images qui font une vie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-3xl p-8 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.2)] border border-[#eadfce]"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#eadfce] text-xs uppercase tracking-[0.14em] text-[var(--loomina-burgundy)] font-semibold">
                {feature.tag}
              </span>
              <h3 className="text-2xl font-semibold text-[var(--loomina-text)] mt-5 mb-3">{feature.title}</h3>
              <p className="text-[var(--loomina-text-light)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
