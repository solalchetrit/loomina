"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { WEAVE_STAGES, type Weave, type WeaveRow } from "@/lib/loomina/weave";
import type { ProjectOverview } from "./types";
import s from "./Loom.module.css";

/** Une page imprimée compte environ 250 mots : un ordre de grandeur, affiché comme tel. */
const WORDS_PER_PAGE = 250;

/** Où se trouve la toile dans les photos du métier (public/toile, 980 × 1225), en % de la photo. */
const CLOTH = { left: 18.67, right: 80.82, top: 12.33, bottom: 84.98 };
const CLOTH_H = CLOTH.bottom - CLOTH.top;

/** Où chaque fil d'or se place dans la hauteur déjà tissée : espacés sans régularité, comme à la main. */
const GOLD_AT = [0.07, 0.24, 0.36, 0.55, 0.63, 0.78, 0.86, 0.96];

const SEEN_KEY = "loomina:toile:rangs";
const PHASES = [1, 2, 3, 4] as const;

/** Les rangs tels qu'on les montre : ceux du livre, ou ceux de l'aperçu quand on fait avancer la démonstration. */
function rowsAt(weave: Weave, preview: number | null): WeaveRow[] {
  if (preview === null) return weave.rows;
  return weave.rows.map((r, i) => ({ ...r, state: i < preview ? "woven" : i === preview ? "next" : "open" }));
}

