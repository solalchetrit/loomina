"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-[var(--loomina-amber)]/10 blur-[150px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-12">

                {/* Success Message */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl mb-4"
                    >
                        ✨
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-serif text-white"
                    >
                        Félicitations, <br /> votre commande est validée.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-neutral-400 text-lg"
                    >
                        Votre voyage narratif commence maintenant.
                    </motion.p>
                </div>

                {/* Access Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="w-full max-w-lg bg-neutral-900 border border-[var(--loomina-amber)]/30 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-[var(--loomina-amber)]/10"
                >
                    {/* Card Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--loomina-amber)]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    <div className="relative z-10 text-center space-y-8">
                        <div>
                            <span className="text-[var(--loomina-amber)] text-xs tracking-[0.2em] uppercase font-bold">Carte d'Accès</span>
                            <h2 className="text-2xl font-serif text-white mt-2">Votre Ligne Biographe</h2>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-neutral-400 text-sm mb-4">
                                Pour commencer votre livre, appelez simplement notre IA biographe au numéro suivant :
                            </p>
                            <a href="tel:+33159169357" className="block text-3xl md:text-4xl font-bold text-white hover:text-[var(--loomina-amber)] transition-colors tracking-wide">
                                01 59 16 93 57
                            </a>
                        </div>

                        <div className="text-xs text-neutral-500">
                            Accessible 24h/24 et 7j/7. <br />
                            Code d'accès non requis, votre numéro est reconnu.
                        </div>
                    </div>
                </motion.div>

                {/* Home Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <MagicButton href="/" variant="ghost" className="text-neutral-400 hover:text-white">
                        Retour à l'accueil
                    </MagicButton>
                </motion.div>

            </div>
        </div>
    );
}
