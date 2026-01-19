'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const OFFER_HIGHLIGHTS = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        title: "Entretiens illimités",
        desc: "À votre rythme"
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        title: "Rédaction littéraire",
        desc: "Par notre IA + relecture pro"
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        title: "Livre premium",
        desc: "Relié + version numérique"
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
        title: "Livraison incluse",
        desc: "Emballage soigné"
    }
];

const DETAILED_FEATURES = [
    {
        category: "La Collecte",
        items: [
            "14 appels thématiques guidés",
            "Durée adaptée à votre rythme",
            "Enregistrements sécurisés et chiffrés",
            "Modifications illimitées à chaque étape"
        ]
    },
    {
        category: "La Rédaction",
        items: [
            "Transformation en prose littéraire",
            "Relecture par des professionnels",
            "Respect de votre voix unique",
            "Validation chapitre par chapitre"
        ]
    },
    {
        category: "Le Livre Final",
        items: [
            "Impression premium reliée",
            "150-250 pages personnalisées",
            "Intégration de vos photos",
            "Version numérique (ebook) incluse"
        ]
    }
];

const FAQ_ITEMS = [
    {
        q: "Combien de temps dure le processus ?",
        a: "En moyenne 14 semaines, mais nous nous adaptons totalement à votre rythme. Certains clients préfèrent avancer rapidement, d&apos;autres prennent leur temps."
    },
    {
        q: "Que se passe-t-il si je veux modifier quelque chose ?",
        a: "Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu&apos;à votre satisfaction complète."
    },
    {
        q: "Puis-je offrir Loomina en cadeau ?",
        a: "Absolument ! C&apos;est même l&apos;un des cadeaux les plus appréciés. Nous fournissons un bon cadeau élégant à offrir."
    },
    {
        q: "Mes données sont-elles sécurisées ?",
        a: "Totalement. Vos enregistrements et textes sont chiffrés, stockés en Europe, et jamais partagés. Vous pouvez demander leur suppression à tout moment."
    },
    {
        q: "Y a-t-il une garantie ?",
        a: "Oui. Si après le premier appel vous n&apos;êtes pas satisfait, nous vous remboursons intégralement, sans question."
    }
];

const TESTIMONIALS = [
    {
        name: "Marie L.",
        age: "68 ans",
        text: "J&apos;ai toujours voulu écrire mes mémoires mais je ne savais pas par où commencer. Loomina a rendu cela si simple et naturel.",
        rating: 5
    },
    {
        name: "Jean-Pierre D.",
        age: "75 ans",
        text: "Un cadeau que ma fille m&apos;a offert. Les conversations étaient passionnantes. C&apos;est devenu un moment que j&apos;attendais chaque semaine.",
        rating: 5
    },
    {
        name: "Sophie M.",
        age: "45 ans",
        text: "Le plus beau cadeau que j&apos;ai pu faire à ma mère. Maintenant nous avons un trésor familial pour toujours.",
        rating: 5
    }
];

