"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import MagicButton from "@/components/ui/MagicButton";
import { motion } from "framer-motion";

// Trigger deployment for simplified login
export default function DashboardPage() {
    const [phone, setPhone] = useState("");
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Normalize phone input
            const val = phone.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');
            let formattedForApi = val;

            // Simple normalization logic to ensure +33 format if possible
            if (val.startsWith("0") && val.length === 10) {
                formattedForApi = "+33" + val.slice(1);
            } else if (val.startsWith("33") && val.length === 11) {
                formattedForApi = "+" + val;
            } else if (!val.startsWith("+")) {
                formattedForApi = val;
            }

            // Check if user exists in Supabase "Client" table
            const { data: clientData, error: clientError } = await supabase
                .from('Client')
                .select('id')
                .eq('phone_number', formattedForApi)
                .single();

            if (clientError || !clientData) {
                setError("Ce numéro ne semble pas faire partie de nos auteurs. Avez-vous déjà commandé votre biographie ?");
                setLoading(false);
                return;
            }

            // Success: Direct Login
            setIsLoggedIn(true);
            if (rememberMe) {
                localStorage.setItem("loomina_user_phone", phone);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setPhone("");
        localStorage.removeItem("loomina_user_phone");
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 pt-32">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h1 className="text-3xl font-serif">Accédez à votre espace</h1>
                    <p className="text-neutral-500 text-sm">
                        Entrez le numéro de téléphone utilisé lors de votre commande.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="tel"
                            placeholder="Votre numéro (ex: 06 12 34 56 78)"
                            value={phone}
                            onChange={(e) => {
                                let val = e.target.value;
                                // Allow + only at the start
                                const hasPlus = val.startsWith('+');
                                // Keep only digits
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
                            {loading ? "Chargement..." : "Accéder à mon espace"}
                        </MagicButton>
                    </form>
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
