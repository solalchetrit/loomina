"use client";

import { useRef } from "react";

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
}

/**
 * Carrousel des 14 chapitres : défilement natif à aimantation (scroll-snap),
 * pan horizontal au doigt, flèches pour la souris et le clavier.
 */
export default function ChapterCarousel({ chapters }: { chapters: Chapter[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="snap-row -mx-5 px-5 sm:-mx-6 sm:px-6"
        style={{ touchAction: "pan-x pan-y" }}
        role="list"
        aria-label="Les 14 chapitres"
      >
        {chapters.map((c) => (
          <article
            key={c.id}
            data-card
            role="listitem"
            className="card flex w-[78vw] max-w-[300px] flex-col rounded-3xl p-6 sm:w-[300px]"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-[15px] italic text-[var(--gold-ink)]">Chapitre {String(c.id).padStart(2, "0")}</span>
              <span className="rounded-full bg-[var(--loomina-night)] px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {c.subtitle}
              </span>
            </div>
            <h3 className="mt-8 font-serif text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{c.title}</h3>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">{c.desc}</p>
          </article>
        ))}
        {/* Marge de fin pour que la dernière carte s'aligne */}
        <div aria-hidden="true" className="w-1 shrink-0" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-sans text-[13px] text-[var(--text-muted)]">
          14 chapitres · <span className="hidden sm:inline">faites défiler ou </span>utilisez les flèches
        </p>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir === -1 ? "Chapitres précédents" : "Chapitres suivants"}
              className="press flex h-11 w-11 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline-strong)] hover:border-[var(--loomina-gold)] hover:text-[var(--gold-ink)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                {dir === -1 ? <path d="M10 3 5 8l5 5" /> : <path d="m6 3 5 5-5 5" />}
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
