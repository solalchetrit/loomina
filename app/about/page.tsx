'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const VALUES = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
        title: "Authenticité",
        desc: "Nous capturons votre voix unique, sans filtre ni artifice. Votre histoire, telle que vous la racontez.",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: "Bienveillance",
        desc: "Chaque conversation est un moment d'écoute attentive et respectueuse de votre rythme.",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: "Transmission",
        desc: "Nous croyons que chaque vie mérite d'être racontée et transmise aux générations futures.",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]"
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        ),
        title: "Excellence",
        desc: "De la technologie à l'impression, nous ne faisons aucun compromis sur la qualité.",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]"
    }
];

function ValueCard({ value, index }: { value: typeof VALUES[0], index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group text-center glass rounded-2xl p-8 hover-lift relative overflow-hidden"
        >
            {/* Gradient accent at top */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${value.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white shadow-lg`}>
                {value.icon}
            </div>
            <h3 className="text-xl font-serif text-[var(--text-primary)] mb-3 group-hover:text-gradient-gold transition-all duration-300">{value.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">{value.desc}</p>
        </motion.div>
    );
}

export default function AboutPage() {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-8 px-6 md:px-12 lg:px-24 min-h-[500px] flex items-center justify-center overflow-hidden">

                <motion.div
                    ref={heroRef}
                    initial={{ opacity: 0, y: 40 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto text-center"
                >
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="mx-6 text-xs font-semibold tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                            À Propos
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <h1 className="heading-display font-serif mb-8">
                        L&apos;Histoire de
                        <span className="block text-gradient-gold mt-2">Loomina</span>
                    </h1>

                    <p className="text-xl text-[var(--text-secondary)] font-serif max-w-3xl mx-auto leading-relaxed">
                        Née d&apos;un besoin personnel, Loomina est devenue une mission :
                        <br className="hidden md:block" />
                        permettre à chacun de transmettre son histoire.
                    </p>
                </motion.div>
            </section>

            <ScrollSeparator />

            {/* L'Histoire du Fondateur */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24 relative overflow-hidden">

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Photo placeholder */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] glass-gold rounded-3xl flex items-center justify-center relative overflow-hidden">
                                {/* Decorative gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent" />

                                <div className="text-center p-8 relative z-10">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] flex items-center justify-center">
                                        <svg className="w-12 h-12 text-[var(--loomina-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-[var(--text-muted)] font-serif">Photo de Solal Chetrit</p>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-[var(--loomina-gold)]/20 to-transparent rounded-full blur-3xl -z-10" />
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">
                                    Tout a Commencé avec ma Grand-Mère
                                </h2>
                                <div className="line-glow w-20 mb-8" />
                            </div>

                            <div className="space-y-5 text-[var(--text-secondary)] font-serif leading-relaxed text-lg">
                                <p>
                                    Je m&apos;appelle <strong className="text-[var(--text-primary)]">Solal Chetrit</strong>, j&apos;ai 22 ans et je suis fraîchement diplômé de l&apos;ESCP Business School.
                                </p>

                                <p>
                                    Il y a deux ans, ma grand-mère a eu des soucis de santé. Face à cette épreuve, j&apos;ai réalisé quelque chose : <strong className="text-[var(--text-primary)]">sa vie était passionnante</strong>, remplie d&apos;histoires que je ne connaissais qu&apos;en partie.
                                </p>

                                <p>
                                    Nous voulions qu&apos;elle écrive son livre, mais c&apos;était trop compliqué pour elle. Écrire demande du temps, de l&apos;énergie, et une certaine aisance avec les mots.
                                </p>

                                <p>
                                    C&apos;est là que l&apos;idée de Loomina est née. <strong className="text-[var(--text-primary)]">Et si on pouvait simplement parler ?</strong> Si la technologie pouvait transformer nos conversations en un vrai livre, sans effort ?
                                </p>

                                <p className="text-[var(--loomina-gold)]">
                                    Aujourd&apos;hui, son livre trône dans notre salon, et c&apos;est devenu notre trésor familial.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Mission */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Notre Raison d&apos;Être
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">Notre Mission</h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative glass-gold rounded-3xl p-12 md:p-16 border border-[var(--loomina-gold)]/20">
                            <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed text-[var(--text-secondary)] text-center mb-10">
                                &quot;Permettre à chaque personne de <span className="text-gradient-gold">transmettre son histoire</span>,
                                sans que l&apos;écriture ne soit un obstacle.&quot;
                            </blockquote>

                            <div className="space-y-5 text-[var(--text-secondary)] font-serif text-lg max-w-2xl mx-auto">
                                <p>
                                    Nous croyons que <strong className="text-[var(--text-primary)]">chaque vie mérite d&apos;être racontée</strong>. Que vous soyez grand-parent, parent, ou simplement quelqu&apos;un qui a une histoire à partager, Loomina est là pour vous.
                                </p>

                                <p>
                                    Notre technologie n&apos;est qu&un outil au service d&apos;une mission plus grande : <strong className="text-[var(--text-primary)]">préserver la mémoire humaine</strong> et créer des ponts entre les générations.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Valeurs */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24 relative overflow-hidden">

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Ce Qui Nous Guide
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">Nos Valeurs</h2>
                        <p className="text-lg text-[var(--text-secondary)] font-serif max-w-2xl mx-auto">
                            Les principes qui guident chaque décision chez Loomina.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((value, idx) => (
                            <ValueCard key={idx} value={value} index={idx} />
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Vision */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                L&apos;Avenir
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)]">Notre Vision</h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 text-[var(--text-secondary)] font-serif text-lg leading-relaxed"
                    >
                        <p>
                            Dans un monde où tout va vite, où les souvenirs se perdent dans le flux numérique, nous voulons créer quelque chose de <strong className="text-[var(--text-primary)]">tangible et durable</strong>.
                        </p>

                        <p>
                            Nous imaginons un futur où chaque famille possède sa bibliothèque d&apos;histoires personnelles. Où les petits-enfants peuvent découvrir la vie de leurs grands-parents non pas à travers des anecdotes éparses, mais à travers un <strong className="text-[var(--text-primary)]">récit complet et structuré</strong>.
                        </p>

                        <p>
                            Loomina n&apos;est que le début. Nous travaillons déjà sur de nouvelles fonctionnalités : intégration de photos, d&apos;enregistrements audio, création de livres collaboratifs familiaux...
                        </p>

                        <p className="text-[var(--loomina-gold)] font-semibold text-xl">
                            Notre ambition ? Devenir la référence mondiale de la transmission des histoires de vie.
                        </p>
                    </motion.div>
                </div>
            </section>

            <ScrollSeparator />

            {/* L'Équipe */}
            <section className="pt-8 pb-8 px-6 md:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Les Humains
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">L&apos;Équipe</h2>
                        <p className="text-lg text-[var(--text-secondary)] font-serif">
                            Une petite équipe passionnée, dédiée à votre histoire.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="glass-gold rounded-3xl p-12 text-center"
                    >
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] flex items-center justify-center shadow-lg shadow-[var(--loomina-gold)]/20">
                            <svg className="w-16 h-16 text-[var(--loomina-void)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-serif text-[var(--text-primary)] mb-2">Solal Chetrit</h3>
                        <p className="text-sm text-[var(--loomina-gold)] tracking-wider uppercase mb-6 font-semibold">
                            Fondateur
                        </p>
                        <p className="text-[var(--text-secondary)] font-serif leading-relaxed max-w-2xl mx-auto">
                            Diplômé de l&apos;ESCP Business School, passionné par l&apos;IA et la transmission.
                            Solal a créé Loomina pour résoudre un problème personnel qui est devenu une mission universelle.
                        </p>
                    </motion.div>

                    <p className="text-center text-sm text-[var(--text-muted)] mt-12 font-serif italic">
                        Nous collaborons également avec des rédacteurs professionnels, des designers et des imprimeurs de confiance pour garantir la qualité de chaque livre.
                    </p>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative pt-8 pb-20 px-6 md:px-12 lg:px-24 text-center overflow-hidden">

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="heading-section font-serif text-[var(--text-primary)] mb-6">
                        Prêt à Écrire Votre Histoire ?
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)] font-serif mb-10">
                        Rejoignez les familles qui ont choisi Loomina pour préserver leurs souvenirs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/offre" variant="primary" size="lg">
                            Découvrir l&apos;offre
                        </Button>
                        <Button href="/contact" variant="secondary" size="lg">
                            Nous contacter
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
