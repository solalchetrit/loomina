"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Overview } from "./types";

const MINUTES = [15, 20, 30, 45];

/**
 * L'accueil du premier passage dans l'espace auteur : Loomina demande tout
 * de suite les préférences de l'entretien (demande de Solal, 17/11/2026).
 *
 * On ne pose que les questions dont on n'a pas déjà la réponse : si un appel
 * a déjà eu lieu, le tutoiement et les sujets à éviter sont connus, et cet
 * accueil ne s'affiche pas (voir `welcome` dans /api/user/overview).
 * « Plus tard » le ferme pour de bon : tout reste modifiable dans Réglages.
 */
export default function Welcome({
  ask,
  prefs,
  onDone,
  onUnauthorized,
}: {
  ask: NonNullable<Overview["welcome"]>;
  prefs: Overview["prefs"];
  onDone: () => void;
  onUnauthorized: () => void;
}) {
  const [politeness, setPoliteness] = useState<"tu" | "vous">(prefs.politeness);
  const [topics, setTopics] = useState<string[]>(prefs.sensitiveTopics);
  const [draft, setDraft] = useState("");
  const [minutes, setMinutes] = useState(prefs.callMinutes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const addTopic = () => {
    const t = draft.trim();
    if (t && !topics.includes(t)) setTopics([...topics, t]);
    setDraft("");
  };

  const send = async (skip: boolean) => {
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

  return (
    <section className="card mt-8 p-6 md:p-8" aria-labelledby="bienvenue-titre">
      <p className="text-[15px] font-bold text-[var(--amber-ink)]">Avant votre premier appel</p>
      <h2 id="bienvenue-titre" className="t-heading mt-1">Comment voulez-vous que Loomina vous parle ?</h2>
      <p className="t-body mt-2 max-w-[62ch]">Trois réglages, pour que Loomina n’ait pas à vous les demander au téléphone. Vous pourrez les changer à tout moment dans Réglages.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {ask.politeness && (
          <fieldset>
            <legend className="field-label">Loomina s’adresse à vous en disant</legend>
            <div className="mt-2 inline-flex rounded-full bg-[var(--canvas)] p-1">
              {(["vous", "tu"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={politeness === p}
                  onClick={() => setPoliteness(p)}
                  className={`press rounded-full px-5 py-2 text-[16px] font-bold ${politeness === p ? "bg-[var(--ink)] text-white" : "hover:bg-[var(--surface-2)]"}`}
                >
                  {p === "vous" ? "Vous" : "Tu"}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="field-label">Durée souhaitée d’un appel</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={minutes === m}
                onClick={() => setMinutes(m)}
                className={`press rounded-full px-4 py-2 text-[16px] font-bold ${minutes === m ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"}`}
              >
                {m} min
              </button>
            ))}
          </div>
        </fieldset>

        {ask.topics && (
          <div className="md:col-span-2">
            <label htmlFor="bienvenue-sujet" className="field-label">Y a-t-il des sujets ou des personnes dont vous préférez ne pas parler ?</label>
            <p className="t-small mt-1">Loomina ne les abordera jamais. Laissez vide s’il n’y en a pas.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                id="bienvenue-sujet"
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
              <Button onClick={addTopic} variant="secondary" disabled={!draft.trim()}>Ajouter</Button>
            </div>
            {topics.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {topics.map((t) => (
                  <li key={t} className="inline-flex items-center gap-2 rounded-full bg-[var(--canvas)] py-1.5 pl-4 pr-2 text-[15px] font-semibold">
                    {t}
                    <button type="button" aria-label={`Retirer ${t}`} onClick={() => setTopics(topics.filter((x) => x !== t))} className="flex h-7 w-7 items-center justify-center rounded-full text-[18px] leading-none text-[var(--ink-3)] hover:bg-[var(--surface-2)]">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {error && <p role="alert" className="mt-4 text-[15px] font-semibold text-[var(--danger)]">L’enregistrement n’a pas abouti. Réessayez dans un instant.</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => send(false)} loading={saving}>Enregistrer</Button>
        <button type="button" onClick={() => send(true)} disabled={saving} className="link text-[16px]">Plus tard</button>
      </div>
    </section>
  );
}
