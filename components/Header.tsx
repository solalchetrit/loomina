"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/experience", label: "Comment ça marche" },
  { href: "/offre", label: "Prix" },
  { href: "/about", label: "Notre histoire" },
  { href: "/faq", label: "Questions" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock with padding adjustment to prevent layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Small timeout to allow exit animation to start before unlocking
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Menu mobile : ouverture occasionnelle → animation courte, ease-out fort.
  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1], when: "afterChildren" },
    },
    open: {
      opacity: 1,
      transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1], staggerChildren: 0.04, delayChildren: 0.03 },
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, transform: reduceMotion ? "none" : "translateY(8px)", transition: { duration: 0.12 } },
    open: { opacity: 1, transform: reduceMotion ? "none" : "translateY(0px)", transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } },
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={`fixed top-0 z-[1000] w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300 ease-out ${
          isScrolled || isOpen
            ? "border-[var(--hairline)] bg-[var(--loomina-void)]/85 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="relative z-[920] flex shrink-0 items-center" onClick={() => setIsOpen(false)}>
            <div className="relative h-7 w-32 md:h-8 md:w-36">
              <Image
                src="/header-logo-trimmed.png"
                alt="Loomina — accueil"
                fill
                className="object-contain object-left"
                priority
                sizes="(max-width: 768px) 128px, 144px"
              />
            </div>
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 font-sans text-[14px] font-medium transition-colors duration-200 lg:px-4 ${
                  isActive(item.href)
                    ? "text-[var(--ink)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-[var(--loomina-gold)] lg:inset-x-4" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full px-3.5 py-2 font-sans text-[14px] font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--ink)]"
            >
              Espace auteur
            </Link>
            <Link
              href="/order"
              className="press inline-flex h-10 items-center rounded-full bg-[var(--ink)] px-5 font-sans text-[14px] font-semibold text-[var(--loomina-void)] hover:bg-[var(--ink-soft)]"
            >
              Commander
            </Link>
          </div>

          {/* BOUTON MENU MOBILE */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="press relative z-[920] -mr-2 flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 top-0 block h-[1.5px] w-full rounded-full bg-[var(--ink)] transition-transform duration-200 ease-out ${
                  isOpen ? "translate-y-[5px] rotate-45" : "translate-y-0"
                }`}
              />
              <span
                className={`absolute left-0 top-0 block h-[1.5px] w-full rounded-full bg-[var(--ink)] transition-transform duration-200 ease-out ${
                  isOpen ? "translate-y-[5px] -rotate-45" : "translate-y-[10px]"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* MENU MOBILE PLEIN ÉCRAN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[910] flex flex-col bg-[var(--loomina-void)] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 md:hidden"
          >
            <nav className="flex flex-1 flex-col" aria-label="Navigation mobile">
              <ul className="flex flex-col">
                {NAV_LINKS.map((item) => (
                  <motion.li key={item.href} variants={itemVariants} className="border-b border-[var(--hairline)]">
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`flex items-center justify-between py-4 font-serif text-[30px] tracking-[-0.02em] ${
                        isActive(item.href) ? "text-[var(--gold-ink)]" : "text-[var(--ink)]"
                      }`}
                    >
                      {item.label}
                      <svg className="h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div variants={itemVariants} className="mt-auto flex flex-col gap-3">
                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="press flex h-13 items-center justify-center rounded-full bg-[var(--ink)] font-sans text-base font-semibold text-[var(--loomina-void)]"
                >
                  Commander
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="press flex h-13 items-center justify-center rounded-full border border-[var(--hairline-strong)] font-sans text-base font-medium text-[var(--ink)]"
                >
                  Espace auteur
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
