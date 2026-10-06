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
    number: "1",
    title: "Le premier appel",
    duration: "Le jour de votre choix",
    items: [
      { title: "Faire connaissance", desc: "Loomina se présente, vous explique comment ça marche et vous demande par où vous aimeriez commencer." },
      { title: "Un premier souvenir", desc: "Souvent l’enfance. Vous parlez, elle relance, et le premier chapitre est écrit dans la foulée." },
    ],
  },
  {
    number: "2",
    title: "Les conversations",
    duration: "Au fil des semaines",
    items: [
      { title: "Un thème par appel", desc: "Quatorze thèmes proposés, de l’enfance à aujourd’hui. Vous en sautez, vous en ajoutez." },
      { title: "Un chapitre après chaque appel", desc: "Vous le relisez dans votre espace et dites au prochain appel ce qu’il faut changer." },
    ],
  },
  {
    number: "3",
    title: "Le livre",
    duration: "6 à 8 semaines en général",
    items: [
      { title: "Relecture et mise en page", desc: "Notre équipe relit chaque page, place vos photos et compose le livre." },
      { title: "Livraison", desc: "Le livre relié arrive chez vous, avec sa version numérique pour la famille." },
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
        title="Comment ça marche"
        text="Vous parlez au téléphone, Loomina écrit, notre équipe relit, et le livre arrive chez vous. Voici le détail, sans jargon."
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
            title="Une conversation, pas un interrogatoire"
            text="Loomina reprend là où vous vous étiez arrêté, pose une question à la fois et vous laisse le temps de chercher vos souvenirs. Vous n’avez rien à préparer."
          />
          <div className="reveal card mx-auto w-full max-w-md rounded-3xl p-2">
            <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--loomina-gold-light)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="font-sans text-[14px] font-semibold text-[var(--ink)]">Appel n°7 · La maison de famille</p>
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
          title="Quatorze thèmes pour vous guider"
          text="Ce sont des points de départ, pas un questionnaire. Vous pouvez en sauter, en approfondir, en ajouter : c’est votre récit."
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
            title="Elle se souvient de ce que vous lui avez dit"
            text="Si vous parlez de votre grand-mère au premier appel, Loomina s’en souviendra quand vous évoquerez sa cuisine des semaines plus tard, et vous posera la bonne question. Vous n’avez jamais à tout répéter."
          />
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Essayez d’abord," accent="commandez ensuite." text="Appelez le 01 59 16 93 57 : trois minutes avec Loomina, gratuitement, sans rien enregistrer." primary={{ href: "tel:+33159169357", label: "Appeler le 01 59 16 93 57" }} secondary={{ href: "/order", label: "Commander" }} />
      </div>
    </main>
  );
}
