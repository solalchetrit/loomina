"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Apparition des blocs [data-reveal] quand ils entrent à l'écran.
 *
 * Avant (jusqu'au 18/11/2026) : animation liée au défilement (animation-timeline).
 * L'opacité suivait la position de la page : un titre arrêté à mi-course restait
 * gris, et le pied de page, tout en bas, n'atteignait jamais la fin de son
 * animation. Maintenant : le bloc s'anime une fois, en entier, dès qu'il entre à
 * l'écran (IntersectionObserver), puis reste net.
 *
 * Seuls les blocs pris en charge ici sont masqués (data-shown="wait") ; ceux
 * déjà visibles au chargement ne bougent pas, rien ne clignote. Sans
 * JavaScript, ou pour un bloc apparu plus tard, tout reste affiché.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    // Les blocs pas encore apparus (y compris ceux d'un passage précédent de cet effet).
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown="now"]):not([data-shown="anim"])'));
    const vh = window.innerHeight;
    for (const el of blocks) {
      if (el.dataset.shown === "wait") continue;
      const r = el.getBoundingClientRect();
      // Déjà visible : rien à animer. Plus bas : masqué jusqu'à son entrée à l'écran.
      el.dataset.shown = r.top < vh && r.bottom > 0 ? "now" : "wait";
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "anim";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    for (const el of blocks) if (el.dataset.shown === "wait") io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
