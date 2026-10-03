'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export default function PrivacyPage() {
    return (
        <main className="w-full">

            {/* Hero Section */}
            <section className="relative pt-28 pb-8 md:pt-40 md:pb-10 px-5 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <p className="eyebrow">Confidentialité</p>

                    <h1 className="heading-section mt-4 mb-5 max-w-3xl">
                        Politique de Confidentialité
                    </h1>

                    <p className="font-sans text-[14px] text-[var(--text-muted)]">
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="pt-6 pb-20 md:pb-28 px-5 sm:px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-6">

                    <div className="card rounded-3xl p-6 sm:p-8">
                        <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">1. Données collectées</h2>
                        <p>
                            Dans le cadre de la création de votre livre autobiographique, Loomina collecte et traite les données suivantes :
                        </p>
                        <ul className="mt-4">
                            <li>Enregistrements vocaux des entretiens.</li>
                            <li>Transcriptions textuelles de ces entretiens.</li>
                            <li>Photographies personnelles fournies pour l’illustration de l’ouvrage.</li>
                            <li>Coordonnées (nom, adresse, email, téléphone) pour la livraison et la facturation.</li>
                        </ul>
                    </div>

                    <div className="card rounded-3xl p-6 sm:p-8">
                        <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">2. Utilisation des données et IA</h2>
                        <p>
                            Vos données personnelles et souvenirs ne sont utilisés <strong className="text-[var(--text-primary)]">que dans l’unique but de créer votre livre</strong>.
                            Loomina garantit que vos enregistrements vocaux ne sont pas utilisés pour entraîner des modèles d’intelligence artificielle publics.
                            L’IA est utilisée comme un outil d’assistance à la transcription et à la rédaction, sous supervision humaine.
                        </p>
                    </div>

                    <div className="card rounded-3xl p-6 sm:p-8">
                        <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">3. Sécurité</h2>
                        <p>
                            Loomina attache une importance capitale à la sécurité de vos mémoires.
                            Toutes les données (audio, texte, images) sont stockées dans un coffre-fort numérique sécurisé et crypté (AES-256).
                            L’accès est strictement limité au personnel chargé de la production de votre ouvrage.
                        </p>
                        <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-[var(--loomina-night)]">
                            <div className="w-10 h-10 rounded-xl bg-[var(--paper)] shadow-[inset_0_0_0_1px_var(--hairline)] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[var(--gold-ink)]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-primary)] font-medium">Stockage sécurisé en Europe</p>
                                <p className="text-xs text-[var(--text-muted)]">Serveurs conformes RGPD</p>
                            </div>
                        </div>
                    </div>

                    <div className="card rounded-3xl p-6 sm:p-8">
                        <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">4. Vos droits</h2>
                        <p>
                            Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données.
                            Vous pouvez à tout moment demander la suppression définitive de vos souvenirs numériques de nos serveurs une fois le livre livré,
                            en nous contactant à <span className="text-[var(--gold-ink)]">contact@loomina.eu</span>.
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
                    </div>

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
