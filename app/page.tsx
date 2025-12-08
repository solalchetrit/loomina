import Hero from "@/components/Hero";
import OfferPreview from "@/components/OfferPreview";
import StarDecoration from "@/components/ui/StarDecoration";

const sectionSpacing = "px-6 py-20 md:py-24 lg:py-28";

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
    title: "Découverte et cadrage",
    detail: "Un premier rendez-vous pour cerner vos attentes, définir les voix à interviewer et le ton à adopter.",
    badge: "Étape 1",
  },
  {
    title: "Collecte guidée par IA",
    detail: "Votre jumeau mémoriel écoute sans relâche, relance avec délicatesse et reste supervisé par un rédacteur.",
    badge: "Étape 2",
  },
  {
    title: "Écriture et mise en forme",
    detail: "Un auteur transforme les entretiens en un récit fluide, harmonisé avec vos photos et relu avec vous.",
    badge: "Étape 3",
  },
  {
    title: "Transmission vivante",
    detail: "Livre imprimé, version numérique protégée et guide de partage pour remettre le récit en douceur.",
    badge: "Étape 4",
  },
];

const missionPillars = [
  {
    title: "Écoute radicale",
    description: "Des entretiens guidés, toujours supervisés par un rédacteur qui veille au ton et au respect.",
  },
  {
    title: "Transmission incarnée",
    description: "Un objet physique à feuilleter, des exemplaires pour la famille et un accès numérique vivant.",
  },
  {
    title: "Respect & sécurité",
    description: "Données chiffrées, hébergées en Europe, avec un contrôle total sur ce qui est partagé ou détruit.",
  },
];

