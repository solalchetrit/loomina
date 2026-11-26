"use client";

import LogoMotion from "@/components/brand/LogoMotion";

import { Fragment, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import { More, PAGE, PAGE_KICKER, PAGE_TITLE, ReaderLayout, Toc } from "./Reader";
import { MEMO_AGES } from "@/lib/loomina/memo";
import Memo from "@/components/brand/Memo";
import type { MemoAge } from "@/components/brand/Memo";

interface BookChapter {
  number: number;
  title: string;
  part: string;
  content: string;
  sources: number[];
}

/** Ce qui entoure les chapitres : titre, dédicace, avant-propos, remerciements, texte du dos. */
interface BookPieces {
  title: string;
  subtitle: string | null;
  dedication: string | null;
  preface: string | null;
  thanks: string | null;
  back_cover: string | null;
}

interface Edition {
  chapters: BookChapter[];
  sourceCount: number;
  at: string;
  pieces?: BookPieces | null;
  /** La dernière étape finie que ce livre raconte (absent : livre d'avant les étapes). */
  through?: number | null;
}

interface Payload {
  edition: Edition | null;
  running: { done: number; total: number; status: string } | null;
  failed: boolean;
  sourceCount: number;
  /** L'étape en cours (1 à 4), la dernière étape finie (0 : aucune), et si le récit est complet. */
  stage?: { current: number; through: number; complete: boolean; progress?: number } | null;
  error?: string;
}

type Block = { kind: "h" | "p"; text: string };

/** Le texte d'un chapitre : des paragraphes, et les intertitres (« ## … » ou une ligne en gras seule). */
function blocks(md: string): Block[] {
  return md
    .split(/\n\s*\n/)
    .map((raw): Block | null => {
      const t = raw.trim();
      if (!t) return null;
      const bold = /^\*\*([^*]+)\*\*$/.exec(t);
      if (/^#+\s/.test(t) || bold) return { kind: "h", text: (bold ? bold[1] : t.replace(/^#+\s*/, "")).replace(/[*_]/g, "").trim() };
      return { kind: "p", text: t.replace(/^#+\s*/gm, "") };
    })
    .filter((b): b is Block => b !== null);
}

/** L'italique du texte (*…*), comme dans le livre imprimé. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    part.length > 2 && part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : <Fragment key={i}>{part.replace(/\*\*/g, "")}</Fragment>
  );
}

