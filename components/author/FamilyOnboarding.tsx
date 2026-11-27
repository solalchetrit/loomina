"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Memo, { type MemoClip } from "@/components/brand/Memo";
import Button from "@/components/ui/Button";
import s from "./Onboarding.module.css";

export interface FamilySetup {
  firstName: string;
  firstNamePhonetic: string;
  politeness: "tu" | "vous";
  sensitiveTopics: string[];
}

/**
 * L'accueil de l'espace famille, au premier passage de la personne qui a
 * offert le livre (demande de Solal du 20/11/2026) : 1. ce que permet
 * l'espace, 2. Mémo, 3. préparer le premier appel du narrateur (prénom,
 * tu ou vous, sujets à éviter), seulement tant qu'aucun appel n'a eu lieu.
 * Même feuille que l'accueil de l'espace auteur (Onboarding.tsx).
 */
export default function FamilyOnboarding({
  projectId,
  giverFirstName,
  narrator,
  setup,
  startAt = 0,
  onDone,
  onUnauthorized,
}: {
  projectId: string;
  giverFirstName: string | null;
  narrator: string | null;
  setup: FamilySetup | null;
  /** 2 : rouvert depuis l'espace pour changer les réglages du premier appel. */
  startAt?: number;
  onDone: () => void;
  onUnauthorized: () => void;
}) {
  const steps = setup ? 3 : 2;
  const [step, setStep] = useState(Math.min(startAt, steps - 1));
  const [clip, setClip] = useState<MemoClip>("pop");
  const [firstName, setFirstName] = useState(setup?.firstName ?? "");
  const [politeness, setPoliteness] = useState<"tu" | "vous">(setup?.politeness ?? "vous");
  const [topics, setTopics] = useState<string[]>(setup?.sensitiveTopics ?? []);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const who = firstName.trim() || narrator?.trim() || "votre proche";

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
    setSaving(true);
    setError(null);
    try {
      // Un sujet tapé mais pas encore ajouté compte aussi.
      const all = draft.trim() && !topics.includes(draft.trim()) ? [...topics, draft.trim()] : topics;
      const body =
        skip || !setup
          ? { projectId }
          : { projectId, firstName: firstName.trim() || undefined, politeness, sensitiveTopics: all };
      const res = await fetch("/api/famille/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" && res.status === 409 ? data.error : "L’enregistrement n’a pas abouti. Réessayez dans un instant.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L’enregistrement n’a pas abouti.");
    } finally {
      setSaving(false);
    }
  };

  const title = "text-[clamp(1.55rem,4.4vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em]";
  const text = "mx-auto mt-3 max-w-[25rem] text-[17px] leading-relaxed text-[var(--ink-2)]";
  const choice = (on: boolean) => `press min-h-12 flex-1 rounded-full px-4 text-[16px] font-bold ${on ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"}`;
  const last = step === steps - 1;

  return createPortal(
    <div className={s.veil} role="dialog" aria-modal="true" aria-labelledby="famille-accueil-titre">
      <div className={s.sheet} key={step}>
        {step === 0 && (
          <div className="text-center">
            <div className={s.visual}>
              <span className="relative block h-[44px] w-[154px]">
                <Image src="/header-logo-bleu.png" alt="Loomina" fill className="object-contain" sizes="154px" priority />
              </span>
            </div>
            <h2 id="famille-accueil-titre" className={title}>
              {giverFirstName ? `Bienvenue, ${giverFirstName}` : "Bienvenue"}
            </h2>
            <p className={text}>
              Ici, vous suivez le livre de {who}. Après chaque appel, vous le voyez avancer. Et vous pouvez poser une question ou souffler un souvenir, que Loomina abordera au bon moment du récit.
            </p>
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
            <h2 id="famille-accueil-titre" className={title}>
              Voici Mémo
            </h2>
            <p className={text}>Mémo retient chaque souvenir que {who} raconte. À chaque appel, il grandit. En le regardant, vous savez où en est le livre.</p>
          </div>
        )}

        {step === 2 && setup && (
          <div>
            <h2 id="famille-accueil-titre" className={`${title} text-center`}>
              Préparez le premier appel
            </h2>
            <p className="mx-auto mt-2 max-w-[25rem] text-center text-[16px] leading-relaxed text-[var(--ink-2)]">
              Ce que vous dites ici, Loomina n’aura pas à le demander. {who} pourra toujours le changer.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="famille-prenom" className="field-label">
                  Son prénom
                </label>
                <input id="famille-prenom" className="field w-full" value={firstName} maxLength={60} autoComplete="off" onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <fieldset>
                <legend className="field-label">Loomina lui dit</legend>
                <div className="flex gap-2">
                  {(["vous", "tu"] as const).map((p) => (
                    <button key={p} type="button" aria-pressed={politeness === p} onClick={() => setPoliteness(p)} className={choice(politeness === p)}>
                      {p === "vous" ? "Vous" : "Tu"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="famille-sujet" className="field-label">
                  Un sujet à éviter ? <span className="font-normal text-[var(--ink-3)]">(facultatif)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="famille-sujet"
                    className="field min-w-0 flex-1"
                    value={draft}
                    maxLength={80}
                    placeholder="Par exemple : la guerre"
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
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-center text-[15px] font-semibold text-[var(--danger)]">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          {!last ? (
            <Button onClick={() => setStep(step + 1)} className="w-full sm:w-auto sm:min-w-[13rem]">
              Continuer
            </Button>
          ) : (
            <Button onClick={() => send(false)} loading={saving} className="w-full sm:w-auto sm:min-w-[13rem]">
              {startAt > 0 ? "Enregistrer" : "Ouvrir l’espace famille"}
            </Button>
          )}
          <div className="flex w-full items-center justify-between">
            <button type="button" onClick={() => setStep(step - 1)} className={`link text-[15px] ${step === 0 || step === startAt ? "invisible" : ""}`}>
              Retour
            </button>
            <span className="flex gap-1.5" aria-label={`Étape ${step + 1} sur ${steps}`} role="img">
              {Array.from({ length: steps }, (_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-[var(--ink)]" : "w-1.5 bg-[var(--line)]"}`} />
              ))}
            </span>
            <button type="button" onClick={() => (startAt > 0 ? onDone() : send(true))} disabled={saving} className={`link text-[15px] ${last && setup ? "" : "invisible"}`}>
              {startAt > 0 ? "Annuler" : "Plus tard"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
