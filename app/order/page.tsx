"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";
import { STRIPE_CONFIG } from "@/config/stripe";

export default function OrderPage() {
    const [selectedOption, setSelectedOption] = useState<"me" | "gift" | null>(null);

    const handleOptionClick = (option: "me" | "gift") => {
        setSelectedOption(option);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-[var(--loomina-amber)] selection:text-white flex flex-col pt-32 pb-20 px-6">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--loomina-amber)]/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--loomina-amber)]/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col flex-1 items-center justify-center space-y-12">

                {/* Header Text */}
                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-serif text-[var(--loomina-amber-strong)]"
                    >
                        À qui se destine cette autobiographie ?
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-neutral-400 text-lg max-w-xl mx-auto"
                    >
                        Nous préparerons l'expérience en fonction de votre choix.
                    </motion.p>
                </div>

                {/* Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
                    {/* Option A: Pour moi */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => handleOptionClick("me")}
                        className={`
                    group relative cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300
                    flex flex-col items-center text-center space-y-6
                    ${selectedOption === "me"
                                ? "bg-white/5 border-[var(--loomina-amber)] shadow-[0_0_30px_-10px_rgba(197,140,60,0.3)]"
                                : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"}
                `}
                    >
                        <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors duration-300
                    ${selectedOption === "me" ? "bg-[var(--loomina-amber)] text-black" : "bg-white/10 text-neutral-400 group-hover:bg-white/20"}
                `}>
                            ✒️
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-2xl font-serif ${selectedOption === "me" ? "text-white" : "text-neutral-300"}`}>C'est pour moi</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Je souhaite raconter mon histoire, explorer mes souvenirs et laisser une trace éternelle.
                            </p>
                        </div>
                        <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mt-auto
                    ${selectedOption === "me" ? "border-[var(--loomina-amber)]" : "border-neutral-600"}
                `}>
                            {selectedOption === "me" && <div className="w-3 h-3 rounded-full bg-[var(--loomina-amber)]" />}
                        </div>
                    </motion.div>

                    {/* Option B: Cadeau */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        onClick={() => handleOptionClick("gift")}
                        className={`
                    group relative cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300
                    flex flex-col items-center text-center space-y-6
                    ${selectedOption === "gift"
                                ? "bg-white/5 border-[var(--loomina-amber)] shadow-[0_0_30px_-10px_rgba(197,140,60,0.3)]"
                                : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"}
                `}
                    >
                        <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors duration-300
                    ${selectedOption === "gift" ? "bg-[var(--loomina-amber)] text-black" : "bg-white/10 text-neutral-400 group-hover:bg-white/20"}
                `}>
                            🎁
                        </div>
                        <div className="space-y-2">
                            <h3 className={`text-2xl font-serif ${selectedOption === "gift" ? "text-white" : "text-neutral-300"}`}>C'est un cadeau</h3>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                J'offre ce voyage unique à un proche (parent, grand-parent) pour qu'il raconte sa vie.
                            </p>
                        </div>
                        <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mt-auto
                    ${selectedOption === "gift" ? "border-[var(--loomina-amber)]" : "border-neutral-600"}
                `}>
                            {selectedOption === "gift" && <div className="w-3 h-3 rounded-full bg-[var(--loomina-amber)]" />}
                        </div>
                    </motion.div>
                </div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-sm"
                >
                    <div className={`${!selectedOption ? "opacity-50 pointer-events-none grayscale" : "opacity-100"} transition-all duration-300`}>
                        <MagicButton
                            href={STRIPE_CONFIG.PAYMENT_LINK}
                            className="w-full shadow-amber-500/20"
                            size="lg"
                            as="a"
                        >
                            Procéder au paiement
                        </MagicButton>
                    </div>
                    {!selectedOption && (
                        <p className="text-center text-neutral-600 text-sm mt-4">Veuillez sélectionner une option pour continuer</p>
                    )}
                </motion.div>

            </div>
        </div>
    );
}
