"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MemberCardProps {
    name?: string;
    memberId?: string;
}

export default function MemberCard({
    name = "Membre Loomina",
    memberId = "2025 • #001",
}: MemberCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="relative w-full max-w-[480px] mx-auto perspective-1000 group cursor-pointer"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative aspect-[1.7/1] w-full transition-all duration-700 transform-style-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* --- FRONT FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] bg-[#FDFBF7] border border-[#E8E6E1]"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* TEXTURE: Subtle Paper Grain */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none mix-blend-multiply"></div>

                    {/* DECORATION: Fine Gold Frame */}
                    <div className="absolute inset-3 border border-amber-900/10 rounded-lg pointer-events-none"></div>
                    <div className="absolute inset-4 border border-amber-900/5 rounded-md pointer-events-none"></div>

                    {/* BACKGROUND ACCENT: Abstract Ink/Watercolor Wash */}
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-amber-100/20 to-transparent blur-3xl rounded-full mix-blend-multiply pointer-events-none"></div>

                    {/* CONTENT LAYER */}
                    <div className="relative h-full p-8 flex flex-col justify-between">

                        {/* HEADER Flex */}
                        <div className="flex justify-between items-start">
                            {/* Logo Mark */}
                            <div className="relative h-6 w-28">
                                <Image
                                    src="/header-logo-trimmed.png"
                                    alt="Loomina Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                        </div>

                        {/* CENTER: Name Typography */}
                        <div className="flex flex-col items-center text-center space-y-2 mt-2">
                            <span className="text-[10px] text-amber-900/30 uppercase tracking-[0.3em] font-sans">
                                Détenteur du compte
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-serif text-amber-950 tracking-wide drop-shadow-sm">
                                {name}
                            </h2>
                            {/* Decorative underline */}
                            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                        </div>

                        {/* FOOTER: ID */}
                        <div className="flex justify-end items-end pt-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-amber-900/30 uppercase tracking-widest font-sans mb-1">
                                    Membre N°
                                </span>
                                <span className="font-mono text-xs text-amber-900/60 tracking-widest">
                                    {memberId}
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* SHIMMER EFFECT (Subtle movement on hover - visible on unturned card) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-[200%] translate-x-[-50%] group-hover:translate-x-0"></div>
                </div>

                {/* --- BACK FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-xl bg-[#0a0a0a] border border-amber-500/20"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#050505] to-black"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                    <div className="relative h-full p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div>
                            <h3 className="text-xl font-serif text-amber-100 mb-2">Bienvenue chez Loomina</h3>
                            <div className="w-8 h-[1px] bg-amber-500/50 mx-auto"></div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-neutral-300 leading-relaxed max-w-sm mx-auto font-sans">
                                Pour commencer l'écriture de votre chef-d'œuvre autobiographique, appelez votre biographe IA dès maintenant.
                            </p>

                            <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg px-4 py-3">
                                <span className="block text-[10px] uppercase tracking-widest text-amber-500/60 mb-1">Numéro Personnel</span>
                                <a href="tel:+33159169357" className="text-lg sm:text-2xl font-serif text-white hover:text-amber-400 transition-colors">
                                    01 59 16 93 57
                                </a>
                            </div>
                        </div>

                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">
                            Vous recevrez votre livre imprimé à la fin.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
