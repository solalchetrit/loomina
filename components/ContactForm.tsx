"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

const SUBJECTS = [
  { value: "question", label: "Une question avant de commander" },
  { value: "cadeau", label: "Je veux l’offrir à un proche" },
  { value: "livre", label: "Mon livre en cours" },
  { value: "autre", label: "Autre chose" },
];

type Status = "idle" | "sending" | "sent" | "error";

/** Formulaire de contact : enregistré côté serveur, confirmation immédiate, erreurs lisibles. */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [form, setForm] = useState({ name: "", email: "", subject: "question", message: "", website: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Indiquez votre nom, pour que nous sachions à qui répondre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Vérifiez l’adresse e-mail : il manque un @ ou un point.";
    if (form.message.trim().length < 10) next.message = "Écrivez-nous quelques mots de plus.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Le message n’a pas pu partir.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Le message n’a pas pu partir.");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="rule-top pt-6">
        <p className="t-eyebrow">Message reçu</p>
        <h2 className="t-title mt-3">Merci, {form.name.split(" ")[0]}.</h2>
        <p className="t-lead mt-5 max-w-md">
          Votre message est bien arrivé. Nous vous répondons à <span className="font-semibold text-[var(--ink)]">{form.email}</span>.
        </p>
        <div className="mt-8">
          <Button href="/" variant="secondary" size="lg">
            Retour à l’accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rule-top pt-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Votre nom" name="name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} required />
        <Input
          label="Votre e-mail"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          hint="C’est là que nous répondrons."
          required
        />
      </div>

      <div className="mt-6">
        <label htmlFor="subject" className="field-label">
          Votre message concerne
        </label>
        <select id="subject" name="subject" value={form.subject} onChange={set("subject")} className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 6l4 4 4-4%22 fill=%22none%22 stroke=%22%231b1915%22 stroke-width=%221.5%22/></svg>')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat pr-12">
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <Textarea label="Votre message" name="message" rows={7} value={form.message} onChange={set("message")} error={errors.message} required />
      </div>

      {/* Piège à robots : invisible, ne doit jamais être rempli. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
      </div>

      {serverError && (
        <p role="alert" className="mt-6 border-l-2 border-[var(--danger)] pl-4 font-sans text-[16px] text-[var(--danger)]">
          {serverError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small max-w-xs">Vos coordonnées ne servent qu’à vous répondre.</p>
        <Button type="submit" variant="primary" size="lg" loading={status === "sending"} className="w-full sm:w-auto">
          {status === "sending" ? "Envoi…" : "Envoyer le message"}
        </Button>
      </div>
    </form>
  );
}
