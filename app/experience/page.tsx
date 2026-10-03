import { Section, SectionHeading, PageHeader } from "@/components/ui/Section";
import ChapterCarousel from "@/components/ChapterCarousel";
import MemoryGraph from "@/components/MemoryGraph";
import CtaBand from "@/components/CtaBand";

const CHAPTERS = [
  { id: 1, title: "Enfance", subtitle: "0-12 ans", desc: "Vos premiers souvenirs, l’école, les vacances en famille." },
  { id: 2, title: "Adolescence", subtitle: "12-18 ans", desc: "Le lycée, les amitiés intenses, les premières libertés." },
  { id: 3, title: "Premiers amours", subtitle: "Rencontres", desc: "Les battements de cœur et les leçons sentimentales." },
  { id: 4, title: "Études & formation", subtitle: "Apprentissage", desc: "Vos années d’étudiant, vos mentors, votre voie." },
  { id: 5, title: "Premiers emplois", subtitle: "Vie active", desc: "Les débuts professionnels, les défis, les réussites." },
  { id: 6, title: "Rencontres marquantes", subtitle: "Influences", desc: "Ces personnes qui ont changé votre destin." },
  { id: 7, title: "Fondation de la famille", subtitle: "Le foyer", desc: "Le mariage, l’arrivée des enfants, la construction." },
  { id: 8, title: "Carrière", subtitle: "L’œuvre", desc: "Vos évolutions, vos fiertés, vos accomplissements." },
  { id: 9, title: "Voyages & découvertes", subtitle: "Le monde", desc: "Les lieux visités, les aventures et les cultures." },
  { id: 10, title: "Épreuves & résilience", subtitle: "Les tempêtes", desc: "Les moments difficiles et comment vous les avez surmontés." },
  { id: 11, title: "Passions", subtitle: "Jardins secrets", desc: "Ce qui vous fait vibrer au quotidien." },
  { id: 12, title: "Sagesse & leçons", subtitle: "Le bilan", desc: "Ce que la vie vous a appris de plus précieux." },
  { id: 13, title: "Héritage & transmission", subtitle: "Valeurs", desc: "Ce que vous souhaitez laisser aux vôtres." },
  { id: 14, title: "Rêves & projets", subtitle: "Le futur", desc: "Ce qu’il vous reste à accomplir." },
];

const PHASES = [
  {
    number: "I",
    title: "L’initialisation",
    duration: "Semaine 1",
    items: [
      { title: "Premier appel", desc: "Nous faisons connaissance et définissons ensemble le ton de votre récit." },
      { title: "Calibrage", desc: "Loomina apprend votre style, vos préférences narratives et vos priorités." },
    ],
  },
  {
    number: "II",
    title: "Les conversations",
    duration: "Semaines 2 à 13",
    items: [
      { title: "14 appels thématiques", desc: "Une thématique par semaine, à votre rythme." },
      { title: "Rédaction en continu", desc: "Loomina transforme vos paroles en prose littéraire." },
      { title: "Validation", desc: "Vous recevez chaque chapitre pour relecture et ajustements." },
    ],
  },
  {
    number: "III",
    title: "L’héritage",
    duration: "Semaine 14",
    items: [
      { title: "Mise en page", desc: "Typographie soignée, couverture personnalisée." },
      { title: "Livraison", desc: "Votre livre arrive chez vous, prêt à être transmis." },
    ],
  },
];

const CALL_STEPS = [
  { time: "0:00", who: "Loomina", text: "Bonjour Jeanne. La semaine dernière, vous m’aviez parlé de la ferme de vos grands-parents. On y retourne ?" },
  { time: "0:12", who: "Jeanne", text: "Oh oui… Il y avait ce grand tilleul dans la cour. Ma grand-mère y faisait sécher les fleurs pour la tisane." },
  { time: "0:41", who: "Loomina", text: "Quelle odeur vous reste de cette cour ?" },
  { time: "0:48", who: "Jeanne", text: "Le tilleul, justement. Et le pain. Elle en faisait tous les samedis…" },
];

