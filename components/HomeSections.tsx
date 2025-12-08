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
    <section className="w-full bg-white py-24 px-6" id="parcours">
      <div className="max-w-6xl mx-auto space-y-14">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">
            Un parcours clair dès la première visite
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[var(--loomina-black)] leading-tight">
            Trois moments clés pour dérouler l'histoire familiale
          </h2>
          <p className="text-[var(--loomina-gray-dark)] max-w-3xl mx-auto leading-relaxed">
            Nous guidons chaque proche avec un fil rouge simple : un temps d'écoute, un atelier de mise en forme, puis des
            supports prêts à offrir. L'accueil de la page reflète cette promesse pour rassurer et donner envie d'avancer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="relative h-full overflow-hidden rounded-[28px] border border-[var(--loomina-black)]/10 shadow-[0_30px_80px_-60px_rgba(217,54,98,0.45)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.accent} pointer-events-none`} aria-hidden />
              <div className="relative p-8 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[var(--loomina-black)]/10 text-xs font-semibold tracking-[0.14em] text-[var(--loomina-black)]">
                  <span className="text-[var(--loomina-gold)]">●</span>
                  {section.badge}
                </div>
                <h3 className="text-2xl font-semibold text-[var(--loomina-black)] leading-tight">{section.title}</h3>
                <p className="text-[var(--loomina-gray-dark)] leading-relaxed">{section.description}</p>
                <div className="space-y-3 pt-2">
                  {section.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 text-[var(--loomina-black)]">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-black)]" aria-hidden />
                      <span className="leading-relaxed">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 items-center bg-[var(--loomina-gray-light)] border border-[var(--loomina-black)]/10 rounded-[28px] p-10">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-black)] font-semibold">Prêt à commencer</p>
            <h3 className="text-3xl font-semibold text-[var(--loomina-black)] leading-tight">
              Une page d'accueil qui invite à passer à l'action
            </h3>
            <p className="text-[var(--loomina-gray-dark)] leading-relaxed">
              En un seul regard, vos proches visualisent l'accompagnement, le soin éditorial et le résultat. Ils peuvent réserver
              une session ou continuer à explorer sans se perdre.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#comment"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-black)] text-white font-semibold shadow-[0_20px_60px_-35px_rgba(217,54,98,0.55)] hover:brightness-110 transition-colors"
            >
              Découvrir le parcours Loomina
            </a>
            <a
              href="#faq"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-[var(--loomina-black)] font-semibold border border-[var(--loomina-black)]/10 hover:brightness-110 transition-colors"
            >
              Lire les réponses clés
            </a>
            <span className="text-[var(--loomina-black)] text-sm text-center">Une structure claire pour guider les familles vers la prochaine étape.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
