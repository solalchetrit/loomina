'use client';

import React from 'react';
import Link from 'next/link';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';



const CHAPTERS = [
    { "id": 1, "title": "Enfance", "subtitle": "0-12 ans", "icon": "🧸", "desc": "Vos premiers souvenirs, l'école, les vacances en famille." },
    { "id": 2, "title": "Adolescence", "subtitle": "12-18 ans", "icon": "🎒", "desc": "Le lycée, les amitiés intenses, les premières libertés." },
    { "id": 3, "title": "Premiers Amours", "subtitle": "Rencontres", "icon": "💕", "desc": "Les battements de cœur et les leçons sentimentales." },
    { "id": 4, "title": "Études & Formation", "subtitle": "L'apprentissage", "icon": "🎓", "desc": "Vos années d'étudiant, vos mentors, votre voie." },
    { "id": 5, "title": "Premiers Emplois", "subtitle": "Vie active", "icon": "💼", "desc": "Les débuts professionnels, les défis, les réussites." },
    { "id": 6, "title": "Rencontres Marquantes", "subtitle": "Influences", "icon": "🤝", "desc": "Ces personnes qui ont changé votre destin." },
    { "id": 7, "title": "Fondation de la Famille", "subtitle": "Le foyer", "icon": "👨‍👩‍👧‍👦", "desc": "Le mariage, l'arrivée des enfants, la construction." },
    { "id": 8, "title": "Carrière Professionnelle", "subtitle": "L'œuvre", "icon": "🏢", "desc": "Vos évolutions, vos fiertés, vos accomplissements." },
    { "id": 9, "title": "Voyages & Découvertes", "subtitle": "Le monde", "icon": "✈️", "desc": "Les lieux visités, les aventures et cultures." },
    { "id": 10, "title": "Épreuves & Résilience", "subtitle": "Les tempêtes", "icon": "💪", "desc": "Les moments difficiles et comment vous les avez surmontés." },
    { "id": 11, "title": "Passions & Hobbies", "subtitle": "Jardins secrets", "icon": "🎨", "desc": "Ce qui vous fait vibrer au quotidien." },
    { "id": 12, "title": "Sagesse & Leçons", "subtitle": "Le bilan", "icon": "🧠", "desc": "Ce que la vie vous a appris de plus précieux." },
    { "id": 13, "title": "Héritage & Transmission", "subtitle": "Valeurs", "icon": "🌳", "desc": "Ce que vous souhaitez laisser aux vôtres." },
    { "id": 14, "title": "Rêves & Projets", "subtitle": "Le futur", "icon": "🌟", "desc": "Ce qu'il vous reste à accomplir." }
];

