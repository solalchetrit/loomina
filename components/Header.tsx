"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
    window.addEventListener("scroll", handleScroll);
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

  // Animation Variants
  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      clipPath: "inset(0% 0% 100% 0%)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full transition-all duration-500 z-[1000] ${isScrolled || isOpen
          ? "bg-[var(--loomina-void)]/80 backdrop-blur-xl border-b border-[var(--loomina-mist)]/20"
          : "bg-transparent"
          }`}
      >
        <div className={`mx-auto flex items-center justify-between px-6 transition-all duration-500 ${isScrolled ? "h-16" : "h-20"} max-w-7xl`}>
          {/* Logo */}
          <Link href="/" className="relative z-[920] flex shrink-0 items-center group" onClick={() => setIsOpen(false)}>
            <div className="relative h-8 w-40">
              <Image
                src="/header-logo-trimmed.png"
                alt="Logo Loomina"
                fill
                className="object-contain object-left transition-all duration-300 group-hover:opacity-80"
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
                    ? "text-[var(--text-primary)] bg-[var(--loomina-mist)]/50 shadow-sm"
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
              shadow-md shadow-[var(--loomina-gold)]/20
              hover:shadow-lg hover:shadow-[var(--loomina-gold)]/30 hover:-translate-y-0.5
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
              hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)] hover:bg-[var(--loomina-void)]
            "
            >
              Se connecter
            </Link>
          </nav>

          {/* MOBILE BURGER BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden relative z-[920] flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-[var(--loomina-mist)]/20 transition-colors"
            aria-label="Menu"
            aria-expanded={isOpen}
          >
            <div className="flex flex-col gap-[5px] w-6 items-center justify-center">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-full h-[2px] bg-[var(--text-primary)] block origin-center transition-all duration-300 ease-out rounded-full"
              />
              <motion.span
                animate={isOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                className="w-full h-[2px] bg-[var(--text-primary)] block origin-center transition-all duration-300 ease-out rounded-full"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-full h-[2px] bg-[var(--text-primary)] block origin-center transition-all duration-300 ease-out rounded-full"
              />
            </div>
          </button>

        </div>
      </motion.header>

      {/* MOBILE FULLSCREEN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[910] flex flex-col pt-32 pb-10 px-6 md:hidden bg-[var(--loomina-void)]/98 backdrop-blur-2xl"
          >
            {/* Background Texture/Gradient for Premium Feel */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[var(--loomina-mist)]/10 to-transparent pointer-events-none" />

            <nav className="relative z-10 flex flex-col items-center justify-between h-full max-h-[600px] mx-auto w-full max-w-sm">
              <div className="flex flex-col items-center gap-6 w-full">
                {NAV_LINKS.map((item) => (
                  <motion.div key={item.href} variants={itemVariants} className="w-full">
                    <Link
                      href={item.label === "Accueil" ? "/#home" : item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        block w-full text-center text-4xl font-serif tracking-tight transition-all duration-300 py-2
                        ${pathname === item.href
                          ? "text-[var(--loomina-gold-dark)] italic scale-105"
                          : "text-[var(--text-primary)] hover:text-[var(--loomina-gold)] hover:scale-105"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                variants={itemVariants}
                className="w-full flex flex-col gap-4 mt-8"
              >
                <div className="w-12 h-0.5 bg-[var(--loomina-gold)]/30 mx-auto mb-6 rounded-full" />

                <Link
                  href="/order"
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full py-4 rounded-xl 
                    bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] 
                    text-white text-lg font-semibold text-center 
                    shadow-lg shadow-[var(--loomina-gold)]/20
                    active:scale-95 transition-all
                  "
                >
                  Commencer l’expérience
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full py-4 rounded-xl 
                    border border-[var(--loomina-mist)] 
                    text-[var(--text-secondary)] text-lg font-medium text-center 
                    hover:bg-[var(--loomina-mist)]/10 hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)]
                    active:scale-95 transition-all
                  "
                >
                  Espace Client
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
