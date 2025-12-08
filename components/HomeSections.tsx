import React from "react";

const sections = [
  {
    badge: "01",
    title: "Rituel d'écoute guidé",
    description:
      "Une session douce en visio ou par téléphone où l'on écoute, relance et capture chaque timbre de voix.",
    accent: "from-[var(--loomina-gold)]/20 via-white to-white",
    bullets: [
      "Questions scénarisées pour dérouler la mémoire sans stress",
      "IA empathique + accompagnant humain pour aller chercher les détails",
      "Enregistrements audio propres prêts pour le montage",
    ],
  },
  {
    badge: "02",
    title: "Atelier éditorial sur-mesure",
    description:
      "On nettoie, sélectionne, et construit le fil rouge qui rend l'histoire lisible pour toute la famille.",
    accent: "from-white via-white to-[var(--loomina-gray-light)]",
    bullets: [
      "Découpage des chapitres, choix des photos et légendes",
      "Réécriture fluide sans trahir la voix originale",
      "Allers-retours rapides avec vous pour valider le ton",
    ],
  },
  {
    badge: "03",
    title: "Œuvres prêtes à transmettre",
    description:
      "Livre relié, coffret audio, PDF à partager : on livre des formats qui s'offrent et se conservent.",
    accent: "from-[var(--loomina-black)]/05 via-white to-[var(--loomina-gold)]/10",
    bullets: [
      "Maquette premium + audio synchronisé des meilleurs extraits",
      "Livraisons multiples pour frères, sœurs, petits-enfants",
      "Archivage sécurisé pour que la voix reste accessible",
    ],
  },
];

export default function HomeSections() {
  return (
    <section className="w-full py-24 px-6 relative" id="comment">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(234,191,119,0.08),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(197,140,60,0.08),transparent_25%)]" aria-hidden />
      <div className="max-w-6xl mx-auto space-y-14 relative">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-amber-strong)] font-semibold">
            Comment ça se passe
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white">
            Trois moments pour dérouler l'histoire familiale
          </h2>
          <p className="text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Un fil rouge simple : un temps d'écoute, un atelier éditorial, puis des supports prêts à offrir. Vous visualisez tout le parcours dès la première visite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.8)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} opacity-70 pointer-events-none`} aria-hidden />
              <div className="relative p-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-[0.14em] text-white">
                  <span className="text-[var(--loomina-amber)]">●</span>
                  {section.badge}
                </div>
                <h3 className="text-2xl font-semibold text-white leading-tight">{section.title}</h3>
                <p className="text-neutral-200 leading-relaxed">{section.description}</p>
                <div className="space-y-3 pt-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 text-white">
                      <span className="mt-1 h-2 w-2 rounded-full bg-white" aria-hidden />
                      <span className="leading-relaxed text-neutral-100">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 items-center bg-white/5 border border-white/10 rounded-[28px] p-10 backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white font-semibold">Prêt à commencer</p>
            <h3 className="text-3xl font-semibold text-white leading-tight">
              Un parcours lisible du premier appel à la remise du livre
            </h3>
            <p className="text-neutral-200 leading-relaxed">
              En un seul regard, vous voyez comment on prépare, écrit et remet le livre. Les CTA guident vers la suite sans quitter la page.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#offres"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-black font-semibold shadow-[0_20px_60px_-35px_rgba(0,0,0,0.65)] hover:bg-neutral-200 transition-colors"
            >
              Découvrir l'offre Loomina
            </a>
            <a
              href="#faq"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-transparent text-white font-semibold border border-white/20 hover:bg-white/10 transition-colors"
            >
              Lire les réponses clés
            </a>
            <span className="text-white/80 text-sm text-center">Une structure claire pour guider les familles vers la prochaine étape.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
