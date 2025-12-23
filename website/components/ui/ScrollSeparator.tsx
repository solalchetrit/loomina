"use client";

import { motion } from "framer-motion";

export default function ScrollSeparator() {
    return (
        <div className="w-full flex justify-center py-16 relative z-20 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center gap-2 text-[var(--loomina-gold)]"
            >
                <motion.span
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-4xl md:text-5xl"
                    aria-hidden
                >
                    ↓
                </motion.span>
            </motion.div>
        </div>
    );
}
