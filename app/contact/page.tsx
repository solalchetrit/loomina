"use client";

import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] flex flex-col relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-15" />
                <div className="ambient-orb aurora w-[300px] h-[300px] bottom-[30%] left-[-50px] opacity-10" />
            </div>

            <main className="flex-grow pt-32 pb-20 px-6 relative z-10">
                <div className="mx-auto max-w-xl space-y-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center space-y-4"
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Contact
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>

                        <h1 className="heading-section font-serif text-[var(--text-primary)]">Nous écrire</h1>
                        <p className="text-[var(--text-secondary)] font-serif">
                            Une question sur votre projet de livre ? Notre équipe vous répond sous 24h.
                        </p>
                    </motion.div>

                    {/* Formulaire */}
                    <motion.form
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6 glass-gold rounded-2xl p-8"
                        action="mailto:contact@loomina.eu"
                        method="post"
                        encType="text/plain"
                    >
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Votre Nom</label>
                            <input
                                required
                                type="text"
                                id="name"
                                name="nom"
                                className="w-full bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] rounded-xl p-4 outline-none focus:border-[var(--loomina-gold)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                placeholder="Jean Dupont"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Votre Email</label>
                            <input
                                required
                                type="email"
                                id="email"
                                name="email"
                                className="w-full bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] rounded-xl p-4 outline-none focus:border-[var(--loomina-gold)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                placeholder="jean@exemple.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Votre Message</label>
                            <textarea
                                required
                                id="message"
                                name="message"
                                rows={6}
                                className="w-full bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] rounded-xl p-4 outline-none focus:border-[var(--loomina-gold)] transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                                placeholder="Bonjour, je souhaiterais en savoir plus sur..."
                            />
                        </div>

                        <MagicButton
                            type="submit"
                            className="w-full justify-center"
                            variant="primary"
                            size="lg"
                        >
                            Envoyer mon message
                        </MagicButton>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center pt-8 border-t border-white/10"
                    >
                        <p className="text-xs text-[var(--text-muted)] mb-3 uppercase tracking-wider">Ou appelez-nous directement</p>
                        <a href="tel:+33159169357" className="inline-flex items-center gap-3 text-xl font-serif text-[var(--text-primary)] hover:text-[var(--loomina-gold)] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-[var(--loomina-gold)]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--loomina-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            01 59 16 93 57
                        </a>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
