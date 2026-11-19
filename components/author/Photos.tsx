"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

interface Photo {
  id: string;
  caption: string | null;
  question: string;
  chapter?: string | null;
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

/**
 * Réduit la photo dans le navigateur avant l'envoi : 1 600 px de côté au
 * plus, en JPEG. Une photo de téléphone (souvent 4 à 10 Mo, parfois HEIC)
 * dépasserait sinon la limite d'envoi du serveur.
 */
async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Cette image ne peut pas être lue."));
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible."))), "image/jpeg", 0.85)
    );
  } finally {
    URL.revokeObjectURL(url);
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

  return (
    <section className="card p-5" aria-labelledby="photos-titre">
      <div className="flex items-center justify-between gap-3">
        <h2 id="photos-titre" className="text-[16px] font-extrabold tracking-[-0.01em]">
          Vos photos{photos.length > 0 ? ` · ${photos.length}` : ""}
        </h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3.5 text-[14px] font-bold text-[var(--ink-2)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
        >
          {open ? (
            "Fermer"
          ) : (
            <>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Ajouter
            </>
          )}
        </button>
      </div>

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

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="min-w-0">
              {p.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire, hors optimisation Next
                <img src={p.url} alt={p.caption ?? "Photo envoyée"} className="aspect-square w-full rounded-[10px] object-cover" />
              ) : (
                <div className="aspect-square w-full rounded-[10px] bg-[var(--surface-2)]" />
              )}
              <p className="mt-1 line-clamp-1 text-[12.5px] leading-tight text-[var(--ink-3)]">{p.caption ?? p.question}</p>
              
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
