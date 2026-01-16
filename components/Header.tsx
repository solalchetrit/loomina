"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/experience", label: "L'Expérience" },
  { href: "/offre", label: "L'Offre" },
  { href: "/about", label: "À Propos" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    requestAnimationFrame(() => setIsScrolled(window.scrollY > 20));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);


  return (
    <>
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        className={`fixed top-0 w-full transition-all duration-500 ${isOpen ? "z-[110]" : "z-50"} ${isScrolled
          ? "bg-[var(--loomina-void)]/95 backdrop-blur-xl"
          : "bg-transparent"
          }`}
      >
        <div className={`mx-auto flex items-center justify-between px-6 transition-all duration-500 ${isScrolled ? "h-16" : "h-20"} max-w-7xl`}>
          {/* Logo */}
          <Link href="/" className="relative z-10 flex shrink-0 items-center group">
            <div className="relative h-8 w-40">
              <Image
                src="/header-logo-trimmed.png"
                alt="Logo Loomina"
                fill
                className="object-contain object-left transition-all duration-300 group-hover:opacity-70"
                priority
                sizes="(max-width: 768px) 144px, 192px"
              />
            </div>
          </Link>

          {/* DESKTOP NAVIGATION - Glass Capsule */}
          <nav className="hidden md:flex items-center gap-1 p-1.5 glass rounded-full">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.label === "Accueil" ? "/#home" : item.href}
                className={`
                px-5 py-2.5 rounded-full
                text-sm font-medium transition-all duration-300 ease-out
                ${pathname === item.href
                    ? "text-[var(--text-primary)] bg-[var(--loomina-mist)]/50"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--loomina-mist)]/30"
                  }
              `}
              >
                {item.label}
              </Link>
            ))}

            {/* Separator */}
            <div className="h-6 w-px bg-[var(--loomina-mist)] mx-2" />

            {/* CTA Buttons */}
            <Link
              href="/order"
              className="
              px-6 py-2.5 rounded-full 
              bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]
              text-white font-sans font-semibold text-sm 
              transition-all duration-300 
              hover:shadow-lg hover:shadow-[var(--loomina-gold)]/20 hover:scale-105
            "
            >
              Commencer
            </Link>

            <Link
              href="/dashboard"
              className="
              px-5 py-2.5 rounded-full 
              border border-[var(--loomina-mist)] text-[var(--text-secondary)]
              text-sm font-medium 
              transition-all duration-300 
              hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)]
            "
            >
              Se connecter
            </Link>
          </nav>

          {/* MOBILE BURGER BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[110] flex items-center justify-center w-10 h-10 -mr-2"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5 w-6">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-[var(--text-primary)] block origin-center transition-transform duration-300 ease-out"
              />
              <motion.span
                animate={isOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                className="w-full h-0.5 bg-[var(--text-primary)] block transition-all duration-300 ease-out"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-[var(--text-primary)] block origin-center transition-all duration-300 ease-in-out"
              />
            </div>
          </button>

        </div>
      </motion.header>

      {/* MOBILE FULLSCREEN MENU - Premium & Simple */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center md:hidden"
          >
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-[var(--loomina-void)]/95 backdrop-blur-xl" />

            <nav className="relative z-10 flex flex-col items-center gap-10">
              <div className="flex flex-col items-center gap-6">
                {NAV_LINKS.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <Link
                      href={item.label === "Accueil" ? "/#home" : item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                    text-4xl font-serif tracking-tight transition-all duration-300
                    ${pathname === item.href
                          ? "text-gradient-gold"
                          : "text-[var(--text-primary)] hover:text-[var(--loomina-gold)]"
                        }
                  `}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-12 h-px bg-[var(--loomina-gold)]/30"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col gap-4 w-full"
              >
                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="
                    px-8 py-3 rounded-full 
                    bg-[var(--text-primary)] text-[var(--loomina-void)]
                    text-base font-medium tracking-wide text-center
                    active:scale-95 transition-transform
                    shadow-xl shadow-[var(--text-primary)]/10
                  "
                >
                  Commencer
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="
                    text-sm text-[var(--text-secondary)] text-center
                    hover:text-[var(--loomina-gold)] transition-colors
                    uppercase tracking-widest font-sans
                  "
                >
                  Connexion
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
