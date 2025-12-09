"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

const FOOTER_LINKS = [
  {
    title: "Explorer",
    links: [
      { label: "Notre Mission", href: "#mission" },
      { label: "Le Parcours", href: "#process" },
      { label: "L'Expérience", href: "#audio-details" },
      { label: "Offre Unique", href: "#offres" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions Légales", href: "/legal" },
      { label: "Confidentialité", href: "/privacy" },
      { label: "CGV", href: "/terms" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-black pt-20 pb-10 text-white border-t border-white/10 overflow-hidden">
      {/* Background Decor (Optional subtlety) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr,2fr]">

          {/* Colonne 1 : Marque & Vision */}
          <div className="space-y-6">
            <div className="relative h-10 w-40">
              {/* Assure-toi que ce chemin d'image est correct selon tes assets */}
              <Image
                src="/header-logo-trimmed.png"
                alt="Loomina"
                fill
                className="object-contain object-left invert brightness-0 saturate-100 filter" // Invert pour passer le logo noir en blanc si c'est un PNG transparent
              />
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Nous capturons la voix, les souvenirs et l'essence d'une vie pour en faire un livre éternel.
            </p>
            <div className="pt-4">
              <MagicButton href="mailto:contact@loomina.fr" className="bg-white text-black px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-neutral-200 border-none">
                Nous Contacter
              </MagicButton>
            </div>
          </div>

          {/* Colonne 2 : Liens (Grid interne) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:pl-20">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--loomina-amber)]">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-neutral-400 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bas de page : Copyright */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; {currentYear} Loomina Éditions. Tous droits réservés.
          </p>
          <p className="text-xs text-neutral-600 font-medium">
            Fait avec mémoire et technologie à Paris.
          </p>
        </div>
      </div>
    </footer>
  );
}
