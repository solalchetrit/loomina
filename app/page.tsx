import Hero from "@/components/Hero";
import StarDecoration from "@/components/ui/StarDecoration";
import HowItWorks from "@/components/HowItWorks";
import MagicButton from "@/components/ui/MagicButton";
import { STRIPE_CONFIG } from "@/config/stripe";

// --- DATA ---
const pillars = [
  {
    title: "L'Oralité retrouvée",
    description: "Plus besoin d'écrire soi-même. Notre IA biographe est une oreille attentive qui recueille vos confidences et souvenirs au téléphone, à votre rythme.",
  },
  {
    title: "L'Objet éternel",
    description: "Nous transformons le moment éphémère de la parole en un livre physique de haute qualité, véritable trésor de mémoire qui traversera les générations.",
  },
  {
    title: "L'Essence capturée",
    description: "Nous ne capturons pas seulement les faits, mais aussi votre voix, vos expressions et votre personnalité dans ce récit de vie unique.",
  },
];



// --- DATA MODIFIÉE ---
// On garde la structure mais on enrichit le texte pour le SEO
const offer = {
  title: "Le Coffret Biographie Complet", // Plus explicite que "L'Héritage Loomina"
  price: "219 €",
  description: "Un tarif tout compris pour éditer vos mémoires. De la collecte de vos souvenirs jusqu'à la livraison de votre livre imprimé.",
  highlights: [ // Ces points sont utilisés plus bas dans le JSX, on peut les laisser ici pour référence
    "Entretiens biographiques illimités",
    "Rédaction par IA et correction pro",
    "Mise en page éditoriale et photos",
    "Impression du livre incluse",
    "Version numérique (Ebook) offerte"
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black">
      <Hero />

      {/* --- SECTION 3: LE PARCOURS --- */}
      <HowItWorks />

      {/* --- SECTION 5: OFFRE (MODIFIÉE) --- */}
      <div id="offres" className="w-full scroll-mt-24">
        <section className="w-full bg-white px-6 py-20 md:py-28 text-black border-t border-neutral-100">
          <div className="mx-auto max-w-3xl text-center space-y-10">

            <div className="space-y-4">
              {/* H2 Optimisé SEO : "Offre", "Livre de vie" */}
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Votre livre de vie, clé en main.</h2>
              <p className="text-xl text-neutral-500">Transmettre son histoire n'a jamais été aussi simple et accessible.</p>
            </div>

            <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-[var(--loomina-amber)]/30 shadow-2xl shadow-[var(--loomina-amber)]/5">
              {/* ... (Glow Effect) ... */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--loomina-amber)_0%,_transparent_70%)] opacity-20 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>


              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column */}
                <div className="space-y-8 text-left">
                  <div>
                    <h3 className="text-3xl font-serif text-white mb-4">{offer.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-lg">{offer.description}</p>
                  </div>

                  <ul className="space-y-4 text-neutral-300">
                    {/* Liste à puces avec mots-clés sémantiques */}
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1"><strong>Entretiens illimités</strong> avec votre biographe IA</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Rédaction, correction et style littéraire</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Mise en page sur mesure avec vos <strong>photos</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1"><strong>Impression</strong> et livraison à domicile</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Version numérique privée incluse</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column ... */}
                <div className="flex flex-col items-center justify-center text-center space-y-8 md:border-l border-white/5 md:pl-12">
                  <div className="space-y-2">
                    <span className="text-neutral-500 text-sm uppercase tracking-widest font-medium">Prix de lancement</span>
                    <div className="text-7xl md:text-8xl font-serif font-medium bg-clip-text text-transparent bg-gradient-to-b from-[#ffecc8] to-[#c58c3c]">
                      {offer.price}
                    </div>
                  </div>

                  <div className="w-full">
                    <MagicButton
                      href="/order"
                      variant="secondary"
                      size="lg"
                      className="w-full shadow-lg shadow-amber-500/20"
                    >
                      Commander ma biographie
                    </MagicButton>
                    <p className="text-neutral-500 text-xs mt-4">Paiement 100% sécurisé via Stripe</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Satisfait ou remboursé après le premier entretien. Un cadeau idéal pour vos parents et grands-parents.
            </p>

          </div>
        </section>
      </div>

    </div>
  );
}
