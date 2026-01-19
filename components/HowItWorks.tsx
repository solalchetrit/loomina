"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    chapter: "01",
    title: "L'Inscription",
    description: "Tout commence par une simple commande. Vous recevez votre Carte Membre Loomina et accédez à votre espace personnel dédié.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]",
  },
  {
    chapter: "02",
    title: "Les Conversations",
    description: "À votre rythme, vous échangez par téléphone avec Loomina. Elle vous écoute, vous guide et ravive vos souvenirs les plus précieux.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]",
  },
  {
    chapter: "03",
    title: "La Rédaction",
    description: "Nos algorithmes transforment votre voix en prose élégante. Un éditeur humain repasse ensuite pour garantir une fluidité parfaite et un style littéraire soigné.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    gradient: "from-[var(--loomina-gold-dark)] to-[var(--loomina-gold)]",
  },
  {
    chapter: "04",
    title: "L'Héritage",
    description: "Vous recevez chez vous un magnifique livre relié, prêt à être transmis. Votre histoire est désormais éternelle.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: "from-[var(--loomina-gold-light)] to-[var(--loomina-gold)]",
  },
];

const StepCard = ({ step, index }: { step: typeof STEPS[0], index: number }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="group relative"
    >
      <div className="glass-gold rounded-2xl p-6 hover-lift relative overflow-hidden">

        {/* Chapter number */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-4xl md:text-5xl font-serif font-light bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-30 group-hover:opacity-60 transition-opacity`}>
            {step.chapter}
          </span>

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-[var(--loomina-void)] shadow-lg`}>
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl md:text-2xl font-serif text-[var(--text-primary)] mb-3 group-hover:text-gradient-gold transition-all duration-300">
          {step.title}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-serif">
          {step.description}
        </p>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      </div>
    </motion.div>
  );
};

export default function HowItWorks() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <section
      id="process"
      ref={containerRef}
      className="relative md:min-h-[600px] flex items-center pt-12 pb-12 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
              Le Parcours
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
          </div>

          <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">
            Votre histoire,
            <span className="block text-gradient-gold">étape par étape</span>
          </h2>

          <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto font-serif">
            Un processus simple et accompagné pour transformer vos souvenirs en un livre d&apos;exception.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {STEPS.map((step, index) => (
            <StepCard key={step.chapter} step={step} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-[var(--text-muted)] text-sm mb-4">
            Prêt à commencer votre voyage ?
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/order"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] text-[var(--loomina-void)] font-semibold text-sm hover:shadow-lg hover:shadow-[var(--loomina-gold)]/20 transition-all duration-300 hover:scale-105"
            >
              Commencer maintenant
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
