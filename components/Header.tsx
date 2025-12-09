"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#mission", label: "Notre Mission" },
  { href: "#process", label: "Le Parcours" },
  { href: "#offres", label: "Offre" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white shadow-sm transition-all duration-300">
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
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md border border-neutral-200/60 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                px-5 py-2 rounded-full
                text-sm font-medium text-neutral-600 
                transition-all duration-300 ease-out
                hover:text-black hover:bg-neutral-100/80
              "
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#contact"
            className="ml-2 px-5 py-2 rounded-full bg-[var(--loomina-ink)] text-white text-sm font-medium transition-transform hover:scale-105"
          >
            Commencer
          </Link>
        </nav>

        {/* --- MOBILE BURGER BUTTON --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative z-50 flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100/50 border border-black/5"
        >
          <div className="flex flex-col gap-1.5">
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-black block transition-transform"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-black block transition-opacity"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-black block transition-transform"
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
              <nav className="flex flex-col items-center gap-8">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-serif text-[var(--loomina-ink)] hover:text-[var(--loomina-gold)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="w-12 h-px bg-neutral-200 my-4"></div>

                <Link
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-4 rounded-full bg-[var(--loomina-ink)] text-white text-lg font-medium shadow-lg hover:scale-105 transition-transform"
                >
                  Commencer
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
