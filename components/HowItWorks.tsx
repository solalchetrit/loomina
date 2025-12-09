"use client";

const STEPS = [
  {
    title: "L'Inscription",
    description: "Tout commence par une simple commande. Vous recevez votre coffret de bienvenue et l'accès à votre espace personnel sécurisé.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: "Les Conversations",
    description: "À votre rythme, vous échangez par téléphone avec notre IA empathique. Elle vous écoute, vous guide et ravive vos souvenirs oubliés.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: "La Rédaction",
    description: "Nos algorithmes transforment votre voix en une prose élégante. Un éditeur humain repasse ensuite pour garantir la fluidité et le style.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "L'Héritage",
    description: "Vous recevez chez vous un magnifique livre relié, prêt à être transmis. Votre histoire est désormais éternelle.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="process" className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative">
        {/* En-tête de section */}
        <div className="text-center mb-20">
          <span className="text-[var(--loomina-gold)] text-sm font-bold tracking-widest uppercase mb-2 block">
            Comment ça marche
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--loomina-ink)]">
            Votre histoire, étape par étape
          </h2>
        </div>

        {/* Ligne Centrale (Le Fil) */}
        <div className="absolute left-6 md:left-1/2 top-40 bottom-20 w-px bg-gradient-to-b from-transparent via-[var(--loomina-gold)]/50 to-transparent md:-translate-x-1/2"></div>

        {/* Liste des étapes */}
        <div className="space-y-16">
          {STEPS.map((step, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}>

              {/* Contenu Texte (Alternance) */}
              <div className={`flex-1 w-full text-left md:text-${index % 2 === 0 ? "left" : "right"} pl-20 md:pl-0 ${index % 2 === 0 ? "md:pr-24" : "md:pl-24"}`}>
                <h3 className="text-2xl font-serif text-[var(--loomina-black)] mb-3">
                  {step.title}
                </h3>
                <p className={`text-neutral-500 leading-relaxed max-w-md ${index % 2 === 0 ? "mr-auto" : "ml-auto"}`}>
                  {step.description}
                </p>
              </div>

              {/* Point Central (Connecteur) */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-0 md:top-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[var(--loomina-gold)] text-[var(--loomina-gold)] shadow-[0_0_15px_rgba(234,191,119,0.3)] z-10">
                {step.icon}
              </div>

              {/* Espace vide pour l'équilibre visuel */}
              <div className="flex-1 hidden md:block w-1/2 md:pl-12"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
