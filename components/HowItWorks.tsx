"use client";

const STEPS = [
  {
    chapter: "01",
    title: "L'Inscription",
    description: "Tout commence par une simple commande. Vous recevez votre coffret de bienvenue et l'accès à votre espace personnel sécurisé.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    chapter: "02",
    title: "Les Conversations",
    description: "À votre rythme, vous échangez par téléphone avec notre IA empathique. Elle vous écoute, vous guide et ravive vos souvenirs oubliés.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    chapter: "03",
    title: "La Rédaction",
    description: "Nos algorithmes transforment votre voix en une prose élégante. Un éditeur humain repasse ensuite pour garantir la fluidité et le style.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    chapter: "04",
    title: "L'Héritage",
    description: "Vous recevez chez vous un magnifique livre relié, prêt à être transmis. Votre histoire est désormais éternelle.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="process" className="relative py-24 bg-white text-[var(--loomina-black)]">
      <div className="max-w-4xl mx-auto px-6">
        {/* En-tête */}
        <div className="text-center mb-20 space-y-4">
          <span className="text-[var(--loomina-gold)] text-sm font-bold tracking-widest uppercase">
            Le Sommaire
          </span>
          <h2 className="text-4xl md:text-5xl font-serif">
            Votre histoire, chapitre après chapitre
          </h2>
        </div>

        {/* Liste style "Sommaire" */}
        <div className="border-t border-black/10">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="group flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 py-10 border-b border-black/10 transition-colors hover:bg-neutral-50/50"
            >
              {/* Numéro de Chapitre */}
              <div className="text-sm font-bold tracking-widest text-[var(--loomina-gold)] w-24 shrink-0 uppercase">
                Chapitre {step.chapter}
              </div>

              {/* Contenu */}
              <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-12 items-baseline">
                <div className="flex items-center gap-3">
                  <div className="text-[var(--loomina-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 group-hover:scale-100">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-[var(--loomina-black)] group-hover:text-[var(--loomina-amber-strong)] transition-colors">
                    {step.title}
                  </h3>
                </div>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
