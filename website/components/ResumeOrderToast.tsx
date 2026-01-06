"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MagicButton from "./ui/MagicButton";
import Link from "next/link";

export default function ResumeOrderToast() {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        const data = localStorage.getItem("loomina_order_data");
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.firstName) {
                    setName(parsed.firstName);
                    // Show after a short delay for better punchiness
                    const timer = setTimeout(() => setShow(true), 1500);
                    return () => clearTimeout(timer);
                }
            } catch (e) {
                console.error("Failed to parse order data", e);
            }
        }
    }, []);

    const handleDismiss = () => {
        setShow(false);
    };

    const handleClear = () => {
        localStorage.removeItem("loomina_order_data");
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-md"
                >
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl bg-white/90 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--loomina-amber)]/10 flex items-center justify-center text-xl">
                                ✒️
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-black">Continuer pour {name} ?</p>
                                <p className="text-xs text-neutral-500">Votre commande est en attente.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/order"
                                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:scale-105 transition-transform"
                            >
                                Reprendre
                            </Link>
                            <button
                                onClick={handleDismiss}
                                className="p-2 text-neutral-400 hover:text-black transition-colors"
                                aria-label="Fermer"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
