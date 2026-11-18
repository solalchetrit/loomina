"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Les animations du logo (kit du 18/11/2026, lib/brand/kit) sur le site.
 *
 * Le kit part des tracés du vrai logo et finit toujours sur le logo
 * d'origine. Il n'est chargé qu'au moment où une animation doit se jouer :
 * tant qu'il n'est pas là (ou si la personne a demandé moins de mouvement),
 * on montre `children`, l'image fixe.
 *
 * Règle du kit : une seule chose bouge à l'écran, et elle dit quelque chose.
 */

type Api = { play(): void; pause(): void; seek(t: number): void; def: { duration: number; loop: boolean } };
type Kit = { mount(el: HTMLElement, name: string, opts: { theme?: string; vb?: string; paused?: boolean }): Api };

let kit: Promise<Kit> | null = null;
function loadKit(): Promise<Kit> {
  kit ??= (async () => {
    // Trois fichiers à effet de bord, dans l'ordre : les tracés, le moteur, les animations ajoutées.
    await import("@/lib/brand/kit/geom.js");
    await import("@/lib/brand/kit/kit-core.js");
    await import("@/lib/brand/kit/kit-more.js");
    return (window as unknown as { Loomina: Kit }).Loomina;
  })();
  return kit;
}

/** Le cadre du logo seul, sans marge : il se pose exactement à la place de l'image. */
export const TIGHT_WORDMARK = "-20 -40 4330 1300";

export type LogoAnimation =
  | "scintille" | "survol" | "fil" | "revelation" | "plume" | "etoilePlume" | "voix" | "pret" | "ecrit"
  | "persoBonjour" | "persoEcoute" | "persoEcrit" | "persoDort" | "persoFete";

interface Props {
  name: LogoAnimation;
  /** `dark` : lettres blanches, pour les fonds bleu nuit. */
  theme?: "light" | "dark";
  /**
   * `once` : se joue une fois dès que le bloc est visible. `loop` : tourne tant qu'il est visible.
   * `hover` : au repos, se joue une fois quand on passe dessus (ou qu'on y arrive au clavier).
   */
  mode?: "once" | "loop" | "hover";
  /** Avec `hover` : joue aussi une fois à l'arrivée, une seule fois par visite du site (clé de session). */
  greetOnce?: string;
  vb?: string;
  /** `left` : le dessin se cale à gauche du cadre, comme une image `object-left`. */
  align?: "center" | "left";
  className?: string;
  /** L'image fixe, montrée avant le chargement et à qui préfère moins de mouvement. */
  children?: ReactNode;
}

export default function LogoMotion({ name, theme = "light", mode = "once", greetOnce, vb, align = "center", className = "", children }: Props) {
  const box = useRef<HTMLSpanElement>(null);
  const stage = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = box.current;
    const target = stage.current;
    if (!host || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let api: Api | null = null;
    let cancelled = false;
    let stop: ReturnType<typeof setTimeout> | undefined;
    const cleanups: (() => void)[] = [];

    const playOnce = () => {
      if (!api) return;
      clearTimeout(stop);
      api.play();
      // Les boucles du kit sont arrêtées au bout d'un tour, revenues au logo d'origine.
      if (api.def.loop) stop = setTimeout(() => api?.seek(0), api.def.duration);
    };

    const start = async () => {
      const k = await loadKit().catch(() => null);
      if (!k || cancelled) return;
      api = k.mount(target, name, { theme, vb, paused: true });
      if (align === "left") target.querySelector("svg")?.setAttribute("preserveAspectRatio", "xMinYMid meet");
      setReady(true);
      if (mode === "hover") {
        const onEnter = () => playOnce();
        host.addEventListener("pointerenter", onEnter);
        host.closest("a")?.addEventListener("focus", onEnter);
        cleanups.push(() => {
          host.removeEventListener("pointerenter", onEnter);
          host.closest("a")?.removeEventListener("focus", onEnter);
        });
        if (greetOnce) {
          let seen = false;
          try {
            seen = sessionStorage.getItem(greetOnce) === "1";
            sessionStorage.setItem(greetOnce, "1");
          } catch {}
          if (!seen) setTimeout(playOnce, 600);
        }
        return;
      }
      // `once` et `loop` : seulement quand le bloc est à l'écran.
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!api) return;
          if (entry.isIntersecting) {
            api.play();
            if (mode === "once") io.disconnect();
          } else if (mode === "loop") api.pause();
        },
        { threshold: 0.4 }
      );
      io.observe(host);
      cleanups.push(() => io.disconnect());
    };

    // Le kit pèse une centaine de Ko : on attend que la page soit tranquille.
    const idle = window.requestIdleCallback ? window.requestIdleCallback(() => void start(), { timeout: 2500 }) : window.setTimeout(() => void start(), 800);
    return () => {
      cancelled = true;
      clearTimeout(stop);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle as number);
      cleanups.forEach((c) => c());
      api?.pause();
      target.innerHTML = "";
    };
  }, [name, theme, mode, greetOnce, vb, align]);

  return (
    <span ref={box} className={`relative block ${className}`} aria-hidden="true">
      <span className={`absolute inset-0 block ${ready ? "invisible" : ""}`}>{children}</span>
      <span ref={stage} className="absolute inset-0 block" />
    </span>
  );
}
