"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/mission", label: "Mission" },
  { href: "/offres", label: "Offres" },
  { href: "/accompagnement", label: "Accompagnement" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl shadow-[0_12px_50px_-36px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-4 md:h-24 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-4 rounded-full px-4 py-2 transition hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-40px_rgba(0,0,0,0.55)]"
        >
          <div className="relative h-16 w-52 md:h-24 md:w-80">
            <Image src="/header-logo-new.png" alt="Logo Loomina" fill className="object-contain" priority sizes="(max-width: 768px) 208px, 320px" />
          </div>
        </Link>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3 md:gap-4">
          <div className="hidden sm:inline-flex md:order-1">
            <MagicButton
              href="mailto:contact@loomina.fr"
              className="px-4 py-2 bg-[var(--loomina-black)] text-white border border-white/10 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] md:px-5"
            >
              Parler à une personne
            </MagicButton>
          </div>

          <nav className="order-2 flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-2 py-1 text-sm font-semibold shadow-sm md:gap-3 md:px-4">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 transition hover:bg-[var(--loomina-cloud)] md:px-4 ${isActive
                    ? "bg-[var(--loomina-cloud)] text-[var(--loomina-amber-strong)] border border-black/5"
                    : "text-[var(--loomina-ink)]"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
