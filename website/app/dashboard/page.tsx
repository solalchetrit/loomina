"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import MagicButton from "@/components/ui/MagicButton";
import { motion } from "framer-motion";
import { formatToE164, formatPhoneNumberForDisplay } from "@/lib/phone";
import { LOOMINA_CONFIG } from "@/config/loomina";

type LoginStep = "phone" | "otp";

// Trigger deployment for simplified login
export default function DashboardPage() {
    const [phone, setPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [loginStep, setLoginStep] = useState<LoginStep>("phone");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for persistent presence on mount
    useEffect(() => {
        const storedPhone = localStorage.getItem("loomina_user_phone");
        if (storedPhone) {
            setPhone(storedPhone);
            setIsLoggedIn(true);
        }
    }, []);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const e164 = formatToE164(phone);
            const digitsOnly = phone.replace(/\D/g, '');

            // 1. Check if user exists in Supabase
            let { data: results } = await supabase
                .from('Client')
                .select('id, phone_number')
                .or(`phone_number.eq."${e164}",phone_number.eq."${digitsOnly}",phone_number.eq."${phone}"`)
                .limit(1);

            if (!results || results.length === 0) {
                console.warn("User not found in Supabase. Proceeding with verification for testing/new user flow.");
                // setError("Ce numéro ne semble pas faire partie de nos auteurs. Avez-vous déjà commandé votre biographie ?");
                // setLoading(false);
                // return;
            }

            const matchPhone = (results && results.length > 0) ? results[0].phone_number : e164;
            setPhone(matchPhone); // Update UI with the matched variation
            const cleanPhone = formatToE164(matchPhone);

            // 2. Call Make.com Webhook
            console.log("[Login] Sending to Webhook:", LOOMINA_CONFIG.MAKE_WEBHOOK_URL);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

                const response = await fetch(LOOMINA_CONFIG.MAKE_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "start",
                        phone_number: cleanPhone
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn("Webhook returned error (non-blocking):", response.status);
                }
            } catch (err) {
                console.warn("Webhook request failed or timed out (proceeding anyway):", err);
            }

            // Always move to OTP step to allow user to try entering code
            // (Twilio might have sent it even if Make timed out)
            setLoginStep("otp");
        } catch (err) {
            console.error("Login error:", err);
            setError("Une erreur est survenue. Veuillez réessayer.");
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
            const response = await fetch(LOOMINA_CONFIG.MAKE_WEBHOOK_URL, {
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
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 pt-32">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h1 className="text-3xl font-serif">
                        {loginStep === "phone" ? "Accédez à votre espace" : "Vérifiez votre identité"}
                        <span className="text-[10px] ml-2 text-neutral-300 opacity-50 font-sans">v4.0</span>
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        {loginStep === "phone"
                            ? "Entrez le numéro de téléphone utilisé lors de votre commande."
                            : `Entrez le code à 6 chiffres envoyé au ${phone}`}
                    </p>

                    <form onSubmit={loginStep === "phone" ? handleRequestOtp : handleVerifyOtp} className="space-y-4">
                        {loginStep === "phone" ? (
                            <input
                                type="tel"
                                placeholder="Votre numéro (ex: 06 12 34 56 78)"
                                value={phone}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumberForDisplay(e.target.value);
                                    if (formatted.length <= 20) setPhone(formatted);
                                }}
                                className="w-full p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-lg focus:ring-black focus:border-black outline-none"
                            />
                        ) : (
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-3xl tracking-[0.5em] font-mono focus:ring-black focus:border-black outline-none"
                                autoFocus
                            />
                        )}

                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-black border-neutral-300 rounded focus:ring-black"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-neutral-600 cursor-pointer select-none">
                                Rester connecté
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <MagicButton type="submit" disabled={loading} className="w-full">
                            {loading ? "Chargement..." : (loginStep === "phone" ? "Recevoir mon code" : "Valider le code")}
                        </MagicButton>

                        {loginStep === "otp" && (
                            <button
                                type="button"
                                onClick={() => setLoginStep("phone")}
                                className="text-sm text-neutral-400 hover:text-black transition-colors underline underline-offset-4"
                            >
                                Modifier le numéro
                            </button>
                        )}
                    </form>

                    <div className="pt-8 border-t border-neutral-100">
                        <p className="text-neutral-400 text-sm mb-4">Vous n'avez pas encore commencé votre histoire ?</p>
                        <MagicButton href="/order" variant="secondary" size="sm">
                            Commander ma biographie
                        </MagicButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header / Actions */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-neutral-100">
                    <div>
                        <h1 className="text-4xl font-serif mb-2">Votre Espace Auteur</h1>
                        <p className="text-neutral-500">Suivez la rédaction de votre autobiographie en temps réel.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StartInterviewButton phone={phone} userName="Auteur" />
                        <button
                            onClick={handleLogout}
                            className="text-sm text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </header>

                {/* Live Book Content */}
                <main>
                    <LiveBook userPhone={phone} />
                </main>

            </div>
        </div>
    );
}
