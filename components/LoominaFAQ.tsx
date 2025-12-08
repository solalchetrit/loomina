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
        <div className="w-full max-w-[800px] mx-auto flex flex-col gap-5 font-[family-name:var(--font-quicksand)] text-[var(--loomina-black)]">
            {faqData.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className={`bg-[var(--loomina-gray-light)] rounded-[16px] overflow-hidden transition-all duration-300 border border-[var(--loomina-black)]/10 ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className={`w-full flex items-center justify-between px-6 py-5 bg-transparent border-none cursor-pointer text-left font-bold text-[1.08rem] transition-colors duration-200 ${isOpen ? 'text-[var(--loomina-black)]' : 'text-[var(--loomina-black)]'} hover:text-[var(--loomina-black)]`}
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
                            <span className={`text-[var(--loomina-gold)] transition-transform duration-300 ease-out flex items-center ${isOpen ? 'rotate-180' : ''}`}>
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </button>

                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ease-out text-[var(--loomina-black)] leading-[1.7] bg-[var(--loomina-gray-light)]`}
                            style={{ maxHeight: isOpen ? '500px' : '0' }}
                        >
                            <p className="pb-[25px] pl-[69px] pr-[32px]">{item.answer}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
