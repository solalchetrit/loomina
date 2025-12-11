"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import StartInterviewButton from "@/components/StartInterviewButton";
import LiveBook from "@/components/LiveBook";
import MagicButton from "@/components/ui/MagicButton";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [phone, setPhone] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Normalize phone input to test multiple formats
        const input = phone.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');
        let possibleFormats: string[] = [input];

        // If starts with 0 (e.g. 0612345678), add +33 version (+33612345678)
        if (input.startsWith("0")) {
            possibleFormats.push("+33" + input.slice(1));
        }
        // If starts with +33 (e.g. +33612345678), add 0 version (0612345678)
        else if (input.startsWith("+33")) {
            possibleFormats.push("0" + input.slice(3));
        }
        // If starts with 33 (e.g. 33612345678), add +33 and 0 versions
        else if (input.startsWith("33")) {
            possibleFormats.push("+" + input);
            possibleFormats.push("0" + input.slice(2));
        }

        try {
            // Check if ANY of the possible formats exist in DB
            const { data, error } = await supabase
                .from('Client')
                .select('id, phone_number')
                .in('phone_number', possibleFormats)
                .maybeSingle();

            if (error || !data) {
                setError("Numéro de téléphone non reconnu ou client introuvable.");
                return;
            }

            // Success: Use the actual phone number from DB to ensure consistency for next steps
            setPhone(data.phone_number);
            setIsLoggedIn(true);
        } catch (err) {
            console.error("Login error:", err);
            setError("Une erreur est survenue lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-6 pt-32">
                <div className="w-full max-w-md space-y-8 text-center">
                    <h1 className="text-3xl font-serif">Accédez à votre espace</h1>
                    <p className="text-neutral-500 text-sm">Entrez le numéro de téléphone utilisé lors de votre commande pour voir l'avancement de votre livre.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="tel"
                            placeholder="Votre numéro (ex: 06 12 34 56 78)"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                const formatted = val.match(/.{1,2}/g)?.join(' ') || val;
                                if (val.length <= 15) { // Allow for international length roughly
                                    setPhone(formatted);
                                }
                            }}
                            className="w-full p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center text-lg focus:ring-black focus:border-black outline-none"
                        />
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <MagicButton type="submit" disabled={loading} className="w-full">
                            {loading ? "Vérification..." : "Voir mon livre"}
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
