"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import type { ProjectOverview } from "./types";
import s from "./Companion.module.css";

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

interface Age {
  w: number;
  h: number;
  name: string;
  /** « Encore 3 souvenirs et Plume … » */
  then: string;
  now: string;
}

interface Character {
  key: string;
  name: string;
  /** « caressez-le » ou « caressez-la ». */
  pronoun: "le" | "la";
  ages: Age[];
  /** Ce qu'il dit quand on joue avec lui. */
  words: string[];
}

/**
 * Le compagnon de l'espace auteur : un personnage qui grandit avec le livre
 * (Solal, 19/11/2026 : visuel, simple, et avec lequel on peut jouer).
 * Un âge par étape du livre. `w`/`h` : la taille du dessin (public/compagnon).
 */
const CHARACTERS: Character[] = [
  {
    key: "elephant",
    name: "Mémo",
    pronoun: "le",
    words: ["Je n’oublie rien !", "Encore un souvenir ?", "Merci !", "J’ai hâte de lire la suite.", "Hi hi !", "Racontez-moi encore."],
    ages: [
      { w: 202, h: 205, name: "Tout petit", then: "se lève", now: "Mémo attend votre première histoire." },
      { w: 235, h: 268, name: "Premiers pas", then: "prend la plume", now: "Mémo retient vos premiers souvenirs." },
      { w: 312, h: 345, name: "La plume", then: "met ses lunettes", now: "Mémo écrit avec vous." },
      { w: 348, h: 405, name: "Les lunettes", then: "reçoit votre livre", now: "Mémo relit ce que vous transmettez." },
      { w: 431, h: 522, name: "Le livre", then: "", now: "Votre récit est complet. Mémo garde votre livre jusqu’à l’impression." },
    ],
  },
  {
    key: "luciole",
    name: "Lueur",
    pronoun: "la",
    words: ["Je brille pour vous !", "Encore un souvenir ?", "Merci !", "J’ai hâte de lire la suite.", "Hi hi !", "Racontez-moi encore."],
    ages: [
      { w: 200, h: 322, name: "La lanterne", then: "sort de sa lanterne", now: "Lueur dort dans sa lanterne." },
      { w: 213, h: 267, name: "L’envol", then: "prend la plume", now: "Lueur s’éveille avec vos premiers souvenirs." },
      { w: 291, h: 366, name: "La plume", then: "met ses lunettes", now: "Lueur écrit avec vous." },
      { w: 314, h: 460, name: "Les lunettes", then: "reçoit votre livre", now: "Lueur relit ce que vous transmettez." },
      { w: 393, h: 572, name: "Le livre", then: "", now: "Votre récit est complet. Lueur garde votre livre jusqu’à l’impression." },
    ],
  },
  {
    key: "hibou",
    name: "Plume",
    pronoun: "le",
    words: ["Hou hou !", "Encore un souvenir ?", "Merci !", "J’ai hâte de lire la suite.", "Hi hi !", "Racontez-moi encore."],
    ages: [
      { w: 174, h: 206, name: "Dans son œuf", then: "sort de son œuf", now: "Plume attend dans son œuf." },
      { w: 234, h: 275, name: "La naissance", then: "prend la plume", now: "Plume est né avec vos premiers souvenirs." },
      { w: 307, h: 341, name: "La plume", then: "met ses lunettes", now: "Plume écrit avec vous." },
      { w: 348, h: 451, name: "Les lunettes", then: "reçoit votre livre", now: "Plume relit ce que vous transmettez." },
      { w: 423, h: 553, name: "Le livre", then: "", now: "Votre récit est complet. Plume garde votre livre jusqu’à l’impression." },
    ],
  },
];

/** Les tours qu'il fait quand on le touche, l'un après l'autre. */
const TRICKS = ["hop", "spin", "dance", "flip", "nod"] as const;
type Mood = "" | (typeof TRICKS)[number] | "grow" | "purr" | "peek" | "shimmy";

interface Spark {
  id: number;
  kind: "star" | "heart";
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
}

const SEEN_KEY = "loomina:compagnon";

