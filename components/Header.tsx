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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--loomina-burgundy)]/10 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_-28px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 md:px-10">
        {/* LOGO */}
        <Link href="/" className="relative h-16 w-[240px] shrink-0">
          <Image
            src="/header_logo.png"
            alt="Lúmina"
            fill
            className="object-contain object-left drop-shadow-[0_10px_26px_rgba(176,79,97,0.18)]"
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
                  isActive ? "text-[var(--loomina-burgundy-dark)]" : "text-[var(--loomina-text)]"
                }`}
              >
                {item.label}
                {isActive && <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[var(--loomina-burgundy)] to-[var(--loomina-gold)]"></span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
