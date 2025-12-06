"use client";

import React from "react";
import Reveal from "./ui/Reveal";

const STEPS = [
  {
    number: 1,
    color: "bg-[var(--loomina-gold)]",
    numberTextColor: "text-[var(--loomina-black)]",
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
    color: "bg-[var(--loomina-black)]",
    numberTextColor: "text-white",
    iconColor: "text-[var(--loomina-black)]",
    borderColor: "border-[var(--loomina-black)]/30",
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
    color: "bg-[var(--loomina-gray-light)]",
    numberTextColor: "text-[var(--loomina-black)]",
    iconColor: "text-[var(--loomina-black)]",
    borderColor: "border-[var(--loomina-black)]/25",
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
      className="bg-gradient-to-br from-[var(--loomina-gray-light)] via-white to-[var(--loomina-gold-light)] py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)] border-t border-[var(--loomina-black)]/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[var(--loomina-black)]/10 text-sm uppercase tracking-[0.2em] text-[var(--loomina-black)] font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" aria-hidden />Processus signature
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--loomina-black)] tracking-tight">
            Comment nous travaillons
          </h2>
          <p className="text-lg text-[var(--loomina-gray-dark)] max-w-3xl mx-auto leading-relaxed">
            Trois étapes pour transformer des souvenirs intimes en un bel objet qu'on est fier d'offrir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.number}
              delay={index * 0.08}
              className="relative bg-white/90 rounded-[2rem] p-10 shadow-[0_40px_90px_-65px_rgba(15,16,20,0.6)] border border-[var(--loomina-black)]/10 flex flex-col h-full backdrop-blur"
            >
              <div
                className={`absolute -top-5 -left-5 w-12 h-12 rounded-full ${step.color} ${step.numberTextColor} flex items-center justify-center text-lg font-bold shadow-lg border-4 border-white`}
              >
                {step.number}
              </div>

              <div
                className={`w-16 h-16 rounded-2xl border ${step.borderColor} bg-white/80 flex items-center justify-center mb-8 ${step.iconColor} shadow-sm`}
              >
                {step.icon}
              </div>

              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-[var(--loomina-black)] mb-4">
                  {step.title}
                </h3>
                <p className="text-[var(--loomina-black)] leading-relaxed mb-8">
                  {step.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[var(--loomina-black)]/10 mt-auto">
                <p className="text-sm font-semibold text-[var(--loomina-gray-dark)] uppercase tracking-[0.14em]">
                  {step.footer}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
