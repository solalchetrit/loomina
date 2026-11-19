"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Memo, { memoSrc, type MemoAge, type MemoClip } from "@/components/brand/Memo";
import { MEMO_AGES, memoState } from "@/lib/loomina/memo";
import type { ProjectOverview } from "./types";
import s from "./Companion.module.css";

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

/** Ce que Mémo dit quand on joue avec lui. */
const WORDS = ["Je n’oublie rien !", "Encore un souvenir ?", "Merci !", "J’ai hâte de lire la suite.", "Racontez-moi encore."];

/** Les prises qu'il enchaîne quand on le touche. */
const TAPS: MemoClip[] = ["joy", "act", "laugh"];

const SEEN_KEY = "loomina:memo";

interface Heart {
  id: number;
  x: number;
}

/**
 * Mémo dans l'espace auteur : son âge, sa phrase et son humeur viennent de
 * l'avancée réelle du livre (lib/loomina/memo.ts). On peut jouer avec lui :
 * le toucher (il saute, s'occupe, rit), le caresser (des cœurs s'envolent).
 */
export default function Companion({ project, demo = false }: { project: ProjectOverview; demo?: boolean }) {
  const state = useMemo(
    () => memoState({ phase: project.phase, completed: project.completed, weave: project.weave!, calls: project.calls, scheduleText: project.scheduleText }),
    [project],
  );
  // Livre d'exemple : on peut toucher un âge pour le voir.
  const [preview, setPreview] = useState<MemoAge | null>(null);
  const age = preview ?? state.age;
  const shown = age === state.age;
  // Sa façon d'être quand on ne le touche pas : il dort avant le premier appel, il lit son livre à la fin.
  const home: MemoClip = shown && (state.mood === "asleep" || state.mood === "done") ? "rest" : "idle";

  const [clip, setClip] = useState<MemoClip>(home);
  const [bubble, setBubble] = useState("");
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [news, setNews] = useState("");
  const taps = useRef(0);
  const counter = useRef(0);
  const bubbleTimer = useRef(0);
  const busy = clip !== "idle" && clip !== "rest";

  const say = useCallback((text: string) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), 2600);
  }, []);

  // Au retour : il saute de joie si le livre a avancé, il fête s'il a grandi.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let seen: { age: number; told: number } | null = null;
    try {
      seen = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "null");
      window.localStorage.setItem(SEEN_KEY, JSON.stringify({ age: state.age, told: state.told }));
    } catch {
      // Stockage indisponible : Mémo reste simplement là.
    }
    const grew = Boolean(seen && seen.age < state.age);
    const moved = Boolean(seen && seen.age === state.age && seen.told < state.told);
    if (!grew && !moved && state.mood !== "fresh" && !demo) return;
    if (state.mood === "asleep" || state.mood === "done") return;
    const id = window.setTimeout(() => {
      setClip(grew ? "pop" : "joy");
      if (grew) setNews("Mémo a grandi depuis votre dernier passage.");
      else if (moved) setNews("Votre livre a avancé depuis votre dernier passage.");
    }, 700);
    return () => window.clearTimeout(id);
  }, [demo, state]);

  // Tout seul, de temps en temps, il s'occupe.
  useEffect(() => {
    if (home !== "idle") return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setClip((c) => (c === "idle" ? "act" : c));
    }, 11000);
    return () => window.clearInterval(id);
  }, [home]);

  // Il se penche vers la souris ou le doigt ; une caresse fait s'envoler des cœurs.
  const scene = useRef<HTMLButtonElement>(null);
  const lean = useRef<HTMLSpanElement>(null);
  const stroke = useRef({ x: 0, y: 0, dist: 0 });
  const onMove = (e: ReactPointerEvent) => {
    const box = scene.current?.getBoundingClientRect();
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nx = ((e.clientX - box.left) / box.width - 0.5) * 2;
    lean.current?.style.setProperty("--lean", `${(nx * 5).toFixed(2)}deg`);
    lean.current?.style.setProperty("--shift", `${(nx * 8).toFixed(1)}px`);
    const st = stroke.current;
    if (Math.abs(nx) < 0.6) {
      st.dist += Math.hypot(e.clientX - st.x, e.clientY - st.y);
      if (st.dist > 280) {
        st.dist = 0;
        setHearts((all) => [...all.slice(-8), { id: ++counter.current, x: 50 + nx * 28 }]);
        setClip((c) => (c === "idle" ? "laugh" : c));
      }
    }
    st.x = e.clientX;
    st.y = e.clientY;
  };
  const onLeave = () => {
    lean.current?.style.setProperty("--lean", "0deg");
    lean.current?.style.setProperty("--shift", "0px");
  };

  const onTap = () => {
    if (busy) return;
    if (home === "rest" && state.mood === "asleep") {
      // Il dort : on le réveille un instant.
      setClip("laugh");
      say("Oh… bonjour !");
      return;
    }
    const n = taps.current++;
    setClip(TAPS[n % TAPS.length]);
    if (n % 2 === 1) say(WORDS[(n >> 1) % WORDS.length]);
  };

  const meta = MEMO_AGES[age - 1];
  const headline = shown ? state.headline : meta.text;
  const fill = (shown ? state.path : (age - 1) / 4) * 100;
  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));

  return (
    <section className="card overflow-hidden" aria-labelledby="memo">
      <div className="grid md:grid-cols-[minmax(0,380px)_1fr]">
        <button ref={scene} type="button" className={s.scene} onClick={onTap} onPointerMove={onMove} onPointerLeave={onLeave} aria-label="Jouer avec Mémo">
          <span className={s.halo} aria-hidden="true" />
          <span ref={lean} className={s.lean}>
            <Memo age={age} clip={busy ? clip : home} size={340} onEnd={() => setClip(home)} />
          </span>
          {hearts.map((h) => (
            <span key={h.id} className={s.heart} style={{ left: `${h.x}%` }} onAnimationEnd={() => setHearts((all) => all.filter((x) => x.id !== h.id))} aria-hidden="true">
              ♥
            </span>
          ))}
          {bubble && (
            <span key={bubble} className={s.bubble} role="status">
              {bubble}
            </span>
          )}
        </button>

        <div className="flex flex-col justify-center p-6 md:p-9 lg:p-11">
          <p className="text-[15px] font-bold text-[var(--amber-deep)]">Mémo grandit avec votre livre</p>
          <h2 id="memo" className="mt-2 text-[clamp(1.5rem,2.6vw,2.05rem)] font-extrabold leading-[1.15] tracking-[-0.03em]" aria-live="polite">
            {headline}
          </h2>
          {shown && (news || state.note) && <p className="mt-2 text-[16px] font-semibold text-[var(--amber-deep)]">{news || state.note}</p>}

          <ol className={s.path} aria-label="Les âges de Mémo">
            <span className={s.rail} aria-hidden="true">
              <span className={s.railFill} style={{ width: `${fill}%` }} />
            </span>
            {MEMO_AGES.map((x) => {
              const reached = x.age <= age;
              const inner = (
                <>
                  <span className={`${s.dot} ${x.age === age ? s.current : reached ? s.reached : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- petit dessin détouré, déjà à sa taille */}
                    <img src={memoSrc(x.age)} alt="" className={`${s.mini} ${reached ? "" : s.later}`} />
                  </span>
                  <span className={`mt-2 block text-[13px] font-bold leading-tight ${x.age === age ? "text-[var(--ink)]" : "text-[var(--ink-3)]"}`}>{x.name}</span>
                </>
              );
              return (
                <li key={x.age} className={s.step} aria-current={x.age === age ? "step" : undefined}>
                  {demo ? (
                    <button
                      type="button"
                      className="press flex flex-col items-center"
                      onClick={() => {
                        setPreview(x.age === state.age ? null : x.age);
                        setClip("pop");
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
            <span className="mt-1 block">Touchez Mémo, caressez-le : il adore jouer.{demo ? " Démonstration : touchez un âge pour le voir." : ""}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
