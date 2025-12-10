"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SuccessPage() {
    const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);

    useEffect(() => {
        // Retrieve the user's data from storage
        const storedData = localStorage.getItem("loomina_order_data");
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                setUserData(parsed);
            } catch (e) {
                console.error("Failed to parse order data", e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-16">

                {/* Success Header is removed/integrated into the card flow or kept minimal? 
           The prompt assumes the card is the "Element central". 
           Let's keep a small header or just jump to the card.
           Based on "Félicitations, l'aventure commence" being BELOW the card in instruction text?
           Wait, prompt says: "Remplace le texte précédent par celui-ci (...) Affiche le numéro (...) en dessous". 
           So the header above might be redundant or should be minimal. 
           Let's keep it simple.
        */}

                {/* LUXURY ACCESS CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-xl mx-auto"
                >
                    <div className="bg-stone-50 rounded-xl border border-amber-700/30 p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-10">

                        {/* Texture/Grain overlay if possible (optional styling) */}

                        {/* Top: Logo & Title */}
                        <div className="w-full flex flex-col items-center space-y-4">
                            <div className="relative w-24 h-6 opacity-80">
                                <Image
                                    src="/header-logo-trimmed.png"
                                    alt="Loomina"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-xs uppercase tracking-[0.25em] text-amber-900/60 font-sans font-medium">
                                Carte d'Accès Membre
                            </h2>
                        </div>

                        {/* Center: Name */}
                        <div className="py-2">
                            <h3 className="text-4xl md:text-5xl font-serif text-black tracking-tight">
                                {userData ? (
                                    <>
                                        {userData.firstName} <span className="font-medium">{userData.lastName}</span>
                                    </>
                                ) : (
                                    <span className="opacity-50">Membre Loomina</span>
                                )}
                            </h3>
                        </div>

                        {/* Bottom: ID */}
                        <div className="w-full pt-6 border-t border-amber-900/10">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans">
                                ID: 2024-LMN-ACCESS
                            </p>
                        </div>

                    </div>
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

                    <a href="tel:+33159169357" className="block text-4xl md:text-6xl font-serif font-bold text-neutral-900 hover:text-amber-700 transition-colors tracking-tight">
                        01 59 16 93 57
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
