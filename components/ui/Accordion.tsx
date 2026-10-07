"use client";

import { useId, useState, type ReactNode } from "react";

export interface AccordionItem {
  q: string;
  a: ReactNode;
}

/**
 * Accordéon accessible (bouton + aria-expanded + région).
 * La hauteur est animée en CSS via grid-template-rows.
 */
export default function Accordion({
  items,
  defaultOpen = null,
  className = "",
}: {
  items: AccordionItem[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={`rule-top ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={i} className="border-b border-[var(--rule)]">
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-6 py-5 text-left font-sans text-[18px] font-medium leading-snug text-[var(--ink)] md:py-6"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="acc-icon mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[var(--gold-ink)]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="acc-panel" data-open={isOpen}>
              <div>
                <div className="t-body max-w-2xl pb-6 pr-10">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
