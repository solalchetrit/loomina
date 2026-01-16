"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LOOMINA_CONFIG } from "@/config/loomina";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[auto] md:min-h-[600px] lg:min-h-[90vh] flex items-center justify-center pt-6 pb-10 md:pt-0 md:pb-0 overflow-hidden scroll-mt-0">
      <div className="w-full px-6 flex flex-col items-center justify-center gap-4 md:gap-12 md:grid md:grid-cols-2 max-w-7xl mx-auto relative z-10">

        {/* CONTENU TEXTE - Consistent entry animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }}
          className={`
            flex flex-col space-y-4 md:space-y-8 z-20 w-full max-w-lg md:max-w-none
            items-center text-center 
            md:items-start md:text-left
            order-2 md:order-1
          `}
        >
          {/* Label with static accent */}
          <div className="flex items-center gap-4">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
            <span className="text-[var(--loomina-gold)] font-sans font-semibold text-[11px] md:text-[13px] tracking-[0.25em] uppercase">
              La 1ère IA Biographe
            </span>
            <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)] md:hidden" />
          </div>

          <h1 className="heading-display font-serif text-[var(--text-primary)] leading-[1.1]">
            Vos souvenirs méritent
            <br />
            <span className="text-gradient-gold italic">l&apos;éternité.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed md:pr-12 max-w-md md:max-w-none font-serif">
            Racontez votre histoire par téléphone. Notre IA biographe la transforme en un{" "}
            <span className="text-[var(--text-primary)] font-medium">livre d&apos;exception</span>,
            sans que vous n&apos;ayez rien à écrire.
          </p>

          {/* Stats - Compact and premium */}
          <div className="flex items-center gap-4 md:gap-8 py-1 md:py-2">
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-serif text-gradient-gold">14+</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Chapitres</div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gradient-to-b from-transparent via-[var(--loomina-mist)] to-transparent" />
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-serif text-gradient-gold">219€</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Tout inclus</div>
            </div>
            <div className="w-px h-8 md:h-10 bg-gradient-to-b from-transparent via-[var(--loomina-mist)] to-transparent" />
            <div className="text-center md:text-left">
              <div className="text-3xl font-serif text-gradient-gold">∞</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Souvenirs</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 md:gap-4 pt-2 md:pt-4 w-full">
            <Button
              href="/order"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Commander mon livre
            </Button>
            <Button
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Essayer gratuitement
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-4 text-[var(--text-muted)] text-[10px] md:text-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Satisfait ou remboursé</span>
            </div>
          </div>
        </motion.div>

        {/* LE LIVRE - Consistent entry animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="relative z-10 w-full max-w-[220px] md:max-w-none md:w-[110%] lg:w-[120%] md:-mr-12 lg:-mr-24 justify-self-center md:justify-self-start order-1 md:order-2"
        >
          <div className="relative group transition-transform duration-700 hover:scale-[1.02]">

            <Image
              src="/hero-book-v2.png"
              alt="Exemple de livre autobiographique Loomina relié et imprimé"
              width={819}
              height={1024}
              className="w-full h-auto object-contain relative z-10 drop-shadow-2xl transition-all duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Static scroll indicator */}

    </section>
  );
}
