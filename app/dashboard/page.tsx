"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import MagicButton from "@/components/ui/MagicButton";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [phone, setPhone] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [otpSent, setOtpSent] = useState(false); // New state to track if we are in OTP step
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Login: Check phone, generate code, send SMS
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Normalize phone input to test multiple formats
        const input = phone.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');
        let possibleFormats: string[] = [input];

        if (input.startsWith("0")) {
            possibleFormats.push("+33" + input.slice(1));
        } else if (input.startsWith("+33")) {
            possibleFormats.push("0" + input.slice(3));
        } else if (input.startsWith("33")) {
            possibleFormats.push("+" + input);
            possibleFormats.push("0" + input.slice(2));
        }

        try {
            // 1. Find the user
            const { data: client, error: findError } = await supabase
                .from('Client')
                .select('id, phone_number')
                .in('phone_number', possibleFormats)
                .maybeSingle();

            if (findError || !client) {
                setError("Numéro de téléphone non reconnu ou client introuvable.");
                setLoading(false);
                return;
            }

            // 2. Generate 6-digit Code
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // 3. Save Code to DB
            const { error: updateError } = await supabase
                .from('Client')
                .update({ otp_code: code })
                .eq('id', client.id);

            if (updateError) {
                console.error("Error saving OTP:", updateError);
                throw new Error("Erreur système lors de la génération du code.");
            }

            // 4. Send via Webhook
            const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;
            if (webhookUrl) {
                await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "send_otp",
                        phone: client.phone_number,
                        code: code
                    }),
                });
            } else {
                console.warn("No webhook URL configured. Code logged:", code);
            }

            // Success: Switch to OTP step
            setPhone(client.phone_number); // Ensure we have the canonical number
            setOtpSent(true);

        } catch (err) {
            console.error("Login process error:", err);
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify the Code
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('Client')
                .select('otp_code')
                .eq('phone_number', phone)
                .single();

            if (error || !data || data.otp_code !== otpInput) {
                setError("Code incorrect. Veuillez réessayer.");
                setLoading(false);
                return;
            }

            // Valid Code
            setIsLoggedIn(true);
        } catch (err) {
            console.error("Verification error:", err);
            setError("Erreur de vérification.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 pt-32">
                <div className="w-full max-w-md space-y-8 text-center">

                    {/* Header Text changes based on step */}
                    {!otpSent ? (
                        <>
                            <h1 className="text-3xl font-serif">Accédez à votre espace</h1>
                            <p className="text-neutral-500 text-sm">Entrez le numéro de téléphone utilisé lors de votre commande pour voir l'avancement de votre livre.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-serif">Code de vérification</h1>
                            <p className="text-neutral-500 text-sm">Un code à 6 chiffres vient d'être envoyé au <strong>{phone}</strong>.</p>
                        </>
                    )}

                    {!otpSent ? (
                        /* PHONE FORM */
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="tel"
                                placeholder="Votre numéro (ex: 06 12 34 56 78)"
                                value={phone}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    const hasPlus = val.startsWith('+');
                                    const digits = val.replace(/\D/g, '');
                                    let formatted = digits;

                                    if (hasPlus) {
                                        if (digits.startsWith('33')) {
                                            formatted = "+33";
                                            const rest = digits.slice(2);
                                            if (rest.length > 0) {
                                                formatted += " " + rest.substring(0, 1);
                                                if (rest.length > 1) {
                                                    const remaining = rest.substring(1).match(/.{1,2}/g)?.join(' ');
                                                    if (remaining) formatted += " " + remaining;
                                                }
                                            }
                                        } else {
                                            formatted = "+" + (digits.match(/.{1,2}/g)?.join(' ') || digits);
                                        }
                                    } else {
                                        formatted = digits.match(/.{1,2}/g)?.join(' ') || digits;
                                    }

                                    if (formatted.length <= 20) {
                                        setPhone(formatted);
                                    }
                                }}
                                className="w-full p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-lg focus:ring-black focus:border-black outline-none"
                            />
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <MagicButton type="submit" disabled={loading} className="w-full">
                                {loading ? "Envoi du code..." : "Recevoir mon code"}
                            </MagicButton>
                        </form>
                    ) : (
                        /* OTP FORM */
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <input
                                type="text"
                                placeholder="123456"
                                value={otpInput}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtpInput(val);
                                }}
                                className="w-full p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-2xl tracking-[0.5em] font-medium focus:ring-black focus:border-black outline-none"
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <MagicButton type="submit" disabled={loading} className="w-full">
                                {loading ? "Vérification..." : "Valider"}
                            </MagicButton>

                            <button
                                type="button"
                                onClick={() => { setOtpSent(false); setError(null); }}
                                className="text-sm text-neutral-400 hover:text-black underline underline-offset-4"
                            >
                                Modifier mon numéro
                            </button>
                        </form>
                    )}

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

                    <div className="flex-shrink-0">
                        <StartInterviewButton phone={phone} userName="Auteur" />
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
