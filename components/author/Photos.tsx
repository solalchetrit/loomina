"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

interface Photo {
  id: string;
  caption: string | null;
  question: string;
  url: string | null;
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
      const res = await fetch("/api/user/photos", { method: "POST", body });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’envoi n’a pas abouti. Réessayez.");
      setPhotos(data.photos);
      setFile(null);
      setCaption("");
      if (input.current) input.current.value = "";
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "L’envoi n’a pas abouti. Réessayez.");
      setStatus("error");
    }
  };

  return (
    <section className="card p-7" aria-labelledby="photos-titre">
      <h2 id="photos-titre" className="text-[17px] font-bold">
        Vos photos
      </h2>
      <p className="t-body mt-2">Envoyez une photo : Loomina vous posera une question dessus au prochain appel.</p>

      <form onSubmit={send} className="mt-4 space-y-3">
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
          className="block w-full text-[15px] file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:px-4 file:font-bold"
        />
        <label htmlFor="photo-legende" className="field-label">
          Une légende (facultatif)
        </label>
        <input
          id="photo-legende"
          className="field"
          maxLength={200}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Par exemple : mariage de mes parents, 1952"
        />
        <Button type="submit" loading={status === "sending"} disabled={!file}>
          Envoyer la photo
        </Button>
        <p role="status" className="text-[15px] font-semibold">
          {status === "sent" && <span className="text-[var(--success)]">Reçue. Loomina vous en parlera au prochain appel.</span>}
          {status === "error" && <span className="text-[var(--danger)]">{error}</span>}
        </p>
      </form>

      {photos.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--line-soft)] pt-5">
          {photos.map((p) => (
            <li key={p.id} className="min-w-0">
              {p.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- lien signé temporaire, hors optimisation Next
                <img src={p.url} alt={p.caption ?? "Photo envoyée"} className="aspect-square w-full rounded-[12px] object-cover" />
              ) : (
                <div className="aspect-square w-full rounded-[12px] bg-[var(--surface-2)]" />
              )}
              <p className="t-small mt-1 line-clamp-2">{p.caption ?? p.question}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
