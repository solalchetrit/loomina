"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Memo, { type MemoClip } from "@/components/brand/Memo";
import Button from "@/components/ui/Button";
import { CALL_MINUTES_OPTIONS } from "@/lib/loomina/call-length";
import type { Overview } from "./types";
import s from "./Onboarding.module.css";
import { DAYS, DAY_LABELS, CALL_HOURS } from "./Settings";

/**
 * L'accueil du premier passage dans l'espace auteur, en trois écrans, une idée par écran :
 * 1. comment le livre s'écrit, 2. Mémo, 3. les préférences d'appel (demande de Solal du
 * 17/11/2026, reprise le 19/11/2026 : « simple mais bien fait, pur »). Depuis le 23/11/2026,
 * l'écran 3 propose aussi les jours et l'heure où Loomina appelle : sans cela, le rendez-vous
 * n'existait que dans Réglages, et un rendez-vous convenu à voix haute n'était jamais enregistré.
 *
 * On ne pose que les questions dont on n'a pas déjà la réponse (voir `welcome` dans
 * /api/user/overview). « Plus tard » ferme pour de bon : tout reste dans Réglages.
 * `preview` : rejoué depuis le livre d'exemple, rien n'est enregistré.
 */
export default function Onboarding({
  ask,
  prefs,
  firstName,
  preview = false,
  onDone,
  onUnauthorized,
}: {
  ask: NonNullable<Overview["welcome"]>;
  prefs: Overview["prefs"];
  firstName: string | null;
  preview?: boolean;
  onDone: () => void;
  onUnauthorized: () => void;
}) {
  const [step, setStep] = useState(0);
  const [clip, setClip] = useState<MemoClip>("pop");
  const [politeness, setPoliteness] = useState<"tu" | "vous">(prefs.politeness);
  const [topics, setTopics] = useState<string[]>(prefs.sensitiveTopics);
  const [draft, setDraft] = useState("");
  const [minutes, setMinutes] = useState(prefs.callMinutes);
  const [days, setDays] = useState<number[]>(prefs.callSchedule?.days ?? []);
  const [time, setTime] = useState(prefs.callSchedule?.time ?? "15:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  // La page derrière ne défile pas pendant l'accueil.
  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, []);

  const addTopic = () => {
    const t = draft.trim();
    if (t && !topics.includes(t)) setTopics([...topics, t]);
    setDraft("");
  };

  const send = async (skip: boolean) => {
    if (preview) return onDone();
    setSaving(true);
    setError(false);
    try {
      // Un sujet tapé mais pas encore ajouté compte aussi.
      const all = draft.trim() && !topics.includes(draft.trim()) ? [...topics, draft.trim()] : topics;
      const body = skip
        ? { welcomeDone: true }
        : {
            welcomeDone: true,
            ...(ask.politeness ? { politeness } : {}),
            ...(ask.topics ? { sensitiveTopics: all } : {}),
            callMinutes: minutes,
            ...(days.length ? { callSchedule: { active: true, days, time } } : {}),
          };
      const res = await fetch("/api/user/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const title = "text-[clamp(1.55rem,4.4vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em]";
  const text = "mx-auto mt-3 max-w-[25rem] text-[17px] leading-relaxed text-[var(--ink-2)]";
  const choice = (on: boolean) => `press min-h-12 flex-1 rounded-full px-4 text-[16px] font-bold ${on ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"}`;

  return createPortal(
    <div className={s.veil} role="dialog" aria-modal="true" aria-labelledby="accueil-titre">
      <div className={s.sheet} key={step}>
        {step === 0 && (
          <div className="text-center">
            <div className={s.visual}>
              <span className="relative block h-[44px] w-[154px]">
                <Image src="/header-logo-bleu.png" alt="Loomina" fill className="object-contain" sizes="154px" priority />
              </span>
            </div>
            <h2 id="accueil-titre" className={title}>
              {firstName ? `Bienvenue, ${firstName}` : "Bienvenue"}
            </h2>
            <p className={text}>Votre livre s’écrit au téléphone. Vous racontez, Loomina écrit. Après chaque appel, votre récit apparaît ici.</p>
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <div className={s.visual}>
              <span className={s.halo} aria-hidden="true" />
              <span className={s.memo}>
                <Memo age={1} clip={clip} size={260} onEnd={() => setClip("idle")} />
              </span>
            </div>
            <h2 id="accueil-titre" className={title}>
              Voici Mémo
            </h2>
            <p className={text}>Mémo n’oublie rien. Il retient chaque souvenir que vous racontez. À chaque souvenir, il grandit, et votre livre avance.</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 id="accueil-titre" className={`${title} text-center`}>
              Vos appels, à votre façon
            </h2>
            <div className="mt-6 space-y-5">
              {ask.politeness && (
                <fieldset>
                  <legend className="field-label">Loomina vous dit</legend>
                  <div className="flex gap-2">
                    {(["vous", "tu"] as const).map((p) => (
                      <button key={p} type="button" aria-pressed={politeness === p} onClick={() => setPoliteness(p)} className={choice(politeness === p)}>
                        {p === "vous" ? "Vous" : "Tu"}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              <fieldset>
                <legend className="field-label">
                  Loomina vous appelle le <span className="font-normal text-[var(--ink-3)]">(facultatif)</span>
                </legend>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => {
                    const day = i + 1;
                    const on = days.includes(day);
                    return (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={on}
                        aria-label={DAY_LABELS[i]}
                        onClick={() => setDays(on ? days.filter((x) => x !== day) : [...days, day].sort())}
                        className={`${choice(on)} !min-h-11 !px-0 text-[13.5px] sm:text-[14px]`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                {days.length > 0 ? (
                  <div className="mt-3 flex items-center gap-3">
                    <label htmlFor="accueil-heure" className="field-label !mb-0">
                      À quelle heure
                    </label>
                    <select id="accueil-heure" className="field max-w-[8.5rem]" value={time} onChange={(e) => setTime(e.target.value)}>
                      {CALL_HOURS.map((h) => (
                        <option key={h} value={h}>
                          {`${Number(h.slice(0, 2))} h${h.endsWith("30") ? " 30" : ""}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="t-small mt-1.5">Sans jour choisi, c’est vous qui appelez, quand vous voulez.</p>
                )}
              </fieldset>
              <fieldset>
                <legend className="field-label">Durée d’un appel</legend>
                <div className="flex gap-2">
                  {CALL_MINUTES_OPTIONS.map((m) => (
                    <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={`${choice(minutes === m)} !px-0`}>
                      {m} min
                    </button>
                  ))}
                </div>
              </fieldset>
              {ask.topics && (
                <div>
                  <label htmlFor="accueil-sujet" className="field-label">
                    Un sujet à éviter ? <span className="font-normal text-[var(--ink-3)]">(facultatif)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="accueil-sujet"
                      className="field min-w-0 flex-1"
                      value={draft}
                      maxLength={80}
                      placeholder="Par exemple : mon divorce"
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTopic();
                        }
                      }}
                    />
                    <Button onClick={addTopic} variant="secondary" disabled={!draft.trim()}>
                      Ajouter
                    </Button>
                  </div>
                  {topics.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {topics.map((t) => (
                        <li key={t}>
                          <button
                            type="button"
                            aria-label={`Retirer ${t}`}
                            onClick={() => setTopics(topics.filter((x) => x !== t))}
                            className="press inline-flex items-center gap-2 rounded-full bg-[var(--canvas)] px-3.5 py-1.5 text-[15px] font-semibold hover:bg-[var(--surface-2)]"
                          >
                            {t} <span aria-hidden="true">×</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-4 text-[15px] font-semibold text-[var(--danger)]">
                L’enregistrement n’a pas abouti. Réessayez dans un instant.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          {step < 2 ? (
            <Button onClick={() => setStep(step + 1)} className="w-full sm:w-auto sm:min-w-[13rem]">
              Continuer
            </Button>
          ) : (
            <Button onClick={() => send(false)} loading={saving} className="w-full sm:w-auto sm:min-w-[13rem]">
              Ouvrir mon espace
            </Button>
          )}
          <div className="flex w-full items-center justify-between">
            <button type="button" onClick={() => setStep(step - 1)} className={`link text-[15px] ${step === 0 ? "invisible" : ""}`}>
              Retour
            </button>
            <span className="flex gap-1.5" aria-label={`Étape ${step + 1} sur 3`} role="img">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-[var(--ink)]" : "w-1.5 bg-[var(--line)]"}`} />
              ))}
            </span>
            <button type="button" onClick={() => send(true)} disabled={saving} className={`link text-[15px] ${step === 2 ? "" : "invisible"}`}>
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
