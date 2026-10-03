"use client";

import { useState } from "react";
import { formatToE164 } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { SITE_CONFIG } from "@/app/config";

const STEPS = ["Pour qui", "Coordonnées", "Paiement"];

const INCLUDED = ["Entretiens illimités par téléphone", "Rédaction et corrections", "Vos photos intégrées", "Livre relié livré chez vous", "Version numérique incluse"];

const Check = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42 0l-3.5-3.53a1 1 0 1 1 1.42-1.408l2.79 2.814 6.79-6.853a1 1 0 0 1 1.414-.006Z" clipRule="evenodd" />
  </svg>
);

export default function OrderPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOption, setSelectedOption] = useState<"me" | "gift" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", age: "", phone: "", email: "" });

  const handleOptionClick = (option: "me" | "gift") => {
    setSelectedOption(option);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.age.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.email.trim() !== "";

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    // Format phone to E164 before saving for consistent storage
    const formattedPhone = formatToE164(formData.phone);

    // Save relevant data to localStorage as a JSON object (Backup)
    const orderData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      isGift: selectedOption === "gift",
      phone: formattedPhone,
      email: formData.email,
    };
    localStorage.setItem("loomina_order_data", JSON.stringify(orderData));

    try {
      // Call our custom checkout API to create a session with metadata
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formattedPhone,
          email: formData.email,
          isGift: selectedOption === "gift",
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No payment URL returned", data);
        setSubmitError("Une erreur est survenue lors de l’initialisation du paiement. Réessayez dans un instant.");
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setSubmitError("Impossible de joindre le service de paiement. Vérifiez votre connexion et réessayez.");
      setSubmitting(false);
    }
  };

  const isGift = selectedOption === "gift";

  return (
    <div className="w-full min-h-[80svh] pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        {/* Étapes */}
        <ol className="rise mx-auto flex max-w-xl items-center justify-center gap-2 font-sans text-[13px]" aria-label="Progression">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const current = n === step;
            const done = n < step;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                    current ? "bg-[var(--ink)] text-[var(--loomina-void)]" : done ? "bg-[var(--gold-ink)] text-white" : "bg-[var(--loomina-slate)] text-[var(--text-muted)]"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? "✓" : n}
                </span>
                <span className={`whitespace-nowrap ${current ? "font-semibold text-[var(--ink)]" : "hidden text-[var(--text-muted)] sm:inline"}`}>{label}</span>
                {n < STEPS.length && <span aria-hidden="true" className="mx-1 h-px w-4 bg-[var(--hairline-strong)] sm:w-10" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Colonne principale */}
          <div>
            <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
              <p className="eyebrow">Commander</p>
              <h1 className="heading-section mt-3">
                {step === 1 ? (
                  <>
                    À qui se destine <em className="text-[var(--gold-ink)]">ce livre ?</em>
                  </>
                ) : isGift ? (
                  <>
                    Qui va raconter <em className="text-[var(--gold-ink)]">son histoire ?</em>
                  </>
                ) : (
                  <>
                    Vos <em className="text-[var(--gold-ink)]">coordonnées.</em>
                  </>
                )}
              </h1>
            </div>

            {/* Étape 1 : choix */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Destinataire">
              {(
                [
                  { key: "me", title: "C’est pour moi", text: "Je veux raconter mon histoire.", i: 2 },
                  { key: "gift", title: "C’est pour offrir", text: "Je veux connaître l’histoire d’un proche.", i: 3 },
                ] as const
              ).map((o) => {
                const active = selectedOption === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleOptionClick(o.key)}
                    className={`press rise card flex items-start gap-4 rounded-3xl p-5 text-left ${active ? "!border-[var(--ink)] ring-1 ring-[var(--ink)]" : "hover:!border-[var(--loomina-gold)]"}`}
                    style={{ "--i": o.i } as React.CSSProperties}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--hairline-strong)]"}`}>
                      {active && <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold-light)]" />}
                    </span>
                    <span>
                      <span className="block font-serif text-[22px] leading-tight text-[var(--ink)]">{o.title}</span>
                      <span className="mt-1 block font-sans text-[14px] text-[var(--text-secondary)]">{o.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Étape 2 : formulaire */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="rise mt-10 border-t border-[var(--hairline)] pt-10" noValidate>
                <p className="font-sans text-[15px] text-[var(--text-secondary)]">
                  {isGift ? "Les coordonnées de la personne qui racontera son histoire. C’est elle que Loomina appellera." : "Ces informations servent à créer votre espace et à vous appeler."}
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Input label="Prénom" name="firstName" autoComplete={isGift ? "off" : "given-name"} value={formData.firstName} onChange={handleInputChange} placeholder="Jeanne" required />
                  <Input label="Nom" name="lastName" autoComplete={isGift ? "off" : "family-name"} value={formData.lastName} onChange={handleInputChange} placeholder="Martin" required />
                  <Input label="Âge" name="age" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={formData.age} onChange={handleInputChange} placeholder="75" required />
                  <Input label="Téléphone" name="phone" type="tel" inputMode="tel" autoComplete={isGift ? "off" : "tel"} value={formData.phone} onChange={handleInputChange} placeholder="06 12 34 56 78" hint="Le numéro sur lequel Loomina appellera." required />
                  <div className="sm:col-span-2">
                    <Input label="E-mail" name="email" type="email" inputMode="email" autoComplete="email" value={formData.email} onChange={handleInputChange} placeholder="jeanne.martin@exemple.fr" hint={isGift ? "Votre e-mail ou le sien : c’est là que le bon cadeau et les chapitres arriveront." : "Pour recevoir la confirmation et vos chapitres à relire."} required />
                  </div>
                </div>

                {submitError && (
                  <p role="alert" className="mt-6 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-3 font-sans text-[14px] text-[var(--danger)]">
                    {submitError}
                  </p>
                )}

                <div className="mt-8">
                  <Button type="submit" variant="primary" size="lg" fullWidth disabled={!isFormValid} loading={submitting}>
                    {submitting ? "Redirection vers le paiement…" : `Procéder au paiement · ${SITE_CONFIG.product.price} ${SITE_CONFIG.product.currencySymbol}`}
                  </Button>
                  <p className="mt-4 flex items-center justify-center gap-1.5 font-sans text-[13px] text-[var(--text-muted)]">
                    <svg className="h-4 w-4 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                    Paiement sécurisé par Stripe. Vous serez redirigé sur une page de paiement.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Récapitulatif */}
          <aside className="rise lg:sticky lg:top-28 lg:self-start" style={{ "--i": 4 } as React.CSSProperties}>
            <div className="card overflow-hidden rounded-3xl">
              <div className="paper-grain relative bg-[var(--ink)] p-6">
                <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--loomina-gold-light)]">Votre commande</p>
                <p className="mt-2 font-serif text-[22px] leading-tight text-[var(--loomina-void)]">Le Coffret Biographie Complet</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-[44px] leading-none tracking-[-0.03em] text-[var(--loomina-void)]">{SITE_CONFIG.product.price}</span>
                  <span className="font-serif text-xl text-[var(--loomina-gold-light)]">{SITE_CONFIG.product.currencySymbol}</span>
                  <span className="ml-2 font-sans text-[13px] text-[#cfc8bb]">tout compris</span>
                </div>
              </div>
              <ul className="space-y-2.5 p-6 font-sans text-[14px] text-[var(--text-secondary)]">
                {INCLUDED.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <Check /> {it}
                  </li>
                ))}
              </ul>
              <div className="border-t border-[var(--hairline)] px-6 py-4 font-sans text-[13px] text-[var(--text-muted)]">
                Satisfait ou remboursé après le premier appel.
              </div>
            </div>
            <p className="mt-4 px-2 font-sans text-[13px] text-[var(--text-muted)]">
              Une question avant de commander ? <a href="/contact" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">Écrivez-nous</a>.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
