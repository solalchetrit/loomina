"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ProjectOverview } from "./types";
import s from "./Companion.module.css";

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

/**
 * Plume, le hibou qui grandit avec le livre (Solal, 19/11/2026 : un personnage
 * qui évolue, visuel et simple). Un âge par étape du livre, rien d'autre à comprendre.
 * `w`/`h` : la taille du dessin (public/compagnon), pour garder les proportions entre les âges.
 */
const AGES = [
  { w: 174, h: 206, name: "Dans son œuf", then: "sort de son œuf", now: "Plume attend dans son œuf." },
  { w: 234, h: 275, name: "La naissance", then: "prend la plume", now: "Plume est né avec vos premiers souvenirs." },
  { w: 307, h: 341, name: "La plume", then: "met ses lunettes", now: "Plume écrit avec vous." },
  { w: 348, h: 451, name: "Les lunettes", then: "reçoit votre livre", now: "Plume relit ce que vous transmettez." },
  { w: 423, h: 553, name: "Le livre", then: "", now: "Votre récit est complet. Plume garde votre livre jusqu’à l’impression." },
] as const;
const TALLEST = 553;

const SEEN_KEY = "loomina:plume";

export default function Companion({ project, demo = false }: { project: ProjectOverview; demo?: boolean }) {
  const weave = project.weave!;
  const realAge = project.completed ? 4 : project.phase - 1;
  // Livre d'exemple : on peut toucher un âge pour le voir.
  const [preview, setPreview] = useState<number | null>(null);
  const age = preview ?? realAge;

  // Ce qu'il reste à raconter avant que Plume grandisse : les sujets de l'étape en cours.
  const stage = weave.rows.filter((r) => r.phase === project.phase);
  const told = stage.filter((r) => r.state === "woven").length;
  const left = Math.max(1, stage.length - told);
  const within = preview !== null || project.completed ? (age === realAge && !project.completed ? told / stage.length : 0) : told / Math.max(1, stage.length);
  const fill = Math.min(100, ((age + (age < 4 ? within : 0)) / 4) * 100);
  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));

  // Un saut de joie au retour si le livre a avancé, une petite fête s'il a grandi.
  const [mood, setMood] = useState<"" | "hop" | "grow">("");
  const [news, setNews] = useState(false);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let seen: { age: number; told: number } | null = null;
    try {
      seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "null");
      window.localStorage.setItem(SEEN_KEY, JSON.stringify({ age: realAge, told: weave.woven }));
    } catch {
      // Stockage indisponible : Plume reste simplement là.
    }
    if (demo || (seen && (seen.age < realAge || seen.told < weave.woven))) {
      const grew = Boolean(seen && seen.age < realAge);
      const id = window.setTimeout(() => {
        setMood(grew ? "grow" : "hop");
        setNews(!demo);
      }, 500);
      return () => window.clearTimeout(id);
    }
  }, [demo, realAge, weave.woven]);

  const play = (m: "hop" | "grow") => {
    setMood("");
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setMood(m)));
  };

  const a = AGES[age];
  const headline =
    age === 4
      ? a.now
      : preview !== null && age !== realAge
        ? a.now
        : `Encore ${left} souvenir${left > 1 ? "s" : ""} et Plume ${a.then}.`;

  return (
    <section className="card overflow-hidden" aria-labelledby="plume">
      <div className="grid md:grid-cols-[minmax(0,340px)_1fr]">
        <button type="button" className={s.scene} onClick={() => play("hop")} aria-label="Faire sauter Plume">
          <span className={s.halo} aria-hidden="true" />
          <span className={`${s.body} ${mood === "hop" ? s.hop : mood === "grow" ? s.grow : ""}`} onAnimationEnd={() => setMood("")} style={{ height: `${28 + (a.h / TALLEST) * 60}%`, aspectRatio: `${a.w} / ${a.h}` }}>
            <Image key={age} src={`/compagnon/hibou-${age + 1}.png`} alt="" fill sizes="340px" priority className={s.sprite} />
          </span>
          <span className={s.ground} aria-hidden="true" />
        </button>

        <div className="flex flex-col justify-center p-6 md:p-9 lg:p-11">
          <p className="text-[15px] font-bold text-[var(--amber-deep)]">Plume grandit avec votre livre</p>
          <h2 id="plume" className="mt-2 text-[clamp(1.5rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em]" aria-live="polite">
            {headline}
          </h2>
          {news && preview === null && <p className="mt-2 text-[16px] font-semibold text-[var(--amber-deep)]">Votre livre a avancé depuis votre dernier passage.</p>}

          <ol className={s.path} aria-label="Les âges de Plume">
            <span className={s.rail} aria-hidden="true">
              <span className={s.railFill} style={{ width: `${fill}%` }} />
            </span>
            {AGES.map((x, i) => {
              const reached = i <= age;
              const inner = (
                <>
                  <span className={`${s.dot} ${i === age ? s.current : reached ? s.reached : ""}`}>
                    <Image src={`/compagnon/hibou-${i + 1}.png`} alt="" width={x.w} height={x.h} className={`${s.mini} ${reached ? "" : s.later}`} />
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
            {demo && <span className="mt-1 block">Démonstration : touchez un âge pour le voir.</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
