"use client";

/**
 * Les 14 thèmes, présentés comme le sommaire du livre : à gauche la page « Sommaire » dans le livre ouvert,
 * à droite les thèmes à parcourir. Pour chacun, ce qu'on y raconte et la question par laquelle Loomina
 * pourrait l'ouvrir. Les thèmes défilent seuls tant qu'on n'en a pas choisi un.
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import PrintedPage from "@/components/ui/PrintedPage";
import { QUESTIONS } from "@/components/home/ThemePicker";
import { OFFER, THEMES } from "@/config/offer";
import s from "./ThemeBook.module.css";

const PACE = 5200;
/** Pages du sommaire d'exemple : un chapitre toutes les quinze pages environ. */
const PAGES = THEMES.map((_, i) => 9 + i * 15 + (i % 3));

function watchMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function ThemeBook() {
  const still = useSyncExternalStore(
    watchMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const playing = auto && !still;

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setCurrent((c) => (c + 1) % THEMES.length), PACE);
    return () => clearTimeout(t);
  }, [playing, current]);

  const theme = THEMES[current];

  return (
    <section id="chapitres" className="section-y w-full scroll-mt-28">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] lg:gap-16">
        <div aria-hidden="true" className="mx-auto w-full max-w-[500px] lg:sticky lg:top-28" data-reveal>
          <PrintedPage chapter="" title="Sommaire" page="5" sizes="(min-width: 1024px) 500px, 100vw">
            <ol className={s.toc}>
              {THEMES.map((t, i) => (
                <li key={t.title} data-on={i === current}>
                  <span>{t.title}</span>
                  <span className={s.dots} />
                  <span>{PAGES[i]}</span>
                </li>
              ))}
            </ol>
          </PrintedPage>
        </div>

        <div data-reveal>
          <h2 className="t-title">Des thèmes pour vous guider, jamais imposés</h2>
          <p className="t-lead mt-5 max-w-xl">
            Loomina propose ces {OFFER.chapters} thèmes au fil des appels. Vous pouvez en sauter, en approfondir, en ajouter : c’est
            votre récit. Choisissez-en un pour voir ce qu’on y raconte.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-2" role="group" aria-label="Thèmes">
            {THEMES.map((t, i) => {
              const active = i === current;
              return (
                <button
                  key={t.title}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setCurrent(i);
                    setAuto(false);
                  }}
                  className={`press flex min-h-12 items-center gap-3 rounded-[16px] px-3.5 py-2 text-left text-[15px] font-semibold leading-tight sm:text-[16px] ${
                    active ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--ink)]"
                  }`}
                >
                  <span className={`w-5 shrink-0 text-[13px] font-bold tabular-nums ${active ? "text-[var(--amber)]" : "text-[var(--ink-3)]"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t.title}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[24px] bg-[var(--ink)] p-6 text-white sm:p-8">
            <div key={current} className="rise" aria-live={auto ? "off" : "polite"}>
              <p className="text-[14px] font-bold text-[var(--amber)]">
                Thème {current + 1} sur {THEMES.length} · {theme.title}
              </p>
              <p className="mt-2 text-[17px] leading-snug text-[#cfcfc8]">{theme.desc}</p>
              <p className="mt-5 text-[13px] font-bold text-[#a8a8a0]">Loomina pourrait vous demander</p>
              <p className="mt-1.5 min-h-[4.2em] text-[clamp(1.2rem,1.9vw,1.5rem)] font-semibold leading-[1.35] tracking-[-0.015em]">
                « {QUESTIONS[theme.title]} »
              </p>
            </div>
            {playing && (
              <span
                key={`bar-${current}`}
                aria-hidden="true"
                className={`${s.progress} absolute inset-x-0 bottom-0 h-[3px] bg-[var(--amber)]`}
                style={{ animationDuration: `${PACE}ms` }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
