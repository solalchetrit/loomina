"use client";

import Link from "next/link";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#offres", label: "Offres" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 6);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        hasScrolled ? "bg-white/95 shadow-[0_12px_50px_-36px_rgba(0,0,0,0.25)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:h-[4.5rem] md:h-20 md:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Retour à l'accueil Loomina">
          <div className="relative h-9 w-32 md:h-10 md:w-40">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 160px, 200px"
            />
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-3 text-sm font-semibold text-[var(--loomina-ink)] sm:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-[var(--loomina-cloud)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <MagicButton
            href="tel:+33756830514"
            className="bg-[var(--loomina-black)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_50px_-36px_rgba(0,0,0,0.45)] sm:px-5"
          >
            Appeler l'équipe
          </MagicButton>
        </div>
      </div>
    </header>
  );
}
