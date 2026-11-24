"use client";

import { EXTRA_COPY } from "@/config/offer";

/** Le signe moins ou plus, dessiné (les caractères « − » et « + » ne tombent pas au centre selon la police). */
function Sign({ plus }: { plus?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {plus && <path d="M8 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

/**
 * Moins, le nombre, plus : le nombre d'exemplaires en plus (config/offer.ts).
 * Une seule pilule, comme un sélecteur de quantité de boutique (Solal, 24/11/2026 : « tu peux faire mieux »).
 * Sur téléphone : pas de zoom au double appui (touch-manipulation), pas de fond resté gris
 * après un appui (survol seulement avec une souris), pas de texte sélectionné en cliquant vite.
 */
export default function CopiesStepper({ value, onChange, min = 0, label }: { value: number; onChange: (n: number) => void; min?: number; label: string }) {
  const btn =
    "press flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-[var(--ink)] transition-colors active:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:text-[var(--rule-strong)] disabled:active:bg-transparent [@media(hover:hover)]:hover:bg-[var(--canvas)] [@media(hover:hover)]:disabled:hover:bg-transparent";
  return (
    <div
      className="inline-flex h-12 select-none items-center rounded-full border border-[var(--rule-strong)] bg-white p-1 shadow-[0_1px_2px_rgba(23,29,43,0.06)]"
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Un exemplaire de moins">
        <Sign />
      </button>
      <output className="min-w-[2.75rem] select-none font-sans text-center text-[18px] font-bold" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(EXTRA_COPY.max, value + 1))} disabled={value >= EXTRA_COPY.max} aria-label="Un exemplaire de plus">
        <Sign plus />
      </button>
    </div>
  );
}
