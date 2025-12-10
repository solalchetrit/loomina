"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { STRIPE_CONFIG } from "@/config/stripe";

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

  // --- ANIMATION TIMELINE ---

  // Scale: Book shrinks slightly on scroll
  const scaleBook = useTransform(scrollYProgress, [0, 0.5], [1.4, 0.9]);

  // Y Movement: Book moves up naturally with sticky, but we adjust it
  const yBook = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  // X Movement (Desktop Only) 
  // - Book is in Right Col but starts Centered (-50% of container width approx? No, -50% of its own width + gutter).
  // - Actually, easier to start at Transformed X (Center) -> 0 (Natural Right Pos).
  // - Let's try: Start at -50% (Left) -> End at 0% (Right Col Center).
  const xBookDesktop = useTransform(scrollYProgress, [0, 0.5], ["-50%", "0%"]);

  // Opacity: Book stays visible.
  const opacityBook = useTransform(scrollYProgress, [0.8, 1], [1, isDesktop ? 1 : 0]); // Kept original as it was not part of the change.

  // Content Reveal
  const opacityContent = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  // Y Content: Slide up slightly
  const yContent = useTransform(scrollYProgress, [0.1, 0.4], [30, 0]);

  // X Content: Unused if static grid placement works well? 
  // User asked for "Left alignment". Static grid is Left.
  // Maybe slight slide in from Left?
  const xContentDesktop = useTransform(scrollYProgress, [0.1, 0.4], ["-10%", "0%"]);

  // Scroll Indicator Fade
  const opacityArrow = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] bg-white"
    >
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden px-6 flex flex-col items-center justify-center md:grid md:grid-cols-2 md:gap-8 max-w-7xl mx-auto">

        {/* --- LE LIVRE (STAR) --- */}
        {/* On Mobile: Centered. On Desktop: Right Column (col-start-2) */}
        <motion.div
          style={{
            scale: scaleBook,
            y: yBook,
            x: isDesktop ? xBookDesktop : 0
          }}
          className="relative z-10 w-full max-w-lg md:max-w-none md:w-auto md:col-start-2 justify-self-center will-change-transform order-1 md:order-2"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/hero-book-v2.png"
              alt="Exemple de livre autobiographique Loomina relié et imprimé"
              width={819}
              height={1024}
              className="w-full h-auto object-contain mix-blend-multiply max-h-[60vh]"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>

        {/* --- CONTENU (TEXTE) --- */}
        {/* On Mobile: Absolute Bottom. On Desktop: Left Column (col-start-1), Static. */}
        <motion.div
          style={{
            opacity: opacityContent,
            y: yContent,
            x: isDesktop ? xContentDesktop : 0
          }}
          className={`
            flex flex-col space-y-8 z-20 w-full max-w-lg md:max-w-none
            items-center text-center
            md:items-start md:text-left md:static md:translate-y-0
            absolute top-[60%] -translate-y-1/2 md:translate-y-0
            order-2 md:order-1
          `}
        >
          <span className="text-[var(--loomina-gold)] font-sans font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-1 block">
            La 1ère IA biographe pour écrire vos mémoires par téléphone
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-[var(--loomina-ink)] leading-[1.1] tracking-tight">
            Votre biographie, <br />
            <span className="italic text-[var(--loomina-gold)]">éternelle.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 leading-relaxed md:pr-12">
            Ne laissez pas vos souvenirs s'effacer. Nous transformons vos entretiens téléphoniques en un <strong>livre autobiographique</strong> d'exception, sans que vous n'ayez rien à écrire.
          </p>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 pt-4 w-full">
            <Link
              href="/order"
              className="px-8 py-3.5 rounded-full bg-[var(--loomina-ink)] text-white font-sans font-medium text-base transition-all hover:bg-black hover:scale-105 shadow-lg shadow-black/10 inline-block w-full sm:w-auto text-center"
            >
              Commander mon livre
            </Link>
            <a
              href="tel:+33159169357"
              className="px-8 py-3.5 rounded-full bg-white text-[var(--loomina-ink)] border border-neutral-200 font-sans font-medium text-base transition-all hover:bg-neutral-50 hover:border-neutral-300 w-full sm:w-auto text-center"
            >
              Essayer gratuitement
            </a>
          </div>
        </motion.div>

        {/* --- BACKGROUND --- */}
        <div className="absolute inset-x-0 top-0 h-full w-full -z-10 bg-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--loomina-gold)] rounded-full blur-[120px] opacity-5 -z-10 pointer-events-none"></div>
      </div>
    </section>
  );
}
