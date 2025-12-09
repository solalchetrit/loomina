"use client";
import { useState } from "react";

const faqData = [
    {
        question: "Qu'est-ce que Loomina ?",
        answer:
            "Loomina est un service de biographie hybride. Nous utilisons une IA empathique pour capturer votre histoire de vive voix et la transformer en un livre physique haut de gamme et un jumeau mémoriel interactif.",
    },
    {
        question: "Comment se déroulent les entretiens ?",
        answer:
            "Nous prévoyons un appel vidéo ou téléphonique d'environ 45 minutes. Notre IA suggère des relances tandis qu'un accompagnant Loomina guide l'échange pour que la parole reste fluide.",
    },
    {
        question: "Quel est le prix ?",
        answer:
            "Une seule offre Loomina : 222€ en lancement. Elle inclut les interviews guidés, la rédaction, la maquette, 5 exemplaires imprimés et la version numérique sécurisée.",
    },
    {
        question: "Qui relit et corrige les textes ?",
        answer:
            "Chaque transcription est vérifiée par un éditeur Loomina : cohérence des faits fournis, reformulation douce, suppression des hésitations pour préserver la voix originale.",
    },
    {
        question: "Mes données sont-elles privées ?",
        answer:
            "Absolument. Vos souvenirs sont cryptés et stockés dans un coffre-fort numérique sécurisé. Vous seul décidez avec qui les partager.",
    },
    {
        question: "Combien d'exemplaires puis-je commander ?",
        answer:
            "Autant que nécessaire : nous imprimons à la demande et fournissons systématiquement une version numérique et audio pour partager facilement.",
        active: true,
    },
    {
        question: "Et si mon proche n'est pas à l'aise avec la technologie ?",
        answer:
            "Nous adaptons le dispositif : simple appel téléphonique, aide à distance pour récupérer les photos, et un accompagnement humain pour faciliter chaque étape.",
    },
    {
        question: "Sous combien de temps recevrai-je le livre ?",
        answer: "Après votre validation de la maquette finale, l'impression et l'envoi prennent en moyenne trois jours ouvrés.",
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
