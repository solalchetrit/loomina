const commitments = [
  {
    title: "Confidentialité totale",
    description:
      "Données chiffrées et hébergées en Europe. Vous choisissez ce qui reste, ce qui s'efface et qui peut accéder au récit.",
    accent: "RGPD & suppression à tout moment",
  },
  {
    title: "Présence humaine continue",
    description:
      "Chaque entretien est suivi par un éditeur qui relit, reformule si besoin et s'assure que le ton reste fidèle à la personne.",
    accent: "Equipe éditoriale dédiée",
  },
  {
    title: "Accessibilité pour vos proches",
    description:
      "Visio, téléphone ou kit papier : nous adaptons le format à l'aise de chacun pour que personne ne soit laissé de côté.",
    accent: "Accompagnement pour seniors",
  },
];

export default function Commitments() {
  return (
    <section className="w-full bg-[#0c1327] py-20 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Nos engagements</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
            Technologie, oui. Mais surtout de l'attention humaine
          </h2>
          <p className="text-[var(--loomina-text-light)] leading-relaxed">
            Nous construisons chaque livre comme s'il était pour notre propre famille : sécurité, patience et écoute restent au cœur du parcours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {commitments.map((commitment) => (
            <div
              key={commitment.title}
              className="relative overflow-hidden bg-white/5 rounded-3xl border border-white/10 p-7 flex flex-col gap-4 shadow-[0_25px_70px_-55px_rgba(124,58,237,0.85)] backdrop-blur"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(165,243,252,0.12),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_80%,rgba(124,58,237,0.14),transparent_55%)]" />
              <div className="relative space-y-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs uppercase tracking-[0.14em] text-[var(--loomina-gold)] font-semibold">
                  {commitment.accent}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white">{commitment.title}</h3>
                <p className="text-[var(--loomina-text-light)] leading-relaxed">{commitment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
