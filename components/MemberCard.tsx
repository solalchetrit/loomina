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
        <div className="relative group w-full max-w-[420px] perspective-1000 mx-auto">
            {/* Halo de lumière arrière (Glow) */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>

            {/* Carte Principale */}
            <motion.div
                initial={{ rotateY: 0 }}
                whileHover={{ rotateY: 2, rotateX: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
            >
                {/* FOND : Texture Noire "Noise" + Dégradé Profond */}
                <div className="absolute inset-0 bg-[#0F0F0F]">
                    {/* Bruit de texture (Grain) */}
                    <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                    {/* Reflet Métallique Diagonal */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#1a1a1a] to-[#2a2a2a]"></div>

                    {/* Cercle Doré Ambient (flou) */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-900/10 rounded-full blur-[80px]"></div>
                </div>

                {/* CONTENU (Z-Index supérieur) */}
                <div className="relative h-full p-6 sm:p-8 flex flex-col justify-between z-10">

                    {/* EN-TÊTE : Logo + Puce Électronique */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            {/* Logo Loomina avec effet doré */}
                            <div className="relative h-8 w-32">
                                <Image
                                    src="/header-logo-new.png" // Assurez-vous que ce fichier existe, sinon mettez header_logo.svg
                                    alt="Loomina"
                                    fill
                                    className="object-contain object-left invert opacity-90"
                                />
                            </div>
                            <span className="text-[10px] tracking-[0.3em] text-amber-500/80 uppercase font-medium ml-1">
                                Official Member
                            </span>
                        </div>

                        {/* Puce style carte bancaire */}
                        <div className="w-11 h-8 rounded bg-gradient-to-br from-amber-200 to-amber-600 shadow-inner border border-amber-300/30 flex items-center justify-center opacity-90">
                            <div className="w-full h-[1px] bg-black/20 absolute"></div>
                            <div className="h-full w-[1px] bg-black/20 absolute"></div>
                            <div className="w-4 h-4 border border-black/20 rounded-sm"></div>
                        </div>
                    </div>

                    {/* CENTRE : Numéro masqué ou ID */}
                    <div className="w-full">
                        <div className="flex gap-4 items-center">
                            <span className="text-white/30 text-xl tracking-widest font-mono">
                                •••• •••• ••••
                            </span>
                            <span className="text-amber-100/90 text-lg font-mono tracking-widest shadow-black drop-shadow-md">
                                {memberId.split('•')[1] || "001"}
                            </span>
                        </div>
                    </div>

                    {/* PIED DE PAGE : Nom et Tier */}
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5 font-sans">
                                Titulaire
                            </p>
                            <h3 className="text-lg sm:text-xl font-serif text-white tracking-wide uppercase drop-shadow-md bg-clip-text">
                                {name}
                            </h3>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">
                                Valid Thru
                            </p>
                            <p className="text-sm font-mono text-white/90">
                                12/28
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bordure Dorée Subtile (Inset) */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none"></div>
                <div className="absolute inset-[1px] rounded-2xl border border-amber-500/20 mix-blend-overlay pointer-events-none"></div>

                {/* Effet de brillance au survol (Sheen) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>

            </motion.div>
        </div>
    );
}
