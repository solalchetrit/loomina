"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { Overview } from "./types";

type Address = NonNullable<Overview["shipping"]>;
type Delivery = NonNullable<Overview["delivery"]>;
type Stage = Delivery["stage"];

const STEPS: Array<{ stage: Exclude<Stage, "writing">; label: string }> = [
  { stage: "completed", label: "Terminé" },
  { stage: "reviewed", label: "Relu" },
  { stage: "printing", label: "À l’impression" },
  { stage: "shipped", label: "Expédié" },
  { stage: "delivered", label: "Reçu" },
];
const ORDER: Stage[] = ["writing", "completed", "reviewed", "printing", "shipped", "delivered"];

const SENTENCE: Record<Exclude<Stage, "writing">, { title: string; body: string }> = {
  completed: { title: "Votre livre est terminé", body: "Notre équipe le relit en entier. Vous recevrez sa version complète par SMS et par e-mail avant qu’il parte à l’impression." },
  reviewed: { title: "Votre livre est relu", body: "Sa version complète est dans « Mon livre ». Un détail à changer ? Appelez-nous ou répondez à notre e-mail. Ensuite, il part à l’impression." },
  printing: { title: "Votre livre est à l’impression", body: "Nous vous prévenons dès qu’il part, avec le numéro qui permet de suivre le colis." },
  shipped: { title: "Votre livre est en route", body: "Il arrive à l’adresse ci-dessous." },
  delivered: { title: "Votre livre est arrivé", body: "Bonne lecture. Vous pouvez toujours le relire et le télécharger dans « Mon livre »." },
};

/**
 * Une fois le livre terminé : où il en est (relu, à l'impression, expédié,
 * reçu) et où l'envoyer. L'adresse est demandée ici et pas à la commande
 * (choix de Solal, 17/11/2026) ; elle reste modifiable tant que le livre
 * n'est pas parti.
 */
export default function Shipping({ saved, delivery, firstName, onSaved, onUnauthorized }: { saved: Address | null; delivery?: Overview["delivery"]; firstName: string | null; onSaved: () => void; onUnauthorized: () => void }) {
  const stage: Exclude<Stage, "writing"> = delivery && delivery.stage !== "writing" ? delivery.stage : "completed";
  const gone = stage === "shipped" || stage === "delivered";
  const [editing, setEditing] = useState(!saved && !gone);
  const [form, setForm] = useState({ name: saved?.name ?? firstName ?? "", line1: saved?.line1 ?? "", line2: saved?.line2 ?? "", postalCode: saved?.postalCode ?? "", city: saved?.city ?? "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  const reached = ORDER.indexOf(stage);
  const text = SENTENCE[stage];

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

  return (
    <section className="card p-6 md:p-8" aria-labelledby="livraison-titre">
      <h2 id="livraison-titre" className="t-heading">{text.title}</h2>
      <p className="t-body mt-2 max-w-[62ch]">{text.body}</p>

      {/* Les cinq étapes, de « terminé » à « reçu ». */}
      <ol className="mt-6 grid grid-cols-5 gap-1.5" aria-label="Les étapes de votre livre">
        {STEPS.map((s, i) => {
          const done = ORDER.indexOf(s.stage) <= reached;
          const current = s.stage === stage;
          return (
            <li key={s.stage} aria-current={current ? "step" : undefined} className="min-w-0">
              <span className={`block h-1.5 rounded-full transition-colors duration-500 ${done ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`} style={{ transitionDelay: `${i * 60}ms` }} />
              <span className={`mt-2 block truncate text-[13.5px] sm:text-[14.5px] ${current ? "font-bold text-[var(--ink)]" : done ? "font-semibold text-[var(--ink-2)]" : "text-[var(--ink-3)]"}`}>{s.label}</span>
            </li>
          );
        })}
      </ol>

      {delivery?.tracking && gone && (
        <p className="t-body mt-5">
          Numéro de suivi : <b className="tabular-nums">{delivery.tracking.number}</b>
          {" · "}
          <a href={delivery.tracking.url} target="_blank" rel="noreferrer" className="link font-semibold">Suivre le colis</a>
        </p>
      )}

      {saved && !editing && (
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <p className="text-[15px] font-bold text-[var(--ink-2)]">{gone ? "Envoyé à" : "Votre livre sera envoyé à"}</p>
          <p className="t-body mt-1 whitespace-pre-line">{[saved.name, saved.line1, saved.line2, `${saved.postalCode} ${saved.city}`].filter(Boolean).join("\n")}</p>
          {!gone && (
            <button type="button" onClick={() => setEditing(true)} className="link mt-2 text-[16px]">Modifier l’adresse</button>
          )}
        </div>
      )}

      {editing && (
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <p className="text-[17px] font-bold">{saved ? "Modifier l’adresse" : "Où souhaitez-vous recevoir votre livre ?"}</p>
          <p className="t-body mt-1">En France métropolitaine.</p>
          <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
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
        </div>
      )}
    </section>
  );
}
