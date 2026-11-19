"use client";

import { useEffect, useRef, useState } from "react";
import Memo, { memoSrc, type MemoAge, type MemoClip } from "@/components/brand/Memo";
import { Section, SectionHead } from "@/components/ui/Section";
import { MEMO_AGES } from "@/lib/loomina/memo";
import s from "./MemoSection.module.css";

/**
 * Mémo présenté sur le site public (Solal, 19/11/2026) : qui il est, et comment
 * il grandit avec le livre. La scène joue seule, âge après âge ; on peut toucher
 * une étape pour la voir, ou toucher Mémo pour le faire sauter.
 *
 * Le déroulé d'un âge : il apparaît (pop), s'occupe (act), saute de joie (joy), puis on passe au suivant.
 */
const SCRIPT: MemoClip[] = ["pop", "idle", "act", "idle", "joy", "idle"];
/** Durée d'une pause « idle » dans le déroulé, en ms. */
const PAUSE = 900;

export default function MemoSection({ id = "memo" }: { id?: string }) {
  const [age, setAge] = useState<MemoAge>(1);
  const [step, setStep] = useState(1);
  // Dès qu'on choisit une étape soi-même, la scène ne défile plus toute seule.
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const clip = SCRIPT[step];
  const next = () => {
    if (step < SCRIPT.length - 1) return setStep(step + 1);
    if (manual) return;
    setAge((a) => ((a % 5) + 1) as MemoAge);
    setStep(0);
  };

  // Les pauses du déroulé (les autres prises préviennent d'elles-mêmes quand elles finissent).
  useEffect(() => {
    if (!visible || clip !== "idle") return;
    if (manual && step === SCRIPT.length - 1) return;
    const id = window.setTimeout(next, PAUSE);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `next` ne dépend que de ce qui est listé
  }, [visible, clip, step, manual, age]);

  const choose = (a: MemoAge) => {
    setManual(true);
    setAge(a);
    setStep(0);
  };

  const meta = MEMO_AGES[age - 1];

  return (
    <Section id={id}>
      <SectionHead
        eyebrow="Dans votre espace auteur"
        title={"Voici Mémo. Il grandit avec votre livre."}
        text="Mémo est le petit éléphant de votre espace auteur. Il retient chaque souvenir que vous racontez. À chaque souvenir, il grandit, et votre livre avance."
      />

      <div ref={root} className="head-gap grid items-stretch gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10" data-reveal>
        <button type="button" className={`card ${s.stage}`} onClick={() => clip === "idle" && setStep(4)} aria-label="Faire sauter Mémo">
          <span className={s.halo} aria-hidden="true" />
          <span className={s.memo}>
            <Memo age={age} clip={visible ? clip : "idle"} size={380} onEnd={next} />
          </span>
          <span className={s.caption} aria-live="polite">
            <b>{meta.stage}</b>
            {meta.name}
          </span>
        </button>

        <ol className="flex flex-col gap-2.5" aria-label="Les cinq âges de Mémo">
          {MEMO_AGES.map((x) => {
            const on = x.age === age;
            return (
              <li key={x.age}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(x.age)}
                  className={`press flex w-full items-center gap-4 rounded-[var(--radius-card)] border p-3.5 text-left transition-colors md:p-4 ${
                    on ? "border-[var(--ink)] bg-white shadow-[var(--shadow-bar)]" : "border-[var(--line)] bg-transparent hover:border-[var(--ink-3)]"
                  }`}
                >
                  <span className={`${s.avatar} ${on ? s.avatarOn : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- petit dessin détouré, déjà à sa taille */}
                    <img src={memoSrc(x.age)} alt="" loading="lazy" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--amber-ink)]">
                      {x.age < 5 ? `Étape ${x.age}` : "À la fin"} · {x.stage}
                    </span>
                    <span className="mt-0.5 block text-[17px] font-semibold leading-snug text-[var(--ink)]">{x.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-6 max-w-2xl text-[16px] text-[var(--ink-3)]" data-reveal>
        Pas de points, pas de niveaux. Mémo grandit quand vous racontez, à votre rythme.
      </p>
    </Section>
  );
}
