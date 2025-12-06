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

const processSteps = [
  {
    title: "On vous guide dès le premier appel",
    detail: "Un créateur Loomina prépare vos entretiens avec vous pour ne rien oublier des moments clés.",
    badge: "Brief & repérage",
  },
  {
    title: "Les entretiens deviennent un récit",
    detail:
      "Séances enregistrées en douceur, puis montage éditorial : les hésitations disparaissent, la voix reste intacte.",
    badge: "Production",
  },
  {
    title: "Un livre tangible pour transmettre",
    detail: "Mise en page artistique, photos intégrées et exemplaires imprimés prêts à offrir en famille.",
    badge: "Livraison",
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

      <section className="w-full bg-gradient-to-b from-white to-[var(--loomina-gray-light)]/40 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-3 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Comment ça marche</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Une méthode claire, pensée pour vos proches</h2>
              <p className="text-[var(--loomina-gray-dark)] leading-relaxed">
                Chaque étape est accompagnée par un humain. Vous parlez, nous orchestrons : le résultat est un livre que l'on conserve et que l'on partage.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--loomina-black)] text-white text-sm font-semibold shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)]">
              <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]"></span>
              3 semaines en moyenne, livraison comprise
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="relative h-full rounded-3xl border border-[var(--loomina-black)]/10 bg-white p-6 shadow-[0_24px_70px_-50px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between mb-3 text-sm uppercase tracking-[0.16em] font-semibold text-[var(--loomina-gray-dark)]">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gray-light)] text-[var(--loomina-black)] border border-[var(--loomina-black)]/10">
                    {step.badge}
                  </span>
                  <span className="text-[var(--loomina-gold)]">0{index + 1}</span>
                </div>
                <h3 className="text-2xl font-semibold text-[var(--loomina-black)] leading-tight">{step.title}</h3>
                <p className="mt-3 text-[var(--loomina-gray-dark)] leading-relaxed">{step.detail}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[var(--loomina-black)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-gold)]"></span>
                  Accompagnement Loomina inclus
                </div>
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
