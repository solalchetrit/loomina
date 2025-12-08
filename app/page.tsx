import Hero from "@/components/Hero";
import OfferPreview from "@/components/OfferPreview";
import StarDecoration from "@/components/ui/StarDecoration";

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

const carePillars = [
  {
    title: "Une éditrice pour vous",
    description: "Un seul interlocuteur qui suit vos rendez-vous, coordonne les relectures et prend soin des détails.",
  },
  {
    title: "Photos guidées",
    description: "Sélection et retouche légère pour garder vos images lumineuses sans dénaturer vos souvenirs.",
  },
  {
    title: "Notation discrète",
    description: "Repères dans les transcriptions pour indiquer les émotions, les silences ou les passages sensibles.",
  },
  {
    title: "Relecture en duo",
    description: "Vous relisez avec nous : nous ajustons ensemble la voix, les tournures et les titres des chapitres.",
  },
];

const sharingFormats = [
  {
    title: "Coffret prêt à offrir",
    detail: "Livres reliés protégés, signets inclus et petit mot imprimé si vous souhaitez l'ajouter.",
    tag: "Objet fini",
  },
  {
    title: "Espace privé",
    detail: "Lien sécurisé pour partager la version numérique avec les proches sans inscription compliquée.",
    tag: "Numérique",
  },
  {
    title: "Guide de partage",
    detail: "Quelques pistes pour organiser une lecture familiale ou une remise en main propre sereine.",
    tag: "Transmission",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black">
      <Hero />

      {/* Section Promesse : NOIR */}
      <section className="relative w-full bg-black px-6 py-20 text-white overflow-hidden">
        <StarDecoration position="top-right" className="opacity-60" />
        <StarDecoration position="bottom-left" className="opacity-40 scale-75" />
        <div className="mx-auto max-w-6xl space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">La promesse Loomina</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Un livre qui ressemble vraiment à la personne</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
              Nous combinons technologie et présence humaine pour faire ressortir la voix, les photos et les messages que vous souhaitez transmettre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promisePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-3xl bg-neutral-900 p-8 space-y-4 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-2xl border border-white/10" aria-hidden>
                  {point.icon}
                </div>
                <h3 className="text-xl font-semibold leading-tight">{point.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Process : BLANC */}
      <section className="w-full bg-white px-6 py-24 text-black">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Comment ça se passe</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">On avance avec vous, du premier appel au livre relié</h2>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Vous gardez la main sur chaque étape : préparation, interviews, relectures, puis maquette finale. Nous faisons le lien entre vos mots et un objet que l'on a envie de transmettre.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 border border-black/5 text-sm font-semibold shadow-sm text-black">
              <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
              3 semaines en moyenne, livraison comprise
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={step.title} className="flex h-full flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] font-semibold text-neutral-500">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-black border border-black/5">
                    {step.badge}
                  </span>
                  <span className="text-[var(--loomina-amber-strong)]">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold leading-tight">{step.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{step.detail}</p>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-amber-strong)]" />
                  Accompagnement Loomina inclus
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Détails : NOIR */}
      <section className="relative w-full bg-black px-6 py-24 text-white overflow-hidden">
        <StarDecoration position="top-left" className="opacity-50 scale-90" />
        <StarDecoration position="bottom-right" className="opacity-50" />
        <div className="mx-auto max-w-6xl space-y-12 relative z-10">
          <div className="space-y-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">
              On s'occupe des détails
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Plus de soin éditorial, moins de gestion pour vous</h2>
            <p className="text-neutral-400 max-w-3xl mx-auto leading-relaxed text-lg">
              Nous orchestrons les rendez-vous, la mise en page et la livraison pour que vous profitiez surtout du plaisir de raconter.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border border-white/5">
                Soin éditorial
              </div>
              <h3 className="text-2xl font-semibold">Une équipe resserrée pour vous écouter</h3>
              <p className="text-neutral-400 leading-relaxed">
                Les interviews sont préparés en amont, les transcriptions relues, et votre éditrice garde le même fil conducteur tout au long du projet.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {carePillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2"
                  >
                    <p className="text-sm uppercase tracking-[0.12em] text-[var(--loomina-amber-strong)] font-semibold">
                      {pillar.title}
                    </p>
                    <p className="text-neutral-400 text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border border-white/5">
                Transmission
              </div>
              <h3 className="text-2xl font-semibold">On prépare le moment où vous partagerez le livre</h3>
              <p className="text-neutral-400 leading-relaxed">
                Votre récit est pensé pour être offert : de la maquette jusqu'à l'envoi, nous anticipons comment il sera lu et conservé.
              </p>
              <div className="space-y-4">
                {sharingFormats.map((format) => (
                  <div
                    key={format.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/5 bg-black/40 p-5"
                  >
                    <div className="inline-flex items-center rounded-full bg-[var(--loomina-amber)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--loomina-amber-strong)] shrink-0">
                      {format.tag}
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">{format.title}</p>
                      <p className="text-neutral-400 text-sm leading-relaxed">{format.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/40 p-5 text-sm text-neutral-500">
                Chaque étape est documentée : vous recevez un petit récapitulatif après chaque session pour suivre la progression sans y penser.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offer Preview restera en blanc via son composant */}
      <OfferPreview />

      {/* Section Audio : NOIR */}
      <section className="relative w-full bg-black px-6 py-24 text-white overflow-hidden" id="exemple-audio">
        <StarDecoration position="top-right" className="-top-20 -right-20 opacity-40 w-96 h-96" />
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center relative z-10">
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Exemple audio</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">La voix reste intacte et lisible</h3>
            <p className="text-neutral-400 leading-relaxed max-w-xl text-lg">
              Un extrait brut pour entendre notre manière de guider les entretiens : rythme calme, silences respectés et montage léger.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 space-y-4">
            <audio controls className="w-full invert hue-rotate-180">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-neutral-500">1 minute pour entendre la qualité Loomina.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
