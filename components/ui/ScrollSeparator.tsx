"use client";

import { motion } from "framer-motion";

export default function ScrollSeparator() {
    return (
        <div className="w-full flex justify-center py-6 md:py-10 bg-white">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 md:h-20 bg-gradient-to-b from-transparent via-[var(--loomina-gold)] to-transparent opacity-50"></div>
                <span className="text-[var(--loomina-gold)] text-xl opacity-80">✦</span>
                <div className="w-[1px] h-12 md:h-20 bg-gradient-to-b from-transparent via-[var(--loomina-gold)] to-transparent opacity-50"></div>
            </motion.div>
        </div>
    );
}