export default function ExperiencePage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* A. Hero Section - Premium */}
            <section className="relative pt-24 pb-16 px-6 md:px-12 lg:px-24 min-h-[85vh] flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Decorative top element */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            L'Expérience
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-[1.1] text-center tracking-tight">
                        Le Voyage de
                        <span className="block text-[var(--loomina-gold)] mt-2">votre Vie</span>
                    </h1>

                    <p className="text-lg text-[#666] font-serif max-w-2xl mx-auto leading-relaxed">
                        De la première conversation à votre livre entre les mains,
                        <br className="hidden md:block" />
                        découvrez comment Loomina transforme vos souvenirs en héritage littéraire.
                    </p>
                </div>
            </section>

            <ScrollSeparator />

            {/* B. Timeline - Compact */}
            <section className="pt-16 pb-12 px-6 md:px-12 lg:px-24 bg-white min-h-[85vh] flex items-center">
                <div className="max-w-6xl mx-auto w-full">
                    {/* Section Title */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">Les 3 Étapes</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line for desktop */}
                        <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--loomina-gold)]/20 to-transparent z-0"></div>

                        {/* Phase 1 - L'Initialisation */}
                        <div className="relative z-10 bg-white rounded-2xl p-6 border border-gray-200/60 hover:border-[var(--loomina-gold)]/40 hover:shadow-xl transition-all duration-500">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                    <span className="text-3xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">I</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-serif mb-2 text-center tracking-tight">L'Initialisation</h3>
                            <p className="text-xs text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-[0.2em] uppercase text-center mb-4 opacity-80">
                                ~Semaine 1
                            </p>

                            <div className="space-y-4">
                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Premier appel</strong> : Nous faisons connaissance et définissons ensemble le ton de votre récit.
                                    </p>
                                </div>

                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Calibrage</strong> : Loomina apprend votre style, vos préférences narratives et vos priorités.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phase 2 - Les Conversations */}
                        <div className="relative z-10 bg-white rounded-2xl p-8 border border-gray-200/60 hover:border-[var(--loomina-gold)]/40 hover:shadow-xl transition-all duration-500">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                    <span className="text-3xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">II</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-serif mb-2 text-center tracking-tight">Les Conversations</h3>
                            <p className="text-xs text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-[0.2em] uppercase text-center mb-6 opacity-80">
                                ~Semaines 2-13
                            </p>

                            <div className="space-y-4">
                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">14 appels thématiques</strong> : Une thématique par semaine, à votre rythme.
                                    </p>
                                </div>

                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Rédaction en temps réel</strong> : Loomina transforme vos paroles en prose littéraire.
                                    </p>
                                </div>

                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Validation continue</strong> : Vous recevez chaque chapitre pour relecture et ajustements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Phase 3 - L'Héritage */}
                        <div className="relative z-10 bg-white rounded-2xl p-8 border border-gray-200/60 hover:border-[var(--loomina-gold)]/40 hover:shadow-xl transition-all duration-500">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--loomina-gold)]/10 to-transparent border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                    <span className="text-3xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">III</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-serif mb-2 text-center tracking-tight">L'Héritage</h3>
                            <p className="text-xs text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-[0.2em] uppercase text-center mb-6 opacity-80">
                                ~Semaine 13-14
                            </p>

                            <div className="space-y-4">
                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Mise en page premium</strong> : Design typographique soigné, couverture personnalisée.
                                    </p>
                                </div>

                                <div className="border-l-2 border-[var(--loomina-gold)]/20 pl-4">
                                    <p className="text-sm text-[#555] font-serif leading-relaxed">
                                        <strong className="text-black font-semibold">Livraison</strong> : Votre livre arrive chez vous, prêt à être transmis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* C. Carte Narrative - Premium Carousel */}
            <section className="pt-16 pb-12 px-6 md:px-12 lg:px-24 bg-white min-h-[85vh] flex flex-col justify-center">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">La Carte Narrative</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[var(--loomina-amber)] to-[var(--loomina-gold)] mx-auto rounded-full"></div>
                        <p className="mt-8 text-base text-[#888888] font-serif max-w-2xl mx-auto leading-relaxed">
                            14 thématiques pour capturer l'essence de votre vie
                        </p>
                    </div>

                    {/* Premium horizontal scroll */}
                    <div className="relative">
                        <div className="overflow-x-auto scrollbar-hide pb-8">
                            <div className="flex gap-6 px-4" style={{ width: 'max-content' }}>
                                {CHAPTERS.map((chapter) => (
                                    <div
                                        key={chapter.id}
                                        className="group relative bg-white border border-gray-200/60 rounded-2xl p-8 hover:border-[var(--loomina-gold)]/40 hover:shadow-2xl transition-all duration-500 w-80 flex-shrink-0"
                                        style={{
                                            background: 'linear-gradient(to bottom, #ffffff, #fafafa)'
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className="absolute top-6 right-6 text-3xl opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300">
                                            {chapter.icon}
                                        </div>

                                        {/* Number */}
                                        <div className="mb-6">
                                            <span className="text-6xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]/20 group-hover:text-[var(--loomina-gold)]/40 transition-colors">
                                                {chapter.id.toString().padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-2xl font-serif mb-2 group-hover:text-[var(--loomina-gold)] transition-colors leading-tight">
                                            {chapter.title}
                                        </h3>
                                        <p className="text-xs uppercase tracking-[0.15em] text-[var(--loomina-gold)] mb-4 font-[family-name:var(--font-cinzel)] opacity-70">
                                            {chapter.subtitle}
                                        </p>
                                        <p className="text-[#666] leading-relaxed font-serif text-sm">
                                            {chapter.desc}
                                        </p>

                                        {/* Bottom accent */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--loomina-gold)]/0 to-transparent group-hover:via-[var(--loomina-gold)]/30 transition-all duration-500 rounded-b-2xl"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <div className="h-px w-8 bg-[var(--loomina-gold)]/30"></div>
                            <p className="text-xs text-[#888888] font-[family-name:var(--font-cinzel)] tracking-wider uppercase">
                                Défilez horizontalement
                            </p>
                            <div className="h-px w-8 bg-[var(--loomina-gold)]/30"></div>
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

            {/* D. Memory Engine + CTA - Unified Section */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white overflow-hidden relative">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--loomina-gold)] opacity-[0.02] blur-[150px] rounded-full pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Memory Engine Content */}
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight">
                                <span className="block text-[var(--loomina-gold)]">
                                    Memory Engine.
                                </span>
                                <span className="text-[#1a1a1a]">L'IA qui n'oublie rien.</span>
                            </h2>
                            <p className="text-[#666] text-base leading-relaxed font-serif">
                                Notre technologie contextuelle analyse et relie vos souvenirs entre eux.
                                Si vous parlez de votre grand-mère au chapitre 1, Loomina saura faire le lien
                                quand vous évoquerez sa cuisine au chapitre 7.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="px-4 py-2 rounded border border-[var(--loomina-gold)]/20 bg-[var(--loomina-gold)]/5 font-[family-name:var(--font-courier)] text-xs text-[var(--loomina-gold)]">
                                    PROCESSING_CONTEXT
                                </div>
                                <div className="px-4 py-2 rounded border border-[var(--loomina-gold)]/20 bg-[var(--loomina-gold)]/5 font-[family-name:var(--font-courier)] text-xs text-[var(--loomina-gold)]">
                                    LINKING_NODES
                                </div>
                            </div>
                        </div>

                        {/* Visual Abstract Representation */}
                        <div className="flex-1 w-full flex justify-center">
                            <div className="relative w-56 h-56 border border-[var(--loomina-gold)]/20 rounded-full flex items-center justify-center animate-[spin_60s_linear_infinite]">
                                <div className="absolute w-40 h-40 border border-[var(--loomina-gold)]/40 rounded-full flex items-center justify-center border-dashed"></div>
                                <div className="absolute w-28 h-28 bg-[var(--loomina-gold)]/10 rounded-full blur-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-12 border-t border-gray-100">
                        <h2 className="text-4xl md:text-5xl font-serif mb-10 tracking-tight">Votre histoire commence aujourd'hui.</h2>
                        <Button href="/order" variant="primary" size="lg">
                            Commencer mon histoire
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
