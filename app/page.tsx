import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import OfferPreview from "@/components/OfferPreview";

const promisePoints = [
  {
    icon: "🎙️",
    title: "Capture facile",
    text: "Questions guidées, relances douces et enregistrement prêt à monter.",
  },
  {
    icon: "🎬",
    title: "Qualité cinéma",
    text: "Montage éditorial, voix respectée et maquette premium sans effort.",
  },
  {
    icon: "🔒",
    title: "Héritage sécurisé",
    text: "Livre relié + jumeau numérique privé pour partager sereinement.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[var(--background)] text-[var(--loomina-black)]">
      <Hero />

      <section className="w-full bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">La promesse</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">On s'occupe de tout, vous profitez du résultat</h2>
            <p className="text-[var(--loomina-gray-dark)] max-w-2xl mx-auto">
              Trois piliers simples pour livrer une histoire fidèle sans diluer votre temps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promisePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-3xl border border-[var(--loomina-black)]/10 bg-[var(--loomina-gray-light)]/60 p-6 space-y-3 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.35)]"
              >
                <div className="text-3xl" aria-hidden>
                  {point.icon}
                </div>
                <h3 className="text-2xl font-semibold leading-tight">{point.title}</h3>
                <p className="text-[var(--loomina-gray-dark)] leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OfferPreview />

      <section className="w-full bg-white py-16 px-6" id="exemple-audio">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Exemple audio</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">La chaleur d'une voix, prête à offrir</h3>
            <p className="text-[var(--loomina-gray-dark)] leading-relaxed max-w-xl">
              Un extrait court, monté comme une capsule souvenir pour vos proches.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--loomina-black)]/10 bg-[var(--loomina-gray-light)]/80 p-6 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.35)] space-y-3">
            <audio controls className="w-full">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-[var(--loomina-black)]/70">1 minute pour entendre la qualité Loomina.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
