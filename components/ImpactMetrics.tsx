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
          <p className="text-[var(--loomina-text)] max-w-xl leading-relaxed">
            Nous accompagnons les familles pour que chaque anecdote, rires comme silences, trouve sa place dans un livre qui reste.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="relative overflow-hidden rounded-2xl p-5 shadow-lg border border-[var(--loomina-burgundy)]/10 bg-white"
            >
              <div className="relative">
                <p className="text-sm text-[var(--loomina-text)] mb-2">{metric.label}</p>
                <p className="text-3xl md:text-4xl font-semibold text-[var(--loomina-text)] leading-tight">
                  {metric.value}
                </p>
                <p className="text-sm text-[var(--loomina-text)] mt-2">{metric.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
