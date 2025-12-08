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
  return (
    <div className="w-full bg-white text-[var(--loomina-ink)]">
      <Hero />

      <section className="w-full bg-[var(--loomina-black)] px-6 py-16 md:py-20 text-white" id="comment">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 text-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)]">
              Parcours en 3 étapes
            </p>
            <h2 className="text-3xl font-semibold md:text-4xl">Comment se passe un livre Loomina ?</h2>
            <p className="text-lg leading-relaxed text-neutral-200 md:text-xl">
              Un entonnoir clair pour avancer sans menus ni distractions : un appel, une écriture accompagnée, puis la livraison.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-left shadow-sm"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-200">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] border border-white/10 text-white">
                    {step.title}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                </div>
                <p className="text-base leading-relaxed text-neutral-100">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-white px-6 py-16 md:py-20" id="exemple-audio">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 rounded-3xl border border-black/5 bg-white p-8 shadow-md md:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)]">Exemple audio</p>
            <h3 className="text-3xl font-semibold leading-tight md:text-4xl">Écouter avant de s'engager</h3>
            <p className="text-lg leading-relaxed text-neutral-600">
              Une minute d'entretien brut pour entendre la façon dont nous guidons la parole : rythme calme, voix respectée, montage léger.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-6 shadow-sm">
            <audio controls className="w-full">
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <p className="text-sm text-neutral-500">Appuyer sur lecture pour entendre l'approche Loomina.</p>
          </div>
        </div>
      </section>

      <OfferPreview variant="dark" />

      <section className="w-full bg-white px-6 py-16 md:py-20" id="faq">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)]">FAQ</p>
            <h3 className="text-3xl font-semibold md:text-4xl">Vos freins, nos réponses rapides</h3>
            <p className="text-lg leading-relaxed text-neutral-600">
              Prix, technique, confidentialité : nous réglons les doutes essentiels pour que vous puissiez lancer l'appel sereinement.
            </p>
          </div>
          <LoominaFAQ />
        </div>
      </section>

      <section className="w-full bg-[var(--loomina-black)] px-6 py-16 md:py-20" id="contact">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-sm text-white">
          <h3 className="text-2xl font-semibold md:text-3xl">Prêt à démarrer ?</h3>
          <p className="text-lg leading-relaxed text-neutral-200">
            Un membre de l'équipe vous rappelle en moins de 24h pour caler le premier échange.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:+33756830514"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--loomina-black)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.45)] transition hover:-translate-y-[1px]"
            >
              Appeler l'équipe Loomina
            </a>
            <a
              href="mailto:contact@loomina.fr?subject=Organiser%20un%20appel%20Loomina"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:bg-white/10"
            >
              Écrire à l'équipe
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
