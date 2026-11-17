"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface FamilyBook {
  id: string;
  narratorFirstName: string | null;
  title: string | null;
  phaseLabel: string;
  progress: number;
  completed: boolean;
  scheduleText: string | null;
  /** Le narrateur a choisi de laisser lire ses récits. */
  shared: boolean;
  calls: { date: string; minutes: number | null }[];
  chapters: { number: number; title: string | null; date: string; text: string | null }[];
  openQuestions: string[];
}

interface FamilyOverview {
  giverFirstName: string | null;
  books: FamilyBook[];
}

const day = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Le texte d'un récit : des paragraphes, sans les marques de mise en forme. */
function paragraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+\s*/gm, "").replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1").trim())
    .filter(Boolean);
}

/** Souffler un souvenir ou une question, que Loomina abordera à un prochain appel. */
function Suggest({ book, onAdded, onUnauthorized }: { book: FamilyBook; onAdded: (questions: string[]) => void; onUnauthorized: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const name = book.narratorFirstName ?? "votre proche";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/famille/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: book.id, question: text }),
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
    <section className="card p-6 md:p-8" aria-labelledby={`souffler-${book.id}`}>
      <h3 id={`souffler-${book.id}`} className="t-heading">
        Souffler un souvenir
      </h3>
      <p className="t-body mt-1">Une histoire que vous aimeriez lire, une question que vous n’avez jamais osé poser : Loomina en parlera à {name} à un prochain appel.</p>
      <form onSubmit={submit} className="mt-5">
        <label htmlFor={`sujet-${book.id}`} className="sr-only">
          Votre question
        </label>
        <textarea
          id={`sujet-${book.id}`}
          rows={3}
          maxLength={280}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("idle");
          }}
          placeholder="Par exemple : comment as-tu rencontré papa ?"
          className="field !min-h-[96px]"
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button type="submit" loading={status === "saving"} disabled={text.trim().length < 5}>
            Envoyer à Loomina
          </Button>
          <p role="status" className="text-[15px] font-semibold">
            {status === "saved" && <span className="text-[var(--success)]">C’est noté, Loomina lui en parlera.</span>}
            {status === "error" && <span className="text-[var(--danger)]">{errorText ?? "L’envoi n’a pas abouti. Réessayez."}</span>}
          </p>
        </div>
      </form>
      {book.openQuestions.length > 0 && (
        <div className="mt-6 border-t border-[var(--line-soft)] pt-5">
          <p className="text-[15px] font-bold text-[var(--ink-3)]">Ce que Loomina garde en tête</p>
          <ul className="mt-3 space-y-2">
            {book.openQuestions.map((q) => (
              <li key={q} className="rounded-[14px] bg-[var(--canvas)] px-4 py-3 text-[16px]">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Book({ book, onChange, onUnauthorized }: { book: FamilyBook; onChange: (b: FamilyBook) => void; onUnauthorized: () => void }) {
  const name = book.narratorFirstName ?? "votre proche";
  const lastCall = book.calls[0];

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[var(--radius-card)] bg-[var(--ink)] p-7 text-white md:p-9" aria-label={`Le livre de ${name}`}>
        <p className="text-[15px] font-bold text-[var(--amber)]">Le livre de {name}</p>
        <p className="t-banner mt-2 text-white">{book.completed ? "Le récit est terminé" : book.phaseLabel}</p>
        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={book.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avancement de l’étape en cours">
          <div className="h-full rounded-full bg-[var(--amber)]" style={{ width: `${Math.max(4, book.progress)}%` }} />
        </div>
        <dl className="mt-7 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-[14px] text-[#cfcfc8]">Appels racontés</dt>
            <dd className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em]">{book.calls.length}</dd>
          </div>
          <div>
            <dt className="text-[14px] text-[#cfcfc8]">Récits écrits</dt>
            <dd className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em]">{book.chapters.length}</dd>
          </div>
          <div>
            <dt className="text-[14px] text-[#cfcfc8]">Dernier appel</dt>
            <dd className="mt-1 text-[17px] font-bold leading-snug">{lastCall ? day(lastCall.date) : "Pas encore d’appel"}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[15px] text-[#cfcfc8]">
          {book.scheduleText ? `Loomina appelle ${name} ${book.scheduleText}.` : `${name} appelle Loomina quand il ou elle le souhaite.`}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="card p-6 md:p-8" aria-labelledby={`recits-${book.id}`}>
          <h3 id={`recits-${book.id}`} className="t-heading">
            Les récits
          </h3>
          {book.chapters.length === 0 ? (
            <p className="t-body mt-2">Le premier récit arrivera après le premier vrai appel de {name}.</p>
          ) : (
            <>
              <p className="t-body mt-1">
                {book.shared
                  ? `${name} a choisi de vous laisser lire ses récits.`
                  : `Vous voyez les titres. Le texte reste entre ${name} et Loomina tant qu’il ou elle n’a pas choisi de le partager : cela se règle dans son espace auteur.`}
              </p>
              <ul className="mt-5 divide-y divide-[var(--line-soft)]">
                {book.chapters.map((c) => (
                  <li key={c.number} className="py-4">
                    {c.text ? (
                      <details>
                        <summary className="flex cursor-pointer items-baseline justify-between gap-4">
                          <span className="font-serif text-[20px] italic">{c.title ?? `Récit ${c.number}`}</span>
                          <span className="shrink-0 text-[14px] text-[var(--ink-3)]">{day(c.date)}</span>
                        </summary>
                        <div className="book-text mt-4" lang="fr">
                          {paragraphs(c.text).map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-serif text-[20px] italic">{c.title ?? `Récit ${c.number}`}</span>
                        <span className="shrink-0 text-[14px] text-[var(--ink-3)]">{day(c.date)}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <Suggest book={book} onAdded={(openQuestions) => onChange({ ...book, openQuestions })} onUnauthorized={onUnauthorized} />
      </div>
    </div>
  );
}

/**
 * L'espace famille : pour la personne qui a offert le livre.
 * Elle suit l'avancement, voit les récits arriver, et peut souffler un souvenir.
 * `onNotFound` : ce numéro n'a offert aucun livre.
 */
export default function FamilySpace({ onLogout, onUnauthorized, onNotFound }: { onLogout: () => void; onUnauthorized: () => void; onNotFound: () => void }) {
  const [data, setData] = useState<FamilyOverview | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/famille/overview");
      if (res.status === 401) return onUnauthorized();
      if (res.status === 404) return onNotFound();
      if (!res.ok) throw new Error();
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [onUnauthorized, onNotFound]);

  useEffect(() => {
    // Chargement initial depuis l'API : le setState arrive après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="page-top section-b w-full">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[16px] font-semibold text-[var(--ink-3)]">Espace famille</p>
            <h1 className="t-display mt-2">{data?.giverFirstName ? `Bonjour ${data.giverFirstName}` : "Bonjour"}</h1>
          </div>
          <Button onClick={onLogout} variant="secondary" className="self-start md:self-auto">
            Se déconnecter
          </Button>
        </header>

        <div className="mt-8 flex flex-col gap-10">
          {failed && (
            <p role="alert" className="rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[16px] font-medium text-[var(--danger)]">
              Nous n’arrivons pas à charger votre espace pour le moment.{" "}
              <button type="button" onClick={load} className="underline underline-offset-4">
                Réessayer
              </button>
            </p>
          )}
          {!data && !failed && (
            <p className="t-body flex items-center gap-3" role="status">
              <span className="spinner" aria-hidden="true" />
              Nous ouvrons votre espace…
            </p>
          )}
          {data?.books.map((book) => (
            <Book
              key={book.id}
              book={book}
              onChange={(b) => setData((d) => (d ? { ...d, books: d.books.map((x) => (x.id === b.id ? b : x)) } : d))}
              onUnauthorized={onUnauthorized}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
