"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#mission", label: "Notre Mission" },
  { href: "#process", label: "Le Parcours" },
  { href: "#offres", label: "Offre" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <div className="relative h-8 w-40">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 144px, 192px"
            />
          </div>
        </Link>

        {/* Clean Navigation */}
        {/* Navigation Premium - Capsule unifiée */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                px-5 py-2 rounded-full
                text-sm font-medium text-neutral-600 
                transition-all duration-300 ease-out
                hover:text-black hover:bg-neutral-100/80
              "
            >
              {item.label}
            </Link>
          ))}

          {/* Bouton d'action distinct (Optionnel mais recommandé pour casser la monotonie) */}
          <Link
            href="#contact"
            className="ml-2 px-5 py-2 rounded-full bg-[var(--loomina-ink)] text-white text-sm font-medium transition-transform hover:scale-105"
          >
            Commencer
          </Link>
        </nav>

        {/* Version Mobile simplifiée (Menu Burger à prévoir idéalement, ou garder le scroll simple sans le style capsule) */}
        <nav className="md:hidden flex overflow-x-auto no-scrollbar w-full absolute top-20 left-0 bg-white border-b border-neutral-100 py-3 px-4 gap-4">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-600 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
