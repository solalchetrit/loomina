"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/experience", label: "Comment ça marche" },
  { href: "/offre", label: "Le livre et le prix" },
  { href: "/faq", label: "Questions" },
  { href: "/about", label: "Notre histoire" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Le menu mobile bloque le défilement derrière lui ; il se ferme au clic sur un lien.
  const close = () => setIsOpen(false);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 z-[1000] w-full border-b transition-[background-color,border-color] duration-200 ${
          isScrolled || isOpen ? "border-[var(--rule)] bg-[var(--paper)]/95 backdrop-blur" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 md:h-[72px]">
          <Link href="/" className="relative z-[920] flex shrink-0 items-center" aria-label="Loomina, accueil">
            <div className="relative h-7 w-32 md:h-8 md:w-36">
              <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" priority sizes="(max-width: 768px) 128px, 144px" />
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`font-sans text-[15px] font-medium underline-offset-[6px] transition-colors duration-150 ${
                  isActive(item.href)
                    ? "text-[var(--ink)] underline decoration-[var(--gold)]"
                    : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline hover:decoration-[var(--rule-strong)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/dashboard"
              aria-current={isActive("/dashboard") ? "page" : undefined}
              className="font-sans text-[15px] font-medium text-[var(--ink-2)] underline-offset-[6px] hover:text-[var(--ink)] hover:underline"
            >
              Espace auteur
            </Link>
            <Link
              href="/order"
              className="press inline-flex h-11 items-center rounded-lg bg-[var(--ink)] px-5 font-sans text-[15px] font-semibold text-[var(--paper)] hover:bg-[var(--ink-soft)]"
            >
              Commander
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="press relative z-[920] -mr-2 flex h-12 w-12 items-center justify-center rounded-lg md:hidden"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
          >
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 block h-[2px] w-full bg-[var(--ink)] transition-transform duration-200 ${
                  isOpen ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-0 block h-[2px] w-full bg-[var(--ink)] transition-transform duration-200 ${
                  isOpen ? "translate-y-[5px] -rotate-45" : "translate-y-[10px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* Menu mobile : une liste, grande, lisible. */}
      {isOpen && (
        <div id="menu-mobile" className="rise fixed inset-0 z-[910] flex flex-col bg-[var(--paper)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 md:hidden">
          <nav className="flex flex-1 flex-col" aria-label="Navigation mobile">
            <ul className="rule-top">
              {NAV_LINKS.map((item) => (
                <li key={item.href} className="border-b border-[var(--rule)]">
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex min-h-[60px] items-center font-serif text-[28px] tracking-[-0.01em] text-[var(--ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-b border-[var(--rule)]">
                <Link href="/dashboard" onClick={close} className="flex min-h-[60px] items-center font-serif text-[28px] tracking-[-0.01em] text-[var(--ink)]">
                  Espace auteur
                </Link>
              </li>
            </ul>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link
                href="/order"
                onClick={close}
                className="press flex h-14 items-center justify-center rounded-lg bg-[var(--ink)] font-sans text-[17px] font-semibold text-[var(--paper)]"
              >
                Commander
              </Link>
              <a
                href="tel:+33159169357"
                className="press flex h-14 items-center justify-center rounded-lg border border-[var(--ink)] font-sans text-[17px] font-semibold text-[var(--ink)]"
              >
                Essayer : 01 59 16 93 57
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
