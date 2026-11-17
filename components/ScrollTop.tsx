"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Toujours arriver en haut de page.
 * - En changeant de page (menu, pied de page, boutons) : on se retrouve tout en haut,
 *   sauf si le lien vise une section précise (#ancre).
 * - En cliquant sur le lien de la page où l'on est déjà (le logo sur l'accueil, par exemple) :
 *   la page remonte en haut au lieu de ne rien faire.
 */
export default function ScrollTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target || link.origin !== window.location.origin) return;
      if (link.hash || link.pathname !== window.location.pathname) return;
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
