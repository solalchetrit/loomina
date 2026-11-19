"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Icon from "@/components/ui/Icon";

/**
 * L'invitation en bas du haut de page. Le clic amène le titre de la section visée
 * juste sous le menu flottant : la position est calculée ici, pour ne dépendre
 * ni de la hauteur du menu ni des marges de la section.
 */
export default function ScrollCue({ target, label, style }: { target: string; label: string; style?: CSSProperties }) {
  // La flèche s'efface dès qu'on a quitté le haut de page : elle ne dépasse pas au-dessus des trois étapes.
  const [away, setAway] = useState(false);
  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a
      href={`#${target}`}
      onClick={(e) => {
        const section = document.getElementById(target);
        if (!section) return;
        e.preventDefault();
        const bar = document.querySelector("header")?.firstElementChild;
        const menuBottom = bar ? bar.getBoundingClientRect().bottom : 84;
        // Arrivée : le titre de la section à 40 px sous le menu flottant. On part du haut de la section et de
        // sa marge (pas de la position du titre, faussée par son animation d'apparition qui le décale).
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const padding = parseFloat(getComputedStyle(section).paddingTop) || 0;
        const top = Math.max(0, sectionTop + padding - menuBottom - 40);
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
      }}
      aria-label={label}
      title={label}
      className={`rise mx-auto mt-8 hidden h-11 w-11 items-center justify-center rounded-full text-[var(--ink-3)] transition-colors duration-200 hover:text-[var(--ink)] lg:flex ${away ? "pointer-events-none" : ""}`}
      style={style}
    >
      {/* Une flèche seule, discrète : le texte « Comment ça marche » est retiré (Solal, 19/11/2026). */}
      {/* L'opacité est sur la pastille : l'animation d'arrivée (.rise) garde la main sur celle du lien. */}
      <span className={`scroll-cue flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/70 transition-opacity duration-300 ${away ? "opacity-0" : ""}`}>
        <Icon name="arrow" size={16} className="rotate-90" />
      </span>
    </a>
  );
}
