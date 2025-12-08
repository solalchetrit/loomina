import MagicButton from "./ui/MagicButton";
import Reveal from "./ui/Reveal";

const offer = {
  title: "Lumina, livre & numérique",
  price: "222 €",
  originalPrice: "279 €",
  description:
    "Une formule unique : interviews guidés, réécriture attentive et maquette élégante. Nous livrons un livre relié et sa version numérique prête à partager.",
  highlights: [
    "5 exemplaires imprimés inclus (papier premium)",
    "Co-écriture et relectures illimitées avec l'équipe Loomina",
    "Mise en page lumineuse avec vos photos retouchées",
    "Version numérique protégée et prête à envoyer",
  ],
  cta: "Préparer mon livre Lumina",
  href: "mailto:contact@loomina.fr?subject=Pr%C3%A9parer%20mon%20livre%20Lumina",
  badge: "Offre unique",
};

const essentials = [
  { title: "Accompagnement humain", text: "Un interlocuteur unique pour planifier, interviewer et relire avec vous." },
  { title: "Sérénité juridique", text: "Confidentialité contractuelle, données hébergées en Europe et sauvegardes régulières." },
  { title: "Esthétique soignée", text: "Choix typographiques et retouches légères pour un rendu élégant et cohérent." },
  { title: "Transmission durable", text: "Formats imprimés et numériques pensés pour traverser le temps et se partager facilement." },
];

const practicalInfos = [
  {
    title: "Calendrier partagé",
    description: "Dates d'interviews, validation des chapitres et remise des épreuves alignées dès la prise de brief.",
  },
  {
    title: "Réponse en moins de 24h",
    description: "Un interlocuteur unique pour l'ensemble des étapes, disponible par e-mail ou visio.",
  },
  {
    title: "Contrat et droits",
    description: "Confidentialité, choix des destinataires et possibilité de suppression complète des données.",
  },
];

type OfferPreviewProps = {
  variant?: "light" | "dark";
};

export default function OfferPreview({ variant = "light" }: OfferPreviewProps) {
  const sectionSpacing = "section-shell";
  const isDark = variant === "dark";

  const tone = {
    bg: isDark ? "bg-[var(--loomina-forest)]" : "bg-[var(--loomina-cloud)]",
    text: isDark ? "text-white" : "text-[var(--loomina-ink)]",
    subtext: isDark ? "text-white/80" : "text-[var(--loomina-ink-soft)]",
    card: isDark
      ? "bg-[var(--loomina-surface)]/90 border border-white/10"
      : "bg-[var(--loomina-surface)] border border-[var(--loomina-outline)]",
    accent: isDark ? "text-[var(--loomina-amber)]" : "text-[var(--loomina-amber-strong)]",
    badge: isDark
      ? "bg-white/10 text-white border border-white/10"
      : "bg-[var(--loomina-surface-muted)] text-[var(--loomina-ink)] border border-[var(--loomina-outline)]",
    chip: isDark
      ? "bg-white/5 text-white border border-white/10"
      : "bg-[var(--loomina-cloud)] text-[var(--loomina-ink)] border border-[var(--loomina-outline)]",
    highlight: isDark ? "bg-white/5 border-white/10" : "bg-[var(--loomina-surface-muted)] border-[var(--loomina-outline)]",
    divider: isDark ? "border-white/10" : "border-[var(--loomina-outline)]",
  };

  return (
    <section className={`${sectionSpacing} ${tone.bg} ${tone.text}`} id="offres">
      <div className="mx-auto max-w-6xl px-6">
        <div className="space-y-4 text-center">
          <p
            className={`inline-flex items-center gap-2 self-center rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-sm ${tone.chip}`}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" aria-hidden /> Offre unique Loomina
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Une offre limpide pour se concentrer sur l'essentiel
          </h2>
          <p className={`mx-auto max-w-3xl text-lg leading-relaxed ${tone.subtext}`}>
            Nous avons réduit les options pour garder un parcours simple : un accompagnement humain, un livre relié, un PDF sécurisé et un suivi jusqu'à la livraison chez vous.
          </p>
        </div>

        <Reveal
          className={`relative mt-10 overflow-hidden rounded-[30px] ${tone.card} bg-gradient-to-br from-[var(--loomina-surface)] via-[var(--loomina-cloud)] to-[var(--loomina-sand)] p-8 shadow-[0_32px_90px_-70px_rgba(15,17,21,0.65)] backdrop-blur`}
        >
          {/* Commentaire : bloc tarifaire premium avec bandeau de mise en avant */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone.badge}`}
              >
                <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" aria-hidden /> {offer.badge}
              </div>
              <h3 className="text-3xl font-bold text-[var(--loomina-ink)]">{offer.title}</h3>
              <p className={`text-lg leading-relaxed text-[var(--loomina-ink-soft)]`}>{offer.description}</p>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${tone.chip}`}
              >
                Livraison moyenne : 3 semaines · Accompagnement humain garanti
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 self-start rounded-2xl bg-[var(--loomina-amber-veil)]/30 px-4 py-3 text-right shadow-[0_18px_60px_-50px_rgba(196,139,63,0.65)]">
              <span className="text-sm font-semibold text-[var(--loomina-muted)] line-through">{offer.originalPrice}</span>
              <div className="flex items-center gap-3">
                <p className={`text-5xl font-bold ${tone.accent}`}>{offer.price}</p>
                <span className="inline-flex items-center rounded-full bg-[var(--loomina-amber)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--loomina-ink)] shadow-sm">
                  Offre de lancement
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loomina-muted)]">Impression incluse</p>
            </div>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {offer.highlights.map((highlight, index) => (
              <Reveal key={highlight} delay={index * 0.05}>
                <li
                  className={`flex items-start gap-4 rounded-2xl border ${tone.highlight} bg-opacity-80 p-5 text-left transition-transform duration-200 hover:-translate-y-1`}
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--loomina-amber-veil)] text-[var(--loomina-amber-strong)]">✦</span>
                  <span className="font-medium text-[var(--loomina-ink)]">{highlight}</span>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {essentials.map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border ${tone.highlight} bg-[var(--loomina-surface)]/90 p-4 transition-transform duration-200 hover:-translate-y-1`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--loomina-amber-strong)]">{item.title}</p>
                <p className="pt-2 text-sm leading-relaxed text-[var(--loomina-ink-soft)]">{item.text}</p>
              </div>
            ))}
          </div>

          <div className={`mt-10 flex flex-wrap items-center gap-4 border-t ${tone.divider} pt-8`}>
            <MagicButton href={offer.href} className="px-6 py-3 text-base">
              {offer.cta}
            </MagicButton>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--loomina-muted)]">Réponse sous 48h</span>
          </div>

          <div className={`mt-10 grid gap-4 rounded-[24px] border ${tone.divider} bg-[var(--loomina-cloud)]/60 p-6 md:grid-cols-3`}>
            {practicalInfos.map((info) => (
              <div key={info.title} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--loomina-amber-strong)]">{info.title}</p>
                <p className="text-sm leading-relaxed text-[var(--loomina-ink-soft)]">{info.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
