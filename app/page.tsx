import Hero from "@/components/Hero";
import StarDecoration from "@/components/ui/StarDecoration";

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

const steps = [
  {
    step: "01",
    title: "L'Échange",
    description: "Tout commence par une conversation. Notre IA vous guide avec douceur pour réveiller vos souvenirs, sans jugement.",
  },
  {
    step: "02",
    title: "Le Tissage",
    description: "La magie opère. Nous transformons vos paroles en un texte fluide, fidèle à votre ton et à vos émotions.",
  },
  {
    step: "03",
    title: "L'Héritage",
    description: "Vous recevez chez vous le livre de votre vie. Un objet tangible, relié, prêt à être lu par vos enfants.",
  },
  {
    step: "04",
    title: "Zéro Technique",
    description: "Oubliez les logiciels. Vous n'avez besoin que d'un téléphone. Nous nous occupons de tout le reste.",
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
      <div id="mission" className="w-full">
        <section className="relative w-full bg-black px-6 py-20 md:py-28 text-white overflow-hidden">
          {/* --- CONSTELLATION --- */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Etoile Principale (Haut Droite) */}
            <StarDecoration position="top-right" className="opacity-30 scale-100" />

            {/* Etoile Secondaire (Bas Gauche) */}
            <StarDecoration position="bottom-left" className="opacity-20 scale-75 translate-y-12 -translate-x-12" />

            {/* Etoiles Lointaines (Petites touches) */}
            <StarDecoration position="top-left" className="opacity-10 scale-50" />
            <StarDecoration position="bottom-right" className="opacity-15 scale-50 translate-y-24" />
          </div>

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

      {/* --- SECTION 3: LE PARCOURS (BLANC) --- */}
      <div id="process" className="w-full">
        <section className="w-full bg-white px-6 py-20 md:py-24 text-black">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Du simple appel au livre d'une vie</h2>
              <p className="text-neutral-500">Une approche simplifiée à l'extrême : nous gérons la technique, vous racontez l'histoire.</p>
            </div>

            {/* Grille Compacte 2x2 */}
            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((block) => (
                <div key={block.step} className="flex flex-col gap-4 py-6 border-l-2 border-neutral-100 pl-8 hover:border-[var(--loomina-amber)] transition-colors duration-500">
                  <span className="text-4xl font-serif text-[var(--loomina-amber)] opacity-50 font-medium">
                    {block.step}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">{block.title}</h3>
                    <p className="text-neutral-500 leading-relaxed text-sm">
                      {block.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* --- SECTION 4: L'EXPÉRIENCE AUDIO (NOIR COMPACT) --- */}
      <section className="w-full bg-black px-6 py-20 text-white" id="audio-details">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-12 md:gap-20 items-center">

          {/* Colonne Gauche : Texte */}
          <div className="space-y-6">
            <div className="inline-block rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-neutral-300">
              Technologie & Émotion
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold">Écoutez la différence.</h2>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Nous ne faisons pas que transcrire. Nous captons les silences, les hésitations et les rires pour tisser un récit qui vous ressemble vraiment.
              <br /><br />
              <span className="text-white text-sm">✦ Votre voix reste intacte, votre histoire devient éternelle.</span>
            </p>
          </div>

          {/* Colonne Droite : Player Audio */}
          <div className="bg-neutral-900 rounded-3xl p-8 border border-white/10 shadow-2xl relative">
            {/* --- CONSTELLATION --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Etoile Principale (Haut Droite) */}
              <StarDecoration position="top-right" className="opacity-30 scale-100" />

              {/* Etoile Secondaire (Bas Gauche) */}
              <StarDecoration position="bottom-left" className="opacity-20 scale-75 translate-y-12 -translate-x-12" />

              {/* Etoiles Lointaines (Petites touches) */}
              <StarDecoration position="top-left" className="opacity-10 scale-50" />
              <StarDecoration position="bottom-right" className="opacity-15 scale-50 translate-y-24" />
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase text-neutral-500 tracking-widest mb-4">Extrait brut de session</p>
              <audio controls className="w-full invert hue-rotate-180 opacity-90 hover:opacity-100 transition-opacity">
                <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              </audio>
              <div className="pt-2 flex justify-between text-xs text-neutral-600">
                <span>0:00</span>
                <span>1:24</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- SECTION 5: OFFRE UNIQUE (BLANC CENTRÉ) --- */}
      <div id="offres" className="w-full">
        <section className="w-full bg-white px-6 py-20 md:py-28 text-black border-t border-neutral-100">
          <div className="mx-auto max-w-3xl text-center space-y-10">

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Une formule, tout inclus.</h2>
              <p className="text-xl text-neutral-500">Transmettre ne devrait pas être un luxe compliqué.</p>
            </div>

            <div className="bg-black text-white rounded-lg p-10 md:p-14 relative overflow-hidden">
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
                  <a
                    href="mailto:contact@loomina.fr?subject=Commande%20Loomina"
                    className="inline-block bg-white text-black font-bold text-lg px-12 py-4 rounded-full hover:scale-105 transition-transform"
                  >
                    Commander mon livre
                  </a>
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
