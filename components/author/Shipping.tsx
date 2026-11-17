"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Overview } from "./types";

type Address = NonNullable<Overview["shipping"]>;

/**
 * Une fois le livre terminé : où l'envoyer. Demandé ici et pas à la
 * commande (choix de Solal, 17/11/2026). L'adresse reste modifiable tant
 * que le livre n'est pas parti.
 */
export default function Shipping({ saved, firstName, onSaved, onUnauthorized }: { saved: Address | null; firstName: string | null; onSaved: () => void; onUnauthorized: () => void }) {
  const [editing, setEditing] = useState(!saved);
  const [form, setForm] = useState({ name: saved?.name ?? firstName ?? "", line1: saved?.line1 ?? "", line2: saved?.line2 ?? "", postalCode: saved?.postalCode ?? "", city: saved?.city ?? "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/user/address", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.status === 401) return onUnauthorized();
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "L’enregistrement n’a pas abouti. Réessayez dans un instant.");
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "L’enregistrement n’a pas abouti.");
    } finally {
      setSending(false);
    }
  };

  if (saved && !editing) {
    return (
      <section className="card p-6 md:p-8" aria-labelledby="livraison-titre">
        <h2 id="livraison-titre" className="t-heading">Votre livre sera envoyé ici</h2>
        <p className="t-body mt-2 whitespace-pre-line">{[saved.name, saved.line1, saved.line2, `${saved.postalCode} ${saved.city}`].filter(Boolean).join("\n")}</p>
        <button type="button" onClick={() => setEditing(true)} className="link mt-3 text-[16px]">Modifier l’adresse</button>
      </section>
    );
  }

  return (
    <section className="card p-6 md:p-8" aria-labelledby="livraison-titre">
      <p className="text-[15px] font-bold text-[var(--amber-ink)]">Votre livre est terminé</p>
      <h2 id="livraison-titre" className="t-heading mt-1">Où souhaitez-vous le recevoir ?</h2>
      <p className="t-body mt-2 max-w-[62ch]">Notre équipe relit votre livre, puis il part à l’impression. Indiquez l’adresse où l’envoyer, en France métropolitaine.</p>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="liv-nom" className="field-label">Nom du destinataire</label>
          <input id="liv-nom" className="field mt-1 w-full" required maxLength={120} autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="liv-adresse" className="field-label">Adresse</label>
          <input id="liv-adresse" className="field mt-1 w-full" required maxLength={160} autoComplete="address-line1" value={form.line1} onChange={set("line1")} />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="liv-complement" className="field-label">Complément (facultatif)</label>
          <input id="liv-complement" className="field mt-1 w-full" maxLength={160} autoComplete="address-line2" placeholder="Bâtiment, étage, digicode" value={form.line2} onChange={set("line2")} />
        </div>
        <div>
          <label htmlFor="liv-cp" className="field-label">Code postal</label>
          <input id="liv-cp" className="field mt-1 w-full" required inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" value={form.postalCode} onChange={set("postalCode")} />
        </div>
        <div>
          <label htmlFor="liv-ville" className="field-label">Ville</label>
          <input id="liv-ville" className="field mt-1 w-full" required maxLength={100} autoComplete="address-level2" value={form.city} onChange={set("city")} />
        </div>
        {error && <p role="alert" className="text-[15px] font-semibold text-[var(--danger)] md:col-span-2">{error}</p>}
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="submit" loading={sending}>Enregistrer l’adresse</Button>
          {saved && <button type="button" onClick={() => setEditing(false)} className="link text-[16px]">Annuler</button>}
        </div>
      </form>
    </section>
  );
}
