"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/mission", label: "Mission" },
  { href: "/offres", label: "Offres" },
  { href: "/accompagnement", label: "Accompagnement" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050915]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        {/* LOGO */}
        <Link href="/" className="relative h-12 w-[180px] shrink-0">
          <Image
            src="/header_logo.png"
            alt="Lúmina"
            fill
            className="object-contain object-left drop-shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
            priority
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-6 md:gap-10 font-[family-name:var(--font-plus-jakarta-sans)] text-sm md:text-[15px] font-semibold">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative transition-opacity hover:opacity-70 ${
                  isActive ? "text-[var(--loomina-gold-light)]" : "text-[var(--loomina-text)]"
                }`}
              >
                {item.label}
                {isActive && <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-burgundy)]"></span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
