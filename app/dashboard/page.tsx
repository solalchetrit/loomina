"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import MagicButton from "@/components/ui/MagicButton";
import { motion } from "framer-motion";
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

            // 1. Check if user exists securely via RPC
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('check_client_exists', { phone_input: e164 });

            if (rpcError) {
                console.error("RPC Error:", rpcError);
                throw rpcError;
            }

            const resultRow = (rpcData && rpcData.length > 0) ? rpcData[0] : null;

            if (!resultRow || !resultRow.client_found) {
                console.warn("User not found in Supabase (Secure Check).");
            }

            const matchPhone = (resultRow && resultRow.matched_phone) ? resultRow.matched_phone : e164;
            setPhone(matchPhone);
            const cleanPhone = formatToE164(matchPhone);

            // 2. Call verification API (Twilio)
            console.log("[Login] Sending verification request for:", cleanPhone);

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

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

                if (!response.ok) {
                    console.warn("Webhook returned error (non-blocking):", response.status);
                }
            } catch (err) {
                console.warn("Webhook request failed or timed out (proceeding anyway):", err);
            }

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
        return (
            <div className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] flex items-center justify-center px-6 pt-32 relative overflow-hidden">
                {/* Background ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="ambient-orb gold w-[500px] h-[500px] top-[-100px] right-[-100px] opacity-15" />
                    <div className="ambient-orb aurora w-[300px] h-[300px] bottom-[20%] left-[-50px] opacity-10" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md space-y-8 text-center relative z-10"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                            Espace Auteur
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <h1 className="text-3xl font-serif text-[var(--text-primary)]">
                        {loginStep === "phone" ? "Accédez à votre espace" : "Vérifiez votre identité"}
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm">
                        {loginStep === "phone"
                            ? "Entrez le numéro de téléphone utilisé lors de votre commande."
                            : `Entrez le code à 6 chiffres envoyé au ${phone}`}
                    </p>

                    <form onSubmit={loginStep === "phone" ? handleRequestOtp : handleVerifyOtp} className="space-y-6">
                        {loginStep === "phone" ? (
                            <input
                                type="tel"
                                placeholder="Votre numéro (ex: 06 12 34 56 78)"
                                value={phone}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumberForDisplay(e.target.value);
                                    if (formatted.length <= 20) setPhone(formatted);
                                }}
                                className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] text-center text-lg focus:border-[var(--loomina-gold)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors"
                            />
                        ) : (
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full p-4 rounded-xl bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] text-center text-3xl tracking-[0.5em] font-mono focus:border-[var(--loomina-gold)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors"
                                autoFocus
                            />
                        )}

                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 bg-[var(--loomina-mist)]/20 border-[var(--loomina-mist)] rounded focus:ring-[var(--loomina-gold)] checked:bg-[var(--loomina-gold)]"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                                Rester connecté
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        <MagicButton type="submit" disabled={loading} className="w-full">
                            {loading ? "Chargement..." : (loginStep === "phone" ? "Recevoir mon code" : "Valider le code")}
                        </MagicButton>

                        {loginStep === "otp" && (
                            <button
                                type="button"
                                onClick={() => setLoginStep("phone")}
                                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4"
                            >
                                Modifier le numéro
                            </button>
                        )}
                    </form>

                    <div className="pt-8 border-t border-[var(--loomina-mist)]">
                        <p className="text-[var(--text-muted)] text-sm mb-4">Vous n&apos;avez pas encore commencé votre histoire ?</p>
                        <MagicButton href="/order" variant="secondary" size="sm">
                            Commander ma biographie
                        </MagicButton>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] pt-32 pb-20 px-6 relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-10" />
            </div>

            <div className="max-w-6xl mx-auto space-y-16 relative z-10">

                {/* Header / Actions */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 relative">
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--loomina-mist)] to-transparent" />
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Dashboard
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h1 className="text-4xl font-serif text-[var(--text-primary)] mb-2">Votre Espace Auteur</h1>
                        <p className="text-[var(--text-secondary)]">Suivez la rédaction de votre autobiographie en temps réel.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StartInterviewButton phone={phone} userName="Auteur" />
                        <button
                            onClick={handleLogout}
                            className="text-sm text-[var(--text-muted)] hover:text-red-400 transition-colors"
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
