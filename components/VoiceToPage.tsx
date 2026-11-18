"use client";

/**
 * « De la voix à la page » : la conversation se déroule à gauche, et la page du livre
 * s'écrit à droite à mesure que Jeanne raconte. Exemple écrit pour illustrer la méthode.
 * L'animation démarre quand la section entre à l'écran, une fois ; un bouton permet de la revoir.
 */

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Section, SectionHead } from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";
import PrintedPage from "@/components/ui/PrintedPage";
import s from "./VoiceToPage.module.css";

const SPOKEN = [
  { who: "Loomina", text: "Vous m’avez dit que vous étiez partie de la ferme à dix-huit ans. Comment s’est passé le départ ?" },
  {
    who: "Jeanne",
    text: "Par le car de six heures. Mon père a porté ma valise jusqu’à la route, il a rien dit, hein. Il m’a juste mis un mouchoir dans la main, avec trois billets dedans. Le mouchoir, je l’ai toujours. Les billets, non !",
  },
  { who: "Loomina", text: "Et en arrivant à Lyon, où avez-vous logé ?" },
  {
    who: "Jeanne",
    text: "Une chambre sous les toits, rue de la Charité. Toute petite, on touchait les deux murs. Mais c’était la mienne.",
  },
];

/** Ce que Loomina écrit après chaque réponse de Jeanne. */
const WRITTEN: { kind: "p" | "h"; text: string }[][] = [
  [
    {
      kind: "p",
      text: "Je suis partie de la ferme à dix-huit ans, par le car de six heures. Mon père a porté ma valise jusqu’à la route sans dire un mot. Au moment de monter, il m’a glissé dans la main un mouchoir noué, avec trois billets dedans.",
    },
    { kind: "p", text: "Les billets n’ont pas duré longtemps. Le mouchoir, lui, est toujours dans mon tiroir." },
  ],
  [
    { kind: "h", text: "Rue de la Charité" },
    {
      kind: "p",
      text: "À Lyon, j’ai trouvé une chambre sous les toits, rue de la Charité. Elle était si petite qu’en tendant les bras, je touchais les deux murs. Mais c’était la mienne.",
    },
  ],
];

/**
 * Le déroulé. Chaque temps dure `ms` avant le suivant :
 * 1 question, 2 réponse, 3 la page s'écrit, 4 question, 5 réponse, 6 la page s'écrit (fin).
 */
const BEATS = [0, 1700, 1600, 4200, 1600, 1600];
const END = 6;
/** Nombre de répliques visibles, et de blocs écrits, à chaque temps. */
const BUBBLES = [0, 1, 2, 2, 3, 4, 4];
const BLOCKS = [0, 0, 0, 1, 1, 1, 2];

/** Hauteurs (en %) des barres de la voix, sous la conversation. */
const WAVE = [30, 55, 80, 45, 100, 65, 35, 75, 95, 50, 28, 70, 90, 40, 60, 85, 38, 66, 48, 92, 58, 34, 78, 52, 88, 42, 62, 30, 72, 46, 84, 36, 68, 96, 44, 74, 32, 56, 82, 40];

function watchMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function VoiceToPage() {
  const still = useSyncExternalStore(
    watchMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [beat, setBeat] = useState(0);
  const [run, setRun] = useState(0);
  const stage = useRef<HTMLDivElement>(null);

  // Départ : quand la scène entre à l'écran, une seule fois.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setBeat((b) => (b === 0 ? 1 : b));
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (beat === 0 || beat >= END) return;
    const t = setTimeout(() => setBeat((b) => b + 1), BEATS[beat]);
    return () => clearTimeout(t);
  }, [beat]);

  const shown = still ? END : beat;
  const speaking = !still && beat > 0 && beat < END;

  return (
    <Section id="exemple" className="bg-white">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHead
          title="De l’appel à la page du livre"
          text="À gauche, un extrait de conversation. À droite, la page que Loomina en tire : vos souvenirs et vos expressions, mis en forme, sans rien inventer."
        />
        {!still && (
          <button
            type="button"
            onClick={() => {
              setRun((r) => r + 1);
              setBeat(1);
            }}
            className={`link shrink-0 text-[16px] transition-opacity duration-500 ${beat >= END ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            Revoir l’exemple
          </button>
        )}
      </div>

      <div ref={stage} className="head-gap grid items-stretch gap-4 lg:grid-cols-2">
        <figure className="flex flex-col rounded-[28px] bg-[var(--canvas)] p-5 sm:p-8">
          <figcaption className="flex items-center gap-3 text-[15px] font-bold">
            <span className="chip-icon !h-9 !w-9 !rounded-[12px]">
              <Icon name="phone" size={18} />
            </span>
            Au téléphone
            <span className="ml-auto font-semibold tabular-nums text-[var(--ink-3)]">Appel n° 6 · 14:32</span>
          </figcaption>
          <ul className="my-auto flex flex-col gap-4 py-8">
            {SPOKEN.map((line, i) => {
              const isLoomina = line.who === "Loomina";
              return (
                <li
                  key={i}
                  className={`${s.bubble} ${i >= BUBBLES[shown] ? s.waiting : ""} max-w-[86%] ${isLoomina ? "self-start" : "self-end"}`}
                >
                  <p className={`text-[13px] font-bold ${isLoomina ? "text-[var(--ink-3)]" : "text-right text-[var(--amber-ink)]"}`}>{line.who}</p>
                  <p
                    className={`mt-1 rounded-[20px] px-4 py-3 text-[17px] leading-relaxed ${
                      isLoomina ? "rounded-tl-md bg-white text-[var(--ink-2)]" : "rounded-tr-md bg-[var(--ink)] text-white"
                    }`}
                  >
                    {line.text}
                  </p>
                </li>
              );
            })}
          </ul>
          <div aria-hidden="true" className={`flex h-8 items-center justify-between ${speaking ? s.speaking : ""}`}>
            {WAVE.map((h, i) => (
              <span
                key={i}
                className={`${s.bar} w-[4px] rounded-full bg-[var(--amber)]`}
                style={{ height: `${h}%`, animationDelay: `${(i * 137) % 900}ms` }}
              />
            ))}
          </div>
        </figure>

        <figure>
          <figcaption className="sr-only">Dans le livre</figcaption>
          <PrintedPage chapter="Chapitre 4" title="Le car de six heures" page="58">
            {WRITTEN.map((blocks, b) => {
              let word = 0;
              const state = still || BLOCKS[shown] > b ? (still ? s.still : s.writing) : "";
              return (
                <div key={`${run}-${b}`} className={state}>
                  {blocks.map((block) => {
                    const Tag = block.kind === "h" ? "h4" : "p";
                    return (
                      <Tag key={block.text}>
                        {block.text.split(" ").map((t, i, all) => (
                          <span key={i}>
                            <span className={s.w} style={{ "--w": word++ } as CSSProperties}>
                              {t}
                            </span>
                            {i < all.length - 1 ? " " : ""}
                          </span>
                        ))}
                      </Tag>
                    );
                  })}
                </div>
              );
            })}
          </PrintedPage>
        </figure>
      </div>
    </Section>
  );
}