export default function Loom({
  project,
  title,
  author,
  demo = false,
}: {
  project: ProjectOverview;
  /** Le titre du livre, inscrit sur la couverture quand la toile est finie. */
  title: string;
  author: string | null;
  /** Livre d'exemple : on peut faire avancer la toile à la main pour voir la suite. */
  demo?: boolean;
}) {
  const weave = project.weave!;
  const [preview, setPreview] = useState<number | null>(null);
  const rows = useMemo(() => rowsAt(weave, preview), [weave, preview]);
  const woven = rows.filter((r) => r.state === "woven").length;
  const total = rows.length;
  const done = woven >= total;
  const next = rows.find((r) => r.state === "next") ?? null;

  // Les rangs montrés sur le métier : ils rattrapent `woven` un par un, navette comprise.
  const [shown, setShown] = useState(woven);
  const [fresh, setFresh] = useState<WeaveRow[]>([]);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Au retour dans l'espace auteur, on voit se tisser ce qui s'est ajouté depuis le dernier passage.
    let seen: number | null = null;
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      seen = raw === null ? null : Number(raw);
      window.localStorage.setItem(SEEN_KEY, String(woven));
    } catch {
      // Stockage indisponible : on montre simplement la toile où elle en est.
    }
    const from = demo ? Math.max(0, woven - 2) : seen !== null && Number.isFinite(seen) && seen < woven ? Math.max(0, seen) : woven;
    if (from < woven && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(from);
      setFresh(weave.rows.filter((r) => r.state === "woven").slice(from, woven));
    }
  }, [demo, woven, weave.rows]);

  useEffect(() => {
    if (shown === woven) return;
    const far = Math.abs(woven - shown) > 3;
    const id = window.setTimeout(() => setShown((n) => (far ? woven : n + Math.sign(woven - n))), far ? 0 : 1150);
    return () => window.clearTimeout(id);
  }, [shown, woven]);

  const [hover, setHover] = useState<number | null>(null);
  const currentPhase = next?.phase ?? 4;
  const [open, setOpen] = useState<number>(currentPhase);
  const [hint, setHint] = useState<string | null>(null);

  const pages = Math.max(project.chapters ? 1 : 0, Math.round(project.words / WORDS_PER_PAGE));
  const percent = Math.round((woven / total) * 100);
  const edge = CLOTH.bottom - (shown / total) * CLOTH_H; // le bord haut de la toile tissée, en % de la photo
  // Dans l'aperçu de démonstration, le dernier fil d'or suit la toile.
  const gold = preview === null ? weave.gold : weave.gold.map((g) => (g.key === "fin" ? { ...g, earned: done } : g));
  const earned = gold.filter((g) => g.earned);
  const complete = done && shown >= total;

  const band = (phase: number) => {
    const first = rows.findIndex((r) => r.phase === phase);
    const count = rows.filter((r) => r.phase === phase).length;
    return { bottom: 100 - CLOTH.bottom + (first / total) * CLOTH_H, height: (count / total) * CLOTH_H };
  };

  return (
    <section className="card overflow-hidden" aria-labelledby="toile">
      <div className="grid lg:grid-cols-[minmax(0,440px)_1fr]">
        <figure className={`${s.figure} ${complete ? s.complete : ""}`}>
          <span aria-hidden="true" className={s.fill}>
            <Image src="/toile/haut2.png" alt="" fill sizes="440px" className={s.stretch} />
          </span>
          <div className={s.frame}>
            <Image src="/toile/metier-fils.jpg" alt="" fill sizes="(min-width: 1024px) 440px, 100vw" priority className={s.photo} />
            <Image
              src="/toile/metier-tisse.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 440px, 100vw"
              priority
              className={`${s.photo} ${s.cloth}`}
              style={{ clipPath: `inset(${edge}% 0 0 0)` }}
            />
            {/* Les fils d'or : un par moment marquant, pris dans la toile déjà tissée. */}
            {earned.map((g, i) => {
              const y = 100 - CLOTH.bottom + GOLD_AT[i % GOLD_AT.length] * (Math.min(shown, woven) / total) * CLOTH_H;
              return shown > 0 ? <span key={g.key} aria-hidden="true" className={s.gold} style={{ bottom: `${y}%`, left: `${CLOTH.left}%`, right: `${100 - CLOTH.right}%` }} /> : null;
            })}
            {hover !== null && (
              <span
                aria-hidden="true"
                className={s.band}
                style={{ bottom: `${band(hover).bottom}%`, height: `${band(hover).height}%`, left: `${CLOTH.left}%`, right: `${100 - CLOTH.right}%` }}
              />
            )}
            {!done && (
              <span aria-hidden="true" className={`${s.shuttle} ${shown % 2 ? s.right : ""}`} style={{ top: `${edge}%` }}>
                <Image src="/toile/navette.png" alt="" fill sizes="320px" className="object-contain" />
              </span>
            )}
            {/* La toile finie habille le livre : le vrai livre, avec le titre de l'auteur. */}
            <div className={s.book} aria-hidden={!complete}>
              <Image src="/toile/livre-toile.jpg" alt="" fill sizes="(min-width: 1024px) 440px, 100vw" className={s.photo} />
              <p className={s.bookTitle}>{title}</p>
              {author && <p className={s.bookAuthor}>{author}</p>}
            </div>
          </div>
          <span aria-hidden="true" className={s.fill}>
            <Image src="/toile/bas2.png" alt="" fill sizes="440px" className={s.stretch} />
          </span>
          <figcaption className="sr-only">
            {complete ? "Votre toile est finie : elle habille votre livre." : `Votre toile sur le métier à tisser : ${woven} rangs tissés sur ${total}.`}
          </figcaption>
        </figure>

        <div className="flex flex-col p-6 md:p-8 lg:p-10">
          <p className="text-[15px] font-bold text-[var(--amber-deep)]">La toile de votre livre</p>
          <h2 id="toile" className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <b className="text-[clamp(3rem,6vw,4.25rem)] font-extrabold leading-none tracking-[-0.045em] tabular-nums">{percent} %</b>
            <span className="text-[19px] font-bold text-[var(--ink-2)]">{complete ? "votre toile est finie" : "de votre toile est tissée"}</span>
          </h2>
          <p className="t-body mt-3 max-w-[34rem]">
            {complete
              ? "Tous les rangs sont tissés. Votre toile habille maintenant votre livre : place à la relecture et à l’impression."
              : "Chaque souvenir que vous racontez ajoute un rang à la toile de lin qui habillera votre livre."}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-[var(--ink-3)]">
            {[
              { value: `${woven} sur ${total}`, label: "rangs tissés" },
              { value: `≈ ${pages}`, label: pages > 1 ? "pages écrites" : "page écrite" },
              { value: project.chapters, label: project.chapters > 1 ? "appels racontés" : "appel raconté" },
            ].map((x) => (
              <div key={x.label} className="flex items-baseline gap-1.5">
                <dd className="text-[19px] font-extrabold tracking-[-0.02em] text-[var(--ink)] tabular-nums">{x.value}</dd>
                <dt>{x.label}</dt>
              </div>
            ))}
          </dl>

          {fresh.length > 0 && preview === null && (
            <p className={`${s.fresh} mt-5 rounded-[14px] bg-[var(--amber-wash)] px-4 py-3 text-[15px] font-semibold text-[var(--amber-deep)]`} role="status">
              {fresh.length > 1 ? `${fresh.length} nouveaux rangs depuis votre dernier passage` : "Un nouveau rang depuis votre dernier passage"} :{" "}
              {fresh.map((r) => r.label.toLowerCase()).join(", ")}.
            </p>
          )}

          <ol className="mt-6 flex flex-col gap-2">
            {PHASES.map((phase) => {
              const list = rows.filter((r) => r.phase === phase);
              if (!list.length) return null;
              const n = list.filter((r) => r.state === "woven").length;
              const isOpen = open === phase;
              const state = n === list.length ? "Tissé" : list.some((r) => r.state !== "open") ? "Sur le métier" : "À venir";
              return (
                <li key={phase} className={`rounded-[18px] ${isOpen ? "bg-[var(--canvas)]" : ""}`} onMouseEnter={() => setHover(phase)} onMouseLeave={() => setHover(null)}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? 0 : phase)}
                    onFocus={() => setHover(phase)}
                    onBlur={() => setHover(null)}
                    className="press flex min-h-14 w-full items-center gap-4 rounded-[18px] px-4 py-3 text-left hover:bg-[var(--canvas)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-bold leading-snug">{WEAVE_STAGES[phase]}</span>
                        <span className={`shrink-0 text-[13px] font-bold ${state === "Tissé" ? "text-[var(--success)]" : state === "À venir" ? "text-[var(--ink-3)]" : "text-[var(--amber-deep)]"}`}>
                          {state} · {n}/{list.length}
                        </span>
                      </span>
                      <span className="mt-2 flex gap-[3px]" aria-hidden="true">
                        {list.map((r) => (
                          <span key={r.key} className={`h-[5px] flex-1 rounded-full ${r.state === "woven" ? "bg-[var(--ink)]" : r.state === "next" ? "bg-[var(--amber)]" : "bg-[var(--rule-strong)]"}`} />
                        ))}
                      </span>
                    </span>
                    <span className={`shrink-0 text-[var(--ink-3)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </button>
                  {isOpen && (
                    <ul className="grid gap-x-6 gap-y-1 px-4 pb-4 pt-1 sm:grid-cols-2">
                      {list.map((r) => (
                        <li key={r.key} className="flex items-center gap-2.5 py-1 text-[15px] leading-snug">
                          <span
                            aria-hidden="true"
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              r.state === "woven" ? "bg-[var(--ink)] text-white" : r.state === "next" ? "bg-[var(--amber)] text-[var(--ink)]" : "border border-[var(--rule-strong)]"
                            }`}
                          >
                            {r.state === "woven" && <Icon name="check" size={12} />}
                          </span>
                          <span className={r.state === "open" ? "text-[var(--ink-3)]" : "font-semibold"}>
                            {r.label}
                            {r.state === "next" && <span className="ml-1.5 font-bold text-[var(--amber-deep)]">· prochain rang</span>}
                            <span className="sr-only">{r.state === "woven" ? " : tissé" : r.state === "open" ? " : à venir" : ""}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 border-t border-[var(--line-soft)] pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-bold">Vos fils d’or</h3>
              <span className="text-[14px] font-bold text-[var(--ink-3)] tabular-nums">
                {earned.length} sur {gold.length}
              </span>
            </div>
            <p className="mt-1 text-[15px] leading-snug text-[var(--ink-3)]">Les moments qui comptent laissent un fil d’or dans votre toile.</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {gold.map((g) => (
                <li key={g.key}>
                  <button
                    type="button"
                    onClick={() => setHint(hint === g.key ? null : g.key)}
                    aria-pressed={hint === g.key}
                    className={`press inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[14px] font-bold ${
                      g.earned ? "bg-[var(--amber-wash)] text-[var(--amber-deep)] ring-1 ring-[var(--amber-line)]" : "border border-dashed border-[var(--rule-strong)] text-[var(--ink-3)]"
                    } ${hint === g.key ? "!ring-2" : ""}`}
                  >
                    <span aria-hidden="true" className={`h-[3px] w-5 rounded-full ${g.earned ? s.thread : "bg-[var(--rule-strong)]"}`} />
                    {g.label}
                    <span className="sr-only">{g.earned ? " : obtenu" : " : à obtenir"}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 min-h-[1.4em] text-[15px] leading-snug text-[var(--ink-2)]" aria-live="polite">
              {hint ? gold.find((g) => g.key === hint)?.hint : ""}
            </p>
          </div>
        </div>
      </div>

      {demo && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--line-soft)] bg-[var(--canvas)] px-6 py-4 md:px-8">
          <label htmlFor="toile-apercu" className="text-[14px] font-bold text-[var(--ink-2)]">
            Démonstration : faites avancer le livre
          </label>
          <input
            id="toile-apercu"
            type="range"
            min={0}
            max={total}
            value={woven}
            onChange={(e) => {
              const n = Number(e.target.value);
              setPreview(n);
              const at = weave.rows[Math.min(n, total - 1)];
              if (at) setOpen(at.phase);
            }}
            className={`${s.range} min-w-[12rem] flex-1`}
          />
          <button type="button" onClick={() => setPreview(null)} className="link text-[14px]" disabled={preview === null}>
            Revenir au livre de Jeanne
          </button>
        </div>
      )}
    </section>
  );
}
