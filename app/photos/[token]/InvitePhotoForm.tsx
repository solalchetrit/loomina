"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { shrinkPhoto } from "@/lib/shrink-photo";

/** Le formulaire du proche : son prénom, la photo, ce qu'elle montre. Les photos partent une par une. */
export default function InvitePhotoForm({ token, essai }: { token: string; essai: boolean }) {
  const [from, setFrom] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [sent, setSent] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("sending");
    setError(null);
    try {
      const body = new FormData();
      body.append("photo", await shrinkPhoto(file), "photo.jpg");
      if (caption.trim()) body.append("caption", caption.trim());
      if (from.trim()) body.append("from", from.trim());
      const res = await fetch(`/api/photos/${encodeURIComponent(token)}`, { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’envoi n’a pas abouti. Réessayez.");
      setSent((n) => n + 1);
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
    <form onSubmit={send} className="space-y-3">
      <label htmlFor="proche-prenom" className="field-label">
        Votre prénom (facultatif)
      </label>
      <input id="proche-prenom" className="field" maxLength={40} autoComplete="given-name" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Par exemple : Claire" />

      <label htmlFor="proche-photo" className="field-label">
        La photo
      </label>
      <input
        ref={input}
        id="proche-photo"
        type="file"
        accept="image/*"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setStatus("idle");
        }}
        className="block w-full text-[16px] file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:px-4 file:font-bold"
      />

      <label htmlFor="proche-legende" className="field-label">
        Ce que montre la photo (facultatif)
      </label>
      <input id="proche-legende" className="field" maxLength={200} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Par exemple : les vacances à Oran, 1958" />

      <Button type="submit" loading={status === "sending"} disabled={!file} className="mt-2 w-full">
        Envoyer la photo
      </Button>
      <p role="status" className="min-h-6 text-[16px] font-semibold">
        {status === "sent" &&
          (essai ? (
            <span className="text-[var(--ink-2)]">Page d’essai : rien n’est envoyé.</span>
          ) : (
            <span className="text-[var(--success)]">
              Merci, la photo est arrivée{sent > 1 ? ` (${sent} envoyées)` : ""}. Vous pouvez en envoyer une autre.
            </span>
          ))}
        {status === "error" && <span className="text-[var(--danger)]">{error}</span>}
      </p>
    </form>
  );
}
