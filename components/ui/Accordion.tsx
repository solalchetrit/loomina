"use client";

import { useId, useState, type ReactNode } from "react";

export interface AccordionItem {
  q: string;
  a: ReactNode;
}

/**
 * Accordéon accessible (bouton + aria-expanded + région).
 * La hauteur est animée en CSS via grid-template-rows : interruptible, pas de JS.
 * Ouvert occasionnellement → 250 ms, ease-out fort.
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
    <div className={`divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={i}>
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-sans text-[17px] font-medium text-[var(--ink)] transition-colors duration-200 hover:text-[var(--gold-ink)] md:py-6"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="acc-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--loomina-night)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="acc-panel" data-open={isOpen}>
              <div>
                <div className="pb-6 pr-14 font-sans text-[16px] leading-relaxed text-[var(--text-secondary)]">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
