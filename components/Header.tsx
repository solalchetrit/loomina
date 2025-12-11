"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const NAV_LINKS = [
  { href: "#process", label: "Le Parcours" },
  { href: "#offres", label: "Offre" },
];

import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Force visibility on non-home pages or handle scroll on home
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHome) {
      if (latest > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(true);
    }
  });

  // Ensure correct initial state when navigating
  useEffect(() => {
    if (!isHome) {
      setIsVisible(true);
    } else {
      // On home, check if already scrolled (case of refresh) or default to false
      setIsVisible(window.scrollY > 50);
    }
  }, [isHome]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 z-50 w-full border-b border-black/5 bg-white shadow-sm"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <div className="relative h-8 w-40">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 144px, 192px"
            />
          </div>
        </Link>

        {/* --- DESKTOP NAVIGATION (Capsule) --- */}
        {/* --- DESKTOP NAVIGATION (Capsule) --- */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md border border-neutral-200/60 rounded-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={isHome ? item.href : `/${item.href}`}
              className="
                px-5 py-2.5 rounded-full
                text-sm font-medium text-neutral-600 
                transition-all duration-300 ease-out
                hover:text-black hover:bg-neutral-100
              "
            >
              {item.label}
            </Link>
          ))}

          {/* Séparateur visuel optionnel */}
          <div className="h-6 w-px bg-neutral-200 mx-1"></div>

          {/* Bouton Commencer - Style Primaire (Mise en valeur) */}
          <Link
            href="/order"
            className="
              hidden md:inline-flex px-6 py-2.5 rounded-full 
              bg-[var(--loomina-ink)] text-white 
              font-sans font-medium text-sm 
              transition-all duration-300 
              shadow-md shadow-black/10
              hover:bg-[var(--loomina-amber-strong)] hover:text-white hover:scale-105 hover:shadow-lg
            "
          >
            Commencer
          </Link>

          {/* Bouton Se connecter - Style Gold */}
          <Link
            href="/dashboard"
            className="
              hidden md:inline-flex px-5 py-2.5 rounded-full 
              bg-[var(--loomina-amber)] text-white
              text-sm font-medium 
              transition-all duration-300 
              shadow-md shadow-[var(--loomina-amber)]/20
              hover:bg-[var(--loomina-amber-strong)] hover:scale-105 hover:shadow-lg
            "
          >
            Se connecter
          </Link>
        </nav>

        {/* --- MOBILE BURGER BUTTON (MINIMALIST) --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-50 flex items-center justify-center w-10 h-10 -mr-2"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5 w-6">
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-full h-0.5 bg-black block origin-center transition-transform duration-300 ease-out"
            />
            <motion.span
              animate={isOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
              className="w-full h-0.5 bg-black block transition-all duration-300 ease-out"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} // Adjusted y offset for cleaner X
              className="w-full h-0.5 bg-black block origin-center transition-transform duration-300 ease-out"
            />
          </div>
        </button>

        {/* --- MOBILE FULLSCREEN MENU --- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center md:hidden"
            >
              <nav className="flex flex-col items-center gap-6">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={isHome ? item.href : `/${item.href}`}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-serif text-[var(--loomina-ink)] hover:text-[var(--loomina-gold)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="w-12 h-px bg-neutral-200 my-4"></div>

                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-4 rounded-full bg-[var(--loomina-ink)] text-white text-lg font-medium shadow-lg active:scale-95 transition-transform"
                >
                  Commencer
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-3 rounded-full bg-[var(--loomina-amber)] text-white text-lg font-medium shadow-lg active:scale-95 transition-transform"
                >
                  Se connecter
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
