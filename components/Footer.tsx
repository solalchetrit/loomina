"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const FOOTER_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/cgv", label: "CGV" },
  { href: "/legal", label: "Mentions Légales" },
  { href: "/privacy", label: "Confidentialité" },
];

const SOCIAL_LINKS = [
  {
    href: "#",
    label: "Instagram",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  },
  {
    href: "#",
    label: "LinkedIn",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[var(--loomina-void)] border-t border-[var(--loomina-mist)] overflow-hidden">
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-12 gap-12 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-8 w-40">
                <Image
                  src="/header-logo-trimmed.png"
                  alt="Loomina Éditions"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm font-serif">
              La première IA biographe qui transforme vos souvenirs en un livre d&apos;exception.
              Racontez votre histoire, nous l&apos;écrivons.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--loomina-gold)] hover:border-[var(--loomina-gold)]/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-[var(--text-primary)] font-semibold text-sm uppercase tracking-wider mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--loomina-gold)] transition-colors text-sm font-sans">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/experience" className="text-[var(--text-secondary)] hover:text-[var(--loomina-gold)] transition-colors text-sm font-sans">
                  L&apos;Expérience
                </Link>
              </li>
              <li>
                <Link href="/offre" className="text-[var(--text-secondary)] hover:text-[var(--loomina-gold)] transition-colors text-sm font-sans">
                  L&apos;Offre
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--loomina-gold)] transition-colors text-sm font-sans">
                  À Propos
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4">
            <h4 className="text-[var(--text-primary)] font-semibold text-sm uppercase tracking-wider mb-6">
              Une question ?
            </h4>
            <p className="text-[var(--text-secondary)] text-sm mb-6 font-serif">
              Notre équipe est à votre écoute pour vous accompagner dans votre projet de biographie.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--loomina-gold)]/40 text-[var(--loomina-gold)] text-sm font-medium hover:bg-[var(--loomina-gold)]/10 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Nous écrire
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--loomina-mist)] mb-8 opacity-50" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            {FOOTER_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-6">
                <Link
                  href={link.href}
                  className="hover:text-[var(--loomina-gold)] transition-colors"
                >
                  {link.label}
                </Link>
                {index < FOOTER_LINKS.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-[var(--loomina-mist)]" />
                )}
              </span>
            ))}
          </div>

          <div className="text-xs text-[var(--text-muted)]">
            © {currentYear} Loomina. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Decorative bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--loomina-gold)]/30 to-transparent" />
    </footer>
  );
}
