"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-white border-t border-white/10 py-16 md:py-20 relative overflow-hidden">

      {/* Petite touche déco en bas */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-start justify-between gap-12">

        {/* Partie Gauche : Marque */}
        <div className="space-y-6 max-w-sm">
          <div className="relative h-10 w-48">
            {/* Logo inversé pour être BLANC sur fond NOIR */}
            <Image
              src="/header-logo-trimmed.png"
              alt="Loomina Éditions"
              fill
              className="object-contain object-left invert brightness-0"
            />
          </div>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Nous capturons l'essence d'une vie pour en faire un héritage éternel.
            <br />GARDIENS DE LA MÉMOIRE FAMILIALE.
          </p>

          {/* Bouton Contact Spécial */}
          <div className="pt-2">
            <MagicButton
              href="/contact"
              className="bg-white text-black border-none hover:bg-neutral-200 px-8 py-3 text-sm"
            >
              Nous écrire
            </MagicButton>
          </div>
        </div>

        {/* Partie Droite : Navigation Utile */}
        <div className="grid grid-cols-2 gap-12 text-sm font-light">

          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-white tracking-widest uppercase text-xs opacity-50">Aide</h4>
            <Link href="/faq" className="text-neutral-400 hover:text-[var(--loomina-amber)] transition-colors">FAQ</Link>
            <Link href="/contact" className="text-neutral-400 hover:text-[var(--loomina-amber)] transition-colors">Contact</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-medium text-white tracking-widest uppercase text-xs opacity-50">Légal</h4>
            <Link href="/cgv" className="text-neutral-400 hover:text-white transition-colors">CGV</Link>
            <Link href="/legal" className="text-neutral-400 hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">Confidentialité</Link>
          </div>

        </div>

      </div>

      {/* Copyright */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 text-xs text-neutral-600 flex justify-between">
        <span>&copy; {currentYear} Loomina Éditions.</span>
        <span>Paris, France.</span>
      </div>
    </footer>
  );
}
