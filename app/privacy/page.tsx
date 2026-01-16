'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[400px] h-[400px] top-[-100px] right-[-100px] opacity-10" />
            </div>

            {/* Hero Section */}
            <section className="relative py-32 px-6 md:px-12 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center mb-8">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="mx-4 text-xs font-semibold tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                            Confidentialité
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <h1 className="heading-display font-serif mb-6">
                        Politique de Confidentialité
                    </h1>

                    <p className="text-[var(--text-muted)] font-serif">
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </motion.div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">1. Données collectées</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed font-serif">
                            Dans le cadre de la création de votre livre autobiographique, Loomina collecte et traite les données suivantes :
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-[var(--text-secondary)] font-serif">
                            <li>Enregistrements vocaux des entretiens.</li>
                            <li>Transcriptions textuelles de ces entretiens.</li>
                            <li>Photographies personnelles fournies pour l&apos;illustration de l&apos;ouvrage.</li>
                            <li>Coordonnées (nom, adresse, email, téléphone) pour la livraison et la facturation.</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-gold rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">2. Utilisation des données et IA</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed font-serif">
                            Vos données personnelles et souvenirs ne sont utilisés <strong className="text-[var(--text-primary)]">que dans l&apos;unique but de créer votre livre</strong>.
                            Loomina garantit que vos enregistrements vocaux ne sont pas utilisés pour entraîner des modèles d&apos;intelligence artificielle publics.
                            L&apos;IA est utilisée comme un outil d&apos;assistance à la transcription et à la rédaction, sous supervision humaine.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">3. Sécurité</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed font-serif">
                            Loomina attache une importance capitale à la sécurité de vos mémoires.
                            Toutes les données (audio, texte, images) sont stockées dans un coffre-fort numérique sécurisé et crypté (AES-256).
                            L&apos;accès est strictement limité au personnel chargé de la production de votre ouvrage.
                        </p>
                        <div className="mt-6 flex items-center gap-3 p-4 bg-[var(--loomina-mist)]/20 rounded-xl border border-[var(--loomina-mist)]">
                            <div className="w-10 h-10 rounded-xl bg-[var(--loomina-gold)]/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-primary)] font-medium">Stockage sécurisé en Europe</p>
                                <p className="text-xs text-[var(--text-muted)]">Serveurs conformes RGPD</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">4. Vos droits</h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed font-serif">
                            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données.
                            Vous pouvez à tout moment demander la suppression définitive de vos souvenirs numériques de nos serveurs une fois le livre livré,
                            en nous contactant à <span className="text-[var(--loomina-gold)]">contact@loomina.eu</span>.
                        </p>
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: "Accès", desc: "Consultez vos données" },
                                { title: "Rectification", desc: "Modifiez vos infos" },
                                { title: "Suppression", desc: "Effacez vos données" },
                                { title: "Portabilité", desc: "Récupérez vos données" }
                            ].map((right, idx) => (
                                <div key={idx} className="bg-[var(--loomina-mist)]/20 rounded-xl p-4 text-center border border-[var(--loomina-mist)]">
                                    <p className="text-sm text-[var(--text-primary)] font-medium">{right.title}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{right.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button href="/legal" variant="secondary" size="lg">
                        Mentions légales
                    </Button>
                    <Button href="/contact" variant="primary" size="lg">
                        Nous contacter
                    </Button>
                </div>
            </section>
        </main>
    );
}
