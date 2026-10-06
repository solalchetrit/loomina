"use client";

import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/cgv", label: "CGV" },
  { href: "/legal", label: "Mentions Légales" },
  { href: "/privacy", label: "Confidentialité" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[var(--loomina-void)] border-t border-[var(--hairline)] overflow-hidden">
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="grid md:grid-cols-12 gap-12 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-8 w-40">
                <Image
                  src="/header-logo-trimmed.png"
                  alt="Loomina"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed max-w-sm font-sans">
              Vous racontez votre vie au téléphone, nous en faisons un livre relié.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="mb-5 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors duration-200 text-[15px] font-sans">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/experience" className="text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors duration-200 text-[15px] font-sans">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/offre" className="text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors duration-200 text-[15px] font-sans">
                  Prix
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors duration-200 text-[15px] font-sans">
                  Notre histoire
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h4 className="mb-5 font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Une question ?
            </h4>
            <p className="mb-2 font-sans text-[15px] text-[var(--text-secondary)]">
              Écrivez-nous, c’est une personne qui vous répond :
            </p>
            <p className="mb-6 font-sans text-[15px]">
              <a href="mailto:contact@loomina.eu" className="font-semibold text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4 transition-colors duration-200 hover:decoration-[var(--loomina-gold)]">contact@loomina.eu</a>
            </p>
            <p className="mb-6 font-sans text-[15px] text-[var(--text-secondary)]">
              Pour essayer Loomina :{" "}
              <a href="tel:+33159169357" className="font-semibold text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4 transition-colors duration-200 hover:decoration-[var(--loomina-gold)]">01 59 16 93 57</a>
            </p>
            <Link
              href="/contact"
              className="press inline-flex h-11 items-center gap-2 rounded-full border border-[var(--hairline-strong)] bg-[var(--paper)] px-5 font-sans text-sm font-semibold text-[var(--ink)] hover:border-[var(--loomina-gold)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Nous écrire
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--hairline)] mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-[13px] text-[var(--text-muted)]">
            {FOOTER_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-6">
                <Link
                  href={link.href}
                  className="hover:text-[var(--ink)] transition-colors duration-200"
                >
                  {link.label}
                </Link>
                {index < FOOTER_LINKS.length - 1 && (
                  <span className="hidden h-1 w-1 rounded-full bg-[var(--loomina-mist)] sm:inline-block" />
                )}
              </span>
            ))}
          </div>

          <div className="font-sans text-[13px] text-[var(--text-muted)]">
            © {currentYear} Loomina. Tous droits réservés.
          </div>
        </div>
      </div>

    </footer>
  );
}
