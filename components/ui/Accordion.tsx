"use client";

import { useId, useState, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

export interface AccordionItem {
  q: string;
  a: ReactNode;
}

/** Accordéon accessible (bouton + aria-expanded + région), dans une carte. */
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
    <div className={`card divide-y divide-[var(--line-soft)] px-5 sm:px-7 ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-b${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={i}>
            <h3 className="m-0 text-[18px] tracking-[-0.01em]">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold leading-snug text-[var(--ink)] md:py-6"
              >
                <span>{item.q}</span>
                <span aria-hidden="true" className="acc-icon chip-icon chip-icon-neutral !h-9 !w-9 !rounded-[12px]">
                  <Icon name="plus" size={18} />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="acc-panel" data-open={isOpen}>
              <div>
                <div className="t-body max-w-2xl pb-6 pr-12">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
