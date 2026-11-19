"use client";

import { useState } from "react";
import { SITE } from "@/config/site";
import { formatDate, type ProjectOverview } from "./types";

/** L'historique des appels : une ligne par appel (date, titre, durée). Le résumé s'ouvre quand on touche la ligne. */
export default function Calls({ project }: { project: ProjectOverview }) {
  const [open, setOpen] = useState<string | null>(project.calls[0]?.date ?? null);
  const total = project.calls.reduce((n, c) => n + (c.minutes ?? 0), 0);

  if (!project.calls.length) {
    return (
      <section className="card p-6 md:p-7">
        <p className="text-[16px] leading-relaxed text-[var(--ink-2)]">
          Pas encore d’appel. Composez le{" "}
          <a href={`tel:${SITE.phone}`} className="link">
            {SITE.phoneDisplay}
          </a>{" "}
          depuis votre numéro : Loomina vous accueillera par votre prénom.
        </p>
      </section>
    );
  }

  return (
    <section className="card px-3 py-3 md:px-4" aria-label="Vos appels">
      <p className="px-3 pb-2 pt-2 text-[14px] text-[var(--ink-3)]">
        {project.calls.length} appel{project.calls.length > 1 ? "s" : ""} · {total} min
      </p>
      <ol>
        {project.calls.map((c) => {
          const on = open === c.date;
          return (
            <li key={c.date} className="border-t border-[var(--line-soft)]">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : c.date)}
                className="press grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-[14px] px-3 py-3.5 text-left hover:bg-[var(--canvas)] sm:grid-cols-[9.5rem_minmax(0,1fr)_auto]"
              >
                <span className="col-span-2 text-[13.5px] text-[var(--ink-3)] sm:col-span-1 sm:text-[15px]">{formatDate(c.date)}</span>
                <b className="text-[16px] leading-snug text-[var(--ink)]">{c.title ?? "Appel enregistré"}</b>
                <span className="text-[14px] tabular-nums text-[var(--ink-3)]">{c.minutes ? `${c.minutes} min` : ""}</span>
                {on && c.summary && <span className="col-span-2 mt-1.5 text-[15px] leading-relaxed text-[var(--ink-2)] sm:col-start-2">{c.summary}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
