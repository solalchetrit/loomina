import type { ProjectOverview } from "./types";

/** Ce que Loomina a retenu de votre vie : la frise, les proches, les thèmes. Tiré du contexte du projet. */
export default function LifeStory({ project }: { project: ProjectOverview }) {
  const empty = !project.timeline.length && !project.family.length && !project.themes.length;
  if (empty) {
    return (
      <section className="card p-7 md:p-10">
        <h2 className="t-heading">Votre histoire prendra forme ici</h2>
        <p className="t-body mt-2 max-w-xl">
          Après vos premiers appels, vous verrez ici les dates clés de votre vie et les personnes qui la peuplent, telles que Loomina les a
          comprises. Une erreur ? Dites-le simplement au prochain appel.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="card p-6 md:p-8" aria-labelledby="frise">
        <h2 id="frise" className="t-heading">
          Votre frise de vie
        </h2>
        <p className="t-body mt-1">Les repères que Loomina a retenus. Une date fausse ? Corrigez-la au prochain appel.</p>
        {project.timeline.length ? (
          <ol className="relative mt-6 space-y-5 border-l-2 border-[var(--line)] pl-6">
            {project.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span aria-hidden="true" className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--amber)]" />
                <b className="block text-[15px] font-extrabold text-[var(--amber-ink)]">{t.year ?? "Date à préciser"}</b>
                <span className="text-[17px] leading-snug">{t.event}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="t-small mt-6">Pas encore de dates : elles viendront au fil des appels.</p>
        )}
      </section>

      <div className="flex flex-col gap-4">
        <section className="card p-6 md:p-8" aria-labelledby="proches">
          <h2 id="proches" className="t-heading">
            Les personnes de votre histoire
          </h2>
          {project.family.length ? (
            <ul className="mt-5 space-y-3">
              {project.family.map((f) => (
                <li key={f.name} className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[16px] font-extrabold text-[var(--amber-deep)]">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <b className="block text-[16px] leading-tight">{f.name}</b>
                    <span className="text-[14px] text-[var(--ink-3)]">
                      {f.relation}
                      {f.deceased ? " · disparu(e)" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-small mt-4">Elles apparaîtront quand vous les évoquerez.</p>
          )}
        </section>

        {project.themes.length > 0 && (
          <section className="card p-6 md:p-8" aria-labelledby="themes-abordes">
            <h2 id="themes-abordes" className="t-heading">
              Déjà racontés
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.themes.map((t) => (
                <li key={t} className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[14px] font-semibold">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
