"use client";
import { useState } from "react";

const faqData = [
  {
    question: "Combien coûte l'accompagnement ?",
    answer:
      "L'offre Lumina est affichée en toute transparence : 222 € impression incluse pour 5 exemplaires et les versions numérique et audio.",
  },
  {
    question: "Qui lit mes souvenirs en dehors de l'équipe ?",
    answer:
      "Personne sans votre accord. Les données restent hébergées en Europe, sous contrat de confidentialité, et peuvent être supprimées sur simple demande.",
  },
  {
    question: "Faut-il être à l'aise avec la technologie ?",
    answer:
      "Non. Nous pouvons tout réaliser par téléphone, récupérer les photos pour vous et vous guider étape par étape sans plateforme compliquée.",
    active: true,
  },
  {
    question: "Combien de temps pour recevoir le livre ?",
    answer: "En moyenne trois semaines : prise de brief, entretiens guidés, maquette, puis impression et envoi suivis.",
  },
];

export default function LoominaFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(2);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {faqData.map((item, index) => {
        const isOpen = openIndex === index;
        const contentId = `faq-panel-${index}`;
        const buttonId = `faq-trigger-${index}`;

        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border border-[var(--loomina-outline)] bg-[var(--loomina-surface)] shadow-[0_16px_45px_-40px_rgba(15,17,21,0.6)] transition-transform duration-200 ${
              isOpen ? "translate-y-[-2px] shadow-[0_26px_60px_-48px_rgba(15,17,21,0.55)]" : ""
            }`}
          >
            <button
              id={buttonId}
              aria-controls={contentId}
              aria-expanded={isOpen}
              onClick={() => toggleFAQ(index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--loomina-amber-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--loomina-surface)]"
            >
              <div className="flex items-start gap-3">
                <span className="mt-[2px] inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--loomina-amber-veil)] text-[var(--loomina-amber-strong)] shadow-inner">
                  ?
                </span>
                <span className="text-base font-semibold leading-snug text-[var(--loomina-ink)]">{item.question}</span>
              </div>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--loomina-outline)] text-[var(--loomina-ink)] transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>

            {/* Commentaire : panneau à hauteur animée pour une lecture fluide */}
            <div
              id={contentId}
              role="region"
              aria-labelledby={buttonId}
              className="overflow-hidden px-5 transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: isOpen ? "320px" : "0" }}
            >
              <p className="pb-6 pr-2 text-[var(--loomina-ink-soft)] leading-relaxed">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
