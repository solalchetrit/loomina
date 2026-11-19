"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Memo, { type MemoAge, type MemoClip } from "@/components/brand/Memo";
import Button from "@/components/ui/Button";
import { MEMO_AGES } from "@/lib/loomina/memo";
import { CALL_MINUTES_OPTIONS } from "@/lib/loomina/call-length";
import type { Overview } from "./types";
import s from "./Onboarding.module.css";

/**
 * L'accueil du premier passage dans l'espace auteur, en quatre écrans, une idée par écran :
 * 1. comment le livre s'écrit (les trois temps, montrés un à un), 2. Mémo, 3. Mémo qui
 * grandit sous les yeux de l'auteur, étape par étape, 4. les préférences d'appel (demande
 * de Solal du 17/11/2026, reprise le 19/11/2026 : « plus démonstratif », « deux étapes Mémo »).
 *
 * On ne pose que les questions dont on n'a pas déjà la réponse (voir `welcome` dans
 * /api/user/overview). « Plus tard » ferme pour de bon : tout reste dans Réglages.
 * `preview` : rejoué depuis le livre d'exemple, rien n'est enregistré.
 */
const LAST = 3;

/** Les trois temps du livre, avec la rubrique où chacun se retrouve. */
const HOW = [
  { title: "Vous racontez au téléphone", text: "Loomina vous appelle aux jours que vous choisissez.", icon: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" },
  { title: "Chaque appel devient un récit", text: "Il apparaît dans « Mes appels ». Vous pouvez le lire et le corriger.", icon: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" },
  { title: "Vos récits composent votre livre", text: "Il se lit dans « Mon livre », et s’enrichit après chaque appel.", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" },
];

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
  const [age, setAge] = useState<MemoAge>(1);
  const [auto, setAuto] = useState(true);
  const [politeness, setPoliteness] = useState<"tu" | "vous">(prefs.politeness);
  const [topics, setTopics] = useState<string[]>(prefs.sensitiveTopics);
  const [draft, setDraft] = useState("");
  const [minutes, setMinutes] = useState(prefs.callMinutes);
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

  const go = (to: number) => {
    setStep(to);
    setClip("pop");
    setAge(1);
    setAuto(true);
  };

  // L'auteur choisit lui-même une étape : Mémo y va, et le défilement s'arrête.
  const grow = (to: MemoAge) => {
    setAuto(false);
    setAge(to);
    setClip("pop");
  };

  // Sur l'écran « Mémo grandit », il passe seul d'un âge au suivant, puis recommence.
  useEffect(() => {
    if (step !== 2 || !auto) return;
    const t = setTimeout(
      () => {
        setAge((a) => (a === 5 ? 1 : ((a + 1) as MemoAge)));
        setClip("pop");
      },
      age === 5 ? 3200 : 1900,
    );
    return () => clearTimeout(t);
  }, [step, auto, age]);

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
        : { welcomeDone: true, ...(ask.politeness ? { politeness } : {}), ...(ask.topics ? { sensitiveTopics: all } : {}), callMinutes: minutes };
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
            <h2 id="accueil-titre" className={title}>
              {firstName ? `Bienvenue, ${firstName}` : "Bienvenue"}
            </h2>
            <p className={text}>Voici comment votre livre s’écrit.</p>
            <ol className={s.how}>
              {HOW.map((h, i) => (
                <li key={h.title} className={s.howRow} style={{ animationDelay: `${250 + i * 450}ms` }}>
                  <span className={s.howIcon} aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={h.icon} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[16.5px] font-bold leading-snug">{h.title}</span>
                    <span className="block text-[15px] leading-snug text-[var(--ink-2)]">{h.text}</span>
                  </span>
                </li>
              ))}
            </ol>
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
            <p className={text}>Mémo n’oublie rien. Il retient chaque souvenir que vous racontez au téléphone.</p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className={s.visual}>
              <span className={s.halo} aria-hidden="true" />
              <span className={`${s.memo} ${s.memoGrow}`}>
                <Memo age={age} clip={clip} size={260} onEnd={() => setClip("idle")} />
              </span>
            </div>
            <ol className={s.ages} aria-label="Les cinq étapes de votre livre">
              {MEMO_AGES.map((a) => (
                <li key={a.age}>
                  <button type="button" aria-pressed={a.age === age} aria-label={a.stage} onClick={() => grow(a.age)} className={`${s.age} ${a.age <= age ? s.ageOn : ""}`} />
                </li>
              ))}
            </ol>
            <p className={s.stage} key={age}>
              Étape {age} sur 5 · {MEMO_AGES[age - 1].stage}
            </p>
            <h2 id="accueil-titre" className={title}>
              Mémo grandit avec votre livre
            </h2>
            <p className={text}>Votre récit avance en cinq étapes. À chaque étape, Mémo grandit. Quand il tient votre livre, votre récit est complet.</p>
          </div>
        )}

        {step === 3 && (
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
          {step < LAST ? (
            <Button onClick={() => go(step + 1)} className="w-full sm:w-auto sm:min-w-[13rem]">
              Continuer
            </Button>
          ) : (
            <Button onClick={() => send(false)} loading={saving} className="w-full sm:w-auto sm:min-w-[13rem]">
              Ouvrir mon espace
            </Button>
          )}
          <div className="flex w-full items-center justify-between">
            <button type="button" onClick={() => go(step - 1)} className={`link text-[15px] ${step === 0 ? "invisible" : ""}`}>
              Retour
            </button>
            <span className="flex gap-1.5" aria-label={`Écran ${step + 1} sur 4`} role="img">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-[var(--ink)]" : "w-1.5 bg-[var(--line)]"}`} />
              ))}
            </span>
            <button type="button" onClick={() => send(true)} disabled={saving} className={`link text-[15px] ${step === LAST ? "" : "invisible"}`}>
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
