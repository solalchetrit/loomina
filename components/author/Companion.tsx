"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Memo, { memoSrc, type MemoAge, type MemoClip } from "@/components/brand/Memo";
import { MEMO_AGES, memoState } from "@/lib/loomina/memo";
import type { ProjectOverview } from "./types";
import s from "./Companion.module.css";

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

/** Ce que Mémo dit quand on joue avec lui. */
const WORDS = ["Je n’oublie rien !", "Encore un souvenir ?", "J’ai hâte de connaître la suite.", "Racontez-moi encore."];

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
    () =>
      memoState({
        phase: project.phase,
        completed: project.completed,
        weave: project.weave!,
        calls: project.calls,
        scheduleText: project.scheduleText,
        lastTitle: project.calls[0]?.title,
      }),
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
  // Le moment où il grandit (ou la présentation, à la première visite) : une vraie petite cérémonie.
  const [growth, setGrowth] = useState<{ age: MemoAge; intro: boolean } | null>(null);
  // Ce qu'il lui reste à entendre pour grandir : replié par défaut.
  const [details, setDetails] = useState(false);
  // Un éléphant n'oublie rien : quand on le touche, il reparle de ce qu'on lui a vraiment raconté.
  const memories = useMemo(() => {
    const out: string[] = [];
    for (const c of project.calls) if (c.title) out.push(`Je me souviens : « ${c.title} ».`);
    for (const f of project.family) out.push(`${f.name}… je n’oublie pas.`);
    for (const t of project.timeline) if (t.year && t.event.length <= 46) out.push(`${t.year} : ${t.event}. C’est noté !`);
    return out;
  }, [project]);
  const taps = useRef(0);
  const counter = useRef(0);
  const bubbleTimer = useRef(0);
  const busy = clip !== "idle" && clip !== "rest";

  const say = useCallback((text: string) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(""), 3600);
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
    if (!seen || grew) {
      // Première visite : on le présente. Il a grandi : on le fête.
      const id = window.setTimeout(() => setGrowth({ age: state.age, intro: !seen }), 600);
      return () => window.clearTimeout(id);
    }
    if (!moved && state.mood !== "fresh") return;
    if (state.mood === "asleep" || state.mood === "done") return;
    const id = window.setTimeout(() => {
      setClip("joy");
      if (moved) {
        const n = state.told - (seen?.told ?? 0);
        setNews(`Mémo a retenu ${n > 1 ? `${n} nouveaux souvenirs` : "un nouveau souvenir"}.`);
      }
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
    // Deux fois sur trois, il reparle d'un vrai souvenir ; sinon, un mot à lui.
    if (memories.length && n % 3 !== 2) say(memories[(n * 5) % memories.length]);
    else say(WORDS[n % WORDS.length]);
  };

  const meta = MEMO_AGES[age - 1];
  const headline = shown ? state.headline : meta.text;
  const fill = (shown ? state.path : (age - 1) / 4) * 100;
  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));
  const stage = shown && !project.completed ? project.weave!.rows.filter((r) => r.phase === project.phase) : [];

  return (
    <section className="card" aria-labelledby="memo">
      {/* Compact (Solal, 19/11/2026) : Mémo à gauche, sa phrase à droite, le chemin dessous. */}
      <div className={s.layout}>
        <button ref={scene} type="button" className={s.scene} onClick={onTap} onPointerMove={onMove} onPointerLeave={onLeave} aria-label="Jouer avec Mémo">
          <span className={s.halo} aria-hidden="true" />
          <span ref={lean} className={s.lean}>
            <Memo age={age} clip={busy ? clip : home} size={130} onEnd={() => setClip(home)} />
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

        <div className={s.words}>
          <h2 id="memo" className="text-[clamp(1.05rem,1.65vw,1.3rem)] font-extrabold leading-[1.2] tracking-[-0.02em]" aria-live="polite">
            {headline}
          </h2>
          {stage.length > 0 && (
            <button
              type="button"
              aria-expanded={details}
              onClick={() => setDetails((d) => !d)}
              className="press group mt-1.5 flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 text-left"
            >
              <span className="flex gap-1" aria-hidden="true">
                {stage.map((r) => (
                  <span key={r.key} className={`h-2 w-2 rounded-full ${r.state === "woven" ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`} />
                ))}
              </span>
              <span className="text-[13px] font-bold text-[var(--ink-2)] underline decoration-[var(--amber-line)] decoration-2 underline-offset-4 group-hover:decoration-[var(--amber)]">
                {details ? "Fermer" : `${state.told} souvenir${state.told > 1 ? "s" : ""} sur ${state.total} · voir lesquels`}
              </span>
            </button>
          )}
          <p className="mt-1.5 text-[14px] leading-snug text-[var(--ink-3)]">
            {shown && (news || state.note) ? <span className="font-semibold text-[var(--amber-deep)]">{news || state.note} </span> : null}
            <span className="whitespace-nowrap">
              <b className="font-extrabold text-[var(--ink)] tabular-nums">≈ {pages}</b> {pages > 1 ? "pages" : "page"}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <b className="font-extrabold text-[var(--ink)] tabular-nums">{project.chapters}</b> {project.chapters > 1 ? "appels" : "appel"}
            </span>
          </p>
        </div>

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
                <span className={`mt-1 block text-[11.5px] font-bold leading-tight ${x.age === age ? "text-[var(--ink)]" : "text-[var(--ink-3)]"}`}>{x.name}</span>
              </>
            );
            return (
              <li key={x.age} className={s.step} aria-current={x.age === age ? "step" : undefined}>
                {demo ? (
                  <button
                    type="button"
                    className="press flex flex-col items-center"
                    onClick={() => {
                      // Livre d'exemple : toucher un âge rejoue le moment où Mémo l'atteint.
                      setPreview(x.age === state.age ? null : x.age);
                      setGrowth({ age: x.age, intro: x.age === 1 });
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
      </div>

      {details && stage.length > 0 && (
        <div className="border-t border-[var(--line-soft)] px-5 py-4 md:px-6">
          <p className="text-[15px] font-bold">Les souvenirs de l’étape « {MEMO_AGES[state.age - 1].stage} »</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {stage.map((r) => (
              <li
                key={r.key}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold ${
                  r.state === "woven"
                    ? "bg-[var(--amber-wash)] text-[var(--amber-deep)]"
                    : r.state === "next"
                      ? "bg-[var(--ink)] text-white"
                      : "bg-[var(--surface-2)] text-[var(--ink-2)]"
                }`}
              >
                {r.state === "woven" && (
                  <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
                {r.label}
                {r.state === "woven" && <span className="sr-only"> (raconté)</span>}
                {r.state === "next" && <span className="font-normal opacity-80">· le prochain</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {growth && <Growth age={growth.age} intro={growth.intro} onClose={() => setGrowth(null)} />}
    </section>
  );
}

/**
 * Le moment où Mémo grandit : plein écran, il surgit dans une gerbe d'étoiles, et on dit
 * ce que ce nouvel âge veut dire pour le livre. À la toute première visite, la même
 * scène sert à le présenter (« Voici Mémo »).
 */
function Growth({ age, intro, onClose }: { age: MemoAge; intro: boolean; onClose: () => void }) {
  const meta = MEMO_AGES[age - 1];
  const [clip, setClip] = useState<MemoClip>("pop");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const first = MEMO_AGES[0];
  // Hors de la carte : une carte qui se soulève au survol décalerait un voile « fixed » posé dedans.
  return createPortal(
    <div className={s.veil} role="dialog" aria-modal="true" aria-labelledby="memo-grandit" onClick={onClose}>
      <div className={s.growth} onClick={(e) => e.stopPropagation()}>
        <div className={s.growthStage}>
          <span className={s.growthHalo} aria-hidden="true" />
          <Memo age={age} clip={clip} size={240} onEnd={() => setClip("idle")} />
        </div>
        <p className="text-[14px] font-bold text-[var(--amber-ink)]">{intro ? "Votre compagnon de route" : `Mémo a grandi · ${meta.stage}`}</p>
        <h2 id="memo-grandit" className="mt-1 text-[clamp(1.5rem,4vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em]">
          {intro ? first.event : meta.event}
        </h2>
        <p className="mx-auto mt-3 max-w-[26rem] text-[16px] leading-relaxed text-[var(--ink-2)]">{intro ? first.meaning : meta.meaning}</p>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-bold text-white hover:bg-[var(--ink-soft)]"
        >
          {intro ? "Faire connaissance" : "Continuer"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
