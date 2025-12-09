"use client";

const STEPS = [
  {
    chapter: "01",
    title: "L'Inscription",
    description: "Tout commence par une simple commande. Vous recevez votre coffret de bienvenue et l'accès à votre espace personnel sécurisé.",
  },
  {
    chapter: "02",
    title: "Les Conversations",
    description: "À votre rythme, vous échangez par téléphone avec notre IA empathique. Elle vous écoute, vous guide et ravive vos souvenirs oubliés.",
  },
  {
    chapter: "03",
    title: "La Rédaction",
    description: "Nos algorithmes transforment votre voix en une prose élégante. Un éditeur humain repasse ensuite pour garantir la fluidité et le style.",
  },
  {
    chapter: "04",
    title: "L'Héritage",
    description: "Vous recevez chez vous un magnifique livre relié, prêt à être transmis. Votre histoire est désormais éternelle.",
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
                <h3 className="text-2xl font-serif font-medium text-[var(--loomina-black)] group-hover:text-[var(--loomina-amber-strong)] transition-colors">
                  {step.title}
                </h3>
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