export default function OffrePage() {
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true });

    return (
        <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
            {/* Hero Section - Compact & Focused */}
            <section className="relative pt-24 pb-8 px-6 md:px-12 lg:px-24 flex items-center justify-center overflow-hidden">
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 40 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto text-center"
                >


                    <h1 className="heading-display font-serif mb-4 text-4xl md:text-5xl lg:text-6xl">
                        Votre Livre de Vie,
                        <span className="block text-gradient-gold mt-1">Clé en Main</span>
                    </h1>

                    <p className="text-base md:text-lg text-[var(--text-secondary)] font-serif max-w-2xl mx-auto leading-relaxed mb-6">
                        Un service tout compris pour transformer vos souvenirs en héritage littéraire.
                    </p>

                    {/* Compact Pricing Card */}
                    <div className="relative max-w-lg mx-auto">
                        <div className="relative glass-gold rounded-3xl p-8 border border-[var(--loomina-gold)]/20 shadow-2xl shadow-[var(--loomina-gold)]/5">
                            <div className="absolute top-0 right-0 px-5 py-1.5 bg-[var(--loomina-gold)] text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-bl-xl">
                                Forfait Complet
                            </div>

                            <div className="mb-6">
                                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.3em] font-bold">Investissement unique</span>
                                <div className="flex items-baseline justify-center gap-1 my-4">
                                    <span className="text-7xl md:text-8xl font-serif text-gradient-gold drop-shadow-sm">219</span>
                                    <span className="text-3xl text-[var(--loomina-gold)] font-serif mb-3">€</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] font-serif italic">Collecte • Rédaction • Impression Premium</p>
                            </div>

                            {/* Compact highlights grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {OFFER_HIGHLIGHTS.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--loomina-gold)]/10 border border-[var(--loomina-gold)]/20 flex items-center justify-center text-[var(--loomina-gold)] flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{item.title}</p>
                                            <p className="text-[10px] text-[var(--text-muted)] leading-tight">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button href="/order" variant="primary" size="lg" fullWidth className="py-4 shadow-lg shadow-[var(--loomina-gold)]/20">
                                Commencer ma biographie
                            </Button>

                            <div className="flex items-center justify-center gap-6 mt-5 text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Satisfait ou Remboursé</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Paiement sécurisé</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <ScrollSeparator />

            {/* What's Included - Detailed Breakdown */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-[var(--loomina-void)]/30">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Ce que vous recevez
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">Tout est Inclus</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {DETAILED_FEATURES.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="group relative glass-gold rounded-3xl p-6 hover-lift overflow-hidden border-0"
                            >
                                <h3 className="text-xl font-serif text-[var(--text-primary)] mb-4">
                                    {feature.category}
                                </h3>
                                <ul className="space-y-3">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] font-serif">
                                            <svg className="w-4 h-4 text-[var(--loomina-gold)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Process Timeline - Horizontal & Compact */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Le Parcours
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">3 Étapes Simples</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { num: "01", title: "Initialisation", duration: "Semaine 1", desc: "Premier appel pour calibrer Loomina selon votre style" },
                            { num: "02", title: "Conversations", duration: "Semaines 2-13", desc: "14 appels thématiques, rédaction en temps réel" },
                            { num: "03", title: "Livraison", duration: "Semaine 14", desc: "Mise en page premium et livraison à domicile" }
                        ].map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="relative glass-gold rounded-2xl p-6 text-center group hover-lift"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] flex items-center justify-center shadow-lg">
                                    <span className="text-lg font-serif text-[var(--loomina-void)] font-medium">{step.num}</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-serif text-[var(--text-primary)] mb-1">{step.title}</h3>
                                    <p className="text-xs text-[var(--loomina-gold)] font-semibold tracking-wider uppercase mb-3">~{step.duration}</p>
                                    <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Testimonials - Compact */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24 bg-[var(--loomina-void)]/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">Ils Nous Font Confiance</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="glass rounded-xl p-6"
                            >
                                <div className="flex gap-1 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-[var(--loomina-gold)] fill-current" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed mb-4 italic">
                                    &quot;{testimonial.text}&quot;
                                </p>
                                <div className="flex items-center gap-3 border-t border-[var(--loomina-mist)] pt-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" />
                                    <div>
                                        <p className="font-semibold text-xs text-[var(--text-primary)]">{testimonial.name}</p>
                                        <p className="text-[10px] text-[var(--text-muted)]">{testimonial.age}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* FAQ - Compact */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">Questions Fréquentes</h2>
                    </div>

                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="glass rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                    className="w-full p-5 text-left flex justify-between items-center hover:bg-[var(--loomina-mist)]/30 transition-colors"
                                >
                                    <span className="font-serif text-base text-[var(--text-primary)] pr-4">{item.q}</span>
                                    <motion.span
                                        animate={{ rotate: openFaqIndex === idx ? 45 : 0 }}
                                        className="text-[var(--loomina-gold)] text-xl flex-shrink-0"
                                    >
                                        +
                                    </motion.span>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openFaqIndex === idx ? "auto" : 0,
                                        opacity: openFaqIndex === idx ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-5">
                                        <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">{item.a}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final - Compact */}
            <section className="relative pt-8 pb-16 px-6 md:px-12 lg:px-24 text-center overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">Prêt à Commencer ?</h2>
                    <p className="text-base text-[var(--text-secondary)] font-serif mb-8">
                        Rejoignez les familles qui ont déjà choisi Loomina pour préserver leurs histoires.
                    </p>
                    <Button href="/order" variant="primary" size="lg">
                        Commander mon livre
                    </Button>
                </div>
            </section>
        </main>
    );
}
