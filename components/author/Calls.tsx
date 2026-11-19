"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import ChapterEditor from "./ChapterEditor";
import { formatDate, type ProjectOverview } from "./types";

interface Story {
  number: number;
  content: string;
}

/** Le récit est en Markdown léger : on garde les paragraphes, on retire les dièses des titres. */
function paragraphs(md: string): string[] {
  return md
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").trim())
    .filter(Boolean);
}

/**
 * Les appels : une ligne par appel (date, titre, durée). Toucher la ligne ouvre le récit
 * tiré de cet appel, avec « Corriger ce récit ». Depuis le 19/11/2026 les récits d'appel
 * se lisent ici, et « Mon livre » ne montre plus que le livre (Solal : plus simple).
 */
export default function Calls({ project, onUnauthorized }: { project: ProjectOverview; onUnauthorized: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [stories, setStories] = useState<Record<string, Story>>({});
  const total = project.calls.reduce((n, c) => n + (c.minutes ?? 0), 0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/stories")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { story_id: number | null; story_title: string | null; story_content: string | null }[]) => {
        if (cancelled) return;
        const byTitle: Record<string, Story> = {};
        for (const r of rows) if (r.story_id !== null && r.story_title) byTitle[r.story_title] = { number: r.story_id, content: r.story_content ?? "" };
        setStories(byTitle);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
        {project.calls.length} appel{project.calls.length > 1 ? "s" : ""} · {total} min · touchez un appel pour lire son récit
      </p>
      <ol>
        {project.calls.map((c) => {
          const on = open === c.date;
          const story = c.title ? stories[c.title] : undefined;
          return (
            <li key={c.date} className="border-t border-[var(--line-soft)]">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : c.date)}
                className="press grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-[14px] px-3 py-3.5 text-left hover:bg-[var(--canvas)] sm:grid-cols-[9.5rem_minmax(0,1fr)_auto_auto]"
              >
                <span className="col-span-2 text-[13.5px] text-[var(--ink-3)] sm:col-span-1 sm:text-[15px]">{formatDate(c.date)}</span>
                <b className="text-[16px] leading-snug text-[var(--ink)]">{c.title ?? "Appel enregistré"}</b>
                <span className="text-[14px] tabular-nums text-[var(--ink-3)] max-sm:hidden">{c.minutes ? `${c.minutes} min` : ""}</span>
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`self-center text-[var(--ink-3)] transition-transform ${on ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {on && (
                <div className="px-3 pb-7 pt-3 sm:px-6">
                  {story ? (
                    <>
                      <div className="book-text mx-auto max-w-[38rem]" lang="fr">
                        {paragraphs(story.content).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                      <ChapterEditor
                        number={story.number}
                        content={story.content}
                        onSaved={(content) => setStories((all) => ({ ...all, [c.title as string]: { ...story, content } }))}
                        onUnauthorized={onUnauthorized}
                      />
                    </>
                  ) : (
                    <p className="mx-auto max-w-[38rem] text-[16px] leading-relaxed text-[var(--ink-2)]">{c.summary ?? "Le récit de cet appel arrive dans quelques minutes."}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
