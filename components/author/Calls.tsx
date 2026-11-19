import { SITE } from "@/config/site";
import { formatDate, type ProjectOverview } from "./types";

/** L'historique des appels traités : date, durée, ce qui a été raconté. */
export default function Calls({ project }: { project: ProjectOverview }) {
  const total = project.calls.reduce((n, c) => n + (c.minutes ?? 0), 0);
  return (
    <section className="card px-5 py-4 md:px-6 md:py-5" aria-labelledby="appels">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h2 id="appels" className="text-[18px] font-extrabold leading-tight tracking-[-0.02em]">
          Vos appels
        </h2>
        {project.calls.length > 0 && (
          <p className="text-[14px] text-[var(--ink-3)]">
            {project.calls.length} appel{project.calls.length > 1 ? "s" : ""} · {total} min au total
          </p>
        )}
      </div>

      {project.calls.length ? (
        <ol className="mt-2">
          {project.calls.map((c, i) => (
            <li key={c.date} className="grid gap-x-5 gap-y-0.5 border-t border-[var(--line-soft)] py-2.5 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:items-baseline">
              <span className="flex items-baseline gap-2 sm:block">
                <b className="text-[14px] font-bold sm:block sm:text-[15px]">{formatDate(c.date)}</b>
                <span className="text-[13px] text-[var(--ink-3)]">
                  {c.minutes ? `${c.minutes} min` : "Durée inconnue"}
                  {i === 0 ? " · le plus récent" : ""}
                </span>
              </span>
              <span className="min-w-0">
                {c.title && <b className="block text-[15.5px] leading-snug text-[var(--ink)]">{c.title}</b>}
                <span className="line-clamp-2 text-[14.5px] leading-snug text-[var(--ink-2)]">{c.summary ?? "Appel enregistré."}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">
          Pas encore d’appel. Composez le{" "}
          <a href={`tel:${SITE.phone}`} className="link">
            {SITE.phoneDisplay}
          </a>{" "}
          depuis votre numéro : Loomina vous accueillera par votre prénom.
        </p>
      )}
    </section>
  );
}
