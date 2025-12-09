import Hero from "@/components/Hero";
import StarDecoration from "@/components/ui/StarDecoration";

// --- SECTION MISSION ---
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

// --- SECTION PROCESS ---
const steps = [
  {
    step: "Étape 1",
    title: "L'Échange téléphonique",
    description: "Tout commence par une conversation. Notre Intelligence Artificielle vous guide avec douceur pour réveiller vos souvenirs.",
    bullets: [
      "Disponible 24/7 selon votre rythme",
      "Une écoute bienveillante sans jugement",
    ],
  },
  {
    step: "Étape 2",
    title: "Le Tissage du récit",
    description: "La magie opère. Nous transformons vos paroles en un texte fluide, fidèle à votre ton et à vos émotions.",
    bullets: [
      "Respect total de votre phrasé",
      "Mise en forme professionnelle et structurée",
    ],
  },
  {
    step: "Étape 3",
    title: "L'Héritage physique",
    description: "Vous recevez chez vous le livre de votre vie. Un objet tangible, prêt à être lu par vos enfants et petits-enfants.",
    bullets: [
      "Impression de haute qualité",
      "Un trésor pour la mémoire familiale",
    ],
  },
  {
    step: "Simplicité",
    title: "Zéro contrainte",
    description: "Oubliez les logiciels compliqués. Vous n'avez besoin que d'un téléphone. Nous nous occupons de tout le reste.",
    bullets: [
      "Aucune compétence technique requise",
      "Un processus fluide de A à Z",
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

// --- SECTION OFFRE ---
const offer = {
  title: "L'Héritage Loomina",
  badge: "Formule unique",
  price: "239 €",
  originalPrice: "",
  description:
    "La transmission ne doit pas être un luxe. Un tarif unique qui englobe l'intégralité de l'expérience, de la première parole à la dernière page.",
  highlights: [
    "Heures d'échanges téléphoniques illimitées",
    "Travail complet d'écriture et de mise en forme",
    "Fabrication et livraison de votre livre physique",
    "L'investissement unique pour une trace indélébile",
  ],
  cta: "Commander mon livre maintenant",
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

      {/* --- SECTION 2: MISSION (NOIR) --- */}
      <div id="mission" className="w-full">
        <section className="relative w-full bg-black px-6 py-24 text-white overflow-hidden">
          <StarDecoration position="top-right" className="opacity-60" />
          <StarDecoration position="bottom-left" className="opacity-40 scale-75" />

          <div className="relative mx-auto flex max-w-6xl flex-col gap-16 z-10">
            <header className="space-y-4 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Notre Conviction</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Les souvenirs ne devraient jamais s'effacer.</h2>
              <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl mx-auto">
                Trop souvent, les histoires restent bloquées par la barrière de l'écriture. Loomina brise ce silence en remettant l'oralité au cœur de la transmission.
              </p>
            </header>

            <section className="rounded-3xl border border-white/10 bg-neutral-900 p-8 md:p-10 space-y-6">
              <blockquote className="border-l-4 border-[var(--loomina-amber-strong)] pl-6 italic text-2xl text-white">
                "Il n'y a pas de vie ordinaire, il n'y a que des histoires qui attendent d'être racontées."
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
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">La technologie au service de l'émotion</p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Du simple appel téléphonique au livre de votre vie</h2>
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
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Nous gérons la technique, vous racontez l'histoire.</h2>
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
              <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Écoutez la différence</h3>
              <p className="text-neutral-400 leading-relaxed max-w-xl text-lg">
                Découvrez comment nous passons de la voix brute au récit écrit, en gardant toute l'émotion.
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
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight">Une approche simple et transparente</h2>
              <p className="text-lg leading-relaxed text-neutral-600">
                Pas de coûts cachés. Un seul paiement pour un héritage qui traversera les générations.
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
