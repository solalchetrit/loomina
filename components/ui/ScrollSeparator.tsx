"use client";

import { motion } from "framer-motion";

interface ScrollSeparatorProps {
    variant?: "default" | "subtle";
}

export default function ScrollSeparator({ variant = "default" }: ScrollSeparatorProps) {
    return (
        <div className="relative w-full py-8 flex items-center justify-center overflow-hidden">
            {/* Center decorative element */}
            <div className="relative flex items-center gap-6">
                {/* Left line */}
                <motion.div
                    className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]/50"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />

                {/* Center diamond */}
                <motion.div
                    className="relative"
                    initial={{ scale: 0, rotate: 45 }}
                    whileInView={{ scale: 1, rotate: 45 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                >
                    <div className="w-3 h-3 border border-[var(--loomina-gold)]/50 bg-[var(--loomina-void)]" />
                    <div className="absolute inset-0 w-3 h-3 bg-[var(--loomina-gold)]/20 blur-sm" />
                </motion.div>

                {/* Right line */}
                <motion.div
                    className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]/50"
                    initial={{ scaleX: 0, originX: 1 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
