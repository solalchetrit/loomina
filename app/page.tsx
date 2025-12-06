import Hero from "@/components/Hero";
import OfferPreview from "@/components/OfferPreview";

const promisePoints = [
  {
    icon: "🎙️",
    title: "Interviews guidés",
    text: "Un interlocuteur humain, des relances douces et l'enregistrement intégral pour ne rien perdre de votre ton.",
  },
  {
    icon: "📖",
    title: "Edition artisanale",
    text: "Réécriture claire, choix typographiques élégants et mise en page avec vos photos préférées.",
  },
  {
    icon: "🔐",
    title: "Transmission sereine",
    text: "Livre relié prêt à offrir, PDF protégé et un espace privé pour partager avec la famille.",
  },
];

const processSteps = [
  {
    title: "On prépare votre récit",
    detail: "Nous définissons ensemble les thèmes clés, les personnes à interviewer et un calendrier réaliste.",
    badge: "Repérage",
  },
  {
    title: "Vous parlez, nous écrivons",
    detail: "Les entretiens sont transcrits, réécrits avec votre voix, puis relus avec vous avant la mise en page.",
    badge: "Production",
  },
  {
    title: "On livre pour transmettre",
    detail: "Vous recevez le livre relié, le PDF sécurisé et un guide pour partager facilement avec les proches.",
    badge: "Livraison",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center text-[var(--loomina-ink)]">
      <Hero />

      <section className="w-full bg-white/70 backdrop-blur px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="text-center space-y-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">La promesse Loomina</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Un livre qui ressemble vraiment à la personne</h2>
            <p className="text-[var(--loomina-muted)] max-w-2xl mx-auto">
              Nous combinons technologie et présence humaine pour faire ressortir la voix, les photos et les messages que vous souhaitez transmettre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promisePoints.map((point) => (
              <div
                key={point.title}
                className="glow-ring rounded-3xl bg-[var(--loomina-cloud)] p-6 space-y-3 border border-black/5"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-inner" aria-hidden>
                  {point.icon}
                </div>
                <h3 className="text-xl font-semibold leading-tight">{point.title}</h3>
                <p className="text-[var(--loomina-muted)] leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Comment ça se passe</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">On avance avec vous, du premier appel au livre relié</h2>
              <p className="text-[var(--loomina-muted)] leading-relaxed">
                Vous gardez la main sur chaque étape : préparation, interviews, relectures, puis maquette finale. Nous faisons le lien entre vos mots et un objet que l'on a envie de transmettre.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-black/5 text-sm font-semibold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
              3 semaines en moyenne, livraison comprise
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <div key={step.title} className="flex h-full flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-6 glow-ring">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] font-semibold text-[var(--loomina-muted)]">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-cloud)] text-[var(--loomina-ink)] border border-black/5">
                    {step.badge}
                  </span>
                  <span className="text-[var(--loomina-amber-strong)]">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold leading-tight">{step.title}</h3>
                <p className="text-[var(--loomina-muted)] leading-relaxed">{step.detail}</p>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[var(--loomina-ink)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-amber-strong)]" />
                  Accompagnement Loomina inclus
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OfferPreview />

      <section className="w-full px-6 py-16" id="exemple-audio">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Exemple audio</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">La voix reste intacte et lisible</h3>
            <p className="text-[var(--loomina-muted)] leading-relaxed max-w-xl">
              Un extrait brut pour entendre notre manière de guider les entretiens : rythme calme, silences respectés et montage léger.
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/80 p-6 glow-ring space-y-3">
            <audio controls className="w-full">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-[var(--loomina-muted)]">1 minute pour entendre la qualité Loomina.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
