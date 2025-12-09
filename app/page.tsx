import Hero from "@/components/Hero";
import StarDecoration from "@/components/ui/StarDecoration";
import { cn } from "@/lib/utils";

// --- DATA FROM MISSION PAGE (for Mission Section) ---
const pillars = [
  {
    title: "Écoute radicale",
    description: "Des entretiens guidés par IA, toujours supervisés par un rédacteur qui veille au ton et au respect.",
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
  {
    title: "Réponse rapide",
    detail: "Retour en moins de 24h pour lancer ou ajuster votre projet.",
  },
  {
    title: "Hébergement européen",
    detail: "Serveurs et sauvegardes localisés en Europe, sans revente de données.",
  },
  {
    title: "Contrats clairs",
    detail: "Clauses de confidentialité fournies dès le premier échange, sans surprise ultérieure.",
  },
];

// --- DATA FROM ACCOMPAGNEMENT PAGE (for Process Section) ---
const steps = [
  {
    step: "Étape 1",
    title: "Découverte et cadrage",
    description: "Un premier rendez-vous pour cerner vos attentes et définir les voix à interviewer. Nous dessinons le fil rouge du récit.",
    bullets: [
      "Analyse des sujets sensibles et du ton à adopter",
      "Plan d'entretien personnalisé et calendrier partagé",
    ],
  },
  {
    step: "Étape 2",
    title: "Collecte guidée par IA",
    description: "Votre jumeau mémoriel écoute sans relâche et relance avec délicatesse. Chaque session est supervisée par un rédacteur.",
    bullets: [
      "Questions adaptatives en fonction de vos réponses",
      "Transcription sécurisée et vérification humaine",
    ],
  },
  {
    step: "Étape 3",
    title: "Écriture et mise en forme",
    description: "Un auteur transforme les entretiens en un récit fluide. Nous ajustons les photos et la voix narrative avec vous.",
    bullets: [
      "Mise en page artisanale et palette personnalisée",
      "Validation itérative avant impression",
    ],
  },
  {
    step: "Étape 4",
    title: "Transmission vivante",
    description: "Livre imprimé, jumeau mémoriel et contributions familiales possibles. Nous restons disponibles pour enrichir l'histoire.",
    bullets: [
      "Livraison suivie et service de réimpression à la demande",
      "Accès privé pour les proches avec droits paramétrables",
    ],
  },
];

// --- DATA FOR DETAILS SECTION ---
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

// --- DATA FROM OFFRES PAGE (for Offers Section) ---
const offer = {
  title: "Lumina, livre & numérique",
  badge: "Offre unique",
  price: "222 €",
  originalPrice: "279 €",
  description:
    "Une formule claire : interviews guidés, réécriture avec votre voix, maquette artisanale et diffusion numérique sécurisée.",
  highlights: [
    "5 exemplaires imprimés inclus (papier premium)",
    "Co-écriture et relectures illimitées avec l'équipe Loomina",
    "Mise en page lumineuse avec vos photos retouchées",
    "Version numérique protégée et prête à partager",
  ],
  cta: "Préparer mon livre Lumina",
};

const buildOfferMailto = (title: string) => {
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(
    "Je souhaite en savoir plus sur l'offre " +
    title +
    ". Pouvez-vous m'indiquer les prochaines disponibilités ?",
  );

  return `mailto:contact@loomina.fr?subject=${subject}&body=${body}`;
};


export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black">
      <Hero />

      {/* --- SECTION 2: MISSION (NOIR) --- replacing "Promesse" */}
      <div id="mission" className="w-full">
        <section className="relative w-full bg-black px-6 py-24 text-white overflow-hidden">
          <StarDecoration position="top-right" className="opacity-60" />
          <StarDecoration position="bottom-left" className="opacity-40 scale-75" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-16 z-10">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Pourquoi Loomina existe</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Garder la lumière allumée, avec simplicité</h2>
              <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl mx-auto">
                Nous épurons le design pour mettre Loomina en avant. Notre mission : préserver la voix, les valeurs et les nuances d'une vie, avec un parcours lisible et des couleurs constantes.
              </p>
            </header>

            <section className="rounded-3xl border border-white/10 bg-neutral-900 p-8 md:p-10 space-y-6">
              <blockquote className="border-l-4 border-[var(--loomina-amber-strong)] pl-6 italic text-2xl text-white">
                "Nous ne sommes pas une entreprise technologique. Nous sommes des gardiens de mémoire."
              </blockquote>
              <p className="text-neutral-400 leading-relaxed text-lg">
                Loomina est née d'un regret : celui des questions restées en suspens une fois qu'un proche est parti. Nous avons voulu offrir un espace d'écoute infinie, où l'IA amplifie l'attention humaine au lieu de la remplacer.
              </p>
            </section>

            <section className="grid gap-8 md:grid-cols-3">
              {pillars.map((value) => (
                <div key={value.title} className="h-full rounded-2xl border border-white/10 bg-black/40 p-7 space-y-3">
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--loomina-amber-strong)] font-semibold">Notre boussole</p>
                  <h3 className="text-2xl font-semibold text-white">{value.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </section>
          </div>
        </section>
      </div>

      {/* --- SECTION 3: PROCESS / ACCOMPAGNEMENT (BLANC) --- */}
      <div id="process" className="w-full">
        <section className="w-full bg-white px-6 py-24 text-black">
          <div className="mx-auto max-w-6xl space-y-16">
            <header className="text-center space-y-6 max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Une présence humaine renforcée par l'IA</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Un accompagnement complet pour raconter et préserver votre histoire</h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Nous simplifions chaque écran pour que Loomina soit lisible partout : mêmes boutons, mêmes couleurs, et un chemin clair de la première conversation jusqu'au livre entre vos mains.
              </p>
            </header>

            <section className="grid md:grid-cols-2 gap-10">
              {steps.map((block) => (
                <div
                  key={block.step}
                  className="rounded-3xl border border-black/5 bg-neutral-50 p-8 space-y-4 hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm uppercase tracking-[0.26em] text-[var(--loomina-amber-strong)] font-semibold">{block.step}</p>
                  <h3 className="text-2xl font-semibold text-black">{block.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{block.description}</p>
                  <ul className="space-y-2 text-neutral-500">
                    {block.bullets.map((item) => (
                      <li key={item} className="flex gap-3 items-start">
                        <span className="text-[var(--loomina-amber-strong)]">✦</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>
        </section>
      </div>

      {/* --- SECTION 4: DETAILS & AUDIO (NOIR) --- */}
      <section className="relative w-full bg-black px-6 py-24 text-white overflow-hidden" id="audio-details">
        <StarDecoration position="top-left" className="opacity-50 scale-90" />
        <StarDecoration position="bottom-right" className="opacity-50" />

        <div className="mx-auto max-w-6xl space-y-24 relative z-10">

          {/* Details Part */}
          <div className="space-y-12">
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
              </div>
            </div>
          </div>

          {/* Audio Part */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center border-t border-white/10 pt-16">
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

        </div>
      </section>

      {/* --- SECTION 5: OFFRES (BLANC) --- */}
      <div id="offres" className="w-full">
        <section className="w-full bg-white px-6 py-24 text-black">
          <div className="mx-auto max-w-6xl space-y-16">
            <header className="text-center space-y-4 max-w-3xl mx-auto">
              <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[var(--loomina-amber-strong)] font-semibold">
                Offre unique Loomina
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Lumina : un seul parcours, tout compris</h2>
              <p className="text-lg leading-relaxed text-neutral-600">
                Nous avons simplifié l'expérience : une seule offre, la même exigence éditoriale et une livraison qui inclut le livre imprimé et sa version numérique protégée.
              </p>
            </header>

            <section className="grid md:grid-cols-[1.15fr,0.85fr] gap-8 items-start">
              {/* Main Offer Card */}
              <div className="relative overflow-hidden rounded-3xl border border-black/5 flex flex-col h-full bg-black text-white shadow-xl">
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] rounded-full border bg-white/10 border-white/20 text-neutral-200">
                      ✦ {offer.badge}
                    </span>
                    <span className="text-sm font-semibold text-[var(--loomina-amber)]">Accompagnement dédié</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{offer.title}</h3>
                    <p className="text-sm uppercase tracking-[0.18em] font-semibold text-[var(--loomina-amber)]">Offre claire</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-[var(--loomina-amber)]">{offer.price}</span>
                    <span className="text-sm text-neutral-400 line-through">{offer.originalPrice}</span>
                  </div>
                  <p className="leading-relaxed text-neutral-300">{offer.description}</p>
                  <ul className="space-y-3 text-sm">
                    {offer.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber)]" />
                        <span className="text-neutral-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 border-t border-white/10 mt-auto bg-neutral-900">
                  <a
                    href={buildOfferMailto(offer.title)}
                    className="block text-center w-full py-4 rounded-full font-semibold transition-all shadow-md bg-white text-black hover:bg-neutral-100"
                  >
                    {offer.cta}
                  </a>
                </div>
              </div>

              {/* Inclusions Card */}
              <div className="rounded-3xl bg-neutral-50 border border-black/5 p-8 space-y-6 h-full flex flex-col">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white text-[11px] font-semibold uppercase tracking-[0.2em] text-black border border-black/5 self-start">
                  Inclus dans Lumina
                </div>
                <h3 className="text-2xl font-semibold">Ce que vous recevez</h3>
                <p className="text-neutral-600 leading-relaxed">
                  De la première prise de notes à la remise des exemplaires, l'équipe Loomina reste votre interlocuteur unique. Nous gérons les interviews, la rédaction, la maquette et la version numérique sécurisée.
                </p>
                <ul className="space-y-3 text-sm text-black">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                    <span>Calendrier partagé et relances douces pour rester serein.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                    <span>Relectures humaines illimitées jusqu'à validation finale.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                    <span>Guide de partage familial pour offrir le livre et le lien numérique.</span>
                  </li>
                </ul>
                <div className="mt-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black border border-black/5 self-start">
                  Réponse sous 48h · Impression incluse
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

    </div>
  );
}
