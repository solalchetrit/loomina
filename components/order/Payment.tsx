"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutElementsProvider, PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import Icon from "@/components/ui/Icon";

/**
 * L'étape « Paiement » de la commande, dessinée par Loomina (demande de Solal, 18/11/2026).
 *
 * Stripe (Checkout, ui_mode « custom ») ne fournit que le champ carte : le
 * récapitulatif, le code promo, le total et le bouton sont à nous. Link est
 * désactivé : pas de code SMS à saisir pour payer. À 0 € (code à 100 %), le
 * champ carte disparaît et le bouton valide la commande.
 * Après paiement, Stripe renvoie sur /bienvenue (return_url de la session).
 */
export default function Payment({
  clientSecret,
  publishableKey,
  label,
  onBack,
}: {
  clientSecret: string;
  publishableKey: string;
  /** « Votre livre » ou « Le livre de Jeanne ». */
  label: string;
  onBack: () => void;
}) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: {
          loader: "never",
          fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" }],
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#161616",
              colorText: "#161616",
              colorTextSecondary: "#4a4a45",
              colorDanger: "#a8402f",
              colorBackground: "#ffffff",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSizeBase: "16px",
              borderRadius: "12px",
              spacingUnit: "4px",
            },
            rules: {
              ".Input": { border: "1px solid #d4d3cc", boxShadow: "none", padding: "13px 14px" },
              ".Input:focus": { border: "1px solid #161616", boxShadow: "0 0 0 3px #fcebd2" },
              ".Label": { fontWeight: "600", fontSize: "14px", marginBottom: "6px" },
            },
          },
        },
      }}
    >
      <PaymentForm label={label} onBack={onBack} />
    </CheckoutElementsProvider>
  );
}

function PaymentForm({ label, onBack }: { label: string; onBack: () => void }) {
  const state = useCheckout();
  const [code, setCode] = useState("");
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeBusy, setCodeBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (state.type === "loading") {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Chargement du paiement">
        <div className="h-24 animate-pulse rounded-[16px] bg-[var(--surface-2)]" />
        <div className="h-36 animate-pulse rounded-[16px] bg-[var(--surface-2)]" />
        <div className="h-12 animate-pulse rounded-full bg-[var(--surface-2)]" />
      </div>
    );
  }
  if (state.type === "error") {
    return (
      <div role="alert" className="rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[15px] font-medium text-[var(--danger)]">
        Le paiement n’a pas pu se charger. Rechargez la page, ou écrivez-nous à contact@loomina.eu.
        <button type="button" onClick={onBack} className="link ml-2">Revenir aux coordonnées</button>
      </div>
    );
  }

  const checkout = state.checkout;
  const discount = checkout.discountAmounts?.[0] ?? null;
  const free = checkout.total.total.minorUnitsAmount === 0;

  const applyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = code.trim();
    if (!value || codeBusy) return;
    setCodeBusy(true);
    setCodeError(null);
    const res = await checkout.applyPromotionCode(value);
    setCodeBusy(false);
    if (res.type === "error") setCodeError("Ce code n’est pas valable. Vérifiez l’orthographe.");
    else setCode("");
  };

  const removeCode = async () => {
    setCodeBusy(true);
    await checkout.removePromotionCode();
    setCodeBusy(false);
  };

  const pay = async () => {
    if (paying) return;
    setPaying(true);
    setPayError(null);
    const res = await checkout.confirm();
    // En cas de succès, Stripe redirige vers /bienvenue : on garde le bouton en attente.
    if (res.type === "error") {
      setPayError(res.error.message || "Le paiement a été refusé. Vérifiez la carte, ou essayez-en une autre.");
      setPaying(false);
    }
  };

  return (
    <div>
      {/* Récapitulatif */}
      <div className="rounded-[18px] bg-[var(--canvas)] p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-4 text-[16px]">
          <span className="font-semibold">{label}</span>
          <span className="tabular-nums">{checkout.total.subtotal.amount}</span>
        </div>
        {discount && (
          <div className="mt-2 flex items-center justify-between gap-4 text-[15px] text-[var(--success)]">
            <span className="flex items-center gap-2">
              <span className="pill pill-green !py-0.5">{discount.promotionCode ?? discount.displayName}</span>
              <button type="button" onClick={removeCode} disabled={codeBusy} className="text-[14px] text-[var(--ink-3)] underline underline-offset-2">
                Retirer
              </button>
            </span>
            <span className="tabular-nums">−{discount.amount}</span>
          </div>
        )}
        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-3">
          <span className="text-[16px] font-bold">Total</span>
          <span className="text-[22px] font-extrabold tracking-[-0.02em] tabular-nums">{checkout.total.total.amount}</span>
        </div>

        {!discount &&
          (codeOpen ? (
            <form onSubmit={applyCode} className="mt-3 flex gap-2">
              <label htmlFor="promo" className="sr-only">Code promo</label>
              <input
                id="promo"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError(null);
                }}
                placeholder="Code promo"
                autoComplete="off"
                autoFocus
                className="field !min-h-11 flex-1 !rounded-[12px] !text-[16px] uppercase"
              />
              <button type="submit" disabled={!code.trim() || codeBusy} className="press min-h-11 rounded-[12px] bg-[var(--ink)] px-4 text-[15px] font-bold text-white disabled:opacity-40">
                {codeBusy ? "…" : "Appliquer"}
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setCodeOpen(true)} className="mt-3 text-[15px] font-semibold text-[var(--ink-2)] underline decoration-[var(--amber-line)] decoration-2 underline-offset-4 hover:decoration-[var(--amber)]">
              J’ai un code promo
            </button>
          ))}
        {codeError && <p className="mt-2 text-[14px] font-medium text-[var(--danger)]">{codeError}</p>}
      </div>

      {/* Carte */}
      {!free && (
        <div className="mt-5">
          <PaymentElement
            options={{
              layout: "tabs",
              wallets: { link: "never", applePay: "auto", googlePay: "auto" },
            }}
          />
        </div>
      )}

      {payError && (
        <p role="alert" className="mt-4 rounded-[12px] bg-[#fbeae6] px-4 py-3 text-[15px] font-medium text-[var(--danger)]">
          {payError}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={paying || !checkout.canConfirm}
        className="press mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3.5 text-[17px] font-bold text-white transition hover:bg-[var(--ink-soft)] disabled:opacity-50"
      >
        <Icon name="shield" size={18} />
        {paying ? "Validation…" : free ? "Valider ma commande" : `Payer ${checkout.total.total.amount}`}
      </button>

      <p className="mt-3 text-center text-[13px] leading-relaxed text-[var(--ink-3)]">
        Paiement chiffré, géré par Stripe. En validant, vous acceptez les{" "}
        <Link href="/cgv" className="underline underline-offset-2">conditions de vente</Link>.
      </p>
      <p className="mt-4 text-center">
        <button type="button" onClick={onBack} className="text-[14px] text-[var(--ink-3)] underline underline-offset-2 hover:text-[var(--ink)]">
          ← Modifier les coordonnées
        </button>
      </p>
    </div>
  );
}
