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

  // Parallax effects
  const yBook = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white pt-20"
    >
      {/* --- LE LIVRE (CENTRAL PIECE) --- */}
      <motion.div
        style={{ y: yBook }}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 w-[80vw] max-w-sm md:max-w-md lg:max-w-lg"
      >
        {/* Floating Animation Wrapper */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/hero-book.png"
            alt="Livre Loomina"
            width={600}
            height={400}
            className="h-auto w-full object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </motion.div>

      {/* --- TEXTE (REVEAL) --- */}
      <motion.div
        style={{ opacity: opacityText }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 mt-12 text-center"
      >
        <h1 className="font-serif text-3xl md:text-5xl font-medium text-[var(--loomina-ink)] tracking-wide">
          Chaque vie mérite d'être lue.
        </h1>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-16 flex flex-col items-center gap-2 opacity-50"
        >
          <span className="text-xs uppercase tracking-widest text-[var(--loomina-gold)]">Découvrir</span>
          <div className="h-12 w-px bg-gradient-to-b from-[var(--loomina-gold)] to-transparent"></div>
        </motion.div>
      </motion.div>

      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-50 via-white to-white opacity-60"></div>
    </section>
  );
}
