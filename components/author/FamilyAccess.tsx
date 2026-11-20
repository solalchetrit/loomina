"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { formatPhoneNumberForDisplay } from "@/lib/phone";
import type { Prefs } from "./types";

type Person = NonNullable<Prefs["family"]>[number];

/** +33612345678 → 06 12 34 56 78 (les numéros étrangers restent tels quels). */
const show = (e164: string) => (e164.startsWith("+33") ? formatPhoneNumberForDisplay(`0${e164.slice(3)}`) : e164);

/**
 * Réglages : qui suit le livre dans l'espace famille (demande de Solal du
 * 20/11/2026). L'auteur ajoute un proche (prénom, portable), qui reçoit un
 * SMS pour ouvrir son espace, ou le retire. Celui qui a offert le livre reste.
 */
export default function FamilyAccess({
  family,
  shared,
  onChange,
  onUnauthorized,
}: {
  family: Person[];
  /** L'auteur laisse sa famille lire ses récits. */
  shared: boolean;
  onChange: (family: Person[]) => void;
  onUnauthorized: () => void;
}) {
  const [form, setForm] = useState({ firstName: "", phone: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const call = async (method: "POST" | "DELETE", body: Record<string, unknown>) => {
    const res = await fetch("/api/user/family", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 401) {
      onUnauthorized();
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Cela n’a pas abouti. Réessayez dans un instant.");
    return data as { family: Person[]; sent?: boolean };
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.phone.trim()) return;
    setBusy("add");
    setError(null);
    setDone(null);
    try {
      const data = await call("POST", form);
      if (!data) return;
      onChange(data.family);
      setDone(data.sent === false ? `${form.firstName.trim()} est ajouté. Le SMS n’est pas parti : dites-lui d’ouvrir loomina.eu/dashboard avec son numéro.` : `${form.firstName.trim()} a reçu un SMS pour ouvrir son espace.`);
      setForm({ firstName: "", phone: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "L’ajout n’a pas abouti.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (p: Person) => {
    setBusy(p.phone);
    setError(null);
    setDone(null);
    try {
      const data = await call("DELETE", { phone: p.phone });
      if (data) onChange(data.family);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le retrait n’a pas abouti.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="card p-6 md:p-7" aria-labelledby="reglages-famille">
      <h2 id="reglages-famille" className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">
        Votre espace famille
      </h2>
      <p className="t-body mt-2 max-w-[62ch]">
        Vos proches suivent votre livre avec leur propre numéro{shared ? " et lisent vos récits" : " (l’avancement, pas vos récits)"}. Ils peuvent aussi souffler un souvenir à Loomina.
      </p>

      {family.length > 0 && (
        <ul className="mt-5 divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
          {family.map((p) => (
            <li key={p.phone} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <span className="min-w-0">
                <span className="text-[16px] font-bold">{p.firstName || "Un proche"}</span>
                <span className="ml-2 whitespace-nowrap text-[15px] tabular-nums text-[var(--ink-3)]">{show(p.phone)}</span>
              </span>
              {p.giver ? (
                <span className="text-[14px] font-semibold text-[var(--ink-3)]">vous a offert ce livre</span>
              ) : (
                <button type="button" onClick={() => remove(p)} disabled={busy !== null} className="link text-[15px] disabled:opacity-50">
                  {busy === p.phone ? "Retrait…" : "Retirer"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Input label="Prénom" name="famille-prenom" autoComplete="off" maxLength={60} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <Input
          label="Portable"
          name="famille-tel"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="06 12 34 56 78"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: formatPhoneNumberForDisplay(e.target.value).slice(0, 20) })}
        />
        <Button type="submit" loading={busy === "add"} disabled={!form.firstName.trim() || !form.phone.trim()} className="max-sm:w-full">
          Ajouter
        </Button>
      </form>
      <p role="status" className="mt-3 text-[15px] font-semibold">
        {done && <span className="text-[var(--success)]">{done}</span>}
        {error && <span className="text-[var(--danger)]">{error}</span>}
      </p>
    </section>
  );
}
