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

/** Une ligne courte pour les barres : « Offre de Noël : 199 € au lieu de 289 € · J-12 ». */
export function LaunchOfferLine({ className = "" }: { className?: string }) {
  const now = useNow();
  const { active } = useLaunchOffer();
  if (!active) return null;
  const d = now == null ? null : launchOfferDaysLeft(now);
  return (
    <p className={`whitespace-nowrap ${className}`}>
      <b>Offre de Noël :</b> {LAUNCH_OFFER.price} € <span className="line-through opacity-70">{OFFER.regularPrice} €</span>
      {d == null ? "" : d === 0 ? " · dernier jour" : ` · plus que ${d} j`}
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
  const box = tone === "dark" ? "bg-white/[0.08] text-white" : "bg-white text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--amber-line)]";
  const unit = tone === "dark" ? "text-[#cfcfc8]" : "text-[var(--amber-deep)]";
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
 * Sous le titre de l'accueil : l'offre de Noël en une carte, avec le temps
 * qui reste. Mène au grand module de l'offre, plus bas.
 */
export function LaunchOfferCard({ className = "" }: { className?: string }) {
  const { active } = useLaunchOffer();
  const now = useNowSecond();
  if (!active) return null;
  const r = now == null ? null : remaining(now);
  return (
    <Link
      href="/#offre-de-noel"
      className={`press group flex w-full max-w-[35rem] items-center gap-4 rounded-[20px] border border-[var(--amber-line)] bg-[var(--amber-wash)] p-3 pr-4 hover:border-[var(--amber)] ${className}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[var(--amber)] text-[var(--ink)]">
        <Icon name="gift" size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold leading-snug text-[var(--ink)] sm:text-[17px]">
          Offre de lancement pour Noël : {LAUNCH_OFFER.price} €{" "}
          <span className="whitespace-nowrap font-bold text-[var(--ink-3)] line-through">{OFFER.regularPrice} €</span>
        </span>
        <span className="mt-0.5 block text-[15px] leading-snug text-[var(--amber-deep)]">
          Jusqu’au {LAUNCH_OFFER.label}.{" "}
          {r && (
            <b className="whitespace-nowrap tabular-nums">
              Plus que {r.days} j {two(r.hours)} h {two(r.minutes)} min {two(r.seconds)} s
            </b>
          )}
        </span>
      </span>
      <Icon name="arrow" size={20} className="shrink-0 text-[var(--amber-deep)] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
