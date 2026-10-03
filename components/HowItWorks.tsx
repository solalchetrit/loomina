const STEPS = [
  {
    chapter: "01",
    title: "L’inscription",
    description:
      "Tout commence par une simple commande. Vous accédez aussitôt à votre espace personnel, et Loomina vous appelle quand vous le souhaitez.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    ),
  },
  {
    chapter: "02",
    title: "Les conversations",
    description:
      "À votre rythme, vous échangez par téléphone avec Loomina. Elle vous écoute, vous guide et ravive vos souvenirs les plus précieux.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    ),
  },
  {
    chapter: "03",
    title: "La rédaction",
    description:
      "Votre voix devient une prose élégante. Notre équipe relit ensuite chaque page pour un style fluide et soigné.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    ),
  },
  {
    chapter: "04",
    title: "L’héritage",
    description:
      "Vous recevez chez vous un beau livre relié, prêt à être transmis. Votre histoire est désormais éternelle.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="process" className="relative w-full scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        {/* En-tête */}
        <div className="reveal grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-ink)]">
              Le parcours
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
              Votre histoire, <em className="text-[var(--gold-ink)]">étape par étape.</em>
            </h2>
          </div>
          <p className="max-w-md font-sans text-[17px] leading-relaxed text-[var(--text-secondary)] md:justify-self-end">
            Un parcours simple et accompagné, du premier appel jusqu’au livre que vous tiendrez entre vos mains.
          </p>
        </div>

        {/* Étapes */}
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)] sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
          {STEPS.map((step) => (
            <li key={step.chapter} className="reveal flex flex-col bg-[var(--paper)] p-7 font-sans md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-serif text-[15px] italic text-[var(--gold-ink)]">Chapitre {step.chapter}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--loomina-night)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                    {step.icon}
                  </svg>
                </span>
              </div>
              <h3 className="mt-6 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)] sm:mt-10 md:mt-14">
                {step.title}
              </h3>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
