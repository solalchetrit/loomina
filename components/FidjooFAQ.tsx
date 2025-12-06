"use client";
import { useState } from "react";

const faqData = [
  {
    question: "Comment se passent les entretiens ?",
    answer:
      "Nous organisons un appel visio ou téléphone d'environ 45 minutes. L'IA propose des relances et un membre de notre équipe accompagne la conversation.",
  },
  {
    question: "Qui relit et corrige les textes ?",
    answer:
      "Chaque transcript est nettoyé par un éditeur Loomina : vérification des faits fournis, harmonisation du style, suppression des hésitations.",
  },
  {
    question: "Combien d'exemplaires puis-je commander ?",
    answer: "Autant que vous le souhaitez : nous imprimons à la demande et fournissons toujours une version numérique.",
    active: true,
  },
  {
    question: "Et si mon proche n'est pas à l'aise avec la technologie ?",
    answer: "Nous pouvons passer par un simple appel téléphonique et envoyer un kit papier pour récupérer les photos.",
  },
  {
    question: "Sous combien de temps recevrai-je le livre ?",
    answer: "Comptez en moyenne 3 jours après votre validation de la maquette finale.",
  },
];

export default function FidjooFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(2);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
        <div className="w-full max-w-[800px] mx-auto flex flex-col gap-5 font-[family-name:var(--font-quicksand)] text-[var(--loomina-text)]">
            {faqData.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className={`bg-[var(--loomina-cream)]/80 rounded-[16px] overflow-hidden transition-all duration-300 border border-[var(--loomina-border)] shadow-[0_16px_40px_-32px_rgba(0,0,0,0.75)] backdrop-blur ${isOpen ? 'active' : ''}`}
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className={`w-full flex items-center justify-between p-[24px_32px] bg-transparent border-none cursor-pointer text-left font-bold text-[1.08rem] transition-colors duration-200 ${isOpen ? 'text-white' : 'text-[var(--loomina-text)]'} hover:text-white`}
                        >
                            <div className="flex items-center gap-[15px]">
                                <span className="text-[var(--loomina-gold)] text-[1.4rem] flex items-center">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </span>
                                <span>{item.question}</span>
                            </div>
                            <span className={`text-[var(--loomina-text-light)] transition-transform duration-300 ease-out flex items-center ${isOpen ? 'rotate-180' : ''}`}>
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </button>

                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ease-out text-[var(--loomina-text-light)] leading-[1.7] bg-[var(--loomina-surface)]`}
                            style={{ maxHeight: isOpen ? '500px' : '0' }}
                        >
                            <p className="pb-[25px] pl-[69px] pr-[32px]">{item.answer}</p> {/* 30px + 15px + 24px icon approx = 69px padding left */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
