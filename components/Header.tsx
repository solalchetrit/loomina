"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

const NAV_LINKS = [
  { href: "/experience", label: "Comment ça marche" },
  { href: "/offre", label: "Le livre et le prix" },
  { href: "/faq", label: "Questions" },
  // « Notre histoire » (/about) masquée du menu à la demande de Solal (12/11/2026) ; la page existe toujours.
  // { href: "/about", label: "Notre histoire" },
];

/** Menu flottant : une barre blanche arrondie, posée au-dessus de la page. */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const close = () => setIsOpen(false);

  // Le menu mobile bloque le défilement derrière lui.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-[22px] border border-[var(--line)] bg-white/90 pl-5 pr-2.5 shadow-[var(--shadow-bar)] backdrop-blur-md md:h-[68px] md:pl-6">
          <Link href="/" className="relative z-[920] flex shrink-0 items-center" aria-label="Loomina, accueil">
            <span className="relative block h-7 w-[118px] md:h-[30px] md:w-[128px]">
              <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" priority sizes="128px" />
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${
                  isActive(item.href) ? "bg-[var(--surface-2)] text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <Link
              href="/dashboard"
              aria-current={isActive("/dashboard") ? "page" : undefined}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--surface-2)]"
            >
              Espace auteur
            </Link>
            <a
              href={`tel:${SITE.phone}`}
              className="press inline-flex h-12 items-center whitespace-nowrap rounded-[14px] bg-[var(--amber-soft)] px-4 text-[15px] font-bold text-[var(--amber-deep)] hover:bg-[#f9dfb8]"
            >
              Essayer la démo
            </a>
            <Link
              href="/order"
              className="press inline-flex h-12 items-center whitespace-nowrap rounded-[14px] bg-[var(--ink)] px-5 text-[15px] font-bold text-white hover:bg-[var(--ink-soft)]"
            >
              Commander
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="press relative z-[920] flex h-12 w-12 items-center justify-center rounded-[14px] hover:bg-[var(--surface-2)] xl:hidden"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="menu-mobile"
          >
            <span className="relative block h-3 w-6">
              <span
                className={`absolute left-0 top-0 block h-[2px] w-full rounded bg-[var(--ink)] transition-transform duration-200 ${
                  isOpen ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-0 block h-[2px] w-full rounded bg-[var(--ink)] transition-transform duration-200 ${
                  isOpen ? "translate-y-[5px] -rotate-45" : "translate-y-[10px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {isOpen && (
        <div id="menu-mobile" className="fixed inset-0 z-[910] flex flex-col bg-[var(--canvas)] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 xl:hidden">
          <nav className="flex flex-1 flex-col" aria-label="Navigation mobile">
            <ul className="card divide-y divide-[var(--line-soft)] px-5">
              {[...NAV_LINKS, { href: "/dashboard", label: "Espace auteur" }].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex min-h-[60px] items-center text-[21px] font-bold tracking-[-0.02em] text-[var(--ink)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Link
                href="/order"
                onClick={close}
                className="press flex h-14 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--ink)] text-[17px] font-bold text-white"
              >
                Commander
              </Link>
              <a
                href={`tel:${SITE.phone}`}
                className="press flex h-14 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--amber)] text-[17px] font-bold text-[var(--ink)]"
              >
                Essayer la démo : {SITE.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