const commitments = [
  { title: "Réponse rapide", description: "Retour en moins de 24h pour lancer ou ajuster votre projet." },
  { title: "Hébergement européen", description: "Serveurs et sauvegardes localisés en Europe, sans revente de données." },
  { title: "Contrats clairs", description: "Clauses de confidentialité fournies dès le premier échange, sans surprise." },
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

const guarantees = [
  { title: "Accompagnement humain", detail: "Un interlocuteur dédié qui répond en moins de 24h et suit l'avancée du projet." },
  { title: "Sécurité & droits", detail: "Données stockées en Europe, partage contrôlé et possibilité de suppression complète." },
  { title: "Finitions sur mesure", detail: "Papier, reliure, photos et annexes choisis avec vous pour un livre vraiment à votre image." },
];

const logistics = [
  { title: "Planning transparent", detail: "Durées annoncées pour chaque étape et points de contrôle validés avec vous." },
  { title: "Accès dédié", detail: "Espace partagé pour suivre l'avancement, envoyer des photos et annoter les chapitres." },
  { title: "Suivi post-livraison", detail: "Retouches mineures et réimpressions possibles après la livraison." },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black">
      <Hero />

      {/* Mission & promesse : NOIR */}
      <section className={`relative w-full bg-black ${sectionSpacing} text-white overflow-hidden`} id="mission">
        <StarDecoration position="top-right" className="opacity-60" />
        <StarDecoration position="bottom-left" className="opacity-40 scale-75" />
        <StarDecoration position="top-left" className="opacity-30 scale-75" />
        <StarDecoration position="bottom-right" className="opacity-30" />
        <div className="mx-auto max-w-6xl space-y-12 relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Pourquoi Loomina existe</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Garder la lumière allumée, avec simplicité</h2>
              <p className="text-neutral-300 leading-relaxed text-lg">
                Nous combinons technologie et présence humaine pour faire ressortir la voix, les photos et les messages que vous souhaitez transmettre. Chaque projet reste lisible, sécurisé et porté par une équipe éditoriale qui respecte votre rythme.
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {commitments.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--loomina-amber-strong)] font-semibold">{item.title}</p>
                    <p className="text-neutral-300 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white border border-white/5">
                Notre boussole
              </div>
              <p className="text-lg text-neutral-300 leading-relaxed">
                "Nous ne sommes pas une entreprise technologique. Nous sommes des gardiens de mémoire." L'IA amplifie l'écoute, mais nous gardons la main sur chaque relecture pour que votre voix reste intacte.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {missionPillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2">
                    <p className="text-sm uppercase tracking-[0.12em] text-[var(--loomina-amber-strong)] font-semibold">{pillar.title}</p>
                    <p className="text-neutral-300 text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
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
      <section className={`w-full bg-white ${sectionSpacing} text-black`} id="accompagnement">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4 max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Un parcours guidé</p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Un accompagnement complet pour raconter et préserver</h2>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Vous gardez la main sur chaque étape : cadrage, collecte guidée par IA, écriture, puis transmission. Nous avançons ensemble sans répéter ce qui a déjà été validé.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 border border-black/5 text-sm font-semibold shadow-sm text-black">
              <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
              3 semaines en moyenne, livraison comprise
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                  Suivi humain à chaque étape
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Détails : NOIR */}
      <section className={`relative w-full bg-black ${sectionSpacing} text-white overflow-hidden`} id="details">
        <StarDecoration position="top-left" className="opacity-50 scale-90" />
        <StarDecoration position="bottom-right" className="opacity-50" />
        <StarDecoration position="top-right" className="opacity-30" />
        <StarDecoration position="bottom-left" className="opacity-25 scale-75" />
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

      {/* Offre complète : BLANC */}
      <OfferPreview />

      {/* Garanties : NOIR */}
      <section className={`w-full bg-black ${sectionSpacing} text-white`} id="garanties">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="space-y-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Ce que nous garantissons</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Confidentialité, patience et soin éditorial</h3>
            <p className="text-neutral-300 max-w-3xl mx-auto leading-relaxed text-lg">
              Les souvenirs sont précieux : données chiffrées, droits clairs, relectures humaines illimitées et un accompagnement disponible en moins de 24h.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="grid gap-4 sm:grid-cols-3">
              {guarantees.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--loomina-amber-strong)] font-semibold">{item.title}</p>
                  <p className="text-neutral-300 leading-relaxed text-sm">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-white/10 bg-neutral-900 p-8 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white border border-white/5">
                Organisation
              </div>
              <p className="text-2xl font-semibold">Une logistique transparente</p>
              <p className="text-neutral-300 leading-relaxed">
                Planning, accès partagé, suivi post-livraison : vous savez toujours où en est le livre et comment le partager avec vos proches.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {logistics.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/5 bg-black/40 p-4 space-y-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-neutral-300 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Audio : BLANC */}
      <section className={`relative w-full bg-white ${sectionSpacing} text-black overflow-hidden`} id="exemple-audio">
        <StarDecoration position="top-right" className="-top-20 -right-20 opacity-20 w-96 h-96" />
        <StarDecoration position="bottom-left" className="opacity-15" />
        <StarDecoration position="top-left" className="opacity-10 scale-75" />
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center relative z-10">
          <div className="space-y-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Exemple audio</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">La voix reste intacte et lisible</h3>
            <p className="text-neutral-600 leading-relaxed max-w-xl text-lg">
              Un extrait brut pour entendre notre manière de guider les entretiens : rythme calme, silences respectés et montage léger.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-neutral-50 p-8 space-y-4 shadow-lg">
            <audio controls className="w-full">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-neutral-500">1 minute pour entendre la qualité Loomina.</p>
          </div>
        </div>
      </section>

      {/* Contact : NOIR */}
      <section className={`w-full bg-black px-6 py-16 md:py-20 lg:py-24 text-white`} id="contact">
        <div className="mx-auto max-w-6xl space-y-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Prendre contact</p>
          <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Parlons de votre livre ou de celui d'un proche</h3>
          <p className="text-neutral-300 max-w-2xl mx-auto leading-relaxed text-lg">
            Un interlocuteur humain vous répond en moins de 24h pour cadrer le récit, planifier les interviews et sécuriser les partages.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contact@loomina.fr?subject=Organiser%20un%20premier%20appel"
              className="inline-flex items-center justify-center rounded-full bg-[var(--loomina-amber)] px-6 py-3 font-semibold text-black shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
            >
              Organiser un premier appel
            </a>
            <a
              href="#offres"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white transition hover:border-white/40"
            >
              Découvrir l'offre Lumina
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
