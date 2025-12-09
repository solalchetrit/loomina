"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Animation values based on scroll
  // Book Move: Starts centered (y:0), moves up slightly (y:-50) or stays to accommodate text
  const scaleBook = useTransform(scrollYProgress, [0, 0.4], [1.3, 0.9]);
  const yBook = useTransform(scrollYProgress, [0, 0.4], [50, -100]); // Moves up to make room
  // Text Reveal: Fades in after the book moves
  const opacityText = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const yText = useTransform(scrollYProgress, [0.3, 0.6], [100, 0]);

  // Down Arrow Fade out
  const opacityArrow = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] bg-white" // Taller to allow scrolling interaction
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* --- LE LIVRE (The Star) --- */}
        <motion.div
          style={{ scale: scaleBook, y: yBook }}
          className="relative z-10 w-[80vw] max-w-lg"
        >
          {/* Floating "Breathing" Animation (Always active) */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/hero-book.png"
              alt="Livre Loomina"
              width={800}
              height={600}
              className="h-auto w-full object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>

        {/* --- TEXTE (S'affiche après) --- */}
        <motion.div
          style={{ opacity: opacityText, y: yText }}
          className="absolute bottom-[20%] z-20 text-center px-4"
        >
          <h1 className="font-serif text-3xl md:text-6xl font-medium text-[var(--loomina-ink)] tracking-wide mb-6">
            Chaque vie mérite d'être lue.
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
            Transformez vos souvenirs en un héritage éternel.
          </p>

          <Link
            href="#process"
            className="inline-block px-8 py-4 rounded-full bg-[var(--loomina-ink)] text-white font-medium hover:scale-105 transition-transform shadow-lg"
          >
            Commencer l'écriture
          </Link>
        </motion.div>

        {/* --- INCITATION AU SCROLL (Premier écran) --- */}
        <motion.div
          style={{ opacity: opacityArrow }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[var(--loomina-gold)] text-xs uppercase tracking-[0.2em]">Ouvrir</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-[var(--loomina-gold)] to-transparent"
          />
        </motion.div>

        {/* --- BACKGROUND --- */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_white_0%,_#fbfbfb_100%)]"></div>
      </div>
    </section>
  );
}
