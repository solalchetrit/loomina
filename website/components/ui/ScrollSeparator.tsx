"use client";

import { motion } from "framer-motion";

export default function ScrollSeparator() {
    return (
        <div className="w-full flex justify-center py-12 relative z-20 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center gap-2 text-[var(--loomina-gold)]"
            >
                <motion.span
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-3xl"
                    aria-hidden
                >
                    ↓
                </motion.span>
            </motion.div>
        </div>
    );
}
