"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MemberCardProps {
    name?: string;
    memberId?: string;
    tier?: string;
}

export default function MemberCard({
    name = "Membre Loomina",
    memberId = "2025 • #001",
    tier = "MEMBER",
}: MemberCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-[480px] mx-auto perspective-1000"
        >
            {/* Container with "Book Cover" / "Stationery" feel */}
            <div className="relative aspect-[1.7/1] rounded-xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] bg-[#FDFBF7] border border-[#E8E6E1] group transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)]">

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
                        {/* Logo Mark: Using the trimmed header logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative h-6 w-24 opacity-80">
                                <Image
                                    src="/header-logo-trimmed.png"
                                    alt="Loomina Logo"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
                            <div className="h-6 w-[1px] bg-amber-900/10"></div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-900/40 font-semibold font-sans pt-0.5">
                                Ex Libris
                            </span>
                        </div>

                        {/* Icon / Seal: Using the favicon pictogram */}
                        <div className="flex flex-col items-end">
                            <div className="relative w-8 h-8 opacity-60 mix-blend-multiply grayscale-[0.2]">
                                <Image
                                    src="/loomina-icon.png"
                                    alt="Loomina Seal"
                                    fill
                                    className="object-contain"
                                />
                            </div>
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

                    {/* FOOTER: ID & Status */}
                    <div className="flex justify-between items-end pt-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-amber-900/30 uppercase tracking-widest font-sans mb-1">
                                Membre N°
                            </span>
                            <span className="font-mono text-xs text-amber-900/60 tracking-widest">
                                {memberId}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-amber-50 rounded-full border border-amber-900/5">
                                <span className="text-[10px] font-medium text-amber-800/70 uppercase tracking-widest">
                                    Accès Privé
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* SHIMMER EFFECT (Subtle movement on hover) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-[200%] translate-x-[-50%] group-hover:translate-x-0"></div>

            </div>
        </motion.div>
    );
}
