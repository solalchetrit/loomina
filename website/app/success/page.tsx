"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import Link from "next/link";
import Image from "next/image";
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
                const parsed = JSON.parse(storedData);
                setUserData(parsed);

                // Sync new client to Supabase
                const syncClient = async () => {
                    if (parsed.phone) {
                        try {
                            const cleanPhone = formatToE164(parsed.phone);
                            const fullName = `${parsed.firstName} ${parsed.lastName}`.trim();

                            const { error } = await supabase
                                .from('Client')
                                .upsert(
                                    {
                                        name: fullName,
                                        first_name: parsed.firstName,
                                        last_name: parsed.lastName,
                                        phone_number: cleanPhone,
                                        email: parsed.email,
                                        phase: LOOMINA_CONFIG.PHASES.ONBOARDING,
                                        // We don't set created_at as it should be auto-generated or handled by DB default
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
        <div className="min-h-screen bg-white text-black selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-16">

                {/* LUXURY ACCESS CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
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
                    <p className="text-xl md:text-2xl font-serif text-black leading-relaxed">
                        Félicitations, l'aventure commence. <br />
                        Pour commencer votre livre, appelez simplement Loomina au numéro suivant :
                    </p>

                    <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="block text-4xl md:text-6xl font-serif font-bold text-neutral-900 hover:text-amber-700 transition-colors tracking-tight">
                        {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
                    </a>
                </motion.div>

                {/* Return Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <MagicButton href="/" variant="ghost" className="text-neutral-500 hover:bg-neutral-50 hover:text-black">
                        Retour à l'accueil
                    </MagicButton>
                </motion.div>

            </div>
        </div>
    );
}
