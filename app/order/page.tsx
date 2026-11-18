"use client";

import { useEffect, useState } from "react";
import Payment from "@/components/order/Payment";
import Icon from "@/components/ui/Icon";
import { CALL_MINUTES_OPTIONS, DEFAULT_CALL_MINUTES } from "@/lib/loomina/call-length";
import { formatToE164 } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import CheckoutBar, { CheckoutFooter } from "@/components/order/CheckoutBar";
import { OFFER } from "@/config/offer";
import { track } from "@/lib/analytics";

const STEPS = ["Pour qui", "Coordonnées", "Paiement"];

type Who = "me" | "gift";
type Errors = Partial<Record<"firstName" | "lastName" | "phone" | "email" | "giverFirstName" | "giverPhone", string>>;

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
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", giverFirstName: "", giverPhone: "" });
  const [callMinutes, setCallMinutes] = useState<number>(DEFAULT_CALL_MINUTES);
  // Paiement intégré : le formulaire Stripe s'affiche ici, à l'étape 3.
  const [checkout, setCheckout] = useState<{ clientSecret: string; publishableKey: string; installments: boolean } | null>(null);

  // Les boutons « Commencer mon livre » et « Offrir le livre » arrivent ici avec le choix déjà fait.
  useEffect(() => {
    const choice = window.location.hash;
    const preset: Who | null = choice === "#pour-moi" ? "me" : choice === "#pour-offrir" ? "gift" : null;
    if (!preset) return;
    const id = window.setTimeout(() => setWho(preset), 0);
    return () => window.clearTimeout(id);
  }, []);

  const step = checkout ? 3 : who ? 2 : 1;
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
    if (isGift) {
      // Celui qui offre : son prénom et son portable ouvrent son espace famille.
      if (!form.giverFirstName.trim()) next.giverFirstName = "Indiquez votre prénom : il apparaîtra dans votre espace famille.";
      if (!validPhone(form.giverPhone)) next.giverPhone = "Vérifiez votre numéro : dix chiffres, par exemple 06 12 34 56 78.";
      else if (validPhone(form.phone) && formatToE164(form.giverPhone) === formatToE164(form.phone))
        next.giverPhone = "C’est le même numéro que celui de la personne qui raconte. Indiquez le vôtre.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const phone = formatToE164(form.phone);
    track("begin_checkout", {
      currency: "EUR",
      value: OFFER.price,
      pour: isGift ? "offrir" : "soi",
      items: [{ item_id: "livre", item_name: OFFER.name, price: OFFER.price, quantity: 1 }],
      transport_type: "beacon",
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone,
          isGift,
          callMinutes,
          giverFirstName: isGift ? form.giverFirstName.trim() : "",
          giverPhone: isGift ? formatToE164(form.giverPhone) : "",
        }),
      });
      const data = await res.json();
      if (data.clientSecret && data.publishableKey) {
        setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey, installments: Boolean(data.installments) });
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (data.url) {
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

  const field = "!min-h-12 !text-[16px] !rounded-[12px]";
  const title =
    step === 1 ? "À qui se destine ce livre ?" : step === 3 ? "Paiement" : isGift ? "Qui va raconter son histoire ?" : "Vos coordonnées";

  return (
    <div className="flex min-h-svh flex-col">
      <CheckoutBar />
      <div className="flex-1 px-4 pb-6 sm:px-6">
        <div className="mx-auto w-full max-w-[640px]">
          {/* Progression */}
          <ol className="mb-4 mt-1 flex items-center justify-center sm:mt-6 gap-2 text-[13px] font-semibold sm:gap-3" aria-label="Étapes de la commande">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const current = n === step;
              const done = n < step;
              return (
                <li key={label} className="flex items-center gap-2 sm:gap-3">
                  {i > 0 && <span aria-hidden className={`h-px w-5 sm:w-10 ${done || current ? "bg-[var(--ink)]" : "bg-[var(--rule-strong)]"}`} />}
                  <span className={`flex items-center gap-1.5 ${current ? "text-[var(--ink)]" : done ? "text-[var(--ink-2)]" : "text-[var(--ink-3)]"}`} aria-current={current ? "step" : undefined}>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        current ? "bg-[var(--ink)] text-white" : done ? "bg-[var(--amber-soft)] text-[var(--amber-deep)]" : "border border-[var(--rule-strong)]"
                      }`}
                    >
                      {done ? <Icon name="check" size={12} /> : n}
                    </span>
                    <span className={current ? "" : "hidden sm:inline"}>{label}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="card card-float p-5 sm:p-8">
            <p className="text-[13px] font-semibold text-[var(--amber-ink)]">
              Votre livre de vie · {OFFER.price} € tout compris
            </p>
            <h1 className="mt-1.5 text-[26px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[30px]">{title}</h1>

            {/* Étape 3 : paiement intégré, sans quitter le site */}
            {step === 3 && checkout && (
              <div className="rise mt-6">
                <Payment
                  clientSecret={checkout.clientSecret}
                  publishableKey={checkout.publishableKey}
                  installments={checkout.installments}
                  label={isGift && form.firstName.trim() ? `Le livre de ${form.firstName.trim()}` : "Votre livre de vie"}
                  onBack={() => setCheckout(null)}
                />
              </div>
            )}

            {/* Étape 1 */}
            {step !== 3 && (
              <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Destinataire">
                {(
                  [
                    { key: "me", title: "Pour moi", text: "Je raconte mon histoire.", icon: "user" },
                    { key: "gift", title: "Pour offrir", text: "Un proche raconte la sienne.", icon: "gift" },
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
                      className={`press relative flex flex-col items-start gap-3 rounded-[18px] border p-4 text-left transition sm:p-5 ${
                        active ? "border-[var(--ink)] bg-[var(--canvas)] ring-1 ring-[var(--ink)]" : "border-[var(--rule-strong)] bg-white hover:border-[var(--ink)]"
                      }`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full transition ${active ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-2)] text-[var(--ink-2)]"}`}>
                        <Icon name={o.icon} size={19} />
                      </span>
                      <span>
                        <span className="block text-[16px] font-bold leading-tight sm:text-[17px]">{o.title}</span>
                        <span className="mt-1 block text-[14px] leading-snug text-[var(--ink-3)]">{o.text}</span>
                      </span>
                      <span aria-hidden className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition ${active ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--rule-strong)]"}`}>
                        {active && <Icon name="check" size={12} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <form onSubmit={submit} className="rise mt-6 border-t border-[var(--line-soft)] pt-6" noValidate>
                <p className="max-w-xl text-[15px] leading-relaxed text-[var(--ink-2)]">
                  {isGift
                    ? "Les coordonnées de la personne qui racontera son histoire : c’est elle qui parlera avec Loomina, et c’est son numéro que Loomina reconnaîtra."
                    : "Pour vous reconnaître quand vous appellerez, et créer votre espace auteur."}
                </p>
                <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  <Input className={field} label={isGift ? "Son prénom" : "Prénom"} name="firstName" autoComplete={isGift ? "off" : "given-name"} value={form.firstName} onChange={onChange} error={errors.firstName} required />
                  <Input className={field} label={isGift ? "Son nom" : "Nom"} name="lastName" autoComplete={isGift ? "off" : "family-name"} value={form.lastName} onChange={onChange} error={errors.lastName} required />
                  <Input
                    className={field}
                    label={isGift ? "Son téléphone" : "Téléphone"}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="06 12 34 56 78"
                    autoComplete={isGift ? "off" : "tel"}
                    value={form.phone}
                    onChange={onChange}
                    error={errors.phone}
                    hint={isGift ? "Celui d’où cette personne appellera Loomina." : "Celui d’où vous appellerez Loomina."}
                    required
                  />
                  <Input
                    className={field}
                    label="E-mail"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange}
                    error={errors.email}
                    hint={isGift ? "Le vôtre ou le sien, pour la confirmation." : "Pour la confirmation et les nouvelles du livre."}
                    required
                  />
                  {isGift && (
                    <div className="rounded-[16px] bg-[var(--canvas)] p-4 sm:col-span-2 sm:p-5">
                      <p className="text-[16px] font-bold">Et vous ?</p>
                      <p className="mt-1 text-[14px] leading-relaxed text-[var(--ink-3)]">Votre espace famille : suivre le livre et souffler des souvenirs à Loomina.</p>
                      <div className="mt-4 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                        <Input className={field} label="Votre prénom" name="giverFirstName" autoComplete="given-name" value={form.giverFirstName} onChange={onChange} error={errors.giverFirstName} required />
                        <Input
                          className={field}
                          label="Votre portable"
                          name="giverPhone"
                          type="tel"
                          inputMode="tel"
                          placeholder="06 12 34 56 78"
                          autoComplete="tel"
                          value={form.giverPhone}
                          onChange={onChange}
                          error={errors.giverPhone}
                          hint="Pour recevoir votre code par SMS."
                          required
                        />
                      </div>
                    </div>
                  )}
                  <fieldset className="sm:col-span-2">
                    <legend className="field-label !text-[14px]">Durée de chaque appel</legend>
                    <div className="inline-flex w-full rounded-full bg-[var(--canvas)] p-1 sm:w-auto">
                      {CALL_MINUTES_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          aria-pressed={callMinutes === m}
                          onClick={() => setCallMinutes(m)}
                          className={`press min-h-10 flex-1 rounded-full px-4 text-[15px] font-semibold sm:flex-none ${
                            callMinutes === m ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                          }`}
                        >
                          {m} min
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[14px] text-[var(--ink-3)]">Environ : Loomina laisse toujours finir le souvenir en cours. Modifiable à tout moment.</p>
                  </fieldset>
                </div>

                {submitError && (
                  <p role="alert" className="mt-5 rounded-[12px] bg-[#fbeae6] px-4 py-3 text-[15px] font-medium text-[var(--danger)]">
                    {submitError}
                  </p>
                )}

                <div className="mt-6">
                  <Button type="submit" loading={submitting} className="w-full">
                    {submitting ? "Préparation du paiement…" : "Continuer vers le paiement"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Ce qui rassure, en une ligne */}
          <ul className="mt-5 grid gap-2 text-[13px] text-[var(--ink-3)] sm:grid-cols-3 sm:gap-3">
            {([
              { icon: "heart", text: `Remboursé si le premier appel ne vous plaît pas` },
              { icon: "book", text: "Livre relié livré chez vous, frais inclus" },
              { icon: "phone", text: "Autant d’appels qu’il vous faut" },
            ] as const).map((t) => (
              <li key={t.text} className="flex items-center gap-2 sm:flex-col sm:items-center sm:text-center">
                <span className="text-[var(--amber-ink)]">
                  <Icon name={t.icon} size={16} />
                </span>
                {t.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <CheckoutFooter />
    </div>
  );
}
