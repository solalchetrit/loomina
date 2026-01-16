"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MemberCard from "@/components/MemberCard";
import { formatToE164 } from "@/lib/phone";
import { LOOMINA_CONFIG } from "@/config/loomina";

export default function SuccessPage() {
    const [userData, setUserData] = useState<{ firstName: string; lastName: string; phone?: string } | null>(null);

    useEffect(() => {
        // Retrieve the user's data from storage
        const storedData = localStorage.getItem("loomina_order_data");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                requestAnimationFrame(() => setUserData(parsedData));

                // Sync new client to Supabase
                const syncClient = async () => {
                    if (parsedData.phone) {
                        try {
                            const cleanPhone = formatToE164(parsedData.phone);
                            const fullName = `${parsedData.firstName} ${parsedData.lastName}`.trim();

                            const { error } = await supabase
                                .from('Client')
                                .upsert(
                                    {
                                        name: fullName,
                                        first_name: parsedData.firstName,
                                        last_name: parsedData.lastName,
                                        phone_number: cleanPhone,
                                        email: parsedData.email,
                                        phase: LOOMINA_CONFIG.PHASES.ONBOARDING,
                                    },
                                    { onConflict: 'phone_number' }
                                );

                            if (error) {
                                console.error("Supabase sync error:", error);
                            } else {
                                console.log("Client synced to Supabase successfully.");
                            }
                        } catch (err) {
                            console.error("Error executing Supabase sync:", err);
                        }
                    }
                };

                syncClient();

            } catch (e) {
                console.error("Failed to parse order data", e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] flex flex-col pt-32 pb-20 px-6 relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
            </div>

            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-16 relative z-10">

                {/* Success Message */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] flex items-center justify-center">
                        <svg className="w-10 h-10 text-[var(--loomina-void)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="heading-section font-serif text-[var(--text-primary)] mb-4">
                        Paiement Confirmé
                    </h1>
                    <p className="text-[var(--text-secondary)] font-serif text-lg">
                        Bienvenue dans l&apos;aventure Loomina
                    </p>
                </motion.div>

                {/* LUXURY ACCESS CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full max-w-xl mx-auto"
                >
                    <MemberCard
                        name={userData ? `${userData.firstName} ${userData.lastName}` : undefined}
                    />
                </motion.div>

                {/* INSTRUCTIONS */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-center space-y-8 max-w-2xl"
                >
                    <p className="text-xl md:text-2xl font-serif text-[var(--text-secondary)] leading-relaxed">
                        Pour commencer votre livre, appelez simplement Loomina :
                    </p>

                    <a
                        href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
                        className="block glass-gold rounded-2xl p-6 hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--loomina-gold)]/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--loomina-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <span className="text-3xl md:text-4xl font-serif text-gradient-gold">
                                {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
                            </span>
                        </div>
                    </a>

                    <p className="text-sm text-[var(--text-muted)]">
                        Disponible du lundi au vendredi, 9h-18h
                    </p>
                </motion.div>

                {/* Return Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <MagicButton href="/" variant="ghost">
                        Retour à l&apos;accueil
                    </MagicButton>
                </motion.div>

            </div>
        </div>
    );
}
