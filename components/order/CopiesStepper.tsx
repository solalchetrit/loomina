"use client";

import { EXTRA_COPY } from "@/config/offer";

/** Moins, le nombre, plus : le nombre d'exemplaires en plus (config/offer.ts). */
export default function CopiesStepper({ value, onChange, min = 0, label }: { value: number; onChange: (n: number) => void; min?: number; label: string }) {
  const btn =
    "press flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rule-strong)] bg-white text-[20px] font-semibold leading-none hover:border-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--rule-strong)]";
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Un exemplaire de moins">
        −
      </button>
      <output className="min-w-[2ch] text-center text-[20px] font-extrabold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(EXTRA_COPY.max, value + 1))} disabled={value >= EXTRA_COPY.max} aria-label="Un exemplaire de plus">
        +
      </button>
    </div>
  );
}
