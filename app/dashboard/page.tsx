"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AuthorSpace from "@/components/author/AuthorSpace";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { formatToE164, formatPhoneNumberForDisplay } from "@/lib/phone";

type LoginStep = "phone" | "otp";

const STORAGE_KEY = "loomina_user_phone";

/**
 * Espace auteur.
 * Connexion par SMS (Twilio Verify) ; la session est un cookie posé par le
 * serveur. Le numéro mémorisé en local ne vaut que comme confort d'affichage :
 * si le cookie a expiré, l'API répond 401 et on revient à la connexion.
 */
export default function DashboardPage() {
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginStep, setLoginStep] = useState<LoginStep>("phone");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justOrdered, setJustOrdered] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // localStorage n'existe que dans le navigateur : on le lit après le premier rendu.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPhone(stored);
        setIsLoggedIn(true);
      }
    } catch {
      /* stockage indisponible : on demandera le code */
    }
    // Poste local : ouverture directe de l'espace du numéro de .env.local (voir /api/auth/dev).
    if (process.env.NODE_ENV === "development") {
      fetch("/api/auth/dev", { method: "POST" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { phone?: string } | null) => {
          if (!data?.phone) return;
          setPhone(data.phone);
          setIsLoggedIn(true);
        })
        .catch(() => {});
    }
    if (new URLSearchParams(window.location.search).has("session_id")) setJustOrdered(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const logout = useCallback(async (expired = false) => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* le cookie sera de toute façon ignoré */
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setIsLoggedIn(false);
    setOtpCode("");
    setLoginStep("phone");
    setSessionExpired(expired);
  }, []);

  const onUnauthorized = useCallback(() => logout(true), [logout]);


  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const e164 = formatToE164(phone);
    if (!/^\+\d{8,15}$/.test(e164)) {
      setError("Vérifiez le numéro : dix chiffres, par exemple 06 12 34 56 78.");
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", phone_number: e164 }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) throw new Error("Ce numéro ne correspond à aucune commande. C’est bien le numéro indiqué à la commande ?");
      if (!res.ok) throw new Error(data.message || "Le code n’a pas pu être envoyé. Réessayez dans un instant.");
      setLoginStep("otp");
    } catch (err) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "Le service d’envoi de SMS ne répond pas. Réessayez dans un instant."
          : err instanceof Error
            ? err.message
            : "Une erreur est survenue. Réessayez."
      );
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode.length !== 6) {
      setError("Le code fait six chiffres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", phone_number: formatToE164(phone), otp_code: otpCode }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && (result.status === "approved" || result.valid === true)) {
        setIsLoggedIn(true);
        setSessionExpired(false);
        if (rememberMe) {
          try {
            localStorage.setItem(STORAGE_KEY, phone);
          } catch {
            /* ignore */
          }
        }
      } else {
        setError("Ce code n’est pas le bon, ou il a expiré. Vérifiez le SMS, ou demandez un nouveau code.");
      }
    } catch {
      setError("La vérification a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full px-5 pb-20 pt-32 sm:px-6 md:pt-40">
        <div className="mx-auto grid w-full max-w-[1240px] items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="rise">
            <p className="t-eyebrow">Espace auteur</p>
            <h1 className="t-display mt-3">{loginStep === "phone" ? "Retrouvez votre livre" : "Votre code est parti"}</h1>
            <p className="t-lead mt-6 max-w-md">
              {loginStep === "phone"
                ? "Entrez le numéro de téléphone donné à la commande. Nous vous envoyons un code par SMS, rien d’autre à retenir."
                : `Un SMS avec un code à six chiffres arrive au ${phone}. Entrez-le ci-contre.`}
            </p>

            {justOrdered && loginStep === "phone" && (
              <div className="mt-8 max-w-md rounded-[20px] border border-[var(--amber-line)] bg-[#fdf3e4] p-6">
                <p className="text-[19px] font-extrabold tracking-[-0.02em]">Merci, votre commande est confirmée.</p>
                <p className="t-body mt-3">
                  Tout commence par un appel : composez le{" "}
                  <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap font-semibold">
                    {SITE.phoneDisplay}
                  </a>{" "}
                  depuis le numéro indiqué à la commande, quand vous voulez. Les chapitres apparaîtront ici.
                </p>
              </div>
            )}

            {sessionExpired && (
              <p role="status" className="t-body mt-8 max-w-md rounded-[14px] bg-[var(--surface-2)] px-4 py-3">
                Votre session a expiré. Reconnectez-vous pour relire votre livre.
              </p>
            )}
          </div>

          <form onSubmit={loginStep === "phone" ? requestOtp : verifyOtp} className="rise card card-float p-6 sm:p-8 md:p-10" style={{ "--i": 2 } as React.CSSProperties}>
            {loginStep === "phone" ? (
              <div>
                <label htmlFor="phone" className="field-label">
                  Numéro de téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumberForDisplay(e.target.value);
                    if (formatted.length <= 20) setPhone(formatted);
                  }}
                  className="field text-[20px]"
                  aria-describedby={error ? "login-error" : undefined}
                  aria-invalid={error ? true : undefined}
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="otp" className="field-label">
                  Code reçu par SMS
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="field h-16 text-center text-[30px] font-bold tracking-[0.35em]"
                  aria-describedby={error ? "login-error" : undefined}
                  aria-invalid={error ? true : undefined}
                  autoFocus
                  required
                />
              </div>
            )}

            <label htmlFor="rememberMe" className="mt-5 flex cursor-pointer select-none items-center gap-3 font-sans text-[16px] text-[var(--ink-2)]">
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-5 w-5 accent-[var(--ink)]" />
              Rester connecté sur cet appareil
            </label>

            {error && (
              <p id="login-error" role="alert" className="mt-5 rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[16px] font-medium text-[var(--danger)]">
                {error}
              </p>
            )}

            <div className="mt-6">
              <Button type="submit" size="lg" loading={loading} className="w-full">
                {loading ? "Un instant…" : loginStep === "phone" ? "Recevoir mon code" : "Ouvrir mon espace"}
              </Button>
            </div>

            {loginStep === "otp" && (
              <button type="button" onClick={() => { setLoginStep("phone"); setOtpCode(""); setError(null); }} className="link mt-5 block font-sans text-[16px]">
                Modifier le numéro ou renvoyer un code
              </button>
            )}

            <div className="mt-8 border-t border-[var(--line-soft)] pt-6">
              <p className="t-body">
                Pas encore de livre en cours ?{" "}
                <Link href="/order" className="link font-medium">
                  Commander
                </Link>
                {" · "}
                <Link href="/contact" className="link font-medium">
                  Une question
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <AuthorSpace onLogout={() => logout(false)} onUnauthorized={onUnauthorized} />;
}
