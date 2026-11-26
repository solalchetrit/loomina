"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Memo, { memoSrc, type MemoAge, type MemoClip } from "@/components/brand/Memo";
import { MEMO_AGES, memoState } from "@/lib/loomina/memo";
import type { ProjectOverview } from "./types";
import s from "./Companion.module.css";

/** Ce que Mémo dit quand on joue avec lui. */
const WORDS = ["Je n’oublie rien.", "Un autre souvenir ?", "Racontez-moi la suite."];

/** Les prises qu'il enchaîne quand on le touche. */
const TAPS: MemoClip[] = ["joy", "hello", "act", "memory", "laugh", "listen"];

/** Au bout de combien de jours sans visite il dit « Vous revoilà ». */
const AWAY_DAYS = 6;

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
export default function Companion({ project, demo = false, skipIntro = false, narrator }: { project: ProjectOverview; demo?: boolean; skipIntro?: boolean; narrator?: string | null }) {
  // Espace famille : Mémo parle de la personne qui raconte, à celle qui a offert le livre.
  const family = narrator !== undefined;
  const who = narrator?.trim() || "votre proche";
  const seenKey = family ? `${SEEN_KEY}:famille` : SEEN_KEY;
  const words = family ? ["Je n’oublie rien.", `Un souvenir à souffler pour ${who} ?`, "Je garde tout pour le livre."] : WORDS;
  const state = useMemo(
    () =>
      memoState({
        phase: project.phase,
        completed: project.completed,
        weave: project.weave!,
        calls: project.calls,
        scheduleText: project.scheduleText,
        lastTitle: project.calls[0]?.title,
        ...(family ? { narrator } : {}),
      }),
    [project, family, narrator],
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
    for (const f of project.family) out.push(`Je n’oublie pas ${f.name}.`);
    for (const t of project.timeline) if (t.year && t.event.length <= 46) out.push(`${t.year}. ${t.event}. Je m’en souviens.`);
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
    let seen: { age: number; told: number; at?: number } | null = null;
    try {
      seen = JSON.parse(window.localStorage.getItem(seenKey) ?? "null");
      window.localStorage.setItem(seenKey, JSON.stringify({ age: state.age, told: state.told, at: Date.now() }));
    } catch {
      // Stockage indisponible : Mémo reste simplement là.
    }
    const grew = Boolean(seen && seen.age < state.age);
    const moved = Boolean(seen && seen.age === state.age && seen.told < state.told);
    // Nouvel auteur : l'accueil de l'espace (Onboarding) vient de le présenter.
    if (!seen && skipIntro) return;
    if (!seen || grew) {
      // Première visite : on le présente. Il a grandi : on le fête.
      const id = window.setTimeout(() => setGrowth({ age: state.age, intro: !seen }), 600);
      return () => window.clearTimeout(id);
    }
    const away = Boolean(seen?.at && Date.now() - seen.at > AWAY_DAYS * 86_400_000);
    if (!moved && !away && state.mood !== "fresh") return;
    if (!away && (state.mood === "asleep" || state.mood === "done")) return;
    const id = window.setTimeout(() => {
      if (moved) {
        // Un nouveau souvenir : une lumière naît au bout de sa trompe et s'envole vers le livre.
        const n = state.told - (seen?.told ?? 0);
        setClip("memory");
        setNews(`Mémo a retenu ${n > 1 ? `${n} nouveaux souvenirs` : "un nouveau souvenir"}.`);
      } else if (away) {
        // Plusieurs jours sans venir : il vous salue.
        setClip("hello");
        say("Vous revoilà !");
      } else setClip("joy");
    }, 700);
    return () => window.clearTimeout(id);
  }, [skipIntro, state, seenKey, say]);

  // Tout seul, de temps en temps, il s'occupe ou tend l'oreille.
  useEffect(() => {
    if (home !== "idle") return;
    let n = 0;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setClip((c) => (c === "idle" ? (n++ % 2 ? "listen" : "act") : c));
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
      // Il dort : on le réveille un instant, il vous salue.
      setClip("hello");
      say("Bonjour !");
      return;
    }
    const n = taps.current++;
    setClip(TAPS[n % TAPS.length]);
    // Deux fois sur trois, il reparle d'un vrai souvenir ; sinon, un mot à lui.
    if (memories.length && n % 3 !== 2) say(memories[(n * 5) % memories.length]);
    else say(words[n % words.length]);
  };

  const meta = MEMO_AGES[age - 1];
  const headline = shown ? state.headline : meta.text;
  const fill = (shown ? state.path : (age - 1) / 4) * 100;
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
              aria-label={`${state.told} souvenir${state.told > 1 ? "s racontés" : " raconté"} sur ${state.total}. Voir lesquels`}
              onClick={() => setDetails((d) => !d)}
              className="press mt-2.5 flex max-w-full items-center gap-2.5 text-left"
            >
              <span className="flex gap-1" aria-hidden="true">
                {stage.map((r, i) => (
                  <span key={r.key} className={`h-2 w-2 rounded-full ${i < state.told ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`} />
                ))}
              </span>
              <span className="text-[13px] font-bold tabular-nums text-[var(--ink-3)]">
                {state.told} sur {state.total}
              </span>
              <svg
                aria-hidden="true"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-[var(--ink-3)] transition-transform ${details ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
          {/* Une seule ligne de plus, et seulement quand il y a du nouveau (Solal, 19/11/2026 : carte trop chargée). */}
          {shown && (news || state.mood === "fresh") && <p className="mt-2 text-[14px] font-semibold leading-snug text-[var(--amber-deep)]">{news || state.note}</p>}
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

      {growth && <Growth age={growth.age} intro={growth.intro} narrator={family ? who : null} onClose={() => setGrowth(null)} />}
    </section>
  );
}

