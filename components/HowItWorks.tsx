"use client";

import React from "react";

const STEPS = [
  {
    number: 1,
    color: "bg-[#D4AF37]",
    iconColor: "text-[#D4AF37]",
    borderColor: "border-[#D4AF37]/40",
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
    color: "bg-[#681829]",
    iconColor: "text-[#681829]",
    borderColor: "border-[#681829]/25",
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
    color: "bg-[#4ADE80]",
    iconColor: "text-[#4ADE80]",
    borderColor: "border-[#4ADE80]/30",
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
      className="bg-[#f9f9f9] py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header de section */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Comment nous travaillons
          </h2>
          <p className="text-lg text-neutral-600">
            Trois étapes pour transformer des souvenirs en un livre vivant
          </p>
        </div>

        {/* Grille des 3 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-[2rem] p-10 shadow-sm border border-black/[0.02] flex flex-col h-full"
            >
              {/* Badge Numéro Flottant (Top Left) */}
              <div
                className={`absolute -top-5 -left-5 w-12 h-12 rounded-full ${step.color} text-white flex items-center justify-center text-lg font-bold shadow-md border-4 border-[#f9f9f9]`}
              >
                {step.number}
              </div>

              {/* Icone Box */}
              <div
                className={`w-16 h-16 rounded-2xl border ${step.borderColor} bg-white flex items-center justify-center mb-8 ${step.iconColor}`}
              >
                {step.icon}
              </div>

              {/* Contenu */}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-8">
                  {step.description}
                </p>
              </div>

              {/* Footer léger en bas de carte */}
              <div className="pt-6 border-t border-gray-100 mt-auto">
                <p className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">
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
