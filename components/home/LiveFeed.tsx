"use client";

import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

type Item = { icon: IconName; title: string; detail: string; badge?: { label: string; tone: "amber" | "green" } };

/** Une semaine type dans l'espace auteur de Jeanne. Exemple, présenté comme tel. */
const EVENTS: Item[] = [
  { icon: "phone", title: "Appel terminé, 32 minutes", detail: "Les dimanches à la mer" },
  { icon: "pen", title: "Chapitre 4 écrit", detail: "« L’été de mes seize ans »", badge: { label: "À relire", tone: "amber" } },
  { icon: "check", title: "Chapitre 3 relu par l’équipe", detail: "Deux corrections, prêt pour le livre", badge: { label: "Validé", tone: "green" } },
  { icon: "image", title: "3 photos ajoutées", detail: "Envoyées par sa fille" },
  { icon: "phone", title: "Appel terminé, 18 minutes", detail: "Le premier emploi, à la poste" },
  { icon: "pen", title: "Chapitre 5 écrit", detail: "« Le guichet de la rue Haute »", badge: { label: "À relire", tone: "amber" } },
  { icon: "check", title: "Chapitre 4 relu par l’équipe", detail: "Une date corrigée par Jeanne", badge: { label: "Validé", tone: "green" } },
  { icon: "heart", title: "Une question ajoutée", detail: "Par son fils : « Et papa, comment l’as-tu rencontré ? »" },
];

const VISIBLE = 4;
const STEP_MS = 2800;

/**
 * La carte vivante du haut de page : les événements d'une semaine arrivent un à un,
 * comme dans l'espace auteur. Sans JavaScript ou avec « réduire les animations »,
 * elle reste figée sur les quatre premiers.
 */
export default function LiveFeed() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setTick((t) => t + 1), STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  // Le plus récent en haut ; on remonte la liste au fil des ticks.
  const items = Array.from({ length: VISIBLE }, (_, i) => {
    const index = (tick + VISIBLE - 1 - i) % EVENTS.length;
    return { ...EVENTS[index], key: tick + VISIBLE - 1 - i };
  });
  // Un nouveau chapitre tous les quatre événements, comme dans la liste ci-dessus.
  const chapters = 4 + Math.floor(tick / 4);

  return (
    <figure data-ui className="card card-float w-full min-w-0 p-5 sm:p-6" aria-label="Exemple : une semaine dans l’espace auteur">
      <figcaption className="flex items-center justify-between gap-3 px-1 pb-4">
        <span className="flex items-center gap-2.5 text-[17px] font-bold">
          <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--amber)] opacity-60 motion-reduce:hidden" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--amber)]" />
          </span>
          Le livre de Jeanne
        </span>
        <span className="pill pill-neutral">Exemple</span>
      </figcaption>

      <ul className="flex h-[300px] flex-col gap-2.5 overflow-hidden sm:h-[292px]" aria-live="off">
        {items.map((item, i) => (
          <li
            key={item.key}
            className={`flex items-center gap-3.5 rounded-[18px] px-3.5 py-3 sm:px-4 ${
              i === 0 ? "feed-new bg-[#fdf3e4]" : "bg-[var(--canvas)]"
            }`}
          >
            <span className={`chip-icon !h-10 !w-10 !rounded-[12px] ${i === 0 ? "!bg-white" : "!bg-white !text-[var(--ink)]"}`}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[16px] leading-snug">{item.title}</b>
              <span className="block truncate text-[14px] text-[var(--ink-3)]">{item.detail}</span>
            </span>
            {item.badge && <span className={`pill pill-${item.badge.tone} hidden sm:inline-flex`}>{item.badge.label}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-8 rounded-[18px] bg-[var(--ink)] px-5 py-4 text-white">
        <p className="leading-tight">
          <b className="text-[28px] font-extrabold tabular-nums tracking-[-0.03em]">{chapters}</b>{" "}
          <span className="text-[14px] text-[#cfcfc8]">chapitres écrits</span>
        </p>
        <p className="leading-tight">
          <b className="text-[28px] font-extrabold tracking-[-0.03em] text-[var(--amber)]">0</b>{" "}
          <span className="text-[14px] text-[#cfcfc8]">ligne écrite par Jeanne</span>
        </p>
      </div>
    </figure>
  );
}
