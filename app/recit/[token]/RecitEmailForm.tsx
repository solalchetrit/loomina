"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

/** L'e-mail pour recevoir le récit complet en PDF. */
export default function RecitEmailForm({ token, preview = false }: { token: string; preview?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    if (preview) {
      setTimeout(() => setState("sent"), 600);
      return;
    }
    try {
      const res = await fetch(`/api/recit/${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState("sent");
      else {
        setMessage(data.message ?? "L’envoi n’a pas abouti. Réessayez dans un instant.");
        setState("error");
      }
    } catch {
      setMessage("L’envoi n’a pas abouti. Vérifiez votre connexion et réessayez.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6" role="status">
        <p className="text-[19px] font-bold text-[var(--ink)]">C’est envoyé.</p>
        <p className="t-body mt-2">
          Votre récit arrive à <strong className="text-[var(--ink)]">{email}</strong> dans une minute, en PDF. S’il n’apparaît
          pas, regardez dans les courriers indésirables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8">
      <label htmlFor="recit-email" className="block text-[16px] font-bold text-[var(--ink)]">
        Votre adresse e-mail
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="recit-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@exemple.fr"
          className="h-14 w-full min-w-0 rounded-[16px] border border-[var(--rule-strong)] bg-[var(--surface)] px-4 text-[18px] text-[var(--ink)] outline-none focus:border-[var(--ink)]"
        />
        <Button type="submit" size="lg" loading={state === "sending"} disabled={state === "sending"}>
          Recevoir mon récit
        </Button>
      </div>
      {state === "error" && (
        <p className="mt-3 text-[15px] font-semibold text-[var(--danger)]" role="alert">
          {message}
        </p>
      )}
      <p className="t-small mt-4">
        Gratuit, sans engagement. Votre adresse sert à vous envoyer ce récit et à vous écrire au sujet de Loomina ; un
        clic suffit pour ne plus rien recevoir. Le récit est effacé de nos serveurs au bout de 30 jours.
      </p>
    </form>
  );
}
