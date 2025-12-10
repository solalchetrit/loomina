import Hero from "@/components/Hero";
import StarDecoration from "@/components/ui/StarDecoration";
import HowItWorks from "@/components/HowItWorks";
import MagicButton from "@/components/ui/MagicButton";

// --- DATA ---
const pillars = [
  {
    title: "L'Oralité retrouvée",
    description: "Plus besoin d'écrire. Notre IA est une oreille attentive qui recueille vos confidences au téléphone, à votre rythme.",
  },
  {
    title: "L'Objet éternel",
    description: "Nous transformons le moment éphémère de la parole en un livre physique de haute qualité qui traversera les générations.",
  },
  {
    title: "L'Essence capturée",
    description: "Nous ne capturons pas seulement les faits, mais aussi votre voix, vos expressions et votre personnalité.",
  },
];



const offer = {
  title: "L'Héritage Loomina",
  price: "219 €",
  description: "Un tarif unique pour une tranquillité d'esprit totale. De la première parole à la dernière page.",
  highlights: [
    "Entretiens téléphoniques illimités",
    "Rédaction et correction professionnelle",
    "Mise en page et insertion photos",
    "Impression et livraison du livre",
    "Version numérique privée incluse"
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black">
      <Hero />



      {/* --- SECTION 3: LE PARCOURS (TIMELINE) --- */}
      <HowItWorks />



      {/* --- SECTION 5: OFFRE UNIQUE (BLANC CENTRÉ) --- */}
      <div id="offres" className="w-full scroll-mt-24">
        <section className="w-full bg-white px-6 py-20 md:py-28 text-black border-t border-neutral-100">
          <div className="mx-auto max-w-3xl text-center space-y-10">

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">L'Excellence, tout simplement.</h2>
              <p className="text-xl text-neutral-500">Transmettre ne devrait pas être un luxe compliqué.</p>
            </div>

            <div className="bg-neutral-900 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-[var(--loomina-amber)]/30 shadow-2xl shadow-[var(--loomina-amber)]/5">
              {/* Glow Effect Top Right */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--loomina-amber)_0%,_transparent_70%)] opacity-20 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column: Promise & Details */}
                <div className="space-y-8 text-left">
                  <div>
                    <h3 className="text-3xl font-serif text-white mb-4">{offer.title}</h3>
                    <p className="text-neutral-400 leading-relaxed text-lg">{offer.description}</p>
                  </div>

                  <ul className="space-y-4 text-neutral-300">
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Entretiens téléphoniques illimités</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Rédaction et correction professionnelle</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Mise en page sur mesure</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Impression et livraison du livre</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[var(--loomina-amber)] text-lg">★</span>
                      <span className="flex-1">Version numérique privée incluse</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Price & Action */}
                <div className="flex flex-col items-center justify-center text-center space-y-8 md:border-l border-white/5 md:pl-12">
                  <div className="space-y-2">
                    <span className="text-neutral-500 text-sm uppercase tracking-widest font-medium">Offre de lancement</span>
                    <div className="text-7xl md:text-8xl font-serif font-medium bg-clip-text text-transparent bg-gradient-to-b from-[#ffecc8] to-[#c58c3c]">
                      {offer.price}
                    </div>
                  </div>

                  <div className="w-full">
                    <MagicButton
                      href="mailto:contact@loomina.fr?subject=Commande%20Loomina"
                      variant="secondary"
                      size="lg"
                      className="w-full shadow-lg shadow-amber-500/20"
                    >
                      Commander mon livre
                    </MagicButton>
                    <p className="text-neutral-500 text-xs mt-4">Paiement 100% sécurisé</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Paiement sécurisé. Satisfaction garantie ou remboursé lors du premier entretien.
            </p>

          </div>
        </section>
      </div>

    </div>
  );
}