/**
 * Le moment où Mémo grandit : plein écran, il surgit dans une gerbe d'étoiles, et on dit
 * ce que ce nouvel âge veut dire pour le livre. À la toute première visite, la même
 * scène sert à le présenter (« Voici Mémo »).
 */
function Growth({ age, intro, narrator = null, onClose }: { age: MemoAge; intro: boolean; narrator?: string | null; onClose: () => void }) {
  const meta = MEMO_AGES[age - 1];
  // Il a grandi : on le voit d'abord à son âge d'avant, il s'illumine, puis il apparaît plus grand.
  // (Sans animation demandée, il est directement à son nouvel âge.)
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const before = !intro && !still && age > 1 ? ((age - 1) as MemoAge) : null;
  const [shownAge, setShownAge] = useState<MemoAge>(before ?? age);
  const [clip, setClip] = useState<MemoClip>(before ? "charge" : "pop");
  const ended = () => {
    if (clip === "charge") {
      setShownAge(age);
      setClip("pop");
    } else if (clip === "pop") setClip(before ? "joy" : "idle");
    else setClip("idle");
  };
  // Les dessins du nouvel âge sont chargés pendant qu'il s'illumine.
  useEffect(() => {
    for (const p of ["a", "b", "c"] as const) new Image().src = memoSrc(age, p);
  }, [age]);
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
          <Memo age={shownAge} clip={clip} size={240} onEnd={ended} />
        </div>
        <p className="text-[14px] font-bold text-[var(--amber-ink)]">{intro ? (narrator ? `Il grandit avec le livre de ${narrator}` : "Il grandit avec votre livre") : meta.event}</p>
        <h2 id="memo-grandit" className="mt-1 text-[clamp(1.5rem,4vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em]">
          {intro ? first.event : "Mémo a grandi"}
        </h2>
        <p className="mx-auto mt-3 max-w-[26rem] text-[16px] leading-relaxed text-[var(--ink-2)]">
          {narrator
            ? intro
              ? `Mémo n’oublie rien. Il retient chaque souvenir que ${narrator} raconte. À chaque souvenir, il grandit, et le livre avance.`
              : age === 5
                ? `Le récit de ${narrator} est complet. Le livre va être relu, puis imprimé.`
                : `Le livre de ${narrator} passe à l’étape « ${meta.stage} ».`
            : intro
              ? first.meaning
              : meta.meaning}
        </p>
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
