"use client";

import { useSyncExternalStore } from "react";
import { OFFER, LAUNCH_OFFER, isLaunchOffer, launchOfferDaysLeft } from "@/config/offer";

/**
 * L'offre de lancement (Solal, 26/11/2026) : 199 € au lieu de 289 € jusqu'au
 * 24 décembre. Composant client : l'heure est relue dans le navigateur, donc
 * le compte des jours reste juste même si la page a été construite avant.
 */
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}
/** L'heure du navigateur, arrondie à la minute ; null pendant le rendu serveur. */
function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => null,
  );
}

/** « Plus que 12 jours », « Dernier jour », ou rien après l'offre. */
export function daysLeftLabel(now: number): string {
  const d = launchOfferDaysLeft(now);
  if (d === 0) return "Dernier jour";
  return `Plus que ${d} jour${d > 1 ? "s" : ""}`;
}

/** Vrai pendant l'offre. Avant l'hydratation, on suit la valeur de la construction. */
export function useLaunchOffer(): { active: boolean; daysLabel: string | null } {
  const now = useNow();
  const active = now == null ? isLaunchOffer() : isLaunchOffer(now);
  return { active, daysLabel: now != null && active ? daysLeftLabel(now) : null };
}

/**
 * Le prix affiché dans les grandes cartes : l'ancien prix barré, le prix de
 * lancement en grand, et l'échéance. Après le 24 décembre : le prix normal seul.
 */
export function LaunchPrice({
  tone = "light",
  priceClassName,
}: {
  tone?: "light" | "dark";
  priceClassName: string;
}) {
  const { active, daysLabel } = useLaunchOffer();
  const price = active ? LAUNCH_OFFER.price : OFFER.regularPrice;
  const dark = tone === "dark";
  return (
    <div>
      {active && (
        <p className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[14px] font-bold ${
              dark ? "bg-[var(--amber)] text-[var(--ink)]" : "bg-[var(--amber-soft)] text-[var(--amber-deep)]"
            }`}
          >
            Offre de lancement
          </span>
          <span className={`text-[15px] font-bold ${dark ? "text-white" : "text-[var(--ink)]"}`}>
            jusqu’au {LAUNCH_OFFER.label}
            {daysLabel && <span className={"whitespace-nowrap " + (dark ? "text-[var(--amber)]" : "text-[var(--amber-deep)]")}> · {daysLabel}</span>}
          </span>
        </p>
      )}
      <p className="flex items-end gap-3">
        <span className={priceClassName}>
          {price}
          <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
        </span>
        {active && (
          <span className={`whitespace-nowrap pb-1 text-[24px] font-bold line-through decoration-2 md:text-[28px] ${dark ? "text-[#9b9b94]" : "text-[var(--ink-3,#8a8a84)]"}`}>
            <span className="sr-only">au lieu de </span>
            {OFFER.regularPrice} {OFFER.currencySymbol}
          </span>
        )}
      </p>
    </div>
  );
}

/** Une ligne courte pour les barres : « Offre de lancement : 199 € au lieu de 289 € · Plus que 12 jours ». */
export function LaunchOfferLine({ className = "" }: { className?: string }) {
  const { active, daysLabel } = useLaunchOffer();
  if (!active) return null;
  return (
    <p className={className}>
      <b>Offre de lancement :</b> {LAUNCH_OFFER.price} € au lieu de{" "}
      <span className="line-through">{OFFER.regularPrice} €</span>
      {daysLabel ? ` · ${daysLabel}` : ` jusqu’au ${LAUNCH_OFFER.label}`}
    </p>
  );
}

/** La pastille du menu, sur grand écran : « 199 € jusqu'au 24 décembre ». */
export function LaunchOfferPill() {
  const { active, daysLabel } = useLaunchOffer();
  if (!active) return null;
  return (
    <span
      className="hidden whitespace-nowrap rounded-full bg-[var(--amber-soft)] px-3 py-1.5 text-[14px] font-bold text-[var(--amber-deep)] min-[1520px]:inline-flex"
      title={`Offre de lancement : ${LAUNCH_OFFER.price} € au lieu de ${OFFER.regularPrice} €, jusqu’au ${LAUNCH_OFFER.label}`}
    >
      Lancement : {LAUNCH_OFFER.price} € {daysLabel ? `· ${daysLabel.toLowerCase()}` : `jusqu’au ${LAUNCH_OFFER.label}`}
    </span>
  );
}
