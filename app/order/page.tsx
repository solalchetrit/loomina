"use client";

import { useState } from "react";
import Link from "next/link";
import { formatToE164 } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { RuledList } from "@/components/ui/Section";
import { OFFER, INCLUDED, GUARANTEE } from "@/config/offer";

const STEPS = ["Pour qui", "Coordonnées", "Paiement"];

type Who = "me" | "gift";
type Errors = Partial<Record<"firstName" | "lastName" | "phone" | "email", string>>;

function validPhone(raw: string): boolean {
  const e164 = formatToE164(raw);
  // Français (+33 + 9 chiffres) ou international plausible (8 à 15 chiffres).
  return /^\+33[1-9]\d{8}$/.test(e164) || /^\+\d{8,15}$/.test(e164);
}

export default function OrderPage() {
  const [who, setWho] = useState<Who | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  const step = who ? 2 : 1;
  const isGift = who === "gift";

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = "Le prénom est nécessaire : Loomina s’en servira pour dire bonjour.";
    if (!form.lastName.trim()) next.lastName = "Indiquez le nom, pour la couverture du livre.";
    if (!validPhone(form.phone)) next.phone = "Vérifiez le numéro : dix chiffres, par exemple 06 12 34 56 78.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Vérifiez l’adresse e-mail : il manque un @ ou un point.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const phone = formatToE164(form.phone);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone, isGift }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubmitError("Le paiement n’a pas pu démarrer. Réessayez dans un instant, ou écrivez-nous à contact@loomina.eu.");
        setSubmitting(false);
      }
    } catch {
      setSubmitError("Impossible de joindre le service de paiement. Vérifiez votre connexion et réessayez.");
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[80svh] pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <div>
            {/* Progression */}
            <ol className="rise flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[15px]" aria-label="Étapes de la commande">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const current = n === step;
                const done = n < step;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span className={current ? "font-semibold text-[var(--ink)]" : done ? "text-[var(--ink)]" : "text-[var(--ink-3)]"} aria-current={current ? "step" : undefined}>
                      <span className="t-numeral mr-1.5">{n}.</span>
                      {label}
                    </span>
                    {n < STEPS.length && <span aria-hidden="true" className="h-px w-6 bg-[var(--rule-strong)]" />}
                  </li>
                );
              })}
            </ol>

            <div className="rise mt-8" style={{ "--i": 1 } as React.CSSProperties}>
              <h1 className="t-title">
                {step === 1 ? "À qui se destine ce livre ?" : isGift ? "Qui va raconter son histoire ?" : "Vos coordonnées."}
              </h1>
              <span aria-hidden="true" className="gold-dash mt-6" />
            </div>

            {/* Étape 1 */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Destinataire">
              {(
                [
                  { key: "me", title: "C’est pour moi", text: "Je veux raconter mon histoire." },
                  { key: "gift", title: "C’est pour offrir", text: "Je veux connaître l’histoire d’un proche." },
                ] as const
              ).map((o) => {
                const active = who === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setWho(o.key)}
                    className={`press flex items-start gap-4 rounded-lg border bg-white p-5 text-left ${
                      active ? "border-[var(--ink)] ring-1 ring-[var(--ink)]" : "border-[var(--rule-strong)] hover:border-[var(--ink)]"
                    }`}
                  >
                    <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--rule-strong)]"}`}>
                      {active && <span className="h-2 w-2 rounded-full bg-[var(--gold-light)]" />}
                    </span>
                    <span>
                      <span className="block font-serif text-[22px] leading-tight text-[var(--ink)]">{o.title}</span>
                      <span className="t-body mt-1 block">{o.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Étape 2 */}
            {step === 2 && (
              <form onSubmit={submit} className="rise mt-10 border-t border-[var(--rule)] pt-10" noValidate>
                <p className="t-body max-w-xl">
                  {isGift
                    ? "Les coordonnées de la personne qui racontera son histoire. C’est elle qui parlera avec Loomina, et c’est son numéro que Loomina reconnaîtra."
                    : "Ces informations servent à vous reconnaître quand vous appellerez, et à créer votre espace auteur."}
                </p>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <Input label={isGift ? "Son prénom" : "Votre prénom"} name="firstName" autoComplete={isGift ? "off" : "given-name"} value={form.firstName} onChange={onChange} error={errors.firstName} required />
                  <Input label={isGift ? "Son nom" : "Votre nom"} name="lastName" autoComplete={isGift ? "off" : "family-name"} value={form.lastName} onChange={onChange} error={errors.lastName} required />
                  <div className="sm:col-span-2">
                    <Input
                      label={isGift ? "Son numéro de téléphone" : "Votre numéro de téléphone"}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete={isGift ? "off" : "tel"}
                      value={form.phone}
                      onChange={onChange}
                      error={errors.phone}
                      hint={
                        isGift
                          ? "Le numéro depuis lequel cette personne appellera Loomina : c’est ainsi qu’elle sera reconnue. Fixe ou portable."
                          : "Le numéro depuis lequel vous appellerez Loomina : c’est ainsi qu’elle vous reconnaîtra. Fixe ou portable."
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="E-mail"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={onChange}
                      error={errors.email}
                      hint={isGift ? "Le vôtre ou le sien : la confirmation et les nouvelles du livre y arriveront." : "Pour recevoir la confirmation et les nouvelles de votre livre."}
                      required
                    />
                  </div>
                </div>

                {submitError && (
                  <p role="alert" className="mt-6 border-l-2 border-[var(--danger)] pl-4 font-sans text-[16px] text-[var(--danger)]">
                    {submitError}
                  </p>
                )}

                <div className="mt-8">
                  <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting}>
                    {submitting ? "Ouverture du paiement…" : `Payer ${OFFER.price} € sur la page sécurisée`}
                  </Button>
                  <p className="t-small mt-4">
                    Paiement par carte, sécurisé par Stripe. En payant, vous acceptez les{" "}
                    <Link href="/cgv" className="link">
                      conditions de vente
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Récapitulatif */}
          <aside className="rise rule-top pt-6 lg:sticky lg:top-28 lg:self-start" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="t-eyebrow">Votre commande</p>
            <p className="mt-3 font-serif text-[24px] leading-tight text-[var(--ink)]">{OFFER.name}</p>
            <p className="mt-4 font-serif text-[56px] leading-none tracking-[-0.03em] text-[var(--ink)]">
              {OFFER.price}
              <span className="ml-1 align-top text-[0.45em]">{OFFER.currencySymbol}</span>
            </p>
            <p className="t-small mt-2">Tout compris, livraison incluse.</p>
            <RuledList className="mt-6" items={INCLUDED.map((i) => ({ title: i.title }))} />
            <p className="t-small mt-5">{GUARANTEE}</p>
            <p className="t-small mt-3">
              Une question avant de commander ?{" "}
              <Link href="/contact" className="link">
                Écrivez-nous
              </Link>
              .
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
