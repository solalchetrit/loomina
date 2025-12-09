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
  price: "239 €",
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

      {/* --- SECTION 2: CONVICTION (NOIR) --- */}
      <div id="mission" className="w-full scroll-mt-24">
        <section className="relative w-full bg-black px-6 py-20 md:py-28 text-white overflow-hidden">


          <div className="mx-auto max-w-5xl flex flex-col gap-16 relative z-10">
            {/* La Citation Centrale */}
            <div className="text-center space-y-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--loomina-amber-strong)]">Notre raison d'être</p>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight text-neutral-200 italic">
                "Trop souvent, les souvenirs s'effacent ou restent bloqués par la barrière de l'écriture. Loomina brise ce silence."
              </h2>
            </div>

            {/* Les 3 Piliers - Épurés */}
            <div className="grid gap-10 md:grid-cols-3 border-t border-white/10 pt-16">
              {pillars.map((value) => (
                <div key={value.title} className="space-y-3">
                  <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* --- SECTION 3: LE PARCOURS (TIMELINE) --- */}
      <HowItWorks />



      {/* --- SECTION 5: OFFRE UNIQUE (BLANC CENTRÉ) --- */}
      <div id="offres" className="w-full scroll-mt-24">
        <section className="w-full bg-white px-6 py-20 md:py-28 text-black border-t border-neutral-100">
          <div className="mx-auto max-w-3xl text-center space-y-10">

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Une formule, tout inclus.</h2>
              <p className="text-xl text-neutral-500">Transmettre ne devrait pas être un luxe compliqué.</p>
            </div>

            <div className="bg-black text-white rounded-lg p-6 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--loomina-amber)]"></div>

              <div className="space-y-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{offer.title}</h3>
                  <div className="text-6xl font-bold text-[var(--loomina-amber)] tracking-tighter my-4">{offer.price}</div>
                  <p className="text-neutral-400 max-w-md mx-auto">{offer.description}</p>
                </div>

                <hr className="border-white/10" />

                <ul className="grid sm:grid-cols-2 gap-4 text-left mx-auto max-w-lg text-sm text-neutral-300">
                  {offer.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[var(--loomina-amber)] mt-1">✓</span> {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <MagicButton
                    href="mailto:contact@loomina.fr?subject=Commande%20Loomina"
                    variant="secondary"
                    size="lg"
                  >
                    Commander mon livre
                  </MagicButton>
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
