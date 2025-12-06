"use client";
import { useState } from "react";

const faqData = [
    {
        question: "What is Fidjoo?",
        answer: "Fidjoo est une plateforme créative pour les enfants..."
    },
    {
        question: "What age group is Fidjoo for?",
        answer: "C'est parfait pour les enfants de 4 à 12 ans."
    },
    {
        question: "Does Fidjoo work offline?",
        answer: "Oui, l'application fonctionne parfaitement sans connexion internet une fois téléchargée.",
        active: true // The user's code had this one active by default? or just marked in HTML
    },
    {
        question: "What if my child doesn't read yet?",
        answer: "L'interface est intuitive et utilise beaucoup de visuels et de guides vocaux."
    },
    {
        question: "How much does Fidjoo cost?",
        answer: "Nous avons plusieurs plans disponibles selon vos besoins."
    }
];

export default function FidjooFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(2); // Default to the 3rd item as per user HTML 'active' class example

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-[800px] mx-auto flex flex-col gap-[15px] font-[family-name:var(--font-quicksand)] text-[#111]">
            {faqData.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div
                        key={index}
                        className={`bg-[#f6f6f4] rounded-[12px] overflow-hidden transition-all duration-300 ${isOpen ? 'active' : ''}`}
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className={`w-full flex items-center justify-between p-[22px_30px] bg-transparent border-none cursor-pointer text-left font-bold text-[1.1rem] transition-colors duration-200 ${isOpen ? 'text-[#4a90e2]' : 'text-[#1a1a1a]'} hover:text-[#4a90e2]`}
                        >
                            <div className="flex items-center gap-[15px]">
                                <span className="text-[#5d9cec] text-[1.4rem] flex items-center">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </span>
                                <span>{item.question}</span>
                            </div>
                            <span className={`text-[#888] transition-transform duration-300 ease-out flex items-center ${isOpen ? 'rotate-180' : ''}`}>
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </button>

                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ease-out text-[#555] leading-[1.6]`}
                            style={{ maxHeight: isOpen ? '500px' : '0' }}
                        >
                            <p className="pb-[25px] pl-[69px] pr-[30px]">{item.answer}</p> {/* 30px + 15px + 24px icon approx = 69px padding left */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
