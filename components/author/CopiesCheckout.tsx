"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Payment from "@/components/order/Payment";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { extraCopiesLabel } from "@/config/offer";

type Need = "address" | "email";
type Address = { name: string; line1: string; line2: string; postalCode: string; city: string };

/**
 * Le paiement des exemplaires en plus, sans quitter Loomina (Solal, 24/11/2026) :
 * une fenêtre dans l'espace, avec, s'il le faut, l'adresse et l'e-mail,
 * puis le même paiement intégré que la commande (components/order/Payment.tsx).
 * Après paiement, Stripe ramène sur /dashboard?exemplaires=merci.
 */
export default function CopiesCheckout({
  endpoint,
  projectId,
  copies,
  family,
  onClose,
  onUnauthorized,
}: {
  endpoint: "/api/user/exemplaires" | "/api/famille/exemplaires";
  projectId?: string;
  copies: number;
  family: boolean;
  onClose: () => void;
  onUnauthorized: () => void;
}) {
  const [need, setNeed] = useState<Need[] | null>(null);
  const [address, setAddress] = useState<Address>({ name: "", line1: "", line2: "", postalCode: "", city: "" });
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const [promo, setPromo] = useState<string | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const start = useCallback(
    async (withDetails: boolean) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            copies,
            ...(withDetails ? { email: email.trim(), shipping: need?.includes("address") ? address : undefined } : {}),
          }),
        });
        if (res.status === 401) return onUnauthorized();
        const data = (await res.json().catch(() => ({}))) as { need?: Need[]; clientSecret?: string; publishableKey?: string; url?: string; error?: string };
        if (res.status === 422 && data.need) {
          setNeed(data.need);
        } else if (data.clientSecret && data.publishableKey) {
          setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey });
        } else if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error(data.error || "Le paiement n’a pas pu démarrer. Réessayez dans un instant.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Le paiement n’a pas pu démarrer.");
      }
      setBusy(false);
    },
    [endpoint, projectId, copies, email, address, need, onUnauthorized]
  );

  // À l'ouverture : le serveur dit s'il faut une adresse ou un e-mail, sinon le paiement s'affiche.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void start(false);
  }, [start]);

  // Fenêtre : la page derrière ne défile plus, Échap ferme.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const field = "!min-h-12 !text-[16px] !rounded-[12px]";
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress((a) => ({ ...a, [k]: e.target.value }));
  const showForm = !checkout && need && need.length > 0;
  const title = checkout ? "Paiement" : showForm ? (need.includes("address") ? "Où les envoyer ?" : "Votre e-mail") : "Des exemplaires en plus";

  // Rendue à la racine de la page : une carte parente (transform, filtre) enfermerait la fenêtre.
  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-end justify-center bg-[rgba(23,29,43,0.45)] p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exemplaires-titre"
        className="card card-float max-h-[92svh] w-full max-w-[560px] overflow-y-auto rounded-b-none p-5 outline-none sm:rounded-b-[var(--radius-card,28px)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-[var(--ink-3)]">{extraCopiesLabel(copies)}</p>
            <h2 id="exemplaires-titre" className="mt-0.5 text-[26px] font-extrabold leading-tight tracking-[-0.03em]">
              {title}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="press -mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px] text-[var(--ink-3)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
            ×
          </button>
        </div>

        {checkout && (
          <div className="rise mt-6">
            <Payment
              key={checkout.clientSecret}
              clientSecret={checkout.clientSecret}
              publishableKey={checkout.publishableKey}
              label={extraCopiesLabel(copies)}
              installments={false}
              method="card"
              onSwitch={async () => true}
              promo={promo}
              onPromo={setPromo}
              onBack={() => (need?.length ? setCheckout(null) : onClose())}
              backLabel={need?.includes("address") ? "Modifier l’adresse" : need?.length ? "Modifier l’e-mail" : "Retour"}
            />
          </div>
        )}

        {showForm && (
          <form
            className="rise mt-6"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void start(true);
            }}
          >
            {need.includes("address") && (
              <>
                <p className="text-[15px] leading-relaxed text-[var(--ink-2)]">
                  {family ? "Les exemplaires sont livrés chez vous, en France, dès que le livre est imprimé." : "Votre livre est déjà parti : dites-nous où envoyer ces exemplaires, en France."}
                </p>
                <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Input className={field} label="Nom sur la boîte aux lettres" name="name" autoComplete="name" value={address.name} onChange={set("name")} required />
                  <Input className={field} label="Adresse" name="line1" autoComplete="address-line1" value={address.line1} onChange={set("line1")} required />
                  <Input className={field} label="Complément (facultatif)" name="line2" autoComplete="address-line2" value={address.line2} onChange={set("line2")} />
                  <div className="grid grid-cols-[7.5rem_1fr] gap-3">
                    <Input className={field} label="Code postal" name="postalCode" inputMode="numeric" autoComplete="postal-code" value={address.postalCode} onChange={set("postalCode")} required />
                    <Input className={field} label="Ville" name="city" autoComplete="address-level2" value={address.city} onChange={set("city")} required />
                  </div>
                </div>
              </>
            )}
            {need.includes("email") && (
              <div className="mt-5">
                <Input className={field} label="E-mail" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Pour la confirmation de la commande." required />
              </div>
            )}
            {error && (
              <p role="alert" className="mt-5 rounded-[12px] bg-[#fbeae6] px-4 py-3 text-[15px] font-medium text-[var(--danger)]">
                {error}
              </p>
            )}
            <Button type="submit" loading={busy} className="mt-6 w-full">
              {busy ? "Préparation du paiement…" : "Continuer vers le paiement"}
            </Button>
          </form>
        )}

        {!checkout && !showForm && (
          <div className="mt-6">
            {error ? (
              <p role="alert" className="rounded-[12px] bg-[#fbeae6] px-4 py-3 text-[15px] font-medium text-[var(--danger)]">
                {error}
              </p>
            ) : (
              <p className="flex items-center gap-3 text-[15px] text-[var(--ink-2)]" role="status">
                <span className="spinner" aria-hidden="true" />
                Préparation du paiement…
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
