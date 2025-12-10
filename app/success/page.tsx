"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import { useEffect, useState } from "react";

export default function SuccessPage() {
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        // Retrieve the user's name from storage (set in /order)
        const storedName = localStorage.getItem("loomina_user_firstname");
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            <div className="max-w-3xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-12">

                {/* Success Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl mb-4 text-[var(--loomina-amber-strong)]"
                    >
                        ★
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-6xl font-serif text-black tracking-tight"
                    >
                        Commande validée.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-neutral-500 text-xl font-serif italic"
                    >
                        "Le voyage commence."
                    </motion.p>
                </div>

                {/* Editorial Access Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="w-full max-w-lg bg-[#ffffff] border border-neutral-200 p-10 md:p-14 relative shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]"
                >
                    {/* Corner Accents (Editorial Look) */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-neutral-300"></div>
                    <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-neutral-300"></div>
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-neutral-300"></div>
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-neutral-300"></div>

                    <div className="relative z-10 text-center space-y-10">
                        <div className="uppercase tracking-[0.3em] text-[10px] text-neutral-400 font-sans">
                            Carte d'Accès Officielle
                        </div>

                        <div className="space-y-6">
                            <p className="text-lg leading-relaxed text-black font-serif">
                                {userName ? (
                                    <>
                                        Pour commencer,<br />
                                        <span className="font-semibold text-xl">{userName}</span> peut appeler dès maintenant.
                                    </>
                                ) : "Pour commencer votre livre, appelez simplement notre IA biographe au numéro suivant :"}
                            </p>

                            <div className="py-6 border-t border-b border-neutral-100">
                                <a href="tel:+33159169357" className="block text-4xl md:text-5xl font-serif text-black hover:text-[var(--loomina-amber-strong)] transition-colors">
                                    01 59 16 93 57
                                </a>
                            </div>
                        </div>

                        <div className="text-xs text-neutral-400 font-sans leading-relaxed">
                            Service accessible 24h/24 et 7j/7.<br />
                            Votre numéro est déjà enregistré, l'IA vous reconnaîtra.
                        </div>
                    </div>
                </motion.div>

                {/* Return Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <MagicButton href="/" variant="ghost" className="text-black hover:bg-neutral-50">
                        Retour à l'accueil
                    </MagicButton>
                </motion.div>

            </div>
        </div>
    );
}
