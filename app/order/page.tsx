"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { blurOf } from "@/lib/photo-blur";
import Payment from "@/components/order/Payment";
import Icon from "@/components/ui/Icon";
import { CALL_MINUTES_OPTIONS, DEFAULT_CALL_MINUTES } from "@/lib/loomina/call-length";
import { formatToE164, formatPhoneNumberForDisplay } from "@/lib/phone";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import CheckoutBar, { CheckoutFooter } from "@/components/order/CheckoutBar";
import { OFFER } from "@/config/offer";
import { track } from "@/lib/analytics";

const STEPS = ["Pour qui", "Coordonnées", "Paiement"];

type Who = "me" | "gift";
type PayMethod = "card" | "klarna";
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
  // Les autres proches qui suivront le livre dans l'espace famille (livre offert).
  const [relatives, setRelatives] = useState<{ firstName: string; phone: string }[]>([]);
  const [relativeErrors, setRelativeErrors] = useState<Record<number, { firstName?: string; phone?: string }>>({});
  const [callMinutes, setCallMinutes] = useState<number>(DEFAULT_CALL_MINUTES);
  // Paiement intégré : le formulaire Stripe s'affiche ici, à l'étape 3.
  const [checkout, setCheckout] = useState<{ clientSecret: string; publishableKey: string; installments: boolean; method: PayMethod } | null>(null);
  // Code promo appliqué : réappliqué si le client passe de la carte à Klarna (nouvelle session).
  const [promo, setPromo] = useState<string | null>(null);
  // Code venu d'un lien (e-mail du récit de démonstration : /order?code=…), appliqué dès l'étape du paiement.
  const [linkCode, setLinkCode] = useState<string | null>(null);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code")?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9-]{4,40}$/.test(code)) return;
    const id = window.setTimeout(() => setLinkCode(code), 0);
    return () => window.clearTimeout(id);
  }, []);

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
    const { name } = e.target;
    // Numéro tapé ou collé : remis en paires (« 07 81 31 12 98 »).
    const value = name === "phone" || name === "giverPhone" ? formatPhoneNumberForDisplay(e.target.value).slice(0, 20) : e.target.value;
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
    // Les proches ajoutés : une ligne vide est ignorée, une ligne commencée doit être complète.
    const rel: Record<number, { firstName?: string; phone?: string }> = {};
    if (isGift) {
      const taken = new Set([formatToE164(form.phone), formatToE164(form.giverPhone)]);
      relatives.forEach((r, i) => {
        if (!r.firstName.trim() && !r.phone.trim()) return;
        const e: { firstName?: string; phone?: string } = {};
        if (!r.firstName.trim()) e.firstName = "Son prénom, pour l’accueillir.";
        if (!validPhone(r.phone)) e.phone = "Vérifiez le numéro : dix chiffres.";
        else if (taken.has(formatToE164(r.phone))) e.phone = "Ce numéro est déjà dans la commande.";
        else taken.add(formatToE164(r.phone));
        if (e.firstName || e.phone) rel[i] = e;
      });
    }
    setRelativeErrors(rel);
    setErrors(next);
    return Object.keys(next).length === 0 && Object.keys(rel).length === 0;
  };

  const startCheckout = async (method: PayMethod, replaces: string | null, phone = formatToE164(form.phone)) => {
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
        familyMembers: isGift
          ? relatives.filter((r) => r.firstName.trim() && validPhone(r.phone)).map((r) => ({ firstName: r.firstName.trim(), phone: formatToE164(r.phone) }))
          : [],
        method,
        replaces,
      }),
    });
    return (await res.json().catch(() => ({}))) as { clientSecret?: string; publishableKey?: string; installments?: boolean; url?: string; error?: string };
  };

  /** Carte ↔ Klarna : une nouvelle session Stripe pour le moyen choisi. Renvoie false si elle n'a pas pu être créée. */
  const switchMethod = async (method: PayMethod): Promise<boolean> => {
    if (!checkout || checkout.method === method) return true;
    const replaces = checkout.clientSecret.split("_secret_")[0] || null;
    try {
      const data = await startCheckout(method, replaces);
      if (!data.clientSecret || !data.publishableKey) {
        if (data.error === "klarna") setCheckout({ ...checkout, installments: false });
        return false;
      }
      setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey, installments: checkout.installments, method });
      return true;
    } catch {
      return false;
    }
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
      const data = await startCheckout("card", null, phone);
      if (data.clientSecret && data.publishableKey) {
        setPromo(linkCode);
        setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey, installments: Boolean(data.installments), method: "card" });
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

          {linkCode && step !== 3 && (
            <p className="mb-4 flex items-center justify-center gap-2 rounded-[14px] bg-[var(--amber-soft)] px-4 py-3 text-center text-[15px] font-semibold text-[var(--amber-deep)]" role="status">
              <Icon name="check" size={16} /> Votre réduction est prête : elle s’appliquera toute seule au paiement.
            </p>
          )}
          <div className="card card-float p-5 sm:p-8">
            <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[30px]">{title}</h1>

            {/* Étape 3 : paiement intégré, sans quitter le site */}
            {step === 3 && checkout && (
              <div className="rise mt-6">
                <Payment
                  key={checkout.clientSecret}
                  clientSecret={checkout.clientSecret}
                  method={checkout.method}
                  onSwitch={switchMethod}
                  promo={promo}
                  onPromo={setPromo}
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
                    { key: "me", title: "Pour moi", text: "Je raconte mon histoire.", photo: "homme-au-telephone", alt: "Un homme âgé raconte un souvenir au téléphone.", focus: "50% 30%" },
                    { key: "gift", title: "Pour offrir", text: "Un proche raconte la sienne.", photo: "grand-mere-calin", alt: "Une petite fille serre sa grand-mère dans ses bras.", focus: "50% 35%" },
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
                      className={`press group relative flex flex-col items-stretch overflow-hidden rounded-[18px] border text-left transition ${
                        active ? "border-[var(--ink)] bg-[var(--canvas)] ring-1 ring-[var(--ink)]" : "border-[var(--rule-strong)] bg-white hover:border-[var(--ink)]"
                      }`}
                    >
                      <span className={`relative block overflow-hidden transition-all duration-300 ${step === 1 ? "aspect-[4/3]" : "aspect-[16/7]"}`}>
                        <Image
                          src={`/photos/${o.photo}.jpg`}
                          alt={o.alt}
                          fill
                          sizes="(min-width: 640px) 300px, 45vw"
                          priority
                          {...blurOf(o.photo)}
                          className={`object-cover transition duration-500 group-hover:scale-[1.03] ${active || step === 1 ? "" : "opacity-60 grayscale"}`}
                          style={{ objectPosition: o.focus }}
                        />
                      </span>
                      <span className="block p-3.5 sm:p-4">
                        <span className="block text-[16px] font-bold leading-tight sm:text-[17px]">{o.title}</span>
                        <span className="mt-1 block text-[14px] leading-snug text-[var(--ink-3)]">{o.text}</span>
                      </span>
                      <span aria-hidden className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition ${active ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-white/80 bg-white/80 backdrop-blur"}`}>
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

                      {/* D'autres proches peuvent suivre le livre, chacun avec son numéro (Solal, 20/11/2026). */}
                      {relatives.map((r, i) => (
                        <div key={i} className="mt-5 border-t border-[var(--line-soft)] pt-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[15px] font-bold">Un autre proche</p>
                            <button
                              type="button"
                              onClick={() => {
                                setRelatives((all) => all.filter((_, j) => j !== i));
                                setRelativeErrors({});
                              }}
                              className="link text-[14px]"
                            >
                              Retirer
                            </button>
                          </div>
                          <div className="mt-3 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                            <Input
                              className={field}
                              label="Son prénom"
                              name={`proche-prenom-${i}`}
                              autoComplete="off"
                              value={r.firstName}
                              onChange={(e) => {
                                const v = e.target.value.slice(0, 30);
                                setRelatives((all) => all.map((x, j) => (j === i ? { ...x, firstName: v } : x)));
                                setRelativeErrors((er) => ({ ...er, [i]: { ...er[i], firstName: undefined } }));
                              }}
                              error={relativeErrors[i]?.firstName}
                            />
                            <Input
                              className={field}
                              label="Son portable"
                              name={`proche-tel-${i}`}
                              type="tel"
                              inputMode="tel"
                              placeholder="06 12 34 56 78"
                              autoComplete="off"
                              value={r.phone}
                              onChange={(e) => {
                                const v = formatPhoneNumberForDisplay(e.target.value).slice(0, 20);
                                setRelatives((all) => all.map((x, j) => (j === i ? { ...x, phone: v } : x)));
                                setRelativeErrors((er) => ({ ...er, [i]: { ...er[i], phone: undefined } }));
                              }}
                              error={relativeErrors[i]?.phone}
                            />
                          </div>
                        </div>
                      ))}
                      {relatives.length < 9 && (
                        <button
                          type="button"
                          onClick={() => setRelatives((all) => [...all, { firstName: "", phone: "" }])}
                          className="press mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--rule-strong)] bg-white px-4 text-[15px] font-semibold hover:border-[var(--ink)]"
                        >
                          <span aria-hidden="true" className="text-[18px] leading-none">+</span>
                          {relatives.length ? "Ajouter un autre proche" : "Ajouter un proche"}
                        </button>
                      )}
                      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--ink-3)]">
                        Un frère, une cousine, un petit-enfant : chacun suit le livre avec son propre numéro. Il reçoit un SMS pour ouvrir son espace.
                      </p>
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
              { icon: "book", text: "Livre imprimé, livré chez vous, frais inclus" },
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
