"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MemberCardProps {
    name?: string;
    memberId?: string;
}

export default function MemberCard({
    name = "ÉDITION BIOGRAPHIQUE",
    memberId = "2025 • #001",
}: MemberCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ perspective: 1000 }}
            className="relative group"
        >
            {/* Effet de lueur arrière (Glow) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-yellow-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            {/* Carte Principale */}
            <div className="relative w-full max-w-md aspect-[1.58/1] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl">

                {/* Fond texturé (Noise + Gradient subtil) */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>

                {/* Cercle décoratif doré en arrière-plan */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Contenu de la carte */}
                <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 z-10">

                    {/* En-tête : Logo et Statut */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            {/* Logo placeholder - remplacez par votre composant Image si nécessaire */}
                            <div className="relative w-8 h-8 opacity-90">
                                <Image
                                    src="/header_logo.svg"
                                    alt="Loomina Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-white/80 font-medium tracking-widest text-xs sm:text-sm uppercase font-sans">
                                Loomina
                            </span>
                        </div>
                        <div className="border border-amber-500/30 bg-amber-500/10 px-3 py-1 rounded-full backdrop-blur-sm">
                            <span className="bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                                Membre Fondateur
                            </span>
                        </div>
                    </div>

                    {/* Centre : Nom du titulaire */}
                    <div className="space-y-1">
                        <p className="text-amber-500/60 text-xs tracking-[0.2em] uppercase">
                            Titulaire
                        </p>
                        <h3 className="text-xl sm:text-3xl font-serif text-white tracking-wide drop-shadow-md">
                            {name}
                        </h3>
                    </div>

                    {/* Pied de page : ID et Puce */}
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                                Identifiant Unique
                            </span>
                            <span className="font-mono text-amber-100/90 text-sm sm:text-base tracking-widest">
                                {memberId}
                            </span>
                        </div>

                        {/* Élément graphique style "Puce" ou "Sceau" */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-200 to-yellow-600 flex items-center justify-center shadow-lg opacity-80">
                            <div className="w-8 h-8 border border-white/20 rounded bg-white/10 backdrop-blur-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
