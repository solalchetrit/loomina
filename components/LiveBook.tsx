"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SITE } from "@/config/site";
import ChapterEditor from "@/components/author/ChapterEditor";
import ComposedBook from "@/components/author/ComposedBook";
import { PAGE, PAGE_KICKER, PAGE_TITLE, ReaderLayout, Segmented, Toc } from "@/components/author/Reader";

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
export default function LiveBook({ onUnauthorized, aside }: { onUnauthorized: () => void; aside?: ReactNode }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [plan, setPlan] = useState<BookPlan | null>(null);
  const [byPeriod, setByPeriod] = useState(false);
  // « Le livre » : composé à part des appels. « Appel par appel » : la matière, telle qu’elle a été recueillie.
  const [view, setView] = useState<"livre" | "appels">("appels");
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
          .map((r) => ({ number: r.story_id as number, title: r.story_title ?? `Appel ${r.story_id}`, content: r.story_content ?? "", date: r.story_date ?? "" }));
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
      <p className="flex items-center gap-3 text-[15px] text-[var(--ink-2)]" role="status">
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
  // Vue par périodes : les parties du plan, dans l'ordre de la vie.
  const sections =
    byPeriod && plan
      ? plan.parts.map((p) => ({ title: p.title as string | null, chapters: p.chapters.map((n) => byNumber.get(n)).filter((c): c is Chapter => !!c) }))
      : [{ title: null as string | null, chapters }];
  const placed = new Set(sections.flatMap((s) => s.chapters.map((c) => c.number)));
  const unplaced = chapters.filter((c) => !placed.has(c.number));
  if (unplaced.length) sections.push({ title: "Nouveaux récits", chapters: unplaced });
  const stale = plan && plan.chapter_count !== chapters.length;

  if (!book || chapters.length === 0) {
    return (
      <ReaderLayout side={aside}>
        <div className="card p-6">
          <p className="text-[13px] font-bold text-[var(--amber-ink)]">Votre livre</p>
          <h2 className="mt-0.5 text-[clamp(1.3rem,2vw,1.6rem)] font-extrabold leading-tight tracking-[-0.02em]">{book?.title ?? "Votre histoire"}</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">
            Aucun récit pour le moment. Tout commence par un appel : composez le{" "}
            <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap font-semibold">
              {SITE.phoneDisplay}
            </a>{" "}
            depuis ce numéro, et Loomina vous accueillera par votre prénom.
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-3)]">
            Le récit de votre premier appel apparaîtra ici quelques minutes après. Parlez de ce que vous voulez, Loomina vous guidera.
          </p>
        </div>
      </ReaderLayout>
    );
  }

  const tabs = (
    <Segmented
      label="Façon de lire votre histoire"
      value={view}
      onChange={setView}
      options={[
        { id: "appels", label: "Appel par appel" },
        { id: "livre", label: "Le livre" },
      ]}
    />
  );

  if (view === "livre") return <ComposedBook onUnauthorized={onUnauthorized} top={tabs} aside={aside} />;

  return (
    <ReaderLayout
      side={
        <>
          {tabs}
          <div className="card px-5 py-4">
            <p className="text-[13px] font-bold text-[var(--amber-ink)]">Vos récits, appel par appel</p>
            <h2 className="mt-0.5 text-[19px] font-extrabold leading-tight tracking-[-0.02em]">{book.title}</h2>
            <p className="mt-1.5 text-[14px] leading-snug text-[var(--ink-3)]">
              {chapters.length === 1 ? "Un récit" : `${chapters.length} récits`}, un par appel : la matière de votre livre. Pour corriger un passage, « Corriger ce récit » sous le
              récit, ou dites-le à Loomina.
            </p>
            {chapters.length >= 2 && (
              <div className="mt-3 space-y-2">
                <Segmented
                  label="Ordre des récits"
                  value={byPeriod ? "periodes" : "appels"}
                  onChange={(v) => (v === "appels" ? setByPeriod(false) : plan ? setByPeriod(true) : arrange())}
                  options={[
                    { id: "appels", label: "Ordre des appels" },
                    { id: "periodes", label: "Par périodes" },
                  ]}
                />
                {plan && (stale || byPeriod) && (
                  <button type="button" onClick={arrange} disabled={planStatus === "working"} className="link text-[14px]">
                    {planStatus === "working" ? "Rangement en cours…" : stale ? "Ranger aussi les nouveaux récits" : "Ranger à nouveau"}
                  </button>
                )}
                {!plan && planStatus === "working" && (
                  <p className="flex items-center gap-2 text-[14px] text-[var(--ink-3)]" role="status">
                    <span className="spinner" aria-hidden="true" /> Loomina range vos récits…
                  </p>
                )}
                {planStatus === "error" && <p className="text-[14px] font-semibold text-[var(--danger)]">{planError}</p>}
                {byPeriod && <p className="text-[13px] leading-snug text-[var(--ink-3)]">Le texte des récits ne change pas : seul l’ordre suit votre vie.</p>}
              </div>
            )}
          </div>
          <Toc parts={sections.map((x) => ({ title: x.title, items: x.chapters.map((c) => ({ href: `#chapitre-${c.number}`, number: c.number, title: c.title })) }))} />
          {aside}
        </>
      }
    >
      {sections.flatMap((section) => [
        ...(section.title
          ? [
              <h3 key={`partie-${section.title}`} className="pt-3 text-center font-serif text-[clamp(1.25rem,2vw,1.5rem)] italic text-[var(--ink-2)]">
                {section.title}
              </h3>,
            ]
          : []),
        ...section.chapters.map((c) => (
          <article key={c.number} id={`chapitre-${c.number}`} className={PAGE}>
            <p className={PAGE_KICKER}>
              Appel {c.number}
              {c.date ? ` · ${formatDate(c.date)}` : ""}
            </p>
            <h3 className={PAGE_TITLE}>{c.title}</h3>
            <div className="book-text mx-auto mt-5 max-w-[38rem]" lang="fr">
              {paragraphs(c.content).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ChapterEditor number={c.number} content={c.content} onSaved={(content) => updateChapter(c.number, content)} onUnauthorized={onUnauthorized} />
          </article>
        )),
      ])}
    </ReaderLayout>
  );
}
