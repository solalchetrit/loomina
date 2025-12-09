"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-black/5 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

        {/* Partie Gauche : Logo & Slogan */}
        <div className="space-y-4">
          <div className="relative h-8 w-32 md:h-10 md:w-40">
            {/* Logo Noir (car fond blanc) - assure-toi que l'image est correcte */}
            <Image
              src="/header-logo-trimmed.png"
              alt="Loomina Éditions"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="text-xs text-neutral-500 font-medium tracking-wide">
            GARDIENS DE LA MÉMOIRE FAMILIALE
          </p>
        </div>

        {/* Partie Droite : Liens & Mentions */}
        <div className="flex flex-col md:items-end gap-4 text-sm font-light text-neutral-600">
          <div className="flex gap-6">
            <Link href="#mission" className="hover:text-black transition-colors">Mission</Link>
            <Link href="#offres" className="hover:text-black transition-colors">Offre</Link>
            <Link href="mailto:contact@loomina.fr" className="hover:text-black transition-colors">Contact</Link>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-xs text-neutral-400 mt-2 md:mt-0">
            <span>&copy; {currentYear} Loomina.</span>
            <Link href="/legal" className="hover:text-neutral-600">Mentions Légales</Link>
            <Link href="/privacy" className="hover:text-neutral-600">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
