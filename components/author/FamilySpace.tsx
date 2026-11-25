"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import BookCopies from "./BookCopies";
import Companion from "./Companion";
import FamilyOnboarding, { type FamilySetup } from "./FamilyOnboarding";
import type { ProjectOverview } from "./types";
import type { Weave } from "@/lib/loomina/weave";

/** Le livre après « terminé », vu par la famille. */
const DELIVERY_LABEL: Record<string, string> = {
  completed: "Le récit est terminé, le livre est en relecture",
  reviewed: "Le livre est relu",
  printing: "Le livre est à l’impression",
  shipped: "Le livre est en route",
  delivered: "Le livre est arrivé",
};

interface FamilyBook {
  id: string;
  narratorFirstName: string | null;
  title: string | null;
  phase?: 1 | 2 | 3 | 4;
  phaseLabel: string;
  /** Mémo, côté famille (absent d'une ancienne réponse). */
  weave?: Weave;
  /** Mots écrits, seulement si le narrateur partage ses récits. */
  words?: number | null;
  /** L'accueil de l'espace famille n'a pas encore été vu. */
  welcome?: boolean;
  /** Préparer le premier appel : possible tant qu'aucun appel n'a eu lieu. */
  setup?: FamilySetup | null;
  setBy?: "giver" | "author" | null;
  progress: number;
  completed: boolean;
  delivery?: { stage: "writing" | "completed" | "reviewed" | "printing" | "shipped" | "delivered"; tracking: { number: string; url: string } | null };
  scheduleText: string | null;
  /** Le narrateur a choisi de laisser lire ses récits. */
  shared: boolean;
  calls: { date: string; minutes: number | null; title?: string | null }[];
  chapters: { number: number; title: string | null; date: string; text: string | null }[];
  openQuestions: string[];
  /** Exemplaires en plus déjà commandés pour ce livre. */
  extraCopies?: number;
}

interface FamilyOverview {
  giverFirstName: string | null;
  /** Espace famille de test (07 12 34 56 78) : rien n'est enregistré. */
  essai?: boolean;
  books: FamilyBook[];
}

const STEPS = [
  { stage: "completed", label: "Terminé" },
  { stage: "reviewed", label: "Relu" },
  { stage: "printing", label: "À l’impression" },
  { stage: "shipped", label: "Expédié" },
  { stage: "delivered", label: "Reçu" },
] as const;
const ORDER = ["writing", "completed", "reviewed", "printing", "shipped", "delivered"];

/** Ce que Mémo a besoin de savoir du livre, sans rien de ce que le narrateur n'a pas partagé. */
function asProject(book: FamilyBook): ProjectOverview {
  return {
    phase: book.phase ?? 1,
    phaseLabel: book.phaseLabel,
    progress: book.progress,
    completed: book.completed,
    nextTopic: null,
    scheduleText: book.scheduleText,
    chapters: book.chapters.length,
    words: book.words ?? 0,
    weave: book.weave,
    timeline: [],
    family: [],
    themes: [],
    openQuestions: book.openQuestions,
    calls: book.calls.map((c) => ({ date: c.date, minutes: c.minutes, title: c.title ?? null, summary: null })),
  };
}

