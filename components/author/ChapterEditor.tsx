"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Step = "closed" | "describe" | "proposing" | "review" | "saving";

/**
 * Corriger un chapitre depuis l'espace auteur.
 *
 * 1. L'auteur décrit l'erreur (« Ma grand-mère s'appelait Rose, pas Rosa »).
 * 2. Loomina propose le texte corrigé, en changeant le moins possible.
 * 3. L'auteur relit, retouche s'il veut, puis enregistre. La correction
 *    rejoint la mémoire du livre : les chapitres suivants la respectent.
 * L'auteur peut aussi modifier le texte directement.
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
        body: JSON.stringify({ correction, content }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "La proposition n’a pas abouti.");
      setDraft(data.content);
      setStep("review");
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "La proposition n’a pas abouti." });
      setStep("describe");
    }
  };

  const save = async () => {
    setStep("saving");
    try {
      const res = await fetch(`/api/user/chapters/${number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, correction: correction.trim() || undefined }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’enregistrement n’a pas abouti.");
      onSaved(draft);
      setCorrection("");
      setStep("closed");
      setMessage({ ok: true, text: "Chapitre corrigé. Loomina s’en souviendra pour la suite du livre." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "L’enregistrement n’a pas abouti." });
      setStep("review");
    }
  };

  const id = `correction-${number}`;

  return (
    <div className="mx-auto mt-8 max-w-[38rem] border-t border-[var(--line-soft)] pt-6">
      {step === "closed" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setStep("describe")}>
            Corriger ce chapitre
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
              Proposer le texte corrigé
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
            {correction.trim() ? "Texte corrigé proposé : relisez-le, retouchez-le si besoin" : "Le texte du chapitre"}
          </label>
          <textarea id={`${id}-texte`} rows={16} value={draft} onChange={(e) => setDraft(e.target.value)} className="field book-text !min-h-[320px]" lang="fr" />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={save} loading={step === "saving"} disabled={!draft.trim()}>
              Enregistrer le chapitre
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
