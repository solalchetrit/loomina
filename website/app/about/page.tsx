'use client';

import React from 'react';
import Link from 'next/link';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const VALUES = [
    {
        icon: "❤️",
        title: "Authenticité",
        desc: "Nous capturons votre voix unique, sans filtre ni artifice. Votre histoire, telle que vous la racontez."
    },
    {
        icon: "🤝",
        title: "Bienveillance",
        desc: "Chaque conversation est un moment d'écoute attentive et respectueuse de votre rythme."
    },
    {
        icon: "🌳",
        title: "Transmission",
        desc: "Nous croyons que chaque vie mérite d'être racontée et transmise aux générations futures."
    },
    {
        icon: "✨",
        title: "Excellence",
        desc: "De la technologie à l'impression, nous ne faisons aucun compromis sur la qualité."
    }
];

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative py-32 px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center mb-12">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            À Propos
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-serif mb-10 leading-[1.1] tracking-tight">
                        L'Histoire de
                        <span className="block text-[var(--loomina-gold)] mt-2">Loomina</span>
                    </h1>

                    <p className="text-xl text-[#666] font-serif max-w-3xl mx-auto leading-relaxed">
                        Née d'un besoin personnel, Loomina est devenue une mission :
                        <br className="hidden md:block" />
                        permettre à chacun de transmettre son histoire.
                    </p>
                </div>
            </section>

            <ScrollSeparator />

            {/* L'Histoire du Fondateur */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image placeholder - à remplacer par une vraie photo */}
                        <div className="relative">
                            <div className="aspect-[4/5] bg-gradient-to-br from-[var(--loomina-gold)]/10 to-[var(--loomina-amber)]/5 rounded-2xl border-2 border-[var(--loomina-gold)]/20 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">👤</div>
                                    <p className="text-sm text-[#888] font-serif">Photo de Solal Chetrit</p>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--loomina-gold)]/5 rounded-full blur-2xl -z-10"></div>
                        </div>

                        {/* Texte */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-4xl font-serif mb-4 tracking-tight">Tout a Commencé avec ma Grand-Mère</h2>
                                <div className="w-16 h-px bg-[var(--loomina-gold)] mb-6"></div>
                            </div>

                            <div className="space-y-4 text-[#666] font-serif leading-relaxed">
                                <p>
                                    Je m'appelle <strong className="text-black">Solal Chetrit</strong>, j'ai 22 ans et je suis fraîchement diplômé de l'ESCP Business School.
                                </p>

                                <p>
                                    Il y a deux ans, ma grand-mère a eu des soucis de santé. Face à cette épreuve, j'ai réalisé quelque chose : <strong className="text-black">sa vie était passionnante</strong>, remplie d'histoires que je ne connaissais qu'en partie.
                                </p>

                                <p>
                                    Nous voulions qu'elle écrive son livre, mais c'était trop compliqué pour elle. Écrire demande du temps, de l'énergie, et une certaine aisance avec les mots. Elle avait tant à raconter, mais pas les moyens de le faire.
                                </p>

                                <p>
                                    C'est là que l'idée de Loomina est née. <strong className="text-black">Et si on pouvait simplement parler ?</strong> Si la technologie pouvait transformer nos conversations en un vrai livre, sans effort ?
                                </p>

                                <p>
                                    J'ai développé Loomina, je l'ai testée avec ma grand-mère, et le résultat a dépassé toutes mes espérances. Aujourd'hui, son livre trône dans notre salon, et c'est devenu notre trésor familial.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Mission */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Notre Mission</h2>
                    <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto mb-12"></div>

                    <div className="bg-gradient-to-b from-white to-[#fafafa] border-2 border-[var(--loomina-gold)]/20 rounded-3xl p-12 md:p-16">
                        <p className="text-2xl md:text-3xl font-serif leading-relaxed text-[#666] mb-8">
                            "Permettre à chaque personne de <span className="text-[var(--loomina-gold)]">transmettre son histoire</span>,
                            sans que l'écriture ne soit un obstacle."
                        </p>

                        <div className="space-y-4 text-left max-w-2xl mx-auto text-[#666] font-serif">
                            <p>
                                Nous croyons que <strong className="text-black">chaque vie mérite d'être racontée</strong>. Que vous soyez grand-parent, parent, ou simplement quelqu'un qui a une histoire à partager, Loomina est là pour vous.
                            </p>

                            <p>
                                Notre technologie n'est qu'un outil au service d'une mission plus grande : <strong className="text-black">préserver la mémoire humaine</strong> et créer des ponts entre les générations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Valeurs */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Nos Valeurs</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto mb-6"></div>
                        <p className="text-lg text-[#888] font-serif max-w-2xl mx-auto">
                            Les principes qui guident chaque décision chez Loomina.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((value, idx) => (
                            <div key={idx} className="text-center p-8 bg-gradient-to-b from-white to-[#fafafa] border border-gray-200/60 rounded-2xl hover:border-[var(--loomina-gold)]/40 hover:shadow-xl transition-all duration-500">
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-serif mb-3 tracking-tight">{value.title}</h3>
                                <p className="text-sm text-[#666] font-serif leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Vision */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Notre Vision</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto"></div>
                    </div>

                    <div className="space-y-8 text-[#666] font-serif leading-relaxed text-lg">
                        <p>
                            Dans un monde où tout va vite, où les souvenirs se perdent dans le flux numérique, nous voulons créer quelque chose de <strong className="text-black">tangible et durable</strong>.
                        </p>

                        <p>
                            Nous imaginons un futur où chaque famille possède sa bibliothèque d'histoires personnelles. Où les petits-enfants peuvent découvrir la vie de leurs grands-parents non pas à travers des anecdotes éparses, mais à travers un <strong className="text-black">récit complet et structuré</strong>.
                        </p>

                        <p>
                            Loomina n'est que le début. Nous travaillons déjà sur de nouvelles fonctionnalités : intégration de photos, d'enregistrements audio, création de livres collaboratifs familiaux...
                        </p>

                        <p className="text-[var(--loomina-gold)] font-semibold">
                            Notre ambition ? Devenir la référence mondiale de la transmission des histoires de vie.
                        </p>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* L'Équipe */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">L'Équipe</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto mb-6"></div>
                        <p className="text-lg text-[#888] font-serif">
                            Une petite équipe passionnée, dédiée à votre histoire.
                        </p>
                    </div>

                    <div className="bg-gradient-to-b from-white to-[#fafafa] border border-gray-200/60 rounded-2xl p-12 text-center">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[var(--loomina-gold)]/10 border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                            <span className="text-5xl">👨‍💼</span>
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Solal Chetrit</h3>
                        <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-wider uppercase mb-4">
                            Fondateur
                        </p>
                        <p className="text-[#666] font-serif leading-relaxed max-w-2xl mx-auto">
                            Diplômé de l'ESCP Business School, passionné par l'IA et la transmission.
                            Solal a créé Loomina pour résoudre un problème personnel qui est devenu une mission universelle.
                        </p>
                    </div>

                    <p className="text-center text-sm text-[#888] mt-12 font-serif italic">
                        Nous collaborons également avec des rédacteurs professionnels, des designers et des imprimeurs de confiance pour garantir la qualité de chaque livre.
                    </p>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white text-center border-t border-gray-100">
                <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Prêt à Écrire Votre Histoire ?</h2>
                <p className="text-lg text-[#888] font-serif mb-10 max-w-2xl mx-auto">
                    Rejoignez les familles qui ont choisi Loomina pour préserver leurs souvenirs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button href="/offre" variant="primary" size="lg">
                        Découvrir l'offre
                    </Button>
                    <Button href="/contact" variant="secondary" size="lg">
                        Nous contacter
                    </Button>
                </div>
            </section>
        </main>
    );
}
