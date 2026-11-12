"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import ChapterEditor from "@/components/author/ChapterEditor";

interface BookPlan {
  parts: { title: string; chapters: number[] }[];
  chapter_count: number;
}

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
  const [plan, setPlan] = useState<BookPlan | null>(null);
  const [byPeriod, setByPeriod] = useState(false);
  const [planStatus, setPlanStatus] = useState<"idle" | "working" | "error">("idle");
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/book-plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.plan) setPlan(d.plan);
      })
      .catch(() => {});
  }, []);

  const arrange = async () => {
    setPlanStatus("working");
    setPlanError(null);
    try {
      const res = await fetch("/api/user/book-plan", { method: "POST" });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Le rangement n’a pas abouti.");
      setPlan(data.plan);
      setByPeriod(true);
      setPlanStatus("idle");
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Le rangement n’a pas abouti.");
      setPlanStatus("error");
    }
  };

  const updateChapter = (number: number, content: string) =>
    setState((s) => (s.kind === "ready" ? { ...s, chapters: s.chapters.map((c) => (c.number === number ? { ...c, content } : c)) } : s));

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
      <p role="alert" className="rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[16px] font-medium text-[var(--danger)]">
        {state.message}
      </p>
    );
  }

  const { book, chapters } = state;
  const byNumber = new Map(chapters.map((c) => [c.number, c]));
  // Vue par thèmes : les parties du plan, dans l’ordre de lecture proposé.
  const sections =
    byPeriod && plan
      ? plan.parts.map((p) => ({ title: p.title as string | null, chapters: p.chapters.map((n) => byNumber.get(n)).filter((c): c is Chapter => !!c) }))
      : [{ title: null as string | null, chapters }];
  const placed = new Set(sections.flatMap((s) => s.chapters.map((c) => c.number)));
  const unplaced = chapters.filter((c) => !placed.has(c.number));
  if (unplaced.length) sections.push({ title: "Nouveaux chapitres", chapters: unplaced });
  const stale = plan && plan.chapter_count !== chapters.length;

  if (!book || chapters.length === 0) {
    return (
      <div className="card max-w-3xl p-7 md:p-10">
        <p className="t-eyebrow">Votre livre</p>
        <h2 className="t-title mt-3">{book?.title ?? "Votre histoire"}</h2>
        <p className="t-lead mt-5">
          Aucun chapitre pour le moment. Tout commence par un appel : composez le{" "}
          <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap font-semibold">
            {SITE.phoneDisplay}
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
      <div className="card p-7 md:p-10">
        <p className="t-eyebrow">Votre livre</p>
        <h2 className="t-title mt-3">{book.title}</h2>
        <p className="t-body mt-4">
          {chapters.length === 1 ? "Un chapitre" : `${chapters.length} chapitres`} pour l’instant. Pour corriger un passage, utilisez
          « Corriger ce chapitre » sous le chapitre, ou dites-le à Loomina au prochain appel.
        </p>
        {chapters.length >= 2 && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-full bg-[var(--surface-2)] p-1" role="group" aria-label="Ordre des chapitres">
              <button
                type="button"
                aria-pressed={!byPeriod}
                onClick={() => setByPeriod(false)}
                className={`press min-h-11 rounded-full px-4 text-[15px] font-bold ${!byPeriod ? "bg-[var(--ink)] text-white" : ""}`}
              >
                Ordre des appels
              </button>
              <button
                type="button"
                aria-pressed={byPeriod}
                onClick={() => (plan ? setByPeriod(true) : arrange())}
                className={`press min-h-11 rounded-full px-4 text-[15px] font-bold ${byPeriod ? "bg-[var(--ink)] text-white" : ""}`}
              >
                Par thèmes
              </button>
            </div>
            {plan && (stale || byPeriod) && (
              <button type="button" onClick={arrange} disabled={planStatus === "working"} className="link text-[15px]">
                {planStatus === "working" ? "Rangement en cours…" : stale ? "Ranger aussi les nouveaux chapitres" : "Ranger à nouveau"}
              </button>
            )}
            {!plan && planStatus === "working" && (
              <p className="t-small flex items-center gap-2" role="status">
                <span className="spinner" aria-hidden="true" /> Loomina range vos chapitres…
              </p>
            )}
            {planStatus === "error" && <p className="text-[15px] font-semibold text-[var(--danger)]">{planError}</p>}
          </div>
        )}
        {byPeriod && (
          <p className="t-small mt-3">Le texte des chapitres ne change pas : ils sont seulement regroupés par thème. C’est l’ordre proposé pour l’impression.</p>
        )}
      </div>

      <nav aria-label="Sommaire" className="card mt-4 px-5 py-4 md:px-7">
        <p className="pt-2 text-[15px] font-bold text-[var(--ink-3)]">Sommaire</p>
        {sections.map((section) => (
        <div key={section.title ?? "tous"}>
        {section.title && <p className="mt-4 text-[15px] font-bold text-[var(--amber-ink)]">{section.title}</p>}
        <ol className="mt-2 divide-y divide-[var(--line-soft)]">
          {section.chapters.map((c) => (
            <li key={c.number}>
              <a href={`#chapitre-${c.number}`} className="flex items-baseline gap-4 py-3 text-[17px] font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
                <span className="w-8 shrink-0 font-bold text-[var(--amber-ink)]">{c.number}</span>
                <span className="flex-1">{c.title}</span>
                <span className="t-small hidden sm:inline">{c.date && formatDate(c.date)}</span>
              </a>
            </li>
          ))}
        </ol>
        </div>
        ))}
      </nav>

      <div className="mt-4 space-y-4">
        {sections.flatMap((section) => [
          ...(section.title
            ? [
                <h3 key={`partie-${section.title}`} className="pt-6 text-center font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] italic text-[var(--ink-2)]">
                  {section.title}
                </h3>,
              ]
            : []),
          ...section.chapters.map((c) => (
          <article key={c.number} id={`chapitre-${c.number}`} className="card scroll-mt-32 px-6 py-12 sm:px-12 md:py-16">
            <p className="text-center text-[14px] font-bold text-[var(--amber-ink)]">Chapitre {c.number}</p>
            <h3 className="mt-2 text-center font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-normal italic leading-tight tracking-normal text-[var(--ink)]">{c.title}</h3>
            <div className="book-text mx-auto mt-8 max-w-[38rem]" lang="fr">
              {paragraphs(c.content).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {c.date && <p className="t-small mt-8 text-center">Écrit le {formatDate(c.date)}</p>}
            <ChapterEditor number={c.number} content={c.content} onSaved={(content) => updateChapter(c.number, content)} onUnauthorized={onUnauthorized} />
          </article>
          )),
        ])}
      </div>
    </div>
  );
}
