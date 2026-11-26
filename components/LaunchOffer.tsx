"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
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
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--noel)] px-3 py-1 text-[14px] font-bold text-white"
          >
            <Icon name="gift" size={15} />
            Offre de Noël
          </span>
          <span className={`text-[15px] font-bold ${dark ? "text-white" : "text-[var(--ink)]"}`}>
            jusqu’au {LAUNCH_OFFER.label}
            {daysLabel && <span className={"whitespace-nowrap " + (dark ? "text-[#ff8f8f]" : "text-[var(--noel)]")}> · {daysLabel}</span>}
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


function subscribeSecond(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}
/** L'heure du navigateur à la seconde ; null pendant le rendu serveur. */
function useNowSecond(): number | null {
  return useSyncExternalStore(
    subscribeSecond,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

/** Ce qu'il reste avant la fin de l'offre : jours, heures, minutes, secondes. */
function remaining(now: number) {
  const ms = Math.max(0, new Date(LAUNCH_OFFER.endsAt).getTime() - now);
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86_400), hours: Math.floor((s % 86_400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}
const two = (n: number) => String(n).padStart(2, "0");

/**
 * Le compte à rebours, en quatre cases : jours, heures, minutes, secondes.
 * Les chiffres ne s'affichent qu'une fois l'heure du navigateur connue.
 */
export function Countdown({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const now = useNowSecond();
  const r = now == null ? null : remaining(now);
  const cells: [string, string][] = [
    [r ? String(r.days) : "–", r && r.days <= 1 ? "jour" : "jours"],
    [r ? two(r.hours) : "–", "heures"],
    [r ? two(r.minutes) : "–", "minutes"],
    [r ? two(r.seconds) : "–", "secondes"],
  ];
  const box = tone === "dark" ? "bg-[var(--noel)] text-white" : "bg-[var(--noel-soft)] text-[var(--noel-deep)]";
  const unit = tone === "dark" ? "text-white/80" : "text-[var(--noel-deep)]";
  return (
    <div
      role="timer"
      aria-label={r ? `Il reste ${r.days} jours, ${r.hours} heures et ${r.minutes} minutes` : undefined}
      className="flex gap-2"
    >
      {cells.map(([value, label]) => (
        <span key={label} aria-hidden="true" className={`flex min-w-[62px] flex-col items-center rounded-[14px] px-2.5 py-2.5 sm:min-w-[72px] ${box}`}>
          <span className="text-[26px] font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[30px]">{value}</span>
          <span className={`mt-1.5 text-[12px] font-semibold sm:text-[13px] ${unit}`}>{label}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Le bandeau rouge de Noël, tout en haut du site (Solal, 26/11/2026 : du rouge
 * sur ce qui annonce l'urgence, et parler de Noël). Fixe, au-dessus du menu ;
 * il pousse la page de sa hauteur (--promo-h). Disparaît seul après le 24 décembre.
 */
export function NoelBanner() {
  const { active } = useLaunchOffer();
  const now = useNowSecond();
  if (!active) return null;
  const r = now == null ? null : remaining(now);
  return (
    <>
      <style>{`:root{--promo-h:44px}body{padding-top:var(--promo-h)}`}</style>
      <Link
        href="/#offre-de-noel"
        className="fixed inset-x-0 top-0 z-[1001] flex h-[44px] items-center justify-center gap-x-3 bg-[var(--noel)] px-3 text-[14.5px] text-white hover:bg-[var(--noel-deep)] sm:text-[15.5px]"
      >
        <Icon name="gift" size={18} className="hidden shrink-0 min-[380px]:block" />
        <span className="truncate">
          <b>Offre de Noël</b>
          <span className="hidden md:inline"> pour le lancement</span> : {LAUNCH_OFFER.price} €{" "}
          <span className="line-through opacity-75">{OFFER.regularPrice} €</span>
          <span className="hidden lg:inline"> jusqu’au {LAUNCH_OFFER.label}</span>
        </span>
        {r && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-[13.5px] font-extrabold tabular-nums text-[var(--noel-deep)] sm:text-[14.5px]">
            <span className="sm:hidden">J-{r.days}</span>
            <span className="hidden sm:inline">
              Plus que {r.days} j {two(r.hours)} h {two(r.minutes)} min {two(r.seconds)} s
            </span>
          </span>
        )}
        <span className="hidden shrink-0 font-bold underline underline-offset-4 xl:inline">J’en profite</span>
      </Link>
    </>
  );
}
