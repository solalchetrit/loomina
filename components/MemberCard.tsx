"use client";

import React from "react";
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
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full max-w-[480px] mx-auto perspective-1000"
        >
            {/* Container with Dark Premium feel */}
            <div className="relative aspect-[1.7/1] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(184,146,58,0.2)] bg-white border border-[var(--loomina-mist)] group transition-all duration-500 hover:shadow-[0_30px_70px_-15px_rgba(184,146,58,0.3)]">

                {/* BACKGROUND: Gold gradient accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--loomina-gold)]/5 via-transparent to-[var(--loomina-aurora)]/5 pointer-events-none" />

                {/* DECORATION: Fine Gold Frame */}
                <div className="absolute inset-3 border border-[var(--loomina-gold)]/20 rounded-xl pointer-events-none" />
                <div className="absolute inset-4 border border-[var(--loomina-gold)]/10 rounded-lg pointer-events-none" />

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-[var(--loomina-gold)]/40 rounded-tl" />
                <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-[var(--loomina-gold)]/40 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-[var(--loomina-gold)]/40 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-[var(--loomina-gold)]/40 rounded-br" />

                {/* BACKGROUND ACCENT: Subtle glow */}
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent blur-3xl rounded-full mix-blend-screen pointer-events-none" />

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
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--loomina-gold)]/10 border border-[var(--loomina-gold)]/20">
                            <span className="w-2 h-2 rounded-full bg-[var(--loomina-gold)] animate-pulse" />
                            <span className="text-[10px] text-[var(--loomina-gold)] uppercase tracking-wider font-semibold">Actif</span>
                        </div>
                    </div>

                    {/* CENTER: Name Typography */}
                    <div className="flex flex-col items-center text-center space-y-2 mt-2">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] font-sans">
                            Détenteur du compte
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-serif text-[var(--text-primary)] tracking-wide">
                            {name}
                        </h2>
                        {/* Decorative underline */}
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--loomina-gold)] to-transparent" />
                    </div>

                    {/* FOOTER: ID & Status */}
                    <div className="flex justify-end items-end pt-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-sans mb-1">
                                Membre N°
                            </span>
                            <span className="font-mono text-xs text-[var(--loomina-gold)]/60 tracking-widest">
                                {memberId}
                            </span>
                        </div>
                    </div>

                </div>

                {/* SHIMMER EFFECT (Subtle movement on hover) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--loomina-gold)]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 w-[200%] translate-x-[-50%] group-hover:translate-x-0" />

            </div>
        </motion.div>
    );
}
