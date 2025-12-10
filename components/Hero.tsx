"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

export default function Hero() {
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // --- ANIMATION TIMELINE (Scroll 0 -> 1) ---
  const scaleBook = useTransform(scrollYProgress, [0, 0.5], [1.6, 1.0]);
  const yBook = useTransform(scrollYProgress, [0, 0.5], [0, -50]); // Reduced upward movement to avoid top cutoff
  // Move right ONLY on desktop
  const xBook = useTransform(scrollYProgress, [0, 0.5], ["0%", isDesktop ? "40%" : "0%"]); // Reduced X slightly to avoid right cutoff
  const opacityBook = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  // Content Reveal
  const opacityContent = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const yContent = useTransform(scrollYProgress, [0.3, 0.6], [50, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] bg-white"
    >
      <div className="sticky top-0 h-[100vh] flex flex-col items-center justify-center overflow-hidden px-4">

        {/* --- LE LIVRE (STAR) --- */}
        <motion.div
          style={{ scale: scaleBook, y: yBook, x: xBook }}
          className="relative z-10 w-full max-w-2xl md:max-w-3xl will-change-transform"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Added unoptimized to ensure display if Next.js image optimization fails locally */}
            <Image
              src="/hero-book-v2.png"
              alt="Livre Loomina"
              width={819}
              height={1024}
              className="w-full h-auto object-contain mix-blend-multiply"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>

        {/* --- CONTENU COMPLET HERO (Section 1) --- */}
        <motion.div
          style={{ opacity: opacityContent, y: yContent }}
          className="absolute top-[75%] md:top-1/2 md:-translate-y-1/2 z-20 flex flex-col items-center md:items-start text-center md:text-left w-full max-w-7xl md:grid md:grid-cols-2 px-6 md:px-12 pointer-events-none md:pointer-events-auto gap-12 md:gap-32"
        >
          {/* Left Column for Text (Desktop) */}
          <div className="flex flex-col items-center md:items-start space-y-8">
            <span className="text-[var(--loomina-gold)] font-sans font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-3 block">
              La première biographie rédigée 100% par téléphone
            </span>
            <h1 className="text-4xl md:text-7xl font-serif font-medium text-[var(--loomina-ink)] leading-[1.1] tracking-tight">
              Votre histoire, <br />
              <span className="italic text-[var(--loomina-gold)]">éternelle.</span>
            </h1>

            <p className="max-w-lg text-lg md:text-xl text-neutral-600 leading-relaxed">
              Nous transformons vos souvenirs en un chef-d'œuvre littéraire. <br className="hidden md:block" />
              Sans effort. Juste votre voix.
            </p>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-4 pointer-events-auto">
              <Link
                href="#contact"
                className="px-8 py-3.5 rounded-full bg-[var(--loomina-ink)] text-white font-sans font-medium text-base transition-all hover:bg-black hover:scale-105 shadow-lg shadow-black/10"
              >
                Commencer l'écriture
              </Link>
              <a
                href="tel:+33159169357"
                className="px-8 py-3.5 rounded-full bg-white text-[var(--loomina-ink)] border border-neutral-200 font-sans font-medium text-base transition-all hover:bg-neutral-50 hover:border-neutral-300"
              >
                Je teste Loomina
              </a>
            </div>
          </div>

          {/* Right Column Spacer (Book occupies this space visually) */}
          <div></div>
        </motion.div>

        {/* --- BACKGROUND --- */}
        <div className="absolute inset-x-0 top-0 h-full w-full -z-10 bg-white"></div>
        {/* Subtle Gold Glow behind book */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--loomina-gold)] rounded-full blur-[120px] opacity-5 -z-10 pointer-events-none"></div>
      </div>
    </section>
  );
}
