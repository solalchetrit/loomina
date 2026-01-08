'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

export default function LegalPage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center mb-8">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                            <span className="mx-4 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                                Informations Légales
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight tracking-tight">
                            Mentions Légales
                        </h1>

                        <p className="text-base text-[#888] font-serif">
                            Dernière mise à jour : 8 janvier 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-12 text-[#555] font-serif leading-relaxed">

                        {/* Éditeur du site */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">1. Éditeur du Site</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-6">
                                    Le site internet <strong>www.loomina.eu</strong> (ci-après « le Site ») est édité par :
                                </p>
                                <div className="bg-gradient-to-br from-[#fefdfb] to-white border border-[var(--loomina-gold)]/20 rounded-2xl p-8 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-[#888] mb-1">Raison sociale</p>
                                            <p className="font-semibold text-[#1a1a1a]">Loomina</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#888] mb-1">Forme juridique</p>
                                            <p className="font-semibold text-[#1a1a1a]">Société par Actions Simplifiée (SAS)</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#888] mb-1">Siège social</p>
                                            <p className="font-semibold text-[#1a1a1a]">France</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-[#888] mb-1">Email</p>
                                            <a href="mailto:contact@loomina.eu" className="font-semibold text-[var(--loomina-gold)] hover:underline">
                                                contact@loomina.eu
                                            </a>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-sm">
                                            <strong>Directeur de la publication :</strong> Solal Chetrit, Président
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Hébergement */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                                        <line x1="6" y1="6" x2="6.01" y2="6" />
                                        <line x1="6" y1="18" x2="6.01" y2="18" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">2. Hébergement</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-6">Le Site est hébergé par :</p>
                                <div className="bg-gradient-to-br from-[#fefdfb] to-white border border-[var(--loomina-gold)]/20 rounded-2xl p-8 space-y-3">
                                    <div>
                                        <p className="text-sm text-[#888] mb-1">Hébergeur</p>
                                        <p className="font-semibold text-[#1a1a1a]">Vercel Inc.</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#888] mb-1">Adresse</p>
                                        <p className="font-semibold text-[#1a1a1a]">340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#888] mb-1">Site web</p>
                                        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--loomina-gold)] hover:underline">
                                            vercel.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Propriété intellectuelle */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4M12 8h.01" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">3. Propriété Intellectuelle</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    L'ensemble des éléments composant le Site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.)
                                    est la propriété exclusive de Loomina ou de ses partenaires, sauf mention contraire.
                                </p>
                                <p>
                                    Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site,
                                    quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Loomina.
                                </p>
                                <div className="bg-[#fefdfb] border-l-4 border-[var(--loomina-gold)] rounded-r-xl p-6">
                                    <p className="text-sm">
                                        Toute exploitation non autorisée du Site ou de l'un quelconque des éléments qu'il contient sera considérée comme
                                        constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Protection des données */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">4. Protection des Données Personnelles</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    Loomina accorde une grande importance à la protection de vos données personnelles.
                                </p>
                                <p>
                                    Les données collectées sur le Site sont traitées conformément au Règlement Général sur la Protection des Données (RGPD)
                                    et à la loi Informatique et Libertés.
                                </p>
                                <p>
                                    Pour en savoir plus sur la collecte, l'utilisation et la protection de vos données personnelles,
                                    consultez notre <Link href="/privacy" className="text-[var(--loomina-gold)] hover:underline underline-offset-2 font-semibold">Politique de Confidentialité</Link>.
                                </p>
                                <div className="bg-gradient-to-br from-[#fefdfb] to-white border border-[var(--loomina-gold)]/20 rounded-2xl p-6 space-y-3">
                                    <div>
                                        <p className="text-sm text-[#888] mb-1">Responsable du traitement</p>
                                        <p className="font-semibold text-[#1a1a1a]">Loomina</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#888] mb-1">Contact DPO</p>
                                        <a href="mailto:contact@loomina.eu" className="font-semibold text-[var(--loomina-gold)] hover:underline">
                                            contact@loomina.eu
                                        </a>
                                    </div>
                                </div>
                                <div className="bg-[#fefdfb] border-l-4 border-[var(--loomina-gold)] rounded-r-xl p-6">
                                    <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Vos droits</p>
                                    <p className="text-sm">
                                        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de limitation,
                                        d'opposition et de portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à :
                                        <strong> contact@loomina.eu</strong>
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Cookies */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                                        <circle cx="8" cy="8" r="1" fill="currentColor" />
                                        <circle cx="16" cy="8" r="1" fill="currentColor" />
                                        <circle cx="8" cy="16" r="1" fill="currentColor" />
                                        <circle cx="16" cy="16" r="1" fill="currentColor" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">5. Cookies</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    Le Site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
                                </p>
                                <p>
                                    Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur le Site.
                                    Les cookies que nous utilisons sont :
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">•</span>
                                        <div>
                                            <strong className="text-[#1a1a1a]">Cookies techniques :</strong> Nécessaires au fonctionnement du Site (session, panier, etc.)
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">•</span>
                                        <div>
                                            <strong className="text-[#1a1a1a]">Cookies analytiques :</strong> Pour mesurer l'audience et améliorer le Site
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm">
                                    Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
                                    Toutefois, cela peut affecter certaines fonctionnalités du Site.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Responsabilité */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">6. Limitation de Responsabilité</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    Loomina s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le Site,
                                    mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                                </p>
                                <p>Loomina ne saurait être tenue responsable :</p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Des interruptions ou dysfonctionnements du Site</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>De l'impossibilité d'accéder au Site</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Des dommages directs ou indirects résultant de l'utilisation du Site</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Du contenu des sites tiers vers lesquels le Site pourrait renvoyer</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Liens hypertextes */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">7. Liens Hypertextes</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    Le Site peut contenir des liens hypertextes vers d'autres sites internet.
                                    Loomina n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                                </p>
                                <p>
                                    La création de liens hypertextes vers le Site est soumise à l'autorisation préalable de Loomina.
                                    Pour toute demande, contactez-nous à : <strong>contact@loomina.eu</strong>.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Droit applicable */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">8. Droit Applicable et Juridiction Compétente</h2>
                            </div>
                            <div className="pl-14 space-y-4">
                                <p>
                                    Les présentes mentions légales sont régies par le droit français.
                                </p>
                                <p>
                                    En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Crédits */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">9. Crédits</h2>
                            </div>
                            <div className="pl-14 space-y-2">
                                <p><strong>Conception et développement :</strong> Loomina</p>
                                <p><strong>Design :</strong> Loomina</p>
                                <p><strong>Icônes :</strong> Lucide Icons & Custom SVG</p>
                            </div>
                        </motion.div>

                        {/* Contact */}
                        <div className="border-t-2 border-[var(--loomina-gold)]/20 pt-12 mt-12">
                            <motion.div {...fadeInUp}>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] mb-6 tracking-tight">Contact</h2>
                                <p className="mb-6">
                                    Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter :
                                </p>
                                <div className="bg-gradient-to-br from-[#fefdfb] to-white border border-[var(--loomina-gold)]/20 rounded-2xl p-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Email : </span>
                                            <a href="mailto:contact@loomina.eu" className="text-[var(--loomina-gold)] hover:underline">contact@loomina.eu</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Localisation : </span>
                                            <span>France</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Site web : </span>
                                            <a href="https://www.loomina.eu" className="text-[var(--loomina-gold)] hover:underline">www.loomina.eu</a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] text-center border-t border-gray-100">
                <motion.div {...fadeInUp}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/privacy" variant="secondary" size="lg">
                            Politique de confidentialité
                        </Button>
                        <Button href="/cgv" variant="secondary" size="lg">
                            CGV
                        </Button>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