export default function ExperiencePage() {
  return (
    <main className="w-full">
      <PageHeader
        eyebrow="L’expérience"
        title="Le voyage de votre vie,"
        accent="en trois étapes."
        text="Un parcours simple et accompagné, de la première écoute à la livraison du livre. Vous parlez, Loomina écrit."
      />

      {/* Phases : frise */}
      <Section size="sm">
        <ol className="grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)] md:grid-cols-3">
          {PHASES.map((phase) => (
            <li key={phase.number} className="reveal flex flex-col bg-[var(--paper)] p-7 md:p-8">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-lg text-[var(--loomina-gold-light)]">
                  {phase.number}
                </span>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">{phase.duration}</span>
              </div>
              <h2 className="mt-8 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{phase.title}</h2>
              <ul className="mt-5 space-y-3 border-t border-[var(--hairline)] pt-5">
                {phase.items.map((it) => (
                  <li key={it.title} className="font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--ink)]">{it.title}</span> — {it.desc}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* Un appel, concrètement */}
      <Section tone="alt">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            align="left"
            eyebrow="Un appel, concrètement"
            title="Une conversation,"
            accent="pas un interrogatoire."
            text="Loomina reprend là où vous vous étiez arrêté, pose une question à la fois et laisse le silence faire son travail. Vous n’avez rien à préparer."
          />
          <div className="reveal card mx-auto w-full max-w-md rounded-3xl p-2">
            <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--loomina-gold-light)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="font-sans text-[14px] font-semibold text-[var(--ink)]">Entretien n°7 · Le foyer</p>
                <p className="font-sans text-[12px] text-[var(--text-muted)]">En cours · 12 min</p>
              </div>
              <span className="flex h-5 items-center gap-[3px]">
                {[0.45, 0.9, 0.6, 1, 0.5].map((h, i) => (
                  <span key={i} className="wave-bar block w-[3px] rounded-full bg-[var(--loomina-gold)]" style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }} />
                ))}
              </span>
            </div>
            <ol className="space-y-3 p-4">
              {CALL_STEPS.map((s, i) => (
                <li key={i} className={`flex ${s.who === "Jeanne" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 font-sans text-[14px] leading-relaxed ${
                      s.who === "Jeanne"
                        ? "rounded-br-md bg-[var(--ink)] text-[var(--loomina-void)]"
                        : "rounded-bl-md bg-[var(--loomina-night)] text-[var(--ink)]"
                    }`}
                  >
                    <span className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] ${s.who === "Jeanne" ? "text-[var(--loomina-gold-light)]" : "text-[var(--gold-ink)]"}`}>
                      {s.who} · {s.time}
                    </span>
                    {s.text}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Chapitres */}
      <Section id="chapitres">
        <SectionHeading
          align="left"
          eyebrow="La carte narrative"
          title="Quatorze chapitres"
          accent="pour une vie."
          text="Chaque appel explore une thématique. Vous pouvez en sauter, en approfondir, en ajouter : c’est votre récit."
        />
        <div className="mt-12">
          <ChapterCarousel chapters={CHAPTERS} />
        </div>
      </Section>

      {/* Memory Engine */}
      <Section tone="alt">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <MemoryGraph />
          </div>
          <SectionHeading
            className="order-1 lg:order-2"
            align="left"
            eyebrow="Technologie"
            title="Memory Engine :"
            accent="l’IA qui n’oublie rien."
            text="Loomina relie vos souvenirs entre eux. Si vous parlez de votre grand-mère au chapitre 1, elle saura faire le lien quand vous évoquerez sa cuisine au chapitre 7, et vous posera la bonne question."
          />
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Votre histoire" accent="commence aujourd’hui." text="Essayez gratuitement par téléphone, puis commandez quand vous êtes prêt. Aucun engagement, juste une conversation." secondary={{ href: "/offre", label: "Voir l’offre" }} />
      </div>
    </main>
  );
}
