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
  const sectionSpacing = "px-6 py-20 md:py-24 lg:py-28";
  const isDark = variant === "dark";
  const headingColor = isDark ? "text-white" : "text-black";
  const subheadingColor = isDark ? "text-neutral-200" : "text-neutral-600";
  const badgeColor = isDark
    ? "bg-white/10 text-white border border-white/10"
    : "bg-neutral-100 text-black border border-black/5";
  const accentBorder = isDark ? "border-white/10" : "border-black/10";
  const cardSubtleBg = isDark ? "bg-white/10 border-white/10 text-white" : "bg-neutral-50 border-black/10 text-black";
  const accentText = isDark ? "text-white" : "text-black";
  const mutedText = isDark ? "text-neutral-200" : "text-neutral-600";
  const highlightText = isDark ? "text-neutral-100" : "text-neutral-700";
  const priceText = isDark ? "text-[var(--loomina-amber)]" : "text-[var(--loomina-amber-strong)]";
  const secondaryBadge = isDark
    ? "bg-white/10 text-white border border-white/10"
    : "bg-neutral-50 text-black border border-black/5";
  const highlightCardBg = isDark ? "bg-white/5" : "bg-neutral-50";
  const footerBorder = isDark ? "border-white/10" : "border-black/5";
  const infoBorder = isDark ? "border-white/10" : "border-black/5";
  const infoBg = isDark ? "bg-white/5" : "bg-neutral-50";
  const containerBg = isDark ? "bg-white/5 text-white" : "bg-white/90 text-black";
  const subtleNote = isDark ? "text-neutral-300" : "text-neutral-500";

  return (
    <section
      className={`relative w-full ${sectionSpacing} ${isDark ? "bg-[var(--loomina-black)] text-white" : "bg-white text-black"}`}
      id="offres"
    >
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="flex flex-col gap-4 text-center">
          <p
            className={`inline-flex items-center gap-2 self-center rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-sm ${badgeColor}`}
          >
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" /> Offre unique Loomina
          </p>
          <h2 className={`text-3xl md:text-4xl font-semibold leading-tight ${headingColor}`}>
            Une offre limpide pour se concentrer sur l'essentiel
          </h2>
          <p className={`${subheadingColor} leading-relaxed max-w-3xl mx-auto text-lg`}>
            Nous avons réduit les options pour garder un parcours simple : un accompagnement humain, un livre relié, un PDF sécurisé et un suivi jusqu'à la livraison chez vous.
          </p>
        </div>

        <Reveal
          className={`relative overflow-hidden rounded-[28px] border ${accentBorder} ${containerBg} p-8 shadow-2xl backdrop-blur`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.18em] font-semibold ${secondaryBadge}`}
              >
                {offer.badge}
              </div>
              <h3 className={`text-3xl font-bold ${accentText}`}>{offer.title}</h3>
              <p className={`${mutedText} leading-relaxed text-lg`}>{offer.description}</p>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${secondaryBadge}`}
              >
                Livraison moyenne : 3 semaines · Accompagnement humain garanti
              </div>
            </div>
              <div className={`flex flex-col items-end gap-2 self-start rounded-2xl ${cardSubtleBg} px-4 py-3 shadow-sm`}>
                <span className={`${subtleNote} text-sm line-through`}>{offer.originalPrice}</span>
                <div className="flex items-center gap-3">
                  <p className={`text-5xl font-bold ${priceText}`}>{offer.price}</p>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] rounded-full bg-[var(--loomina-amber)] text-black shadow-sm">
                    Offre de lancement
                  </span>
                </div>
                <p className={`text-xs font-semibold ${subtleNote}`}>Impression incluse</p>
              </div>
            </div>

          <ul className={`grid gap-3 md:grid-cols-2 mt-8 ${accentText}`}>
            {offer.highlights.map((highlight, index) => (
              <Reveal key={highlight} delay={index * 0.05}>
                <li
                  className={`flex items-start gap-3 rounded-2xl ${highlightCardBg} p-4 border ${accentBorder} transition-colors ${
                    isDark ? "hover:bg-white/10" : "hover:bg-neutral-100"
                  }`}
                >
                  <span className={`text-[var(--loomina-amber-strong)] text-lg ${isDark ? "text-[var(--loomina-amber)]" : ""}`}>✦</span>
                  <span className={`font-medium ${highlightText}`}>{highlight}</span>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="grid gap-4 md:grid-cols-4 mt-10">
            {essentials.map((item) => (
              <div key={item.title} className={`rounded-2xl ${infoBg} p-4 space-y-2 border ${accentBorder}`}>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--loomina-amber-strong)] font-semibold">{item.title}</p>
                <p className={`${mutedText} text-sm leading-relaxed`}>{item.text}</p>
              </div>
            ))}
          </div>

          <div className={`flex flex-wrap items-center gap-4 pt-8 border-t ${footerBorder} mt-8 ${accentText}`}>
            <MagicButton
              href={offer.href}
              className={`shadow-lg px-6 py-3 text-base ${isDark ? "bg-black text-white border border-black hover:bg-neutral-800" : "bg-black text-white border border-black hover:bg-neutral-800"}`}
            >
              {offer.cta}
            </MagicButton>
            <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? "text-neutral-200" : "text-neutral-500"}`}>
              Réponse sous 48h
            </span>
          </div>

          <div className={`mt-10 grid gap-4 md:grid-cols-3 border ${infoBorder} rounded-[24px] p-6 ${infoBg}`}>
            {practicalInfos.map((info) => (
              <div key={info.title} className={`space-y-2 ${accentText}`}>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--loomina-amber-strong)] font-semibold">{info.title}</p>
                <p className={`${highlightText} text-sm leading-relaxed`}>{info.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
