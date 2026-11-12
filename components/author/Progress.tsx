import type { ProjectOverview } from "./types";

/** Les quatre étapes du livre, telles que Loomina les mène (lib/loomina/phases.ts). */
const STAGES = [
  { phase: 1, title: "Faire connaissance", text: "Votre parcours dans les grandes lignes" },
  { phase: 2, title: "Les racines", text: "L’enfance, la famille, les lieux d’origine" },
  { phase: 3, title: "La vie adulte", text: "Le travail, les passions, les rencontres" },
  { phase: 4, title: "Ce que vous transmettez", text: "Vos messages, vos valeurs" },
] as const;

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

export default function Progress({ project }: { project: ProjectOverview }) {
  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));
  return (
    <section className="card p-6 md:p-8" aria-labelledby="progression">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="progression" className="t-heading">
            Où en est votre livre
          </h2>
          <p className="t-body mt-1">
            {project.completed ? "Votre récit est complet : place à la relecture et à l’impression." : `Étape en cours : ${STAGES[project.phase - 1].title.toLowerCase()}.`}
          </p>
        </div>
        <dl className="flex gap-6">
          {[
            { value: project.chapters, label: project.chapters > 1 ? "chapitres" : "chapitre" },
            { value: project.words.toLocaleString("fr-FR"), label: "mots" },
            { value: `≈ ${pages}`, label: "pages" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <b className="block text-[28px] font-extrabold leading-none tracking-[-0.03em]">{s.value}</b>
                <span className="text-[14px] text-[var(--ink-3)]">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((s) => {
          const done = project.completed || s.phase < project.phase;
          const current = !project.completed && s.phase === project.phase;
          const fill = done ? 100 : current ? project.progress : 0;
          return (
            <li
              key={s.phase}
              aria-current={current ? "step" : undefined}
              className={`rounded-[18px] p-4 ${current ? "bg-[#fdf3e4] ring-1 ring-[var(--amber-line)]" : "bg-[var(--canvas)]"}`}
            >
              <div className="flex items-center justify-between text-[13px] font-bold">
                <span className={done ? "text-[var(--success)]" : current ? "text-[var(--amber-deep)]" : "text-[var(--ink-3)]"}>
                  {done ? "Terminé" : current ? "En cours" : "À venir"}
                </span>
                <span className="text-[var(--ink-3)]">{s.phase}/4</span>
              </div>
              <p className="mt-2 text-[16px] font-bold leading-snug">{s.title}</p>
              <p className="mt-0.5 text-[14px] leading-snug text-[var(--ink-3)]">{s.text}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100} aria-label={s.title}>
                <div className="h-full rounded-full bg-[var(--amber)]" style={{ width: `${fill}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
