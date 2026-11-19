"use client";

import { useState, type ReactNode } from "react";

/**
 * La page de lecture de l'espace auteur : à gauche, une colonne fixe (le titre,
 * le sommaire, les photos) ; à droite, le texte. Sur téléphone, la colonne passe
 * au-dessus et le sommaire se replie, pour arriver tout de suite au texte.
 */
export function ReaderLayout({ side, children }: { side: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-5">
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[5.75rem] lg:max-h-[calc(100dvh-6.75rem)] lg:overflow-y-auto lg:pb-1">{side}</aside>
      <div className="min-w-0 space-y-4 lg:space-y-5">{children}</div>
    </div>
  );
}

export interface TocPart {
  title: string | null;
  items: { href: string; number: number | string; title: string }[];
}

/** Le sommaire : toujours ouvert sur ordinateur, replié sur téléphone. */
export function Toc({ parts, label = "Sommaire" }: { parts: TocPart[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const count = parts.reduce((n, p) => n + p.items.length, 0);
  return (
    <nav aria-label={label} className="mt-4 border-t border-[var(--line-soft)] pt-2 lg:pt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="press flex min-h-9 w-full items-center justify-between gap-3 text-left lg:pointer-events-none lg:min-h-0"
      >
        <span className="text-[14px] font-bold text-[var(--ink-3)]">
          {label} <span className="font-semibold lg:hidden">· {count}</span>
        </span>
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
          className={`text-[var(--ink-3)] transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={open ? "pt-1" : "hidden lg:block"}>
        {parts.map((part) => (
          <div key={part.title ?? "tous"}>
            {part.title && <p className="mt-3 text-[13px] font-bold text-[var(--amber-ink)]">{part.title}</p>}
            <ol className="mt-1">
              {part.items.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="-mx-2 flex items-baseline gap-2.5 rounded-[10px] px-2 py-2 text-[15px] font-semibold leading-snug text-[var(--ink)] hover:bg-[var(--canvas)]"
                  >
                    <span className="w-5 shrink-0 text-[13px] font-bold tabular-nums text-[var(--amber-ink)]">{c.number}</span>
                    <span className="min-w-0 flex-1">{c.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  );
}

/** Une explication qu'on n'impose pas : elle s'ouvre si on la demande. */
export function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="mt-3">
      <summary className="link inline cursor-pointer list-none text-[14px] [&::-webkit-details-marker]:hidden">{label}</summary>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-2)]">{children}</p>
    </details>
  );
}

/** Les deux façons de lire : petit sélecteur à deux positions. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-[var(--surface-2)] p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`press min-h-10 flex-1 rounded-full px-3 text-[14px] font-bold leading-tight ${value === o.id ? "bg-[var(--ink)] text-white shadow-sm" : "text-[var(--ink-2)]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Une page du livre : même carte pour un récit d'appel et pour un chapitre. */
export const PAGE = "card scroll-mt-28 px-6 py-9 sm:px-12 sm:py-12";
export const PAGE_TITLE = "mt-1 text-center font-serif text-[clamp(1.4rem,2.2vw,1.75rem)] font-normal italic leading-tight tracking-normal text-[var(--ink)]";
export const PAGE_KICKER = "text-center text-[13px] font-bold text-[var(--amber-ink)]";