export default function Companion({ project, demo = false }: { project: ProjectOverview; demo?: boolean }) {
  const weave = project.weave!;
  const realAge = project.completed ? 4 : project.phase - 1;
  // Livre d'exemple : on peut toucher un âge pour le voir, et comparer les personnages.
  const [preview, setPreview] = useState<number | null>(null);
  const [who, setWho] = useState(0);
  const character = CHARACTERS[who];
  const age = preview ?? realAge;
  const tallest = Math.max(...character.ages.map((x) => x.h));

  // Ce qu'il reste à raconter avant qu'il grandisse : les sujets de l'étape en cours.
  const stage = weave.rows.filter((r) => r.phase === project.phase);
  const told = stage.filter((r) => r.state === "woven").length;
  const left = Math.max(1, stage.length - told);
  const within = age === realAge && !project.completed ? told / Math.max(1, stage.length) : 0;
  const fill = Math.min(100, ((age + (age < 4 ? within : 0)) / 4) * 100);
  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));

  const [mood, setMood] = useState<Mood>("");
  const moodRef = useRef<Mood>("");
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [bubble, setBubble] = useState("");
  const [news, setNews] = useState(false);
  const calm = useRef(false);
  const counter = useRef(0);
  const trick = useRef(0);
  const word = useRef(0);
  const bubbleTimer = useRef(0);

  const play = useCallback((m: Mood) => {
    if (calm.current) return;
    setMood("");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setMood(m)));
  }, []);

  /** Une gerbe d'étoiles ou de cœurs qui part du personnage. */
  const burst = useCallback((kind: Spark["kind"], count: number, x = 50, y = 48) => {
    if (calm.current) return;
    const fresh: Spark[] = Array.from({ length: count }, (_, i) => {
      const angle = kind === "heart" ? -Math.PI / 2 + (Math.random() - 0.5) * 0.9 : (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const reach = kind === "heart" ? 70 + Math.random() * 40 : 80 + Math.random() * 70;
      return { id: ++counter.current, kind, x, y, dx: Math.cos(angle) * reach, dy: Math.sin(angle) * reach, size: 12 + Math.random() * 12 };
    });
    setSparks((all) => [...all.slice(-40), ...fresh]);
  }, []);

  const say = useCallback((text: string) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), 2400);
  }, []);

  // Au retour : un saut de joie si le livre a avancé, une fête s'il a grandi.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    calm.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen: { age: number; told: number } | null = null;
    try {
      seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "null");
      window.localStorage.setItem(SEEN_KEY, JSON.stringify({ age: realAge, told: weave.woven }));
    } catch {
      // Stockage indisponible : il reste simplement là.
    }
    if (demo || (seen && (seen.age < realAge || seen.told < weave.woven))) {
      const grew = Boolean(seen && seen.age < realAge);
      const id = window.setTimeout(() => {
        play(grew ? "grow" : "hop");
        burst("star", grew ? 14 : 8);
        setNews(!demo);
      }, 600);
      return () => window.clearTimeout(id);
    }
  }, [burst, demo, play, realAge, weave.woven]);

  // Il vit tout seul : de temps en temps il regarde autour de lui ou se dandine.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (moodRef.current === "" && document.visibilityState === "visible") play(Math.random() < 0.5 ? "peek" : "shimmy");
    }, 6500);
    return () => window.clearInterval(id);
  }, [play]);

  // Il suit le doigt ou la souris : il se penche vers vous.
  const scene = useRef<HTMLButtonElement>(null);
  const lean = useRef<HTMLSpanElement>(null);
  const stroke = useRef({ x: 0, y: 0, dist: 0 });
  const onMove = (e: ReactPointerEvent) => {
    const box = scene.current?.getBoundingClientRect();
    if (!box || calm.current) return;
    const nx = ((e.clientX - box.left) / box.width - 0.5) * 2;
    const ny = ((e.clientY - box.top) / box.height - 0.5) * 2;
    lean.current?.style.setProperty("--lean", `${(nx * 6).toFixed(2)}deg`);
    lean.current?.style.setProperty("--shift", `${(nx * 10).toFixed(1)}px`);
    lean.current?.style.setProperty("--lift", `${(Math.min(0, ny) * 6).toFixed(1)}px`);
    // Une caresse : on passe et repasse sur lui, des cœurs s'envolent.
    const near = Math.abs(nx) < 0.55 && ny > -0.6;
    const st = stroke.current;
    if (near) {
      st.dist += Math.hypot(e.clientX - st.x, e.clientY - st.y);
      if (st.dist > 260) {
        st.dist = 0;
        burst("heart", 2, 50 + nx * 30, 40);
        if (moodRef.current === "" || moodRef.current === "peek" || moodRef.current === "shimmy") play("purr");
      }
    }
    st.x = e.clientX;
    st.y = e.clientY;
  };
  const onLeave = () => {
    lean.current?.style.setProperty("--lean", "0deg");
    lean.current?.style.setProperty("--shift", "0px");
    lean.current?.style.setProperty("--lift", "0px");
  };

  const onTap = () => {
    const t = TRICKS[trick.current++ % TRICKS.length];
    play(t);
    burst("star", t === "flip" ? 12 : 7);
    if (trick.current % 2 === 0) say(character.words[word.current++ % character.words.length]);
  };

  const a = character.ages[age];
  const headline = age === 4 || age !== realAge ? a.now : `Encore ${left} souvenir${left > 1 ? "s" : ""} et ${character.name} ${a.then}.`;

  return (
    <section className="card overflow-hidden" aria-labelledby="compagnon">
      <div className="grid md:grid-cols-[minmax(0,360px)_1fr]">
        <button ref={scene} type="button" className={s.scene} onClick={onTap} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={`Jouer avec ${character.name}`}>
          <span className={s.halo} aria-hidden="true" />
          <span ref={lean} className={s.lean} style={{ height: `${28 + (a.h / tallest) * 58}%`, aspectRatio: `${a.w} / ${a.h}` }}>
            <span className={`${s.body} ${mood ? s[mood] : ""}`} onAnimationEnd={(e) => e.target === e.currentTarget && setMood("")}>
              <Image key={`${character.key}-${age}`} src={`/compagnon/${character.key}-${age + 1}.png`} alt="" fill sizes="360px" priority className={s.sprite} />
            </span>
          </span>
          <span className={`${s.ground} ${mood === "hop" || mood === "flip" || mood === "dance" ? s.groundJump : ""}`} aria-hidden="true" />
          {sparks.map((p) => (
            <span
              key={p.id}
              className={`${s.spark} ${p.kind === "heart" ? s.heart : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }}
              onAnimationEnd={() => setSparks((all) => all.filter((x) => x.id !== p.id))}
              aria-hidden="true"
            >
              {p.kind === "heart" ? "♥" : "✦"}
            </span>
          ))}
          {bubble && (
            <span key={bubble} className={s.bubble} role="status">
              {bubble}
            </span>
          )}
        </button>

        <div className="flex flex-col justify-center p-6 md:p-9 lg:p-11">
          <p className="text-[15px] font-bold text-[var(--amber-deep)]">{character.name} grandit avec votre livre</p>
          <h2 id="compagnon" className="mt-2 text-[clamp(1.5rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em]" aria-live="polite">
            {headline}
          </h2>
          {news && preview === null && <p className="mt-2 text-[16px] font-semibold text-[var(--amber-deep)]">Votre livre a avancé depuis votre dernier passage.</p>}

          <ol className={s.path} aria-label={`Les âges de ${character.name}`}>
            <span className={s.rail} aria-hidden="true">
              <span className={s.railFill} style={{ width: `${fill}%` }} />
            </span>
            {character.ages.map((x, i) => {
              const reached = i <= age;
              const inner = (
                <>
                  <span className={`${s.dot} ${i === age ? s.current : reached ? s.reached : ""}`}>
                    <Image src={`/compagnon/${character.key}-${i + 1}.png`} alt="" width={x.w} height={x.h} className={`${s.mini} ${reached ? "" : s.later}`} />
                  </span>
                  <span className={`mt-2 block text-[13px] font-bold leading-tight ${i === age ? "text-[var(--ink)]" : "text-[var(--ink-3)]"}`}>{x.name}</span>
                </>
              );
              return (
                <li key={x.name} className={s.step} aria-current={i === age ? "step" : undefined}>
                  {demo ? (
                    <button
                      type="button"
                      className="press flex flex-col items-center"
                      onClick={() => {
                        setPreview(i === realAge ? null : i);
                        play("grow");
                        burst("star", 14);
                      }}
                    >
                      {inner}
                    </button>
                  ) : (
                    <span className="flex flex-col items-center">{inner}</span>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="mt-6 text-[15px] text-[var(--ink-3)]">
            <b className="font-extrabold text-[var(--ink)] tabular-nums">≈ {pages}</b> {pages > 1 ? "pages écrites" : "page écrite"}
            <span className="mx-2.5" aria-hidden="true">
              ·
            </span>
            <b className="font-extrabold text-[var(--ink)] tabular-nums">{project.chapters}</b> {project.chapters > 1 ? "appels racontés" : "appel raconté"}
            <span className="mt-1 block">Touchez {character.name}, caressez-{character.pronoun} : {character.pronoun === "la" ? "elle" : "il"} adore jouer.</span>
          </p>

          {demo && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-4 text-[14px] text-[var(--ink-3)]">
              <span className="mr-1">Démonstration, personnage :</span>
              {CHARACTERS.map((c, i) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={i === who}
                  className={`press rounded-full px-3.5 py-1.5 font-bold ${i === who ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] text-[var(--ink)]"}`}
                  onClick={() => {
                    setWho(i);
                    play("grow");
                    burst("star", 12);
                  }}
                >
                  {c.name}
                </button>
              ))}
              <span className="basis-full">Touchez un âge pour le voir.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
