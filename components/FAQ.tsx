"use client";
import { useState } from "react";

const faqData = [
    {
        question: "Qu'est-ce que Loomina ?",
        answer: "Loomina est un service de biographie hybride. Nous utilisons une IA empathique pour capturer votre histoire de vive voix et la transformer en un livre physique haut de gamme et un jumeau mémoriel interactif."
    },
    {
        question: "Comment fonctionne l'interview ?",
        answer: "C'est une conversation naturelle. Vous parlez, l'IA écoute, pose des questions pertinentes pour creuser vos souvenirs. Vous pouvez le faire à votre rythme, en plusieurs sessions, depuis votre téléphone ou ordinateur."
    },
    {
        question: "Quel est le prix ?",
        answer: "Une seule offre Lumina : 222€ en lancement. Elle inclut les interviews guidés, la rédaction, la maquette, 5 exemplaires imprimés et la version numérique sécurisée."
    },
    {
        question: "Mes données sont-elles privées ?",
        answer: "Absolument. Vos souvenirs sont cryptés et stockés dans un coffre-fort numérique sécurisé. Vous seul décidez avec qui les partager."
    },
    {
        question: "Combien de temps faut-il pour créer le livre ?",
        answer: "Cela dépend de vous ! Certains terminent en quelques heures d'interview, d'autres prennent des semaines. Une fois l'interview finie, notre IA rédige et met en page le livre instantanément."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full max-w-3xl px-4 pb-32 font-[family-name:var(--font-inter)]"> {/* Use Inter for clean look */}
            <div className="space-y-4">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                        >
                            <div className="flex items-center gap-4">
                                {/* Icon similar to screenshot */}
                                <div className="flex-shrink-0 w-6 h-6 rounded-full border border-blue-400 text-blue-400 flex items-center justify-center text-sm font-bold group-hover:bg-blue-400 group-hover:text-white transition-colors">
                                    ?
                                </div>
                                <span className="text-gray-800 font-bold text-lg">{item.question}</span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="px-6 pb-6 pl-16 text-gray-600 leading-relaxed font-light">
                                {item.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
