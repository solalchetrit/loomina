"use client";
import { LOOMINA_CONFIG } from "@/config/loomina";

import { useState, useEffect } from "react";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import Button from "@/components/ui/Button";
import { formatToE164, formatPhoneNumberForDisplay } from "@/lib/phone";

type LoginStep = "phone" | "otp";

export default function DashboardPage() {
    const [phone, setPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [loginStep, setLoginStep] = useState<LoginStep>("phone");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    // Arrivée depuis Stripe (success_url = /dashboard?session_id=…) : le client
    // vient de payer et atterrit sur un formulaire de connexion sans un mot.
    const [justOrdered, setJustOrdered] = useState(false);

    // Check for persistent presence on mount
    useEffect(() => {
        const storedPhone = localStorage.getItem("loomina_user_phone");
        if (storedPhone) {
            setPhone(storedPhone);
            setIsLoggedIn(true);
        }
        if (new URLSearchParams(window.location.search).has("session_id")) {
            setJustOrdered(true);
        }
    }, []);

    // Fetch user profile when logged in
    useEffect(() => {
        async function fetchProfile() {
            if (!isLoggedIn || !phone) return;

            try {
                const res = await fetch("/api/user/me");
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.full_name) setUserName(data.full_name);
            } catch {
                /* silencieux : le prénom est un confort, pas une condition */
            }
        }
        fetchProfile();
    }, [isLoggedIn, phone]);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const e164 = formatToE164(phone);

            // L'existence du client est vérifiée côté serveur par /api/auth/verify.
            const cleanPhone = e164;

            // 2. Call verification API (Twilio)
            console.log("[Login] Sending verification request for:", cleanPhone);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const response = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "start",
                        phone_number: cleanPhone
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Erreur lors de l'envoi du code");
                }

                setLoginStep("otp");
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') {
                    throw new Error("Le service de vérification ne répond pas. Veuillez réessayer.");
                }
                throw err;
            }
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError(err instanceof Error && err.message ? err.message : "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const cleanPhone = formatToE164(phone);
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "check",
                    phone_number: cleanPhone,
                    otp_code: otpCode
                }),
            });

            const result = await response.json();

            if (result.status === "approved" || result.valid === true) {
                setIsLoggedIn(true);
                if (rememberMe) {
                    localStorage.setItem("loomina_user_phone", phone);
                }
            } else {
                setError("Code incorrect. Veuillez réessayer.");
            }
        } catch (err) {
            console.error("Verification error:", err);
            setError("Une erreur est survenue lors de la vérification.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setPhone("");
        setOtpCode("");
        setLoginStep("phone");
        localStorage.removeItem("loomina_user_phone");
    };

    if (!isLoggedIn) {
        const showOrdered = justOrdered && loginStep === "phone";
        return (
            <div className="flex min-h-[calc(100svh-0px)] w-full items-center px-5 pt-28 pb-16 sm:px-6 md:pt-32">
                <div className="mx-auto w-full max-w-md">
                    {showOrdered && (
                        <div className="rise card mb-8 rounded-3xl p-5">
                            <p className="font-serif text-[20px] leading-tight text-[var(--ink)]">Merci, votre commande est confirmée.</p>
                            <p className="mt-2 font-sans text-[14px] leading-relaxed text-[var(--text-secondary)]">
                                Votre biographe est prêt. Appelez le{" "}
                                <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="whitespace-nowrap font-semibold text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">{LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}</a>{" "}
                                depuis le numéro indiqué à la commande, ou connectez-vous ci-dessous pour que Loomina vous appelle.
                            </p>
                        </div>
                    )}

                    <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
                        <p className="eyebrow">Espace auteur</p>
                        <h1 className="heading-section mt-3">
                            {loginStep === "phone" ? (
                                <>Accédez à <em className="text-[var(--gold-ink)]">votre espace.</em></>
                            ) : (
                                <>Vérifiez <em className="text-[var(--gold-ink)]">votre identité.</em></>
                            )}
                        </h1>
                        <p className="mt-4 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">
                            {loginStep === "phone"
                                ? "Entrez le numéro de téléphone utilisé lors de votre commande. Vous recevrez un code par SMS."
                                : `Entrez le code à 6 chiffres envoyé au ${phone}.`}
                        </p>
                    </div>

                    <form onSubmit={loginStep === "phone" ? handleRequestOtp : handleVerifyOtp} className="rise mt-8 space-y-5" style={{ "--i": 2 } as React.CSSProperties}>
                        {loginStep === "phone" ? (
                            <div>
                                <label htmlFor="phone" className="field-label">Numéro de téléphone</label>
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
                                    className="field text-lg"
                                    required
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="otp" className="field-label">Code reçu par SMS</label>
                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="••••••"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="field h-16 text-center font-serif text-[32px] tracking-[0.4em]"
                                    autoFocus
                                    required
                                />
                            </div>
                        )}

                        <label htmlFor="rememberMe" className="flex cursor-pointer select-none items-center gap-3 font-sans text-[14px] text-[var(--text-secondary)]">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 accent-[var(--ink)]"
                            />
                            Rester connecté sur cet appareil
                        </label>

                        {error && (
                            <p role="alert" className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 px-4 py-3 font-sans text-[14px] text-[var(--danger)]">{error}</p>
                        )}

                        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                            {loading ? "Un instant…" : (loginStep === "phone" ? "Recevoir mon code" : "Valider le code")}
                        </Button>

                        {loginStep === "otp" && (
                            <button
                                type="button"
                                onClick={() => setLoginStep("phone")}
                                className="block w-full text-center font-sans text-[14px] text-[var(--text-muted)] underline decoration-[var(--hairline-strong)] underline-offset-4 transition-colors duration-200 hover:text-[var(--ink)]"
                            >
                                Modifier le numéro
                            </button>
                        )}
                    </form>

                    <div className="rise mt-10 border-t border-[var(--hairline)] pt-8" style={{ "--i": 3 } as React.CSSProperties}>
                        <p className="font-sans text-[14px] text-[var(--text-muted)]">Vous n’avez pas encore commencé votre histoire ?</p>
                        <Button href="/order" variant="secondary" size="md" className="mt-4">
                            Commander ma biographie
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pt-28 pb-20 md:pt-32 md:pb-28">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-6">
                <header className="rise flex flex-col gap-6 border-b border-[var(--hairline)] pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="eyebrow">Espace auteur</p>
                        <h1 className="heading-section mt-3">
                            {userName ? <>Bonjour, <em className="text-[var(--gold-ink)]">{userName}.</em></> : <>Votre <em className="text-[var(--gold-ink)]">espace.</em></>}
                        </h1>
                        <p className="mt-3 font-sans text-[15px] text-[var(--text-secondary)]">Suivez la rédaction de votre livre, récit après récit.</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                        <StartInterviewButton phone={phone} userName="Auteur" />
                        <button
                            onClick={handleLogout}
                            className="press rounded-full px-4 py-2 font-sans text-[14px] text-[var(--text-muted)] hover:bg-[var(--loomina-slate)]/60 hover:text-[var(--ink)]"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </header>

                <main className="rise mt-10" style={{ "--i": 2 } as React.CSSProperties}>
                    <LiveBook />
                </main>
            </div>
        </div>
    );
}
