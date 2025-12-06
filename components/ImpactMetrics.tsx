const metrics = [
  {
    label: "Histoires sauvegardées",
    value: "12 800+",
    detail: "familles accompagnées en Europe",
  },
  {
    label: "Temps moyen d'entretien",
    value: "45 min",
    detail: "guidés par l'IA empathique",
  },
  {
    label: "Satisfaction",
    value: "98%",
    detail: "des proches recommandent Loomina",
  },
  {
    label: "Livres remis",
    value: "3 jours",
    detail: "après validation de la mise en page",
  },
];

export default function ImpactMetrics() {
  return (
    <section className="w-full bg-[var(--loomina-cream)] py-16 px-6 border-y border-[var(--loomina-burgundy)]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">
              Confiance et impact
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-[var(--loomina-text)] leading-tight mt-2">
              Des souvenirs qui traversent le temps
            </h2>
          </div>
          <p className="text-[var(--loomina-text-light)] max-w-xl leading-relaxed">
            Nous accompagnons les familles pour que chaque anecdote, rires comme silences, trouve sa place dans un livre qui reste.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="relative overflow-hidden rounded-2xl p-5 shadow-[0_25px_70px_-55px_rgba(217,54,98,0.6)] border border-[var(--loomina-burgundy)]/10 bg-white"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,93,122,0.12),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(43,183,163,0.12),transparent_55%)]" />
              <div className="relative">
                <p className="text-sm text-[var(--loomina-text-light)] mb-2">{metric.label}</p>
                <p className="text-3xl md:text-4xl font-semibold text-[var(--loomina-text)] leading-tight">
                  {metric.value}
                </p>
                <p className="text-sm text-[var(--loomina-text-light)] mt-2">{metric.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
