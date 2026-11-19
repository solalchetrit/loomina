"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const IDEAS = ["Comment as-tu rencontré papa ?", "Raconte la maison de ton enfance", "Quel a été ton premier métier ?"];

/**
 * Suggérer un sujet : la question rejoint celles que Loomina garde en tête
 * et sera posée au prochain appel. Un proche peut s'en servir aussi.
 */
export default function SuggestTopic({
  questions,
  onAdded,
  onUnauthorized,
}: {
  questions: string[];
  onAdded: (questions: string[]) => void;
  onUnauthorized: () => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/user/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorText(res.status === 409 && typeof data.error === "string" ? data.error : null);
        throw new Error();
      }
      const data = await res.json();
      onAdded(data.openQuestions);
      setText("");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="card p-6" aria-labelledby="suggerer">
      <h2 id="suggerer" className="text-[19px] font-extrabold tracking-[-0.02em]">
        Suggérer un sujet
      </h2>
      <p className="mt-0.5 text-[15px] text-[var(--ink-2)]">Un souvenir à ne pas oublier, une question de la famille : Loomina l’abordera au prochain appel.</p>

      <form onSubmit={submit} className="mt-3">
        <label htmlFor="sujet" className="sr-only">
          Votre question
        </label>
        <textarea
          id="sujet"
          rows={2}
          maxLength={280}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("idle");
          }}
          placeholder="Par exemple : raconte-nous ton premier voyage à l’étranger"
          className="field !min-h-[64px] !py-2.5"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {IDEAS.map((idea) => (
            <button key={idea} type="button" onClick={() => setText(idea)} className="press rounded-full bg-[var(--surface-2)] px-3 py-1 text-[13px] font-semibold hover:bg-[var(--line)]">
              {idea}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button type="submit" loading={status === "saving"} disabled={text.trim().length < 5}>
            Ajouter au prochain appel
          </Button>
          <p role="status" className="text-[15px] font-semibold">
            {status === "saved" && <span className="text-[var(--success)]">C’est noté, Loomina vous en parlera.</span>}
            {status === "error" && <span className="text-[var(--danger)]">{errorText ?? "L’envoi n’a pas abouti. Réessayez."}</span>}
          </p>
        </div>
      </form>

      {questions.length > 0 && (
        <div className="mt-4 border-t border-[var(--line-soft)] pt-3">
          <p className="text-[14px] font-bold text-[var(--ink-3)]">Ce que Loomina garde en tête</p>
          <ul className="mt-2 space-y-1">
            {questions.map((q) => (
              <li key={q} className="flex gap-3 text-[15px]">
                <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--amber)]" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
