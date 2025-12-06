"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/mission", label: "Mission" },
  { href: "/offres", label: "Offres" },
  { href: "/accompagnement", label: "Accompagnement" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/85 backdrop-blur-xl shadow-[0_12px_50px_-36px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-full px-4 py-2 transition hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-40px_rgba(0,0,0,0.55)]">
          <div className="relative h-10 w-32">
            <Image src="/header_logo.svg" alt="Logo Loomina" fill className="object-contain" priority sizes="8rem" />
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--loomina-amber-strong)] font-semibold">Mémoire vivante</p>
            <p className="text-base font-semibold text-[var(--loomina-ink)]">Une maison pour vos histoires</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-sm font-semibold shadow-sm">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 transition hover:bg-[var(--loomina-cloud)] ${
                    isActive
                      ? "bg-[var(--loomina-cloud)] text-[var(--loomina-amber-strong)] border border-black/5"
                      : "text-[var(--loomina-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <a
            href="mailto:contact@loomina.fr"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[var(--loomina-amber)] px-4 py-2 text-sm font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
          >
            Parler à une personne
          </a>
        </div>
      </div>
    </header>
  );
}
