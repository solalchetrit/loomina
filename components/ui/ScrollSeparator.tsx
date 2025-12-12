"use client";

import { motion } from "framer-motion";

export default function ScrollSeparator() {
    return (
        <div className="w-full flex justify-center py-4 md:py-6 bg-white">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-3 text-[var(--loomina-amber)]"
            >
                <div className="w-[1px] h-14 md:h-24 bg-gradient-to-b from-transparent via-[var(--loomina-amber)] to-transparent opacity-80" />
                <span className="text-xl" aria-hidden>
                    ✦
                </span>
                <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl font-semibold"
                    aria-hidden
                >
                    ↓
                </motion.span>
                <div className="w-[1px] h-14 md:h-24 bg-gradient-to-b from-transparent via-[var(--loomina-amber)] to-transparent opacity-80" />
                <div className="flex items-center gap-2 rounded-full bg-[var(--loomina-amber)]/10 border border-[var(--loomina-amber)]/30 px-4 py-1.5 text-[var(--loomina-black)]">
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold">Section suivante</span>
                    <span className="text-sm font-medium text-[var(--loomina-amber)]">Faire défiler pour lire</span>
                </div>
            </motion.div>
        </div>
    );
}
