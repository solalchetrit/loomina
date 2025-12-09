"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#mission", label: "Notre Mission" },
  { href: "#process", label: "Le Parcours" },
  { href: "#audio-details", label: "L'Expérience" },
  { href: "#offres", label: "Offre" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <div className="relative h-10 w-36 md:h-12 md:w-48 -mt-1">
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
        <nav className="flex items-center gap-6 md:gap-8">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
