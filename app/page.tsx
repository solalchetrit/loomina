import Hero from "@/components/Hero";
import OfferPreview from "@/components/OfferPreview";
import LoominaFAQ from "@/components/LoominaFAQ";

const steps = [
  {
    title: "On s'appelle",
    description:
      "15 minutes pour comprendre l'histoire à raconter et rassurer la personne qui sera interviewée.",
  },
  {
    title: "On écrit",
    description:
      "Les conversations sont guidées, réécrites avec douceur et rassemblées dans une maquette claire.",
  },
  {
    title: "Vous recevez",
    description:
      "Le livre relié et sa version numérique sécurisée, prêts à être offerts à la famille.",
  },
];

export default function Home() {
  const container = "mx-auto w-full max-w-6xl px-6";
  const sectionSpacing = "section-shell";

  return (
    <div className="w-full bg-[var(--loomina-cloud)] text-[var(--loomina-ink)]">
      <Hero />

      <section className={`${sectionSpacing} bg-[var(--loomina-forest)] text-white`} id="comment">
        <div className={`${container} space-y-10 text-center`}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber)]">Parcours en 3 étapes</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Comment se passe un livre Loomina ?</h2>
            <p className="text-lg leading-relaxed text-white/80 md:text-xl">
              Un entonnoir clair pour avancer sans menus ni distractions : un appel, une écriture accompagnée, puis la livraison.
            </p>
          </div>

          {/* Commentaire : grille de cartes numérotées pour rythmer la lecture */}
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 px-6 py-8 text-left shadow-[0_20px_60px_-50px_rgba(0,0,0,0.7)] backdrop-blur"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                    Étape {index + 1}
                  </span>
                  <span className="h-3 w-3 rounded-full bg-[var(--loomina-amber)]" />
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-base leading-relaxed text-white/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionSpacing} bg-[var(--loomina-cloud)]`} id="exemple-audio">
        <div className={`${container} grid grid-cols-1 items-center gap-10 rounded-[30px] border border-[var(--loomina-outline)] bg-[var(--loomina-surface)] p-8 shadow-[0_32px_80px_-65px_rgba(15,17,21,0.5)] md:grid-cols-[1.05fr,0.95fr]`}>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)]">Exemple audio</p>
            <h3 className="text-3xl font-semibold leading-tight text-[var(--loomina-ink)] md:text-4xl">Écouter avant de s'engager</h3>
            <p className="text-lg leading-relaxed text-[var(--loomina-ink-soft)]">
              Une minute d'entretien brut pour entendre la façon dont nous guidons la parole : rythme calme, voix respectée, montage léger.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--loomina-outline)] bg-[var(--loomina-cloud)]/70 p-6 shadow-inner">
            <audio controls className="w-full" aria-label="Exemple audio Loomina">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-[var(--loomina-muted)]">Appuyer sur lecture pour entendre l'approche Loomina.</p>
          </div>
        </div>
      </section>

      <OfferPreview variant="dark" />

      <section className={`${sectionSpacing} bg-[var(--loomina-cloud)]`} id="faq">
        <div className={`${container} flex flex-col gap-8 text-center`}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)]">FAQ</p>
            <h3 className="text-3xl font-semibold md:text-4xl">Vos freins, nos réponses rapides</h3>
            <p className="text-lg leading-relaxed text-[var(--loomina-ink-soft)]">
              Prix, technique, confidentialité : nous réglons les doutes essentiels pour que vous puissiez lancer l'appel sereinement.
            </p>
          </div>
          <LoominaFAQ />
        </div>
      </section>

      <section className={`${sectionSpacing} bg-[var(--loomina-forest)]`} id="contact">
        <div className={`${container} flex flex-col gap-6 rounded-[28px] border border-white/15 bg-white/5 p-8 text-center text-white shadow-[0_32px_80px_-60px_rgba(0,0,0,0.65)]`}>
          <h3 className="text-2xl font-semibold md:text-3xl">Prêt à démarrer ?</h3>
          <p className="text-lg leading-relaxed text-white/80">
            Un membre de l'équipe vous rappelle en moins de 24h pour caler le premier échange.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:+33756830514"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.45)] transition hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--loomina-amber-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--loomina-forest)]"
            >
              Appeler l'équipe Loomina
            </a>
            <a
              href="mailto:contact@loomina.fr?subject=Organiser%20un%20appel%20Loomina"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--loomina-forest)]"
            >
              Écrire à l'équipe
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
