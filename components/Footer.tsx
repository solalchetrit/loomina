"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // Modifié pour l'esthétique "Luxe & Editorial"
    <footer className="w-full bg-gradient-to-b from-[var(--color-background)] to-[var(--color-ink-blue)] text-white border-t border-white/5 py-16 relative overflow-hidden">

      {/* Ligne décorative en bas */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/30 to-transparent" />

      <div className="w-full px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Partie Gauche : Logo & Bouton alignés */}
        <div className="flex flex-col items-start gap-6">
          <div className="relative h-8 w-40">
            <Link href="/" className="relative block w-full h-full">
              {/* Logo Blanc (inversé) */}
              <Image
                src="/header-logo-trimmed.png"
                alt="Loomina Éditions"
                fill
                className="object-contain object-left invert brightness-0"
              />
            </Link>
          </div>

          {/* Signature Manuscrite */}
          <div className="text-[var(--color-primary)] text-2xl rotate-[-5deg] opacity-80" style={{ fontFamily: '"Brush Script MT", cursive' }}>
            Loomina
          </div>

          {/* Bouton : Fond Blanc, Police NOIRE (explicite) */}
          <MagicButton
            href="/contact"
            variant="secondary"
            size="sm"
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
