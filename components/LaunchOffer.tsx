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
            {daysLabel && <span className={"whitespace-nowrap " + (dark ? "text-[var(--noel-bright)]" : "text-[var(--noel)]")}> · {daysLabel}</span>}
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
/** Le module de Noël est aussi sur d'autres pages : s'il est sur celle-ci, on y descend au lieu de repartir à l'accueil. */
function goToOfferHere(e: React.MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById("offre-de-noel");
  if (!target || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

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
        onClick={goToOfferHere}
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
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span className="hidden text-white/85 sm:inline">Se termine dans</span>
            {[
              [String(r.days), r.days <= 1 ? "jour" : "jours"],
              [two(r.hours), "h"],
              [two(r.minutes), "min"],
              [two(r.seconds), "s"],
            ].map(([value, unit], i) => (
              <span key={unit} className={`rounded-[8px] bg-[var(--noel-deep)] px-2 py-1 text-[14px] leading-none ${i > 1 ? "hidden sm:inline" : ""} ${i === 3 ? "min-w-[3.1rem] text-center" : ""}`}>
                <b className="tabular-nums">{value}</b> {unit}
              </span>
            ))}
          </span>
        )}
        <span className="hidden shrink-0 font-bold underline underline-offset-4 xl:inline">J’en profite</span>
      </Link>
    </>
  );
}

/**
 * L'offre de lancement dans le haut de l'accueil (Solal, 26/11/2026) : pas
 * de boîte, de la typographie. Un trait rouge, le prix en grand, l'ancien
 * prix barré et le temps qui reste.
 */
export function HeroOffer({ className = "" }: { className?: string }) {
  const { active } = useLaunchOffer();
  const now = useNowSecond();
  if (!active) return null;
  const r = now == null ? null : remaining(now);
  return (
    <Link href="/#offre-de-noel" onClick={goToOfferHere} className={`group block w-fit max-w-full border-l-[3px] border-[var(--noel)] pl-5 ${className}`}>
      <span className="flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.08em] text-[var(--noel)]">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--noel)] opacity-60 motion-reduce:hidden" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--noel)]" />
        </span>
        Offre de lancement · Noël
      </span>
      <span className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
        <span className="text-[56px] font-extrabold leading-[0.9] tracking-[-0.05em] text-[var(--ink)] md:text-[64px]">
          {LAUNCH_OFFER.price}
          <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
        </span>
        <span className="whitespace-nowrap pb-1 text-[22px] font-bold text-[var(--ink-3)] line-through decoration-[var(--noel)] decoration-2">
          <span className="sr-only">au lieu de </span>
          {OFFER.regularPrice} {OFFER.currencySymbol}
        </span>
        <span className="pb-1.5 text-[16px] leading-snug text-[var(--ink-2)]">
          jusqu’au {LAUNCH_OFFER.label}
          {r && (
            <>
              <br />
              <b className="whitespace-nowrap tabular-nums text-[var(--noel)]">
                Il reste {r.days} {r.days <= 1 ? "jour" : "jours"} {two(r.hours)} h {two(r.minutes)} min
              </b>
            </>
          )}
        </span>
      </span>
      <span className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-bold text-[var(--ink)] underline decoration-[var(--noel)] decoration-2 underline-offset-4">
        Le cadeau de Noël à offrir à vos proches
        <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
