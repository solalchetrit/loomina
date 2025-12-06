"use client";

import React from "react";

const STEPS = [
  {
    number: 1,
    color: "bg-[#C5A265]", // Couleur Or/Bronze
    iconColor: "text-[#C5A265]",
    borderColor: "border-[#C5A265]/30",
    title: "Réservation confirmée",
    description:
      "Le client reçoit automatiquement sa clé digitale dans Apple Wallet ou Google Wallet. Aucune application à télécharger.",
    footer: "ASSA ABLOY • dormakaba • SALTO",
    icon: (
      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>
    ),
  },
  {
    number: 2,
    color: "bg-[#3B82F6]", // Bleu
    iconColor: "text-[#3B82F6]",
    borderColor: "border-[#3B82F6]/30",
    title: "Arrivée à l'hôtel",
    description:
      "Le client déverrouille sa chambre directement avec son téléphone. L'expérience est instantanée et naturelle.",
    footer: "Compatible iPhone/Apple Watch et Android",
    icon: (
      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    number: 3,
    color: "bg-[#4ADE80]", // Vert
    iconColor: "text-[#4ADE80]",
    borderColor: "border-[#4ADE80]/30",
    title: "Départ simplifié",
    description:
      "La clé expire automatiquement. Pas de retour en réception, pas de carte perdue. L'expérience est fluide de bout en bout.",
    footer: "Fonctionne même sans déverrouiller",
    icon: (
      <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#f9f9f9] py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)]">
      <div className="max-w-7xl mx-auto">
        {/* Header de section */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
            Clés digitales. Simplicité. Efficacité
          </h2>
          <p className="text-lg text-neutral-600">
            Trois étapes pour une expérience d'arrivée révolutionnaire
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
