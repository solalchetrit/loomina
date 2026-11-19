"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { blurOf } from "@/lib/photo-blur";
import s from "./VoiceToBook.module.css";

/** Ce que Jeanne dit au téléphone. Exemple écrit pour illustrer la méthode : la même Jeanne que dans les autres exemples du site. */
const SPOKEN = "« Oh, le tilleul. Un grand tilleul, énorme… Ma grand-mère faisait sécher les fleurs dessous, sur des draps. »";

/** La page que Loomina en tire, dans la mise en page du livre imprimé. */
const PAGE: { kind: "par" | "sub"; text: string }[] = [
  {
    kind: "par",
    text: "En entrant dans la cour, on ne voyait que lui : un tilleul immense. Ma grand-mère faisait sécher ses fleurs à son pied, étalées sur des draps, et leur odeur montait jusque dans la cuisine.",
  },
  { kind: "sub", text: "Le pain du samedi" },
  {
    kind: "par",
    text: "Le samedi, c’était le jour du pain. J’avais le droit de façonner une petite boule, la mienne, qu’elle marquait d’une croix du bout de son couteau pour qu’on la reconnaisse.",
  },
  {
    kind: "par",
    text: "Le tilleul et le pain chaud se mêlaient alors dans toute la maison. Aujourd’hui encore, il me suffit de passer devant une boulangerie pour retrouver cette cour.",
  },
];

const STEPS = [
  { label: "Vous racontez", ms: 6500 },
  { label: "Loomina écrit", ms: 7000 },
  { label: "Le livre arrive", ms: 8000 },
];

/** Hauteurs de départ des barres de la voix : fixes, pour que le serveur et le navigateur dessinent la même chose. */
const WAVE = Array.from({ length: 30 }, (_, i) => ({ delay: -((i * 37) % 110) / 100, duration: 0.8 + ((i * 53) % 70) / 100 }));

const PHOTO_SIZES = "(min-width: 1024px) 460px, 92vw";

const REDUCED = "(prefers-reduced-motion: reduce)";
const watchMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const w = (i: number) => ({ "--w": i }) as CSSProperties;

/**
 * Le module du haut de page, « de la voix au livre », en une scène et trois temps :
 * Jeanne raconte au téléphone, sa page s'écrit dans le livre ouvert, puis le livre
 * se referme et se présente debout. Les trois temps défilent seuls et sont cliquables.
 * Avec « réduire les animations », la scène reste sur le livre fini.
 */
export default function VoiceToBook() {
  const [act, setAct] = useState(0);
  // Change à chaque passage : relance les animations du temps affiché, même quand on reclique dessus.
  const [run, setRun] = useState(0);
  const still = useSyncExternalStore(watchMotion, () => window.matchMedia(REDUCED).matches, () => false);
  const shown = still ? STEPS.length - 1 : act;

  useEffect(() => {
    if (still) return;
    const id = window.setTimeout(() => {
      setAct((a) => (a + 1) % STEPS.length);
      setRun((r) => r + 1);
    }, STEPS[act].ms);
    return () => window.clearTimeout(id);
  }, [act, run, still]);

  const go = (i: number) => {
    setAct(i);
    setRun((r) => r + 1);
  };

  let word = 0;

  return (
    <figure className="w-full min-w-0" aria-label="De l’appel au livre : vous racontez au téléphone, Loomina écrit la page, le livre relié arrive chez vous.">
      <div className={s.stage} data-act={shown + 1}>
        <div aria-hidden="true">
          <div className={s.open}>
            <Image src="/photos/accueil-livre-ouvert.jpg" alt="" fill sizes={PHOTO_SIZES} priority className={s.shot} {...blurOf("accueil-livre-ouvert")} />
            <div className={s.ink} lang="fr">
              <p className={`${s.chapter} ${s.w}`} style={w(-6)}>
                Chapitre 2
              </p>
              <p className={`${s.title} ${s.w}`} style={w(-3)}>
                La cour au tilleul
              </p>
              {PAGE.map((block) => (
                <p key={block.text} className={block.kind === "sub" ? s.sub : s.par}>
                  {block.text.split(" ").map((t, i, all) => (
                    <span key={i}>
                      <span className={s.w} style={w(word++)}>
                        {t}
                      </span>
                      {i < all.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
              ))}
              <p className={`${s.pageNumber} ${s.w}`} style={w(word + 4)}>
                27
              </p>
            </div>
          </div>
          <Image src="/photos/accueil-livre-ferme.jpg" alt="" fill sizes={PHOTO_SIZES} loading="eager" className={`${s.shot} ${s.closed}`} />
          <Image src="/photos/accueil-livre-debout.jpg" alt="" fill sizes={PHOTO_SIZES} loading="eager" className={`${s.shot} ${s.standing}`} />
        </div>

        <div className={s.call} aria-hidden="true">
          <div className={s.callTop}>
            <span className={s.live}>
              <span className={s.dot} />
              Jeanne, au téléphone
            </span>
            <CallTimer still={still} />
          </div>
          <p className={s.said} key={run}>
            {SPOKEN.split(" ").map((t, i) => (
              <span key={i} style={w(i)}>
                {t}{" "}
              </span>
            ))}
          </p>
          <div className={s.wave}>
            {WAVE.map((b, i) => (
              <b key={i} style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s` }} />
            ))}
          </div>
        </div>
      </div>

      <div className={s.steps}>
        {STEPS.map((step, i) => (
          <button
            key={step.label}
            type="button"
            className={s.step}
            data-state={still || i < shown ? "done" : i === shown ? "on" : "todo"}
            aria-current={i === shown ? "step" : undefined}
            style={{ "--dur": `${step.ms}ms` } as CSSProperties}
            onClick={() => go(i)}
          >
            <span className={s.bar} key={i === act ? run : "idle"} />
            <span className={s.label}>{step.label}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}

/**
 * La durée de l'appel, qui avance chaque seconde. À part : seule cette ligne se redessine,
 * pas toute la page du livre et ses centaines de mots.
 */
function CallTimer({ still }: { still: boolean }) {
  const [seconds, setSeconds] = useState(724);
  useEffect(() => {
    if (still) return;
    const id = window.setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [still]);
  return (
    <span className={s.timer}>
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}
