"use client";

import React from "react";

const STEPS = [
  {
    number: 1,
    color: "bg-[var(--loomina-gold)]",
    iconColor: "text-[var(--loomina-gold)]",
    borderColor: "border-[var(--loomina-gold)]/30",
    title: "Préparation douce",
    description:
      "Un membre de votre famille partage ses souvenirs par téléphone ou visio, guidé par notre IA empathique et un accompagnant humain.",
    footer: "Lancement en 48h",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    number: 2,
    color: "bg-[var(--loomina-burgundy)]",
    iconColor: "text-[var(--loomina-burgundy)]",
    borderColor: "border-[var(--loomina-burgundy)]/30",
    title: "Montage éditorial",
    description:
      "Nous nettoyons les enregistrements, retranscrivons, sélectionnons les meilleures photos et construisons une narration fluide.",
    footer: "Relecture humaine systématique",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    ),
  },
  {
    number: 3,
    color: "bg-[#22c55e]",
    iconColor: "text-[#22c55e]",
    borderColor: "border-[#22c55e]/30",
    title: "Livre prêt à offrir",
    description:
      "Vous validez la maquette. Nous imprimons et envoyons autant d'exemplaires que souhaité, avec une version audio en option.",
    footer: "Maquette + audio inclus",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75c-2.708 0-5.416.879-7.5 2.636L12 21.75l7.5-12.364C17.416 7.629 14.708 6.75 12 6.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75c-1.445 0-2.89.24-4.253.72L12 21.75l4.253-14.28A12.063 12.063 0 0 0 12 6.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 6.75 2.72-4.698a9.045 9.045 0 0 0-5.44 0L12 6.75Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="comment"
      className="bg-[var(--loomina-cream)] py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)] border-t border-[var(--loomina-burgundy)]/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--loomina-text)] tracking-tight">
            Comment nous travaillons
          </h2>
          <p className="text-lg text-[var(--loomina-text-light)]">
            Trois étapes pour transformer des souvenirs en un livre vivant
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-[2rem] p-10 shadow-[0_30px_80px_-60px_rgba(217,54,98,0.55)] border border-[var(--loomina-burgundy)]/10 flex flex-col h-full"
            >
              <div
                className={`absolute -top-5 -left-5 w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center text-lg font-bold shadow-lg border-4 border-white`}
              >
                {step.number}
              </div>

              <div
                className={`w-16 h-16 rounded-2xl border ${step.borderColor} bg-[var(--loomina-cream)] flex items-center justify-center mb-8 ${step.iconColor}`}
              >
                {step.icon}
              </div>

              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-[var(--loomina-text)] mb-4">
                  {step.title}
                </h3>
                <p className="text-[var(--loomina-text-light)] leading-relaxed mb-8">
                  {step.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--loomina-burgundy)]/15 mt-auto">
                <p className="text-sm font-semibold text-[var(--loomina-text-light)] uppercase tracking-wide">
                  {step.footer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
