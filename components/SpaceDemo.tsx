"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Le téléphone du module des espaces (Solal, 26/11/2026) : il montre l'espace
 * tout seul, comme une vidéo qu'on n'a pas à lancer. Chaque écran défile de
 * haut en bas, puis un doigt touche l'onglet suivant ; à la fin de l'espace
 * auteur, on passe à l'espace famille, et ainsi de suite.
 *
 * Ce ne sont pas des écrans redessinés : de vraies captures de l'espace, en
 * mode démo local, sur le livre d'exemple de Jeanne (personne fictive), dans
 * public/espace-auteur/demo/. Le haut et le menu du bas sont des captures à
 * part, posées par-dessus, pour rester fixes pendant que la page défile,
 * comme sur un vrai téléphone.
 *
 * Ne tourne que lorsqu'il est à l'écran ; immobile si le visiteur a demandé
 * moins d'animations dans les réglages de son appareil.
 */
export type SpaceId = "auteur" | "famille";

/** Hauteur de chaque capture, en pixels d'un écran de 390 de large (l'écran du téléphone en fait 844). */
const SCREENS: Record<SpaceId, { id: string; height: number }[]> = {
  auteur: [
    { id: "auteur-apercu", height: 1859 },
    { id: "auteur-livre", height: 2400 },
    { id: "auteur-vie", height: 2058 },
    { id: "auteur-appels", height: 1113 },
    { id: "auteur-reglages", height: 2150 },
  ],
  famille: [{ id: "famille", height: 2400 }],
};
const FRAME_H = 844;
const HOLD_MS = 1800;
const TAP_MS = 900;
const FADE_MS = 400;
// Assez lent pour lire (Solal, 26/11 : « le défilé est trop rapide ») : environ 170 px de l’écran réel par seconde.
const scrollMs = (height: number) => Math.min(9500, Math.max(3000, (height - FRAME_H) * 6));

export default function SpaceDemo({
  space,
  auto,
  onAutoNext,
  label,
}: {
  space: SpaceId;
  /** Vrai tant que le visiteur n'a pas choisi un espace : on enchaîne auteur puis famille. */
  auto: boolean;
  onAutoNext: (next: SpaceId) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [still, setStill] = useState(false);
  const [scene, setScene] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [tapping, setTapping] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const el = ref.current;
    if (!el) return () => mq.removeEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => {
      mq.removeEventListener("change", sync);
      io.disconnect();
    };
  }, []);

  // Un autre espace : on repart du premier écran.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setScene(0);
    setScrolled(false);
    setTapping(false);
  }, [space]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const screens = SCREENS[space];
  const current = screens[Math.min(scene, screens.length - 1)];

  useEffect(() => {
    if (!inView || still) return;
    let t: ReturnType<typeof setTimeout>;
    if (!scrolled && !tapping) {
      t = setTimeout(() => setScrolled(true), HOLD_MS);
    } else if (scrolled && !tapping) {
      t = setTimeout(() => {
        if (scene < screens.length - 1) setTapping(true);
        else if (auto) onAutoNext(space === "auteur" ? "famille" : "auteur");
        else {
          setScene(0);
          setScrolled(false);
        }
      }, scrollMs(current.height) + HOLD_MS);
    } else {
      t = setTimeout(() => {
        setScene((s) => s + 1);
        setScrolled(false);
        setTapping(false);
      }, TAP_MS);
    }
    return () => clearTimeout(t);
  }, [inView, still, scrolled, tapping, scene, screens.length, current.height, auto, onAutoNext, space]);

  return (
    <div ref={ref} className="h-fit w-[190px] shrink-0 rounded-[30px] bg-[var(--ink)] p-[7px] shadow-[0_24px_50px_-24px_rgba(20,24,34,0.55)] md:w-[250px] md:rounded-[38px]">
      <div className="relative aspect-[390/844] overflow-hidden rounded-[24px] bg-[#f3f4f7] md:rounded-[31px]" role="img" aria-label={label}>
        {(Object.keys(SCREENS) as SpaceId[]).flatMap((key) =>
          SCREENS[key].map((s, i) => {
            const on = key === space && i === scene;
            const moving = on && scrolled;
            return (
              <Image
                key={s.id}
                src={`/espace-auteur/demo/${s.id}.webp`}
                alt=""
                width={520}
                height={Math.round((s.height * 520) / 390)}
                sizes="(min-width: 768px) 236px, 176px"
                className="absolute inset-x-0 top-0 h-auto w-full"
                style={{
                  opacity: on ? 1 : 0,
                  transform: moving ? `translateY(-${(((s.height - FRAME_H) / s.height) * 100).toFixed(2)}%)` : "translateY(0)",
                  transition: on
                    ? `opacity ${FADE_MS}ms ease, transform ${moving ? scrollMs(s.height) : 0}ms cubic-bezier(0.45,0,0.4,1)`
                    : `opacity ${FADE_MS}ms ease, transform 0s ${FADE_MS + 50}ms`,
                }}
              />
            );
          }),
        )}

        {/* Le haut de l'espace, fixe. */}
        {(["auteur", "famille"] as SpaceId[]).map((key) => (
          <Image
            key={key}
            src={`/espace-auteur/demo/${key}-haut.webp`}
            alt=""
            width={520}
            height={112}
            sizes="(min-width: 768px) 236px, 176px"
            className="absolute inset-x-0 top-0 h-auto w-full transition-opacity duration-[400ms]"
            style={{ opacity: key === space ? 1 : 0 }}
          />
        ))}

        {/* Le menu du bas de l'espace auteur, fixe, avec l'onglet en cours. */}
        {SCREENS.auteur.map((s, i) => (
          <Image
            key={s.id}
            src={`/espace-auteur/demo/${s.id}-menu.webp`}
            alt=""
            width={520}
            height={92}
            sizes="(min-width: 768px) 236px, 176px"
            className="absolute inset-x-0 bottom-0 h-auto w-full transition-opacity duration-300"
            style={{ opacity: space === "auteur" && i === scene ? 1 : 0 }}
          />
        ))}

        {/* Le doigt qui touche l'onglet suivant. */}
        {space === "auteur" && (
          <span
            aria-hidden
            className="pointer-events-none absolute aspect-square w-[12%] rounded-full bg-[var(--ink)]/25 ring-2 ring-white/80 transition-[opacity,transform] duration-300"
            style={{
              left: `${((Math.min(scene + 1, 4) + 0.5) / 5) * 100}%`,
              // Le centre de l'icône de l'onglet, sur la capture du menu.
              top: `${(800 / FRAME_H) * 100}%`,
              opacity: tapping ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${tapping ? 1 : 1.6})`,
            }}
          />
        )}
      </div>
    </div>
  );
}
