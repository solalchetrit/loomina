"use client";

import "./memo.css";
import { MEMO_SPRITES } from "./memo-sprites";

/**
 * Mémo, l'éléphant de Loomina (choisi par Solal le 19/11/2026, redessiné le 23/11/2026
 * avec ChatGPT : on le voit vraiment grandir d'un âge à l'autre).
 * Il grandit avec le livre : cinq âges, huit poses par âge (public/memo/<âge>-<pose>.webp).
 *   a : sa pose de base      b : la même, les yeux fermés (clignement, rire)
 *   c : le saut de joie      d : son activité (il dort, marche, écrit, relit, lit son livre)
 *   e : merci (la trompe sur le cœur)        f : un souvenir de plus (une lumière au bout de la trompe)
 *   g : vous revoilà (il salue)              h : je vous écoute (la tête penchée, une oreille tendue)
 * Les animations sont dans memo.css ; ce composant ne fait que poser les images.
 */

export type MemoAge = 1 | 2 | 3 | 4 | 5;

/**
 * idle : il respire, se balance et cligne des yeux (en boucle)   joy : le saut de joie
 * laugh : il rit                     act : son activité, puis il revient
 * rest : il reste dans son activité (en boucle)                    pop : il vient de grandir
 * charge : il s'illumine juste avant de grandir                    thanks : il dit merci, la trompe sur le cœur
 * memory : il reçoit une lumière (un souvenir), elle s'envole vers le livre, il remercie
 * hello : il salue (on revient le voir)                            listen : il écoute, la tête penchée, et acquiesce
 */
export type MemoClip = "idle" | "joy" | "laugh" | "act" | "rest" | "pop" | "charge" | "thanks" | "memory" | "hello" | "listen";

/** Hauteur de Mémo dans la scène, par âge (mesurée sur la planche des cinq âges). */
const TALL: Record<MemoAge, number> = { 1: 0.5, 2: 0.62, 3: 0.7, 4: 0.79, 5: 0.9 };

/** Huit étoiles en couronne : la gerbe du saut et de la croissance. */
const STARS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.25 : -0.1);
  const reach = i % 2 ? 0.4 : 0.31;
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, s: i % 3 === 0 ? 1.35 : i % 3 === 1 ? 0.8 : 1.05 };
});

export const MEMO_POSES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export type MemoPose = (typeof MEMO_POSES)[number];

/** L'adresse d'un dessin de Mémo. */
export const memoSrc = (age: MemoAge, pose: MemoPose = "a") => `/memo/${age}-${pose}.webp`;

export default function Memo({
  age,
  clip = "idle",
  size = 320,
  onEnd,
  className = "",
}: {
  age: MemoAge;
  clip?: MemoClip;
  /** Côté de la scène en px : sert seulement à proportionner les étoiles (la scène, elle, prend la largeur offerte). */
  size?: number;
  /** Appelé quand une prise qui ne boucle pas est finie. */
  onEnd?: () => void;
  className?: string;
}) {
  const sp = MEMO_SPRITES[age];
  // Tous les dessins d'un âge viennent de la même planche : une seule échelle, réglée sur la pose de base.
  const k = TALL[age] / sp.a.h;
  const pct = (n: number) => `${(n * k * 100).toFixed(2)}%`;
  // La lumière du souvenir : posée sur celle que Mémo tient dans la pose f.
  const f = sp.f;
  const orbLeft = 50 - (f.w * k * 100) / 2 + (f.orb?.[0] ?? 0.8) * f.w * k * 100;
  const orbBottom = 8 + (1 - (f.orb?.[1] ?? 0.2)) * f.h * k * 100;
  return (
    <span
      className={`memo memo--${clip} memo--k${age} ${className}`}
      style={{ ["--memo-h" as string]: `${(TALL[age] * 100).toFixed(0)}%`, ["--memo-size" as string]: `${size}px` }}
      aria-hidden="true"
    >
      <span className="memo-shadow" />
      <span className="memo-ring" />
      <span
        key={`${age}-${clip}`}
        className="memo-body"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && clip !== "idle" && clip !== "rest") onEnd?.();
        }}
      >
        {/* eslint-disable @next/next/no-img-element -- quarante petits dessins détourés, posés au pixel : pas de recadrage ni de redimensionnement à la volée */}
        {MEMO_POSES.map((p) => (
          <img key={p} className={`memo-pose memo-${p}`} src={memoSrc(age, p)} alt="" style={{ width: pct(sp[p].w) }} draggable={false} />
        ))}
        {/* eslint-enable @next/next/no-img-element */}
        <span className="memo-orb" style={{ left: `${orbLeft.toFixed(2)}%`, bottom: `${orbBottom.toFixed(2)}%` }} />
        <span className="memo-love">♥</span>
      </span>
      <span className="memo-z">z</span>
      <span className="memo-z">z</span>
      <span key={`fx-${age}-${clip}`} className="memo-fx">
        {STARS.map((st, i) => (
          <span
            key={i}
            className="memo-star"
            style={{ ["--dx" as string]: `${(st.x * size).toFixed(0)}px`, ["--dy" as string]: `${(st.y * size).toFixed(0)}px`, ["--s" as string]: st.s }}
          >
            ✦
          </span>
        ))}
      </span>
    </span>
  );
}
