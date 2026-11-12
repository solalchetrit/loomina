"use client";

import { useState } from "react";
import Link from "next/link";
import { formatToE164 } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { CheckList } from "@/components/ui/Section";
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
    <div className="min-h-[80svh] w-full pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="card p-6 sm:p-8 md:p-10">
            {/* Progression */}
            <ol className="flex flex-wrap items-center gap-2 text-[15px]" aria-label="Étapes de la commande">
              {STEPS.map((label, i) => {
                const n = i + 1;
                const current = n === step;
                const done = n < step;
                return (
                  <li key={label}>
                    <span
                      className={`pill ${current ? "bg-[var(--ink)] text-white" : done ? "pill-amber" : "pill-neutral"}`}
                      aria-current={current ? "step" : undefined}
                    >
                      {n}. {label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <h1 className="t-title mt-8">
              {step === 1 ? "À qui se destine ce livre ?" : isGift ? "Qui va raconter son histoire ?" : "Vos coordonnées"}
            </h1>

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
                    className={`press flex items-start gap-4 rounded-[20px] border p-5 text-left ${
                      active ? "border-[var(--ink)] bg-[var(--canvas)] ring-1 ring-[var(--ink)]" : "border-[var(--rule-strong)] bg-white hover:border-[var(--ink)]"
                    }`}
                  >
                    <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-[var(--ink)] bg-[var(--ink)]" : "border-[var(--rule-strong)]"}`}>
                      {active && <span className="h-2 w-2 rounded-full bg-[var(--amber)]" />}
                    </span>
                    <span>
                      <span className="block text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]">{o.title}</span>
                      <span className="t-body mt-1 block">{o.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Étape 2 */}
            {step === 2 && (
              <form onSubmit={submit} className="rise mt-8 border-t border-[var(--line-soft)] pt-8" noValidate>
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
                  <p role="alert" className="mt-6 rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[16px] font-medium text-[var(--danger)]">
                    {submitError}
                  </p>
                )}

                <div className="mt-8">
                  <Button type="submit" size="lg" loading={submitting} className="w-full">
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
          <aside className="card p-6 sm:p-8 lg:sticky lg:top-32 lg:self-start">
            <p className="text-[15px] font-bold text-[var(--ink-3)]">Votre commande</p>
            <p className="mt-2 text-[20px] font-extrabold leading-tight tracking-[-0.02em]">{OFFER.name}</p>
            <p className="mt-4 text-[56px] font-extrabold leading-none tracking-[-0.05em]">
              {OFFER.price}
              <span className="ml-1 align-top text-[0.45em] tracking-normal">{OFFER.currencySymbol}</span>
            </p>
            <p className="t-small mt-2">Tout compris, livraison incluse.</p>
            <CheckList className="mt-5" items={INCLUDED.map((i) => ({ title: i.title }))} />
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