const day = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Le texte d'un récit : des paragraphes, sans les marques de mise en forme. */
function paragraphs(markdown: string): string[] {
  return markdown
    .split(/\n{2,}/)
    .map((p) => p.replace(/^#+\s*/gm, "").replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1").trim())
    .filter(Boolean);
}

/** Poser une question ou souffler un souvenir, que Loomina abordera à un prochain appel. */
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
        Poser une question ou souffler un souvenir
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

/** Le livre après « terminé » : les cinq étapes, en lecture seule. */
function Delivery({ book, name }: { book: FamilyBook; name: string }) {
  const stage = book.delivery && book.delivery.stage !== "writing" ? book.delivery.stage : "completed";
  const reached = ORDER.indexOf(stage);
  return (
    <section className="card p-6 md:p-8" aria-labelledby={`envoi-${book.id}`}>
      <h3 id={`envoi-${book.id}`} className="t-heading">
        {DELIVERY_LABEL[stage]}
      </h3>
      <p className="t-body mt-1">Le récit de {name} est complet. Vous êtes prévenu par SMS à chaque étape.</p>
      <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Les étapes du livre">
        {STEPS.map((s) => {
          const done = ORDER.indexOf(s.stage) <= reached;
          const current = s.stage === stage;
          return (
            <li key={s.stage} aria-current={current ? "step" : undefined} className="min-w-0">
              <span className={`block h-1.5 rounded-full ${done ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`} />
              <span className={`mt-2 block truncate text-[13.5px] sm:text-[14.5px] ${current ? "font-bold text-[var(--ink)]" : done ? "font-semibold text-[var(--ink-2)]" : "text-[var(--ink-3)]"}`}>{s.label}</span>
            </li>
          );
        })}
      </ol>
      {book.delivery?.tracking && (stage === "shipped" || stage === "delivered") && (
        <p className="t-body mt-5">
          Numéro de suivi : <b className="tabular-nums">{book.delivery.tracking.number}</b>
          {" · "}
          <a href={book.delivery.tracking.url} target="_blank" rel="noreferrer" className="link font-semibold">
            Suivre le colis
          </a>
        </p>
      )}
    </section>
  );
}

/** Avant le premier appel : ce que la famille a préparé, modifiable jusqu'à l'appel. */
function FirstCall({ book, name, onEdit }: { book: FamilyBook; name: string; onEdit: () => void }) {
  const setup = book.setup!;
  const ready = book.setBy === "giver";
  return (
    <section className="card p-6 md:p-8" aria-labelledby={`premier-${book.id}`}>
      <h3 id={`premier-${book.id}`} className="t-heading">
        Le premier appel de {name}
      </h3>
      {ready ? (
        <dl className="mt-4 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-3">
          <div>
            <dt className="text-[14px] font-bold text-[var(--ink-3)]">Prénom</dt>
            <dd className="mt-0.5 font-semibold">
              {setup.firstName || name}
              {setup.firstNamePhonetic && <span className="font-normal text-[var(--ink-3)]"> · se dit « {setup.firstNamePhonetic} »</span>}
            </dd>
          </div>
          <div>
            <dt className="text-[14px] font-bold text-[var(--ink-3)]">Loomina lui dit</dt>
            <dd className="mt-0.5 font-semibold">{setup.politeness === "tu" ? "Tu" : "Vous"}</dd>
          </div>
          <div>
            <dt className="text-[14px] font-bold text-[var(--ink-3)]">À éviter</dt>
            <dd className="mt-0.5 font-semibold">{setup.sensitiveTopics.length ? setup.sensitiveTopics.join(", ") : "Rien de particulier"}</dd>
          </div>
        </dl>
      ) : (
        <p className="t-body mt-1">Dites à Loomina comment s’adresser à {name} et les sujets à éviter. Loomina n’aura pas à le lui demander.</p>
      )}
      <button type="button" onClick={onEdit} className="link mt-4 text-[16px]">
        {ready ? "Modifier" : "Préparer le premier appel"}
      </button>
    </section>
  );
}

function Book({ book, giverFirstName, onChange, onReload, onUnauthorized }: { book: FamilyBook; giverFirstName: string | null; onChange: (b: FamilyBook) => void; onReload: () => void; onUnauthorized: () => void }) {
  const name = book.narratorFirstName ?? "votre proche";
  const lastCall = book.calls[0];
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {book.welcome && <FamilyOnboarding projectId={book.id} giverFirstName={giverFirstName} narrator={book.narratorFirstName} setup={book.setup ?? null} onDone={onReload} onUnauthorized={onUnauthorized} />}
      {editing && book.setup && (
        <FamilyOnboarding
          projectId={book.id}
          giverFirstName={giverFirstName}
          narrator={book.narratorFirstName}
          setup={book.setup}
          startAt={2}
          onDone={() => {
            setEditing(false);
            onReload();
          }}
          onUnauthorized={onUnauthorized}
        />
      )}

      {book.completed && <Delivery book={book} name={name} />}
      {book.weave && <Companion project={asProject(book)} narrator={name} skipIntro={Boolean(book.welcome)} />}
      {book.setup && !book.welcome && <FirstCall book={book} name={name} onEdit={() => setEditing(true)} />}

      <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <section className="card p-6 md:p-8" aria-labelledby={`suivi-${book.id}`}>
          <h3 id={`suivi-${book.id}`} className="t-heading">
            {book.completed ? "Le récit" : book.phaseLabel}
          </h3>
          <dl className="mt-5 grid grid-cols-3 gap-4">
            <div>
              <dt className="text-[14px] text-[var(--ink-3)]">Appels</dt>
              <dd className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{book.calls.length}</dd>
            </div>
            <div>
              <dt className="text-[14px] text-[var(--ink-3)]">Récits</dt>
              <dd className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{book.chapters.length}</dd>
            </div>
            <div>
              <dt className="text-[14px] text-[var(--ink-3)]">Dernier appel</dt>
              <dd className="mt-1 text-[16px] font-bold leading-snug">{lastCall ? day(lastCall.date) : "Pas encore"}</dd>
            </div>
          </dl>
          {!book.completed && (
            <p className="t-body mt-5">
              {book.scheduleText ? `Loomina appelle ${name} ${book.scheduleText}.` : `${name} appelle Loomina quand bon lui semble, au 01 59 16 93 57.`}
            </p>
          )}
        </section>

        {!book.completed && <Suggest book={book} onAdded={(openQuestions) => onChange({ ...book, openQuestions })} onUnauthorized={onUnauthorized} />}
      </div>

      <section className="card p-6 md:p-8" aria-labelledby={`recits-${book.id}`}>
        <h3 id={`recits-${book.id}`} className="t-heading">
          Les récits
        </h3>
        {book.chapters.length === 0 ? (
          <p className="t-body mt-2">Le premier récit arrivera après le premier appel de {name}.</p>
        ) : (
          <>
            <p className="t-body mt-1">
              {book.shared
                ? `${name} a choisi de vous laisser lire ses récits.`
                : `Vous voyez le livre avancer. Les récits restent entre ${name} et Loomina tant que ${name} n’a pas choisi de les partager, depuis son espace auteur.`}
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

      <BookCopies extraCopies={book.extraCopies ?? 0} narrator={book.narratorFirstName} endpoint="/api/famille/exemplaires" projectId={book.id} onUnauthorized={onUnauthorized} />
    </div>
  );
}

/**
 * L'espace famille : pour la personne qui a offert le livre.
 * Elle suit le livre et Mémo, prépare le premier appel, voit les récits
 * arriver (si le narrateur partage), pose une question ou souffle un souvenir,
 * et peut commander des exemplaires en plus.
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

  // Comme l'espace auteur : le menu et le pied de page du site s'effacent (voir globals.css).
  useEffect(() => {
    document.documentElement.dataset.space = "famille";
    return () => {
      delete document.documentElement.dataset.space;
    };
  }, []);

  // Un seul livre : on dit de qui il est dans le titre. Plusieurs : chacun a le sien.
  const single = data?.books.length === 1 ? data.books[0] : null;
  // Un seul accueil à la fois, même avec plusieurs livres offerts.
  const firstWelcome = data?.books.find((b) => b.welcome)?.id;

  return (
    <div className="author-space w-full pb-10 pt-[5.9rem] md:pt-[6.5rem]">
      {/* La même barre flottante que l'espace auteur, signée « FAMILLE ». */}
      <header className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/80 pl-5 pr-2.5 shadow-[var(--shadow-bar)] backdrop-blur-xl backdrop-saturate-150 md:h-[68px] md:pl-6">
          <Link href="/" className="flex shrink-0 flex-col" aria-label="Loomina, espace famille. Retour au site">
            <span className="relative block h-[26px] w-[91px] md:h-[28px] md:w-[98px]">
              <Image src="/header-logo-bleu.png" alt="" fill className="object-contain object-left" priority sizes="98px" />
            </span>
            <span aria-hidden="true" className="mt-[5px] flex items-center gap-2">
              <span className="h-px flex-1 bg-[var(--amber)]" />
              <span className="-mr-[0.32em] text-[9.5px] font-bold uppercase leading-none tracking-[0.32em] text-[var(--amber-ink)]">Famille</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Se déconnecter"
            className="press inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--canvas)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="hidden sm:inline">Se déconnecter</span>
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
          <h1 className="text-[clamp(1.6rem,2.6vw,2rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">{data?.giverFirstName ? `Bonjour ${data.giverFirstName}` : "Bonjour"}</h1>
          {single && <p className="text-[15px] font-semibold text-[var(--ink-3)]">{single.title || `Le livre de ${single.narratorFirstName ?? "votre proche"}`}</p>}
        </header>

        <div className="mt-4 flex flex-col gap-10">
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
            <div key={book.id}>
              {!single && <h2 className="mb-3 text-[19px] font-extrabold tracking-[-0.02em]">{book.title || `Le livre de ${book.narratorFirstName ?? "votre proche"}`}</h2>}
              <Book
                book={{ ...book, welcome: book.welcome && book.id === firstWelcome }}
                giverFirstName={data.giverFirstName}
                onChange={(b) => setData((d) => (d ? { ...d, books: d.books.map((x) => (x.id === b.id ? { ...b, welcome: x.welcome } : x)) } : d))}
                onReload={load}
                onUnauthorized={onUnauthorized}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
