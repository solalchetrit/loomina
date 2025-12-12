"use client";

import { motion } from "framer-motion";

export default function ScrollSeparator() {
    return (
        <div className="w-full flex justify-center -mt-16 relative z-20 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-3 text-[var(--loomina-amber)]"
            >
                <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl font-semibold"
                    aria-hidden
                >
                    ↓
                </motion.span>
            </motion.div>
        </div>
    );
}
