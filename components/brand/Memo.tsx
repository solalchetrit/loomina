"use client";

import "./memo.css";

/**
 * Mémo, l'éléphant de Loomina (choisi par Solal le 19/11/2026).
 * Il grandit avec le livre : cinq âges, quatre poses par âge (public/memo/<âge>-<pose>.webp).
 *   a : sa pose de base      b : la même, les yeux fermés (clignement, rire)
 *   c : le saut de joie      d : son activité (il dort, salue, écrit, relit, lit son livre)
 * Les animations sont dans memo.css ; ce composant ne fait que poser les images.
 */

export type MemoAge = 1 | 2 | 3 | 4 | 5;

/**
 * idle : il respire et cligne des yeux (en boucle)   joy : le saut de joie
 * laugh : il rit                                      act : son activité, puis il revient
 * rest : il reste dans son activité (en boucle)       pop : il vient de grandir
 */
export type MemoClip = "idle" | "joy" | "laugh" | "act" | "rest" | "pop";

/** Taille de chaque dessin (px de la planche) et hauteur de Mémo dans la scène, par âge. */
const SPRITES: Record<MemoAge, { tall: number; a: [number, number]; c: [number, number]; d: [number, number] }> = {
  1: { tall: 0.46, a: [315, 327], c: [335, 359], d: [362, 240] },
  2: { tall: 0.56, a: [319, 371], c: [329, 376], d: [346, 369] },
  3: { tall: 0.66, a: [336, 373], c: [378, 437], d: [345, 362] },
  4: { tall: 0.76, a: [342, 388], c: [369, 397], d: [367, 408] },
  5: { tall: 0.9, a: [342, 460], c: [413, 479], d: [386, 431] },
};

/** Huit étoiles en couronne : la gerbe du saut et de la croissance. */
const STARS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.25 : -0.1);
  const reach = i % 2 ? 0.4 : 0.31;
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, s: i % 3 === 0 ? 1.35 : i % 3 === 1 ? 0.8 : 1.05 };
});

export const MEMO_POSES = ["a", "b", "c", "d"] as const;

/** L'adresse d'un dessin de Mémo. */
export const memoSrc = (age: MemoAge, pose: (typeof MEMO_POSES)[number] = "a") => `/memo/${age}-${pose}.webp`;

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
  /** Appelé quand une prise qui ne boucle pas (joy, laugh, act, pop) est finie. */
  onEnd?: () => void;
  className?: string;
}) {
  const sp = SPRITES[age];
  const k = sp.tall / sp.a[1];
  const width = (w: number) => `${(w * k * 100).toFixed(2)}%`;
  return (
    <span
      className={`memo memo--${clip} memo--k${age} ${className}`}
      style={{ ["--memo-h" as string]: `${(sp.tall * 100).toFixed(0)}%`, ["--memo-size" as string]: `${size}px` }}
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
        {/* eslint-disable @next/next/no-img-element -- vingt petits dessins détourés, posés au pixel : pas de recadrage ni de redimensionnement à la volée */}
        <img className="memo-pose memo-a" src={memoSrc(age, "a")} alt="" style={{ width: width(sp.a[0]) }} draggable={false} />
        <img className="memo-pose memo-b" src={memoSrc(age, "b")} alt="" style={{ width: width(sp.a[0]) }} draggable={false} />
        <img className="memo-pose memo-c" src={memoSrc(age, "c")} alt="" style={{ width: width(sp.c[0]) }} draggable={false} />
        <img className="memo-pose memo-d" src={memoSrc(age, "d")} alt="" style={{ width: width(sp.d[0]) }} draggable={false} />
        {/* eslint-enable @next/next/no-img-element */}
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
