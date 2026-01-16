'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const CHAPTERS = [
    { id: 1, title: "Enfance", subtitle: "0-12 ans", desc: "Vos premiers souvenirs, l'école, les vacances en famille.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 2, title: "Adolescence", subtitle: "12-18 ans", desc: "Le lycée, les amitiés intenses, les premières libertés.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 3, title: "Premiers Amours", subtitle: "Rencontres", desc: "Les battements de cœur et les leçons sentimentales.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 4, title: "Études & Formation", subtitle: "L'apprentissage", desc: "Vos années d'étudiant, vos mentors, votre voie.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 5, title: "Premiers Emplois", subtitle: "Vie active", desc: "Les débuts professionnels, les défis, les réussites.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 6, title: "Rencontres Marquantes", subtitle: "Influences", desc: "Ces personnes qui ont changé votre destin.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 7, title: "Fondation de la Famille", subtitle: "Le foyer", desc: "Le mariage, l'arrivée des enfants, la construction.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 8, title: "Carrière Professionnelle", subtitle: "L'œuvre", desc: "Vos évolutions, vos fiertés, vos accomplissements.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 9, title: "Voyages & Découvertes", subtitle: "Le monde", desc: "Les lieux visités, les aventures et cultures.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 10, title: "Épreuves & Résilience", subtitle: "Les tempêtes", desc: "Les moments difficiles et comment vous les avez surmontés.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 11, title: "Passions & Hobbies", subtitle: "Jardins secrets", desc: "Ce qui vous fait vibrer au quotidien.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 12, title: "Sagesse & Leçons", subtitle: "Le bilan", desc: "Ce que la vie vous a appris de plus précieux.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 13, title: "Héritage & Transmission", subtitle: "Valeurs", desc: "Ce que vous souhaitez laisser aux vôtres.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" },
    { id: 14, title: "Rêves & Projets", subtitle: "Le futur", desc: "Ce qu'il vous reste à accomplir.", gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" }
];

const PHASES = [
    {
        number: "I",
        title: "L'Initialisation",
        duration: "Semaine 1",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]",
        items: [
            { title: "Premier appel", desc: "Nous faisons connaissance et définissons ensemble le ton de votre récit." },
            { title: "Calibrage", desc: "Loomina apprend votre style, vos préférences narratives et vos priorités." }
        ]
    },
    {
        number: "II",
        title: "Les Conversations",
        duration: "Semaines 2-13",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]",
        items: [
            { title: "14 appels thématiques", desc: "Une thématique par semaine, à votre rythme." },
            { title: "Rédaction en temps réel", desc: "Loomina transforme vos paroles en prose littéraire." },
            { title: "Validation continue", desc: "Vous recevez chaque chapitre pour relecture et ajustements." }
        ]
    },
    {
        number: "III",
        title: "L'Héritage",
        duration: "Semaine 14",
        gradient: "from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]",
        items: [
            { title: "Mise en page premium", desc: "Design typographique soigné, couverture personnalisée." },
            { title: "Livraison", desc: "Votre livre arrive chez vous, prêt à être transmis." }
        ]
    }
];

function ChapterCard({ chapter, index }: { chapter: typeof CHAPTERS[0], index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            className="group relative glass-gold rounded-3xl p-6 hover-lift overflow-hidden border-0 w-72 flex-shrink-0"
        >

            {/* Number */}
            <div className="mb-4">
                <span className={`text-5xl font-serif font-light bg-gradient-to-r ${chapter.gradient} bg-clip-text text-transparent opacity-40 group-hover:opacity-70 transition-opacity`}>
                    {chapter.id.toString().padStart(2, '0')}
                </span>
            </div>

            {/* Content */}
            <h3 className="text-xl font-serif text-[var(--text-primary)] mb-1 group-hover:text-gradient-gold transition-all duration-300">
                {chapter.title}
            </h3>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--loomina-gold)] mb-3 font-semibold opacity-70">
                {chapter.subtitle}
            </p>
            <p className="text-[var(--text-secondary)] text-sm font-serif leading-relaxed">
                {chapter.desc}
            </p>
        </motion.div >
    );
}

