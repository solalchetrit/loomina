"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface BookChapter {
  number: number;
  title: string;
  part: string;
  content: string;
  sources: number[];
}

interface Edition {
  chapters: BookChapter[];
  sourceCount: number;
  at: string;
}

interface Payload {
  edition: Edition | null;
  running: { done: number; total: number; status: string } | null;
  failed: boolean;
  sourceCount: number;
  error?: string;
}

function paragraphs(md: string): string[] {
  return md
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^#+\s*/gm, "").trim())
    .filter(Boolean);
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * Le livre composé : les chapitres ne suivent pas les appels. Loomina relit
 * tout ce qui a été raconté, range les souvenirs dans l'ordre de la vie et
 * ne garde qu'une fois ce qui a été dit plusieurs fois.
 */
export default function ComposedBook({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [refresh, setRefresh] = useState(0);

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

  if (!data && !error) {
    return (
      <p className="t-body flex items-center gap-3" role="status">
        <span className="spinner" aria-hidden="true" />
        Nous ouvrons votre livre…
      </p>
    );
  }

  const edition = data?.edition ?? null;
  const running = data?.running ?? null;
  const newCalls = edition && data ? data.sourceCount - edition.sourceCount : 0;
  const canCompose = (data?.sourceCount ?? 0) >= 2;

  const parts: { title: string; chapters: BookChapter[] }[] = [];
  for (const c of edition?.chapters ?? []) {
    const last = parts[parts.length - 1];
    if (last && last.title === c.part) last.chapters.push(c);
    else parts.push({ title: c.part, chapters: [c] });
  }

  return (
    <div>
      <div className="card p-7 md:p-10">
        <p className="t-eyebrow">Votre livre</p>
        <p className="t-body mt-3">
          Ici, les chapitres ne suivent pas vos appels. Loomina relit tout ce que vous avez raconté, range vos souvenirs dans l’ordre de
          votre vie et ne garde qu’une fois ce qui a été dit plusieurs fois. Rien n’est ajouté.
        </p>

        {running ? (
          <p className="t-body mt-5 flex items-center gap-3 font-semibold" role="status">
            <span className="spinner" aria-hidden="true" />
            {running.total
              ? `Loomina écrit votre livre : chapitre ${Math.min(running.done + 1, running.total)} sur ${running.total}. Vous pouvez fermer cette page, il continuera.`
              : "Loomina relit tous vos appels et prépare le plan du livre. Comptez quelques minutes."}
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {canCompose ? (
              <Button onClick={compose} loading={starting}>
                {edition ? "Recomposer mon livre" : "Composer mon livre"}
              </Button>
            ) : (
              <p className="t-small">Le livre pourra être composé à partir de deux appels racontés.</p>
            )}
            {edition && (
              <p className="t-small">
                Composé le {formatDate(edition.at)} à partir de {edition.sourceCount} appels
                {newCalls > 0 ? ` · ${newCalls === 1 ? "un nouvel appel n’y figure" : `${newCalls} nouveaux appels n’y figurent`} pas encore` : ""}.
              </p>
            )}
          </div>
        )}
        {data?.failed && !running && (
          <p className="mt-4 text-[15px] font-semibold text-[var(--danger)]">La dernière composition n’a pas abouti. Vous pouvez la relancer.</p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-[15px] font-semibold text-[var(--danger)]">
            {error}
          </p>
        )}
        {edition && (
          <p className="t-small mt-4">Pour corriger un passage, corrigez-le dans « Appel par appel », puis recomposez le livre.</p>
        )}
      </div>

      {edition && (
        <>
          <nav aria-label="Sommaire du livre" className="card mt-4 px-5 py-4 md:px-7">
            <p className="pt-2 text-[15px] font-bold text-[var(--ink-3)]">Sommaire</p>
            {parts.map((part) => (
              <div key={part.title}>
                <p className="mt-4 text-[15px] font-bold text-[var(--amber-ink)]">{part.title}</p>
                <ol className="mt-2 divide-y divide-[var(--line-soft)]">
                  {part.chapters.map((c) => (
                    <li key={c.number}>
                      <a href={`#livre-${c.number}`} className="flex items-baseline gap-4 py-3 text-[17px] font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
                        <span className="w-8 shrink-0 font-bold text-[var(--amber-ink)]">{c.number}</span>
                        <span className="flex-1">{c.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </nav>

          <div className="mt-4 space-y-4">
            {parts.flatMap((part) => [
              <h3 key={`partie-${part.title}`} className="pt-6 text-center font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] italic text-[var(--ink-2)]">
                {part.title}
              </h3>,
              ...part.chapters.map((c) => (
                <article key={c.number} id={`livre-${c.number}`} className="card scroll-mt-32 px-6 py-12 sm:px-12 md:py-16">
                  <p className="text-center text-[14px] font-bold text-[var(--amber-ink)]">Chapitre {c.number}</p>
                  <h3 className="mt-2 text-center font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-normal italic leading-tight tracking-normal text-[var(--ink)]">{c.title}</h3>
                  <div className="book-text mx-auto mt-8 max-w-[38rem]" lang="fr">
                    {paragraphs(c.content).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <p className="t-small mt-8 text-center">
                    Tiré de {c.sources.length === 1 ? `l’appel ${c.sources[0]}` : `vos appels ${c.sources.slice(0, -1).join(", ")} et ${c.sources[c.sources.length - 1]}`}
                  </p>
                </article>
              )),
            ])}
          </div>
        </>
      )}
    </div>
  );
}
