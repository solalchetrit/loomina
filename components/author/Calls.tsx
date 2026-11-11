import { SITE } from "@/config/site";
import { formatDate, type ProjectOverview } from "./types";

/** L'historique des appels traités : date, durée, ce qui a été raconté. */
export default function Calls({ project }: { project: ProjectOverview }) {
  const total = project.calls.reduce((n, c) => n + (c.minutes ?? 0), 0);
  return (
    <section className="card p-6 md:p-8" aria-labelledby="appels">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="appels" className="t-heading">
          Vos appels
        </h2>
        {project.calls.length > 0 && (
          <p className="text-[15px] text-[var(--ink-3)]">
            {project.calls.length} appel{project.calls.length > 1 ? "s" : ""} · {total} min au total
          </p>
        )}
      </div>

      {project.calls.length ? (
        <ol className="mt-5 divide-y divide-[var(--line-soft)]">
          {project.calls.map((c, i) => (
            <li key={c.date} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
              <span>
                <b className="block text-[16px]">{formatDate(c.date)}</b>
                <span className="text-[14px] text-[var(--ink-3)]">
                  {c.minutes ? `${c.minutes} min` : "Durée inconnue"}
                  {i === 0 ? " · le plus récent" : ""}
                </span>
              </span>
              <span className="text-[16px] leading-relaxed text-[var(--ink-2)]">{c.summary ?? "Appel enregistré."}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="t-body mt-3">
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