function PhaseCard({ phase, index }: { phase: typeof PHASES[0], index: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group relative glass-gold rounded-3xl p-6 hover-lift overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${phase.gradient}`} />

            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-xl font-serif text-[var(--loomina-void)] font-medium">{phase.number}</span>
                </div>
            </div>

            <h3 className="text-xl font-serif text-[var(--text-primary)] text-center mb-1">{phase.title}</h3>
            <p className="text-[10px] text-[var(--loomina-gold)] tracking-[0.2em] uppercase text-center mb-4 font-semibold">
                ~{phase.duration}
            </p>

            <div className="space-y-3">
                {phase.items.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-[var(--loomina-gold)]/30 pl-4">
                        <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">
                            <strong className="text-[var(--text-primary)] font-medium">{item.title}</strong> : {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function ExperiencePage() {
    const heroRef = useRef(null);
    const heroInView = useInView(heroRef, { once: true });

    return (
        <main className="min-h-screen bg-transparent text-[var(--text-primary)]">
            {/* Merged Hero & Phases Section */}
            <section className="relative flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
                <motion.div
                    ref={heroRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-6xl mx-auto text-center mb-8"
                >


                    <h1 className="heading-display font-serif mb-6">
                        Le Voyage de votre Vie
                        <span className="block text-gradient-gold mt-1">en trois étapes</span>
                    </h1>

                    <p className="text-lg text-[var(--text-secondary)] font-serif max-w-2xl mx-auto leading-relaxed">
                        Un processus simple et accompagné pour transformer vos souvenirs en un livre d&apos;exception, de la première écoute à la livraison finale.
                    </p>
                </motion.div>

                {/* Phases Grid */}
                <div className="relative z-10 max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {PHASES.map((phase, idx) => (
                            <PhaseCard key={phase.number} phase={phase} index={idx} />
                        ))}
                    </div>
                </div>

                {/* No scroll indicator inside this section anymore */}
            </section>

            <ScrollSeparator />

            {/* La Carte Narrative */}
            <section className="md:min-h-[600px] flex items-center pt-8 pb-8 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                            <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                                Les Chapitres
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                        </div>
                        <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">La Carte Narrative</h2>
                        <p className="text-[var(--text-secondary)] font-serif text-lg max-w-2xl mx-auto">
                            14 thématiques pour capturer l&apos;essence de votre vie
                        </p>
                    </div>

                    {/* Horizontal scroll */}
                    <div className="relative">
                        <div className="overflow-x-auto scrollbar-hide pb-8 -mx-6 px-6">
                            <div className="flex gap-6" style={{ width: 'max-content' }}>
                                {CHAPTERS.map((chapter, idx) => (
                                    <ChapterCard key={chapter.id} chapter={chapter} index={idx} />
                                ))}
                            </div>
                        </div>

                        {/* Scroll hint */}
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <div className="h-px w-8 bg-[var(--loomina-gold)]/30" />
                            <p className="text-xs text-[var(--text-muted)] tracking-wider uppercase">
                                Défilez horizontalement
                            </p>
                            <div className="h-px w-8 bg-[var(--loomina-gold)]/30" />
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <ScrollSeparator />

            {/* Memory Engine */}
            <section className="md:min-h-[600px] flex items-center pt-8 pb-16 px-6 md:px-12 lg:px-24 relative overflow-hidden">

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div>
                                <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase block mb-4">
                                    Technologie
                                </span>
                                <h2 className="heading-section font-serif">
                                    <span className="text-gradient-gold">Memory Engine.</span>
                                    <span className="block text-[var(--text-primary)] mt-2">L&apos;IA qui n&apos;oublie rien.</span>
                                </h2>
                            </div>

                            <p className="text-[var(--text-secondary)] text-lg font-serif leading-relaxed">
                                Notre technologie contextuelle analyse et relie vos souvenirs entre eux.
                                Si vous parlez de votre grand-mère au chapitre 1, Loomina saura faire le lien
                                quand vous évoquerez sa cuisine au chapitre 7.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 rounded-lg glass text-xs text-[var(--loomina-gold)] font-mono">
                                    PROCESSING_CONTEXT
                                </div>
                                <div className="px-4 py-2 rounded-lg glass text-xs text-[var(--loomina-gold-dark)] font-mono">
                                    LINKING_NODES
                                </div>
                                <div className="px-4 py-2 rounded-lg glass text-xs text-[var(--loomina-ember)] font-mono">
                                    MEMORY_GRAPH
                                </div>
                            </div>
                        </motion.div>

                        {/* Visual representation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex justify-center"
                        >
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                {/* Simplified visual */}
                                <div className="absolute inset-0 rounded-full border border-[var(--loomina-gold)]/20" />
                                <div className="w-4 h-4 rounded-full bg-[var(--loomina-gold)] shadow-lg shadow-[var(--loomina-gold)]/20" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="relative pt-8 pb-20 px-6 md:px-12 lg:px-24 text-center overflow-hidden">

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="heading-section font-serif text-[var(--text-primary)] mb-6">
                        Votre histoire commence aujourd&apos;hui.
                    </h2>
                    <Button href="/order" variant="primary" size="lg">
                        Commencer mon histoire
                    </Button>
                </div>
            </section>
        </main>
    );
}
