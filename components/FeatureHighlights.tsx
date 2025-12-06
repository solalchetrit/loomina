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
    <section className="w-full bg-[var(--loomina-cream)] py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(242,93,122,0.12),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(43,183,163,0.12),transparent_40%)]" />
      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Fonctionnalités clés</p>
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
              className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-[0_30px_80px_-60px_rgba(217,54,98,0.55)] border border-[var(--loomina-burgundy)]/10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(183,246,231,0.14),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_90%,rgba(242,93,122,0.1),transparent_55%)]" />
              <div className="relative space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--loomina-cream)] border border-[var(--loomina-burgundy)]/20 text-xs uppercase tracking-[0.14em] text-[var(--loomina-burgundy-dark)] font-semibold">
                  {feature.tag}
                </span>
                <h3 className="text-2xl font-semibold text-[var(--loomina-text)]">{feature.title}</h3>
                <p className="text-[var(--loomina-text-light)] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
