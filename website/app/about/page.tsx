'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const VALUES = [
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: "Authenticité",
        desc: "Nous préservons l'essence de votre voix, vos expressions uniques, votre façon de raconter. Aucun filtre, aucun artifice — juste vous, tel que vous êtes."
    },
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: "Bienveillance",
        desc: "Chaque échange est un moment privilégié. Nous écoutons avec patience, sans jamais brusquer. Votre rythme est le nôtre, votre confort notre priorité."
    },
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: "Transmission",
        desc: "Nous tissons le fil invisible qui relie les générations. Votre histoire devient un héritage tangible, un pont entre le passé et l'avenir de votre famille."
    },
    {
        icon: (
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: "Excellence",
        desc: "De notre technologie de pointe à l'impression artisanale de votre livre, nous cultivons l'excellence à chaque étape. Votre histoire mérite ce qu'il y a de mieux."
    }
];

const STATS = [
    { value: "87%", label: "des gens rêvent d'écrire leur histoire" },
    { value: "3%", label: "passent réellement à l'acte" },
    { value: "100%", label: "de nos clients sont satisfaits" },
];

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a] overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24 min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-white via-white to-[#fefdfb]">
                {/* Decorative background elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--loomina-gold)]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--loomina-amber)]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    className="max-w-4xl mx-auto text-center relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            Notre Histoire
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-[1.1] tracking-tight">
                        Chaque vie est un
                        <span className="block text-[var(--loomina-gold)] mt-2 italic">roman à écrire</span>
                    </h1>

                    <p className="text-xl text-[#555] font-serif max-w-3xl mx-auto leading-relaxed">
                        Loomina est née d'une conviction profonde : les histoires les plus précieuses
                        ne doivent jamais disparaître. Nous avons créé la technologie qui permet
                        à chacun de transmettre la sienne.
                    </p>
                </motion.div>
            </section>

            <ScrollSeparator />

            {/* L'Histoire du Fondateur */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Image */}
                        <motion.div
                            className="relative order-2 md:order-1"
                            {...fadeInUp}
                        >
                            <div className="aspect-[4/5] bg-gradient-to-br from-[#f8f6f3] to-[#f0ebe3] rounded-3xl overflow-hidden border border-[var(--loomina-gold)]/10 shadow-2xl shadow-black/5">
                                <div className="w-full h-full flex items-center justify-center relative">
                                    {/* Elegant placeholder with initials */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent" />
                                    <div className="relative z-10 text-center">
                                        <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-amber)] flex items-center justify-center shadow-lg">
                                            <span className="text-5xl font-serif text-white">SC</span>
                                        </div>
                                        <p className="text-lg font-serif text-[#666]">Solal Chetrit</p>
                                        <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-wider uppercase mt-1">Fondateur</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[var(--loomina-gold)]/10 rounded-full blur-2xl -z-10"></div>
                            <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-[var(--loomina-gold)]/20 rounded-3xl -z-10"></div>
                        </motion.div>

                        {/* Texte */}
                        <motion.div
                            className="space-y-8 order-1 md:order-2"
                            {...fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div>
                                <h2 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight leading-tight">
                                    « Ma grand-mère avait mille histoires à raconter... »
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] rounded-full mb-8"></div>
                            </div>

                            <div className="space-y-5 text-[#555] font-serif leading-relaxed text-lg">
                                <p>
                                    Je m'appelle <strong className="text-[#1a1a1a]">Solal Chetrit</strong>. Il y a deux ans,
                                    ma grand-mère a été hospitalisée. Dans cette chambre d'hôpital, entre inquiétude
                                    et espoir, j'ai réalisé quelque chose de bouleversant.
                                </p>

                                <p>
                                    Cette femme extraordinaire avait vécu <strong className="text-[#1a1a1a]">une vie
                                        romanesque</strong> — l'Algérie de son enfance, l'exil, la reconstruction,
                                    les joies et les peines. Des décennies d'histoires que je ne connaissais qu'en fragments.
                                </p>

                                <p>
                                    Nous voulions qu'elle écrive ses mémoires. Mais écrire un livre, c'est un travail
                                    titanesque. Elle avait tant à dire, mais <strong className="text-[#1a1a1a]">pas
                                        les moyens de le faire</strong>.
                                </p>

                                <p className="text-xl italic text-[var(--loomina-gold)] border-l-4 border-[var(--loomina-gold)]/30 pl-6">
                                    Et si la technologie pouvait simplement l'écouter parler, et transformer
                                    ses mots en livre ?
                                </p>

                                <p>
                                    Fraîchement diplômé de l'ESCP, j'ai mis toutes mes compétences dans ce projet.
                                    Aujourd'hui, le livre de ma grand-mère trône dans notre salon. C'est notre
                                    <strong className="text-[#1a1a1a]"> trésor familial</strong>.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Statistics Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#fefdfb] to-white">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="grid md:grid-cols-3 gap-8 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {STATS.map((stat, idx) => (
                            <div key={idx} className="p-8">
                                <div className="text-6xl md:text-7xl font-serif bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] bg-clip-text text-transparent mb-4">
                                    {stat.value}
                                </div>
                                <p className="text-[#666] font-serif text-lg">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Mission */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white relative">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-tight">Notre Mission</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] mx-auto mb-10 rounded-full"></div>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-b from-white to-[#fefdfb] border border-[var(--loomina-gold)]/20 rounded-3xl p-10 md:p-16 shadow-xl shadow-[var(--loomina-gold)]/5 relative overflow-hidden"
                        {...fadeInUp}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--loomina-gold)]/5 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />

                        <p className="text-2xl md:text-4xl font-serif leading-relaxed text-[#333] mb-10 relative z-10">
                            « Offrir à chaque personne le pouvoir de
                            <span className="text-[var(--loomina-gold)]"> transmettre son histoire</span>,
                            simplement en la racontant. »
                        </p>

                        <div className="space-y-6 text-left max-w-2xl mx-auto text-[#555] font-serif text-lg relative z-10">
                            <p>
                                Nous refusons de laisser des vies extraordinaires sombrer dans l'oubli
                                simplement parce que l'écriture est un obstacle.
                            </p>

                            <p>
                                Notre technologie n'est qu'un outil au service d'une cause plus grande :
                                <strong className="text-[#1a1a1a]"> préserver la mémoire humaine</strong> et
                                construire des ponts durables entre les générations.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Valeurs */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb]">
                <div className="max-w-6xl mx-auto">
                    <motion.div className="text-center mb-16" {...fadeInUp}>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-tight">Nos Valeurs</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] mx-auto mb-6 rounded-full"></div>
                        <p className="text-lg text-[#666] font-serif max-w-2xl mx-auto">
                            Les principes fondamentaux qui guident chacune de nos actions.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((value, idx) => (
                            <motion.div
                                key={idx}
                                className="group text-center p-8 bg-white border border-gray-100 rounded-3xl hover:border-[var(--loomina-gold)]/40 hover:shadow-2xl hover:shadow-[var(--loomina-gold)]/10 transition-all duration-500"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--loomina-gold)]/10 to-[var(--loomina-amber)]/5 flex items-center justify-center text-[var(--loomina-gold)] group-hover:scale-110 transition-transform duration-300">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-serif mb-3 tracking-tight">{value.title}</h3>
                                <p className="text-sm text-[#666] font-serif leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Vision */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-tight">Notre Vision</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] mx-auto rounded-full"></div>
                    </motion.div>

                    <motion.div
                        className="space-y-8 text-[#555] font-serif leading-relaxed text-lg"
                        {...fadeInUp}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <p className="text-xl">
                            Dans un monde où tout s'accélère, où les souvenirs se noient dans le flux
                            numérique, nous voulons créer quelque chose de <strong className="text-[#1a1a1a]">tangible,
                                de durable, de précieux</strong>.
                        </p>

                        <p>
                            Nous imaginons un futur où chaque famille possède sa propre bibliothèque
                            d'histoires — où les petits-enfants découvrent la vie de leurs aïeux non
                            pas à travers des bribes de souvenirs, mais à travers des
                            <strong className="text-[#1a1a1a]"> récits complets et vivants</strong>.
                        </p>

                        <p>
                            Loomina n'est que le premier chapitre de cette aventure. Nous développons
                            déjà de nouvelles fonctionnalités : intégration de photos d'archives,
                            enregistrements audio préservés, livres collaboratifs multi-générations...
                        </p>

                        <p className="text-2xl text-center py-6 text-[var(--loomina-gold)] font-medium italic">
                            Notre ambition : devenir la référence mondiale de la transmission
                            des histoires de vie.
                        </p>
                    </motion.div>
                </div>
            </section>

            <ScrollSeparator />

            {/* L'Équipe */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#fefdfb] to-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div className="text-center mb-12" {...fadeInUp}>
                        <h2 className="text-3xl md:text-5xl font-serif mb-4 tracking-tight">L'Équipe</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-amber)] mx-auto mb-6 rounded-full"></div>
                        <p className="text-lg text-[#666] font-serif">
                            Une équipe passionnée, dédiée à préserver vos histoires.
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-white border border-[var(--loomina-gold)]/20 rounded-3xl p-10 md:p-12 text-center shadow-xl shadow-black/5"
                        {...fadeInUp}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="w-36 h-36 mx-auto mb-8 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-amber)] flex items-center justify-center shadow-lg shadow-[var(--loomina-gold)]/30">
                            <span className="text-4xl font-serif text-white">SC</span>
                        </div>
                        <h3 className="text-3xl font-serif mb-2">Solal Chetrit</h3>
                        <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-widest uppercase mb-6">
                            Fondateur & CEO
                        </p>
                        <p className="text-[#555] font-serif leading-relaxed max-w-xl mx-auto text-lg">
                            Diplômé de l'ESCP Business School, passionné par l'intelligence artificielle
                            et la préservation de la mémoire familiale. Solal a créé Loomina pour transformer
                            un problème personnel en solution universelle.
                        </p>
                    </motion.div>

                    <motion.p
                        className="text-center text-[#666] mt-12 font-serif italic text-lg"
                        {...fadeInUp}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Nous collaborons avec des rédacteurs professionnels, des designers talentueux
                        et des imprimeurs d'excellence pour garantir la qualité de chaque livre.
                    </motion.p>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] text-center relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--loomina-gold)]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--loomina-amber)]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div className="relative z-10" {...fadeInUp}>
                    <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">
                        Prêt à écrire
                        <span className="block text-[var(--loomina-gold)] italic mt-2">votre histoire ?</span>
                    </h2>
                    <p className="text-xl text-[#666] font-serif mb-12 max-w-2xl mx-auto">
                        Rejoignez les familles qui ont choisi Loomina pour préserver
                        leurs souvenirs les plus précieux.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/offre" variant="primary" size="lg">
                            Découvrir l'offre
                        </Button>
                        <Button href="/contact" variant="secondary" size="lg">
                            Nous contacter
                        </Button>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