function BookText({ text }: { text: string }) {
  return (
    <div className="book-text mx-auto mt-7 max-w-[38rem]" lang="fr">
      {blocks(text).map((b, i) =>
        b.kind === "h" ? (
          <h4 key={i} className="mb-2 mt-8 text-left font-serif text-[1.14rem] font-bold leading-snug tracking-normal text-[var(--ink)] first:mt-0" style={{ hyphens: "manual" }}>
            {b.text}
          </h4>
        ) : (
          <p key={i}>{inline(b.text)}</p>
        )
      )}
    </div>
  );
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Le livre composé : les chapitres ne suivent pas les appels. Loomina relit
 * tout ce qui a été raconté, range les souvenirs dans l'ordre de la vie et
 * ne garde qu'une fois ce qui a été dit plusieurs fois.
 *
 * Le livre s'écrit à la fin de chaque étape de Mémo (Solal, 26/11/2026) :
 * l'auteur le lit dès qu'il a fini une étape, et il s'allonge à chaque étape finie.
 */
export default function ComposedBook({ onUnauthorized, top, aside, after }: { onUnauthorized: () => void; top?: ReactNode; aside?: ReactNode; /** Sous la carte du livre, dans la colonne de gauche. */ after?: ReactNode }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/book");
        if (res.status === 401) return onUnauthorized();
        const body: Payload = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nous n’arrivons pas à lire votre livre pour le moment.");
        if (cancelled) return;
        setData(body);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur de chargement.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, onUnauthorized]);

  // Pendant la composition, on revient voir toutes les cinq secondes.
  useEffect(() => {
    if (!data?.running) return;
    const t = setTimeout(() => setRefresh((r) => r + 1), 5000);
    return () => clearTimeout(t);
  }, [data]);

  const compose = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/user/book", { method: "POST" });
      if (res.status === 401) return onUnauthorized();
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof body.error === "string" ? body.error : "La composition n’a pas pu démarrer.");
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "La composition n’a pas pu démarrer.");
    } finally {
      setStarting(false);
    }
  };

  // Le PDF se fabrique à la demande (quelques secondes avec les photos) : on montre l'attente.
  const download = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/book/pdf");
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Le PDF n’a pas pu être préparé.");
      }
      const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? "Mon-livre.pdf";
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le PDF n’a pas pu être préparé.");
    } finally {
      setDownloading(false);
    }
  };

  if (!data && !error) {
    return (
      <ReaderLayout side={<>{top}{aside}{after}</>}>
        <p className="flex items-center gap-3 text-[15px] text-[var(--ink-2)]" role="status">
          <span className="spinner" aria-hidden="true" />
          Nous ouvrons votre livre…
        </p>
      </ReaderLayout>
    );
  }

  const edition = data?.edition ?? null;
  const running = data?.running ?? null;
  const stage = data?.stage ?? null;
  const canCompose = (data?.sourceCount ?? 0) >= 1 && (!stage || stage.through >= 1);
  const stageName = (n: number) => MEMO_AGES[Math.min(Math.max(n, 1), 4) - 1].stage;
  // Ce que l'auteur lit sous le titre : où s'arrête son livre, et quand viendra la suite.
  const reach = edition?.through ?? stage?.through ?? 0;
  const stageNote = !stage
    ? null
    : stage.complete
      ? null
      : !edition
        ? `Votre livre s’écrit étape par étape. Vous lirez ici la première partie à la fin de l’étape « ${stageName(stage.current)} ».`
        : reach >= 1
          ? `Votre livre va jusqu’à la fin de l’étape « ${stageName(reach)} ». La suite s’écrira à la fin de l’étape « ${stageName(stage.current)} ».`
          : null;

  const pieces = edition?.pieces ?? null;

  const parts: { title: string; chapters: BookChapter[] }[] = [];
  for (const c of edition?.chapters ?? []) {
    const last = parts[parts.length - 1];
    if (last && last.title === c.part) last.chapters.push(c);
    else parts.push({ title: c.part, chapters: [c] });
  }

  const small = "text-[13.5px] leading-snug text-[var(--ink-3)]";
  const toc = [
    ...(pieces?.preface ? [{ title: null, items: [{ href: "#livre-avant-propos", number: "·", title: "Avant-propos" }] }] : []),
    ...parts.map((part) => ({ title: part.title, items: part.chapters.map((c) => ({ href: `#livre-${c.number}`, number: c.number, title: c.title })) })),
    ...(pieces?.thanks ? [{ title: " ", items: [{ href: "#livre-remerciements", number: "·", title: "Remerciements" }] }] : []),
  ];

  return (
    <ReaderLayout
      side={
        <>
          {top}
          <div className="card p-5">
            {pieces ? (
              <>
                <h2 className="font-serif text-[1.5rem] font-normal italic leading-tight tracking-normal text-[var(--ink)]">{pieces.title}</h2>
                {pieces.subtitle && <p className="mt-1 font-serif text-[15px] text-[var(--ink-3)]">{pieces.subtitle}</p>}
              </>
            ) : (
              <h2 className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">Votre livre</h2>
            )}

            {aside && <div className="mt-5">{aside}</div>}

            {running ? (
              <p className="mt-4 flex items-center gap-3 text-[14px] font-semibold leading-snug text-[var(--ink-2)]" role="status">
                {/* L'Étincelle écrit : l'attente devient un moment (le rond qui tourne reste si le kit ne charge pas). */}
                <LogoMotion name="persoEcrit" mode="loop" className="h-12 w-12 shrink-0">
                  <span className="flex h-full w-full items-center justify-center">
                    <span className="spinner" />
                  </span>
                </LogoMotion>
                {running.total
                  ? running.done >= running.total
                    ? "Loomina relit votre livre pour les dernières retouches."
                    : `Loomina écrit votre livre : chapitre ${Math.min(running.done + 1, running.total)} sur ${running.total}.`
                  : "Loomina prépare le plan du livre. Comptez quelques minutes."}
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {data?.failed && canCompose && (
                  <Button onClick={compose} loading={starting} className="!min-h-11 w-full !text-[15px]">
                    Réessayer
                  </Button>
                )}
                {stageNote && edition && <p className="text-[14.5px] leading-snug text-[var(--ink-2)]">{stageNote}</p>}
                {edition && (
                  <Button onClick={download} loading={downloading} variant="secondary" className="!min-h-11 w-full !px-4 !text-[15px]">
                    {!downloading && (
                      <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
                      </svg>
                    )}
                    {downloading ? "Préparation du PDF…" : "Télécharger en PDF"}
                  </Button>
                )}
                {edition && (
                  <p className={small}>
                    Mis à jour le {formatDate(edition.at)}
                  </p>
                )}
              </div>
            )}
            {data?.failed && !running && <p className="mt-2 text-[14px] font-semibold text-[var(--danger)]">La dernière mise à jour n’a pas abouti. Vous pouvez la relancer.</p>}
            {error && (
              <p role="alert" className="mt-2 text-[14px] font-semibold text-[var(--danger)]">
                {error}
              </p>
            )}
            <More label="Comment ce livre est composé ?">
              Loomina relit tout ce que vous avez raconté, range vos souvenirs dans l’ordre de votre vie et ne garde qu’une fois ce qui a été dit plusieurs fois. Rien n’est ajouté. Le
              livre s’écrit à la fin de chaque étape : Loomina a alors toute une période de votre vie sous les yeux. Pour corriger un passage, ouvrez l’appel concerné dans « Mes appels » : le reste ne change pas.
            </More>
            {edition && <Toc label="Sommaire" parts={toc} />}
          </div>
          {after}
        </>
      }
    >
      {/* Pas encore de livre : Mémo attend avec l'auteur, et la page dit quand le livre arrivera. */}
      {!edition && stage && !stage.complete && (
        <section aria-label="Votre livre" className={`${PAGE} text-center`}>
          <div className="mx-auto w-[200px] max-w-full" aria-hidden="true">
            <Memo age={Math.min(Math.max(stage.current, 1), 4) as MemoAge} clip={running ? "rest" : "idle"} size={200} />
          </div>
          <p className={`${PAGE_KICKER} mt-2`}>
            Étape {stage.current} sur 4 · {stageName(stage.current)}
          </p>
          <h3 className={PAGE_TITLE.replace("italic ", "")}>{running ? "Loomina écrit la première partie de votre livre" : "Votre livre arrive à la fin de cette étape"}</h3>
          <p className="mx-auto mt-4 max-w-[32rem] text-[16.5px] leading-relaxed text-[var(--ink-2)]">
            {running
              ? "Vous avez fini une étape. Votre livre s’écrit avec tout ce que vous avez raconté. Comptez quelques minutes : vous le lirez ici."
              : `Mémo garde chaque souvenir que vous racontez. Quand l’étape « ${stageName(stage.current)} » sera finie, Loomina écrira la première partie de votre livre avec tous ces souvenirs. Vous la lirez ici.`}
          </p>
          {!running && (
            <div className="mx-auto mt-7 max-w-[22rem]">
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--line-soft)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stage.progress ?? 0} aria-label="Avancée de l’étape">
                <div className="h-full rounded-full bg-[var(--amber)]" style={{ width: `${Math.min(100, Math.max(4, stage.progress ?? 0))}%` }} />
              </div>
              <p className="mt-2 text-[14px] text-[var(--ink-3)]">Étape racontée à {Math.min(100, Math.max(0, stage.progress ?? 0))} %</p>
            </div>
          )}
          <p className="mx-auto mt-6 max-w-[32rem] text-[14.5px] text-[var(--ink-3)]">En attendant, le récit de chaque appel se lit dans « Mes appels ».</p>
        </section>
      )}
      {edition && (
        <>
          {pieces?.dedication && (
            <section aria-label="Dédicace" className={PAGE}>
              <p className="mx-auto max-w-[30rem] whitespace-pre-line text-center font-serif text-[1.14rem] italic leading-relaxed text-[var(--ink-2)]">{pieces.dedication}</p>
            </section>
          )}
          {pieces?.preface && (
            <article id="livre-avant-propos" className={PAGE}>
              <h3 className={PAGE_TITLE.replace("italic ", "")}>Avant-propos</h3>
              <BookText text={pieces.preface} />
            </article>
          )}
          {parts.flatMap((part) => [
            <h3 key={`partie-${part.title}`} className="pt-3 text-center font-serif text-[clamp(1.25rem,2vw,1.5rem)] italic text-[var(--ink-2)]">
              {part.title}
            </h3>,
            ...part.chapters.map((c) => (
              <article key={c.number} id={`livre-${c.number}`} className={PAGE}>
                <p className={PAGE_KICKER}>Chapitre {c.number}</p>
                <h3 className={PAGE_TITLE}>{c.title}</h3>
                <BookText text={c.content} />
                <p className="mt-5 text-center text-[13.5px] text-[var(--ink-3)]">
                  Tiré de {c.sources.length === 1 ? `l’appel ${c.sources[0]}` : `vos appels ${c.sources.slice(0, -1).join(", ")} et ${c.sources[c.sources.length - 1]}`}
                </p>
              </article>
            )),
          ])}
          {pieces?.thanks && (
            <article id="livre-remerciements" className={PAGE}>
              <h3 className={PAGE_TITLE.replace("italic ", "")}>Remerciements</h3>
              <BookText text={pieces.thanks} />
            </article>
          )}
          {pieces?.back_cover && (
            <section aria-label="Au dos de votre livre" className={PAGE}>
              <p className={PAGE_KICKER}>Au dos de votre livre</p>
              <BookText text={pieces.back_cover} />
            </section>
          )}
        </>
      )}
    </ReaderLayout>
  );
}
