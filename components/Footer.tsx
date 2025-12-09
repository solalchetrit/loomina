"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Padding réduit (py-12 au lieu de py-20) pour un footer plus fin
    <footer className="w-full bg-black text-white border-t border-white/10 py-12 relative overflow-hidden">

      {/* Ligne décorative en bas */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="w-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Partie Gauche : Logo & Bouton alignés */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative h-8 w-40">
            {/* Logo Blanc (inversé) */}
            <Image
              src="/header-logo-trimmed.png"
              alt="Loomina Éditions"
              fill
              className="object-contain object-center md:object-left invert brightness-0"
            />
          </div>

          {/* Bouton : Fond Blanc, Police NOIRE (explicite) */}
          <MagicButton
            href="/contact"
            className="bg-white text-black border-none hover:bg-neutral-200 px-6 py-2 text-xs font-sans font-medium tracking-wide"
          >
            Nous écrire
          </MagicButton>
        </div>

        {/* Partie Droite : Liens Légaux discrets */}
        <div className="flex gap-6 text-xs font-light text-neutral-500">
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
          <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
          <span>&copy; {currentYear} Loomina.</span>
        </div>

      </div>
    </footer>
  );
}
