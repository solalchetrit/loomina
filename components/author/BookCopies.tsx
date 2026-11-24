"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import CopiesStepper from "@/components/order/CopiesStepper";
import { EXTRA_COPY, extraCopiesLabel } from "@/config/offer";

/**
 * Les livres prévus pour cette histoire (Solal, 24/11/2026), dans l'espace
 * auteur (onglet « Le livre ») et dans l'espace famille : le livre de
 * l'auteur plus les exemplaires en plus déjà commandés, et de quoi en ajouter.
 * Le paiement se fait sur une page Stripe ; au retour (?exemplaires=merci), un merci.
 */
export default function BookCopies({
  extraCopies,
  narrator,
  endpoint,
  projectId,
  onUnauthorized,
  compact = false,
}: {
  extraCopies: number;
  /** Prénom de l'auteur, vu par la famille. Absent : c'est l'auteur qui regarde. */
  narrator?: string | null;
  endpoint: "/api/user/exemplaires" | "/api/famille/exemplaires";
  projectId?: string;
  onUnauthorized: () => void;
  /** Colonne étroite (onglet « Le livre » de l'espace auteur). */
  compact?: boolean;
}) {
  const [copies, setCopies] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);

  // Retour de Stripe après paiement.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("exemplaires") !== "merci") return;
    url.searchParams.delete("exemplaires");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    const id = window.setTimeout(() => setThanks(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const family = narrator !== undefined;
  const total = 1 + extraCopies;
  const own = family ? `Le livre de ${narrator || "votre proche"}` : "Votre livre";

  const order = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, copies }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Le paiement n’a pas pu démarrer. Réessayez dans un instant.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le paiement n’a pas pu démarrer.");
      setBusy(false);
    }
  };

  return (
    <section className={`card ${compact ? "p-5" : "p-6 md:p-8"}`} aria-labelledby={`livres-prevus-${projectId ?? "auteur"}`}>
      <div className={compact ? "" : "grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-10"}>
        {/* Le compteur */}
        <div>
          <h3 id={`livres-prevus-${projectId ?? "auteur"}`} className={compact ? "text-[13px] font-bold text-[var(--ink-3)]" : "t-heading"}>
            Les livres prévus
          </h3>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{total}</span>
            <span className="text-[17px] font-bold">livre{total > 1 ? "s" : ""}</span>
          </p>
          <p className="mt-2 text-[15px] leading-snug text-[var(--ink-2)]">
            {extraCopies ? `${own}, et ${extraCopiesLabel(extraCopies)}.` : `${own}.`}
          </p>
          {thanks && (
            <p role="status" className="mt-3 rounded-[12px] bg-[var(--amber-soft)] px-3 py-2 text-[14.5px] font-semibold text-[var(--amber-deep)]">
              Merci, c’est commandé. Le nombre se met à jour dans un instant, et la confirmation arrive par e-mail.
            </p>
          )}
        </div>

        {/* En ajouter */}
        <div className={compact ? "mt-4 border-t border-[var(--line-soft)] pt-4" : "md:border-l md:border-[var(--line-soft)] md:pl-10"}>
          <p className={compact ? "text-[14.5px] font-bold" : "text-[16px] font-bold"}>Ajouter des exemplaires</p>
          <p className="mt-1 text-[14.5px] leading-snug text-[var(--ink-3)]">
            {family
              ? `Le même livre, pour vous ou un proche. ${EXTRA_COPY.price} € l’exemplaire, livré chez vous en France.`
              : `Le même livre, pour votre famille. ${EXTRA_COPY.price} € l’exemplaire, envoyé avec le vôtre.`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <CopiesStepper value={copies} onChange={setCopies} min={1} label="Nombre d’exemplaires à ajouter" />
            <p className="text-[16px]">
              Total : <b className="tabular-nums">{copies * EXTRA_COPY.price} €</b>
            </p>
          </div>
          <Button type="button" onClick={order} loading={busy} className={`mt-4 ${compact ? "!min-h-11 w-full !text-[15px]" : ""}`}>
            Commander
          </Button>
          {error && (
            <p role="alert" className="mt-3 text-[14.5px] font-semibold text-[var(--danger)]">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
