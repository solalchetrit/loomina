"use client";

import { useEffect, useState } from "react";
import { LOOMINA_CONFIG } from "@/config/loomina";

interface Chapter {
  number: number;
  title: string;
  content: string;
  date: string;
}

interface Book {
  id: string;
  title: string;
}

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; book: Book | null; chapters: Chapter[] };

/** Le manuscrit est en Markdown léger : on garde les paragraphes, on retire les dièses des titres. */
function paragraphs(md: string): string[] {
  return md
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").trim())
    .filter(Boolean);
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Le livre en cours : tous les chapitres, en entier, dans l'ordre.
 * Avant, seul le dernier chapitre apparaissait, coupé à 320 caractères.
 */
export default function LiveBook({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/stories");
        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (!res.ok) throw new Error("Nous n’arrivons pas à lire votre livre pour le moment. Réessayez dans un instant.");
        const rows: {
          book_id: string;
          book_title: string;
          story_id: number | null;
          story_title: string | null;
          story_content: string | null;
          story_date: string | null;
        }[] = await res.json();
        if (cancelled) return;

        if (!rows.length) {
          setState({ kind: "ready", book: null, chapters: [] });
          return;
        }
        const book = { id: rows[0].book_id, title: rows[0].book_title };
        const chapters = rows
          .filter((r) => r.story_id !== null)
          .map((r) => ({ number: r.story_id as number, title: r.story_title ?? `Chapitre ${r.story_id}`, content: r.story_content ?? "", date: r.story_date ?? "" }));
        setState({ kind: "ready", book, chapters });
      } catch (err) {
        if (!cancelled) setState({ kind: "error", message: err instanceof Error ? err.message : "Erreur de chargement." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  if (state.kind === "loading") {
    return (
      <p className="t-body flex items-center gap-3" role="status">
        <span className="spinner" aria-hidden="true" />
        Nous ouvrons votre livre…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <p role="alert" className="border-l-2 border-[var(--danger)] pl-4 font-sans text-[16px] text-[var(--danger)]">
        {state.message}
      </p>
    );
  }

  const { book, chapters } = state;

  if (!book || chapters.length === 0) {
    return (
      <div className="rule-top max-w-2xl pt-8">
        <p className="t-eyebrow">Votre livre</p>
        <h2 className="t-title mt-3">{book?.title ?? "Votre histoire"}</h2>
        <p className="t-lead mt-6">
          Aucun chapitre pour le moment. Tout commence par un appel : composez le{" "}
          <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="link whitespace-nowrap font-semibold">
            {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
          </a>{" "}
          depuis ce numéro, et Loomina vous accueillera par votre prénom.
        </p>
        <p className="t-body mt-4">
          Le premier chapitre apparaîtra ici quelques minutes après l’appel. Parlez de ce que vous voulez, Loomina vous guidera.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="rule-top pt-8">
        <p className="t-eyebrow">Votre livre</p>
        <h2 className="t-title mt-3">{book.title}</h2>
        <p className="t-body mt-4">
          {chapters.length === 1 ? "Un chapitre" : `${chapters.length} chapitres`} pour l’instant. Pour corriger ou compléter un
          passage, dites-le à Loomina à votre prochain appel.
        </p>
      </div>

      <nav aria-label="Sommaire" className="mt-10">
        <p className="t-eyebrow !text-[var(--ink-3)]">Sommaire</p>
        <ol className="rule-top mt-3">
          {chapters.map((c) => (
            <li key={c.number} className="border-b border-[var(--rule)]">
              <a href={`#chapitre-${c.number}`} className="flex items-baseline gap-4 py-3 font-sans text-[17px] text-[var(--ink)] hover:underline underline-offset-4">
                <span className="t-numeral w-8 shrink-0">{c.number}</span>
                <span className="flex-1">{c.title}</span>
                <span className="t-small hidden sm:inline">{c.date && formatDate(c.date)}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-16 space-y-20">
        {chapters.map((c) => (
          <article key={c.number} id={`chapitre-${c.number}`} className="scroll-mt-28">
            <p className="text-center font-sans text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--gold-ink)]">Chapitre {c.number}</p>
            <h3 className="mt-3 text-center font-serif text-[clamp(1.6rem,3vw,2.2rem)] italic leading-tight text-[var(--ink)]">{c.title}</h3>
            <span aria-hidden="true" className="gold-dash mx-auto mt-6" />
            <div className="book-text mx-auto mt-8 max-w-[38rem]" lang="fr">
              {paragraphs(c.content).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {c.date && <p className="t-small mt-8 text-center">Écrit le {formatDate(c.date)}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
