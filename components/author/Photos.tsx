"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { shrinkPhoto as shrink } from "@/lib/shrink-photo";

interface Photo {
  id: string;
  caption: string | null;
  question: string;
  chapter?: string | null;
  from?: string | null;
  url: string | null;
}

/**
 * Les chapitres proposés pour placer une photo : ceux du livre composé s'il
 * existe, sinon les récits d'appel. Liste vide : le choix n'apparaît pas.
 */
async function chapterTitles(): Promise<string[]> {
  try {
    const book = await fetch("/api/user/book").then((r) => (r.ok ? r.json() : null));
    const fromBook: string[] = (book?.edition?.chapters ?? []).map((c: { title: string }) => c.title);
    if (fromBook.length) return fromBook;
    const stories = await fetch("/api/user/stories").then((r) => (r.ok ? r.json() : []));
    return (stories as { story_title: string | null }[]).map((s) => s.story_title).filter((t): t is string => !!t);
  } catch {
    return [];
  }
}

/** Les photos du livre : chacune devient une question au prochain appel. */
export default function Photos({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [chapter, setChapter] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/photos")
      .then((r) => (r.status === 401 ? (onUnauthorized(), null) : r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.photos) setPhotos(d.photos);
      })
      .catch(() => {});
    chapterTitles().then((t) => {
      if (!cancelled) setChapters([...new Set(t)]);
    });
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("sending");
    setError(null);
    try {
      const body = new FormData();
      body.append("photo", await shrink(file), "photo.jpg");
      if (caption.trim()) body.append("caption", caption.trim());
      if (chapter) body.append("chapter", chapter);
      const res = await fetch("/api/user/photos", { method: "POST", body });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’envoi n’a pas abouti. Réessayez.");
      setPhotos(data.photos);
      setFile(null);
      setCaption("");
      setChapter("");
      if (input.current) input.current.value = "";
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "L’envoi n’a pas abouti. Réessayez.");
      setStatus("error");
    }
  };

  const [open, setOpen] = useState(false);

  // Dans la carte du livre : les photos en petite rangée, puis une tuile « + » pour en ajouter.
  return (
    <section aria-labelledby="photos-titre">
      <h3 id="photos-titre" className="text-[13px] font-bold text-[var(--ink-3)]">
        {photos.length > 0 ? `Vos photos · ${photos.length}` : "Vos photos"}
      </h3>
      <ul className="mt-2 flex flex-wrap items-center gap-2">
        {photos.slice(0, 9).map((p) => (
          <li key={p.id}>
            {p.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire, hors optimisation Next
              <img src={p.url} alt={p.caption ?? "Photo envoyée"} title={[p.caption ?? p.question, p.from ? `Envoyée par ${p.from}` : null].filter(Boolean).join(" · ")} className="h-12 w-12 rounded-[12px] object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-[12px] bg-[var(--surface-2)]" title={p.caption ?? p.question} />
            )}
          </li>
        ))}
        <li className={photos.length ? "" : "w-full"}>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Fermer" : "Ajouter une photo"}
            onClick={() => setOpen((o) => !o)}
            className={`press flex h-12 items-center justify-center gap-2 rounded-[12px] border border-dashed border-[var(--rule-strong)] text-[15px] font-bold text-[var(--ink-2)] hover:border-[var(--ink-3)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] ${
              photos.length ? "w-12" : "w-full"
            }`}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={`transition-transform ${open ? "rotate-45" : ""}`}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {!photos.length && (open ? "Fermer" : "Ajouter une photo")}
          </button>
        </li>
      </ul>

      {open && (
      <form onSubmit={send} className="mt-3 space-y-2.5">
        <p className="text-[14px] leading-snug text-[var(--ink-3)]">Loomina vous posera une question sur cette photo au prochain appel.</p>
        <label htmlFor="photo-fichier" className="sr-only">
          Choisir une photo
        </label>
        <input
          ref={input}
          id="photo-fichier"
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setStatus("idle");
          }}
          className="block w-full text-[14px] file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:px-4 file:font-bold"
        />
        <label htmlFor="photo-legende" className="field-label">
          Un titre pour cette photo (facultatif)
        </label>
        <input
          id="photo-legende"
          className="field"
          maxLength={200}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Par exemple : mariage de mes parents, 1952"
        />
        {chapters.length > 0 && (
          <>
            <label htmlFor="photo-chapitre" className="field-label">
              Pour quel chapitre ? (facultatif)
            </label>
            <select id="photo-chapitre" className="field" value={chapter} onChange={(e) => setChapter(e.target.value)}>
              <option value="">Je ne sais pas, à vous de voir</option>
              {chapters.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}
        <Button type="submit" loading={status === "sending"} disabled={!file} className="!min-h-11 w-full !text-[15px]">
          Envoyer la photo
        </Button>
        <p role="status" className="text-[14px] font-semibold">
          {status === "sent" && <span className="text-[var(--success)]">Reçue. Loomina vous en parlera au prochain appel.</span>}
          {status === "error" && <span className="text-[var(--danger)]">{error}</span>}
        </p>
      </form>
      )}

      <InviteLink onUnauthorized={onUnauthorized} />
    </section>
  );
}

/**
 * Le lien pour les proches (lib/loomina/photo-invite.ts) : l'auteur le copie
 * et l'envoie, ses proches ajoutent leurs photos sans compte.
 */
function InviteLink({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/photos/lien")
      .then((r) => (r.status === 401 ? (onUnauthorized(), null) : r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && typeof d?.url === "string") setUrl(d.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  if (!url) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      // Presse-papiers refusé : le lien reste lisible et sélectionnable juste en dessous.
      setState("error");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Ajoutez une photo à mon livre", text: "Ajoutez une photo à mon livre Loomina :", url });
    } catch {
      /* partage annulé */
    }
  };

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="mt-4 border-t border-[var(--rule)] pt-3">
      <p className="text-[14px] font-bold text-[var(--ink-2)]">Vos proches aussi</p>
      <p className="mt-0.5 text-[14px] leading-snug text-[var(--ink-3)]">Envoyez-leur votre lien : ils ajoutent leurs photos, sans compte.</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="press min-h-10 flex-1 rounded-full border border-[var(--rule-strong)] bg-white px-4 text-[14px] font-bold text-[var(--ink)] hover:border-[var(--ink-3)]"
        >
          {state === "copied" ? "Lien copié" : "Copier le lien"}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="press min-h-10 rounded-full border border-[var(--rule-strong)] bg-white px-4 text-[14px] font-bold text-[var(--ink)] hover:border-[var(--ink-3)]"
          >
            Envoyer
          </button>
        )}
      </div>
      <p className="mt-2 break-all text-[13px] text-[var(--ink-3)]">
        <span className="select-all font-semibold text-[var(--ink-2)]">{url.replace(/^https?:\/\//, "")}</span>
      </p>
      {state === "error" && (
        <p className="mt-1 text-[13px] text-[var(--ink-2)]" role="status">
          Copie impossible : sélectionnez l’adresse ci-dessus.
        </p>
      )}
    </div>
  );
}
