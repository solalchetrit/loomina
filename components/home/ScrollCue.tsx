"use client";

import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";

/**
 * L'invitation en bas du haut de page. Le clic amène le titre de la section visée
 * juste sous le menu flottant : la position est calculée ici, pour ne dépendre
 * ni de la hauteur du menu ni des marges de la section.
 */
export default function ScrollCue({ target, label, style }: { target: string; label: string; style?: CSSProperties }) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => {
        const section = document.getElementById(target);
        if (!section) return;
        e.preventDefault();
        const title = section.querySelector("h2") ?? section;
        const bar = document.querySelector("header")?.firstElementChild;
        const menuBottom = bar ? bar.getBoundingClientRect().bottom : 84;
        const top = title.getBoundingClientRect().top + window.scrollY - menuBottom - 28;
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
      }}
      className="rise mx-auto mt-6 hidden items-center gap-2.5 rounded-full px-4 py-2 text-[15px] font-bold text-[var(--ink)] lg:flex"
      style={style}
    >
      {label}
      <span className="scroll-cue flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-white">
        <Icon name="arrow" size={16} className="rotate-90" />
      </span>
    </a>
  );
}
