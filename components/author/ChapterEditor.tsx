"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Step = "closed" | "describe" | "proposing" | "review" | "saving";

/**
 * Corriger un chapitre depuis l'espace auteur.
 *
 * Deux façons (demande de Solal, 17/11/2026) :
 * - écrire une remarque (« Ma grand-mère s'appelait Rose, pas Rosa ») :
 *   Loomina corrige le récit quelques minutes plus tard et prévient l'auteur ;
 * - modifier le texte soi-même : enregistré et affiché tout de suite.
 * Dans les deux cas, la correction rejoint la mémoire du livre.
 */
export default function ChapterEditor({
  number,
  content,
  onSaved,
  onUnauthorized,
}: {
  number: number;
  content: string;
  onSaved: (content: string) => void;
  onUnauthorized: () => void;
}) {
  const [step, setStep] = useState<Step>("closed");
  const [correction, setCorrection] = useState("");
  const [draft, setDraft] = useState(content);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const propose = async () => {
    setStep("proposing");
    setMessage(null);
    try {
      const res = await fetch(`/api/user/chapters/${number}/correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correction, later: true }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’envoi n’a pas abouti.");
      setCorrection("");
      setStep("closed");
      setMessage({ ok: true, text: "Remarque envoyée. Loomina corrige ce récit dans les minutes qui viennent et vous prévient dès que c’est fait." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "L’envoi n’a pas abouti." });
      setStep("describe");
    }
  };

  const save = async () => {
    setStep("saving");
    try {
      const res = await fetch(`/api/user/chapters/${number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’enregistrement n’a pas abouti.");
      onSaved(draft);
      setCorrection("");
      setStep("closed");
      setMessage({ ok: true, text: "Récit enregistré." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "L’enregistrement n’a pas abouti." });
      setStep("review");
    }
  };

  const id = `correction-${number}`;

  return (
    <div className="mx-auto mt-5 max-w-[38rem] border-t border-[var(--line-soft)] pt-4">
      {step === "closed" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setStep("describe")}>
            Corriger ce récit
          </Button>
          {message && (
            <p role="status" className={`text-[15px] font-semibold ${message.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}

      {(step === "describe" || step === "proposing") && (
        <div className="space-y-3">
          <label htmlFor={id} className="field-label">
            Qu’est-ce qui n’est pas juste ?
          </label>
          <textarea
            id={id}
            rows={3}
            maxLength={300}
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Par exemple : ma grand-mère s’appelait Rose, pas Rosa. Et c’était à Brest, pas à Rennes."
            className="field !min-h-[96px]"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={propose} loading={step === "proposing"} disabled={correction.trim().length < 4}>
              Envoyer ma remarque
            </Button>
            <button
              type="button"
              className="link text-[15px]"
              onClick={() => {
                setDraft(content);
                setStep("review");
              }}
            >
              Modifier le texte moi-même
            </button>
            <button type="button" className="link text-[15px]" onClick={() => setStep("closed")}>
              Annuler
            </button>
          </div>
          {message && !message.ok && <p className="text-[15px] font-semibold text-[var(--danger)]">{message.text}</p>}
        </div>
      )}

      {(step === "review" || step === "saving") && (
        <div className="space-y-3">
          <label htmlFor={`${id}-texte`} className="field-label">
            Le texte du récit : modifiez-le directement
          </label>
          <textarea id={`${id}-texte`} rows={16} value={draft} onChange={(e) => setDraft(e.target.value)} className="field book-text !min-h-[320px]" lang="fr" />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save} loading={step === "saving"} disabled={!draft.trim()}>
              Enregistrer le récit
            </Button>
            <button
              type="button"
              className="link text-[15px]"
              onClick={() => {
                setDraft(content);
                setStep("closed");
              }}
            >
              Annuler
            </button>
          </div>
          {message && !message.ok && <p className="text-[15px] font-semibold text-[var(--danger)]">{message.text}</p>}
        </div>
      )}
    </div>
  );
}
