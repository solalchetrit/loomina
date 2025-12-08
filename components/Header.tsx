"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#top", label: "Accueil" },
  { href: "#mission", label: "Mission" },
  { href: "#accompagnement", label: "Accompagnement" },
  { href: "#offres", label: "Offres" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl shadow-[0_12px_50px_-36px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-4 md:h-24 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-4 rounded-full py-2 pl-0 pr-4 transition hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-40px_rgba(0,0,0,0.55)]"
        >
          <div className="relative h-10 w-36 md:h-12 md:w-48 -mt-1">
            <Image src="/header-logo-trimmed.png" alt="Logo Loomina" fill className="object-contain object-left" priority sizes="(max-width: 768px) 144px, 192px" />
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

          <nav className="order-2 hidden items-center gap-2 rounded-full border border-black/5 bg-white/85 px-2 py-1 text-sm font-semibold shadow-sm md:flex md:gap-3 md:px-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-[var(--loomina-cloud)] md:px-4 text-[var(--loomina-ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--loomina-ink)] shadow-sm transition hover:-translate-y-[1px] md:hidden"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Basculer le menu</span>
            <div className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 rounded-full bg-current transition ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={closeMenu}>
          <div
            className="absolute right-4 top-4 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-[0.18em]">Navigation</p>
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--loomina-ink)] shadow-sm"
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-xl border border-black/5 bg-[var(--loomina-cloud)]/60 px-4 py-3 text-base font-semibold text-[var(--loomina-ink)] shadow-sm transition hover:border-[var(--loomina-amber-strong)] hover:text-[var(--loomina-amber-strong)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 grid gap-3">
              <MagicButton
                href="mailto:contact@loomina.fr"
                className="w-full justify-center bg-black text-white shadow-lg border border-black hover:bg-neutral-800"
              >
                Parler à une personne
              </MagicButton>
              <MagicButton
                href="tel:+33600000000"
                variant="secondary"
                className="w-full justify-center bg-white text-black border border-black/10 shadow-md hover:bg-neutral-50 !text-black"
              >
                📞 Appeler Loomina
              </MagicButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
