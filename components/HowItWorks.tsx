"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    chapter: "01",
    title: "L'Inscription",
    description: "Tout commence par une simple commande. Vous recevez votre coffret de bienvenue et l'accès à votre espace personnel sécurisé.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    chapter: "02",
    title: "Les Conversations",
    description: "À votre rythme, vous échangez par téléphone avec notre IA empathique. Elle vous écoute, vous guide et ravive vos souvenirs oubliés.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    chapter: "03",
    title: "La Rédaction",
    description: "Nos algorithmes transforment votre voix en une prose élégante. Un éditeur humain repasse ensuite pour garantir la fluidité et le style.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
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
  },
];

const StepItem = ({ step, index, scrollYProgress, totalSteps }: { step: any, index: number, scrollYProgress: any, totalSteps: number }) => {
  // Determine the active range for this step based on its index
  // We approximate that each step occupies a slice of the scroll progress
  const stepStart = index / totalSteps;
  const stepEnd = (index + 1) / totalSteps;

  // Create a transform that checks if the current scroll is past this step's trigger point
  // We add a little offset so it triggers slightly before the exact math point for better feel
  const isActive = useTransform(scrollYProgress, [stepStart, stepStart + 0.1], [0, 1]);

  // Transform values for styling
  const color = useTransform(isActive, [0, 1], ["#a3a3a3", "#c58c3c"]); // neutral-400 to loomina-amber-strong (darker grey start)
  const scale = useTransform(isActive, [0, 1], [1, 1.35]); // Larger pop
  const opacity = useTransform(isActive, [0, 1], [0.5, 1]); // More visible when inactive
  const shadow = useTransform(isActive, [0, 1], ["0 0 0 0px rgba(0,0,0,0)", "0 0 20px 2px rgba(197, 140, 60, 0.4)"]); // Gold glow

  return (
    <div className="relative pl-12 md:pl-24 py-12 group">
      {/* Icon Circle that sits on the timeline */}
      <motion.div
        style={{ scale, borderColor: color, color: color, opacity, boxShadow: shadow }}
        className="absolute left-[9px] md:left-[11px] top-12 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center z-10"
      >
        {step.icon}
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-baseline gap-4">
        {/* Chapter Number */}
        <motion.div style={{ color, opacity }} className="text-sm font-bold tracking-widest uppercase mb-1 md:mb-0 md:w-16 shrink-0 transition-colors">
          {step.chapter}
        </motion.div>

        {/* Content */}
        <div className="max-w-xl">
          <motion.h3 style={{ color }} className="text-2xl font-serif font-medium mb-3 transition-colors">
            {step.title}
          </motion.h3>
          <p className="text-neutral-500 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section id="process" className="relative py-24 bg-white text-[var(--loomina-black)] overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-20">
          <span className="text-[var(--loomina-gold)] text-sm font-bold tracking-widest uppercase mb-2 block">
            Comment ça marche
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--loomina-ink)]">
            Votre histoire, étape par étape
          </h2>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative">
          {/* Vertical Lines */}
          <div className="absolute left-[9px] md:left-[11px] top-12 bottom-24 w-[3px] bg-neutral-200 -translate-x-1/2"></div>

          <motion.div
            style={{ scaleY: scrollYProgress }}
            className="absolute left-[9px] md:left-[11px] top-12 bottom-24 w-[3px] bg-[var(--loomina-amber)] -translate-x-1/2 origin-top z-0"
          />

          {/* Steps */}
          <div className="space-y-0">
            {STEPS.map((step, index) => (
              <StepItem
                key={index}
                step={step}
                index={index}
                scrollYProgress={scrollYProgress}
                totalSteps={STEPS.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
