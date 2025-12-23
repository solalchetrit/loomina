'use client';

import React from 'react';
import Link from 'next/link';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const OFFER_FEATURES = [
    {
        icon: "📞",
        title: "Entretiens illimités",
        desc: "Autant d'appels que nécessaire pour capturer l'intégralité de votre histoire, à votre rythme."
    },
    {
        icon: "✍️",
        title: "Rédaction littéraire",
        desc: "Notre IA transforme vos paroles en prose élégante, relue et corrigée par des professionnels."
    },
    {
        icon: "📸",
        title: "Intégration de photos",
        desc: "Illustrez votre récit avec vos propres images, souvenirs visuels de votre vie."
    },
    {
        icon: "📖",
        title: "Impression premium",
        desc: "Livre relié de haute qualité, papier ivoire, couverture personnalisée."
    },
    {
        icon: "💾",
        title: "Version numérique",
        desc: "Ebook privé inclus pour partager facilement avec votre famille."
    },
    {
        icon: "🚚",
        title: "Livraison incluse",
        desc: "Réception à domicile, emballage soigné, prêt à offrir ou à conserver."
    }
];

const FAQ_ITEMS = [
    {
        q: "Combien de temps dure le processus ?",
        a: "En moyenne 14 semaines, mais nous nous adaptons totalement à votre rythme. Certains clients préfèrent avancer rapidement, d'autres prennent leur temps."
    },
    {
        q: "Que se passe-t-il si je veux modifier quelque chose ?",
        a: "Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu'à votre satisfaction complète."
    },
    {
        q: "Combien de pages fait le livre final ?",
        a: "Cela dépend de votre histoire ! En moyenne, nos livres font entre 150 et 250 pages. Nous nous adaptons à la richesse de votre récit."
    },
    {
        q: "Puis-je offrir Loomina en cadeau ?",
        a: "Absolument ! C'est même l'un des cadeaux les plus appréciés. Nous fournissons un bon cadeau élégant à offrir."
    },
    {
        q: "Mes données sont-elles sécurisées ?",
        a: "Totalement. Vos enregistrements et textes sont chiffrés, stockés en Europe, et jamais partagés. Vous pouvez demander leur suppression à tout moment."
    },
    {
        q: "Y a-t-il une garantie ?",
        a: "Oui. Si après le premier appel vous n'êtes pas satisfait, nous vous remboursons intégralement, sans question."
    }
];

const TESTIMONIALS = [
    {
        name: "Marie L.",
        age: "68 ans",
        text: "J'ai toujours voulu écrire mes mémoires mais je ne savais pas par où commencer. Loomina a rendu cela si simple et naturel. Le livre est magnifique, mes petits-enfants l'adorent.",
        rating: 5
    },
    {
        name: "Jean-Pierre D.",
        age: "75 ans",
        text: "Un cadeau que ma fille m'a offert. Au début j'étais sceptique, mais les conversations étaient passionnantes. C'est devenu un moment que j'attendais chaque semaine.",
        rating: 5
    },
    {
        name: "Sophie M.",
        age: "45 ans (pour sa mère)",
        text: "Le plus beau cadeau que j'ai pu faire à ma mère. Elle a adoré raconter sa vie, et maintenant nous avons un trésor familial pour toujours.",
        rating: 5
    }
];

export default function OffrePage() {
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative pt-24 pb-8 px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-center bg-white">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            L'Offre
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-[1.1] tracking-tight">
                        Votre Livre de Vie,
                        <span className="block text-[var(--loomina-gold)] mt-2">Clé en Main</span>
                    </h1>

                    <p className="text-lg text-[#666] font-serif max-w-3xl mx-auto leading-relaxed mb-8">
                        Un service tout compris pour transformer vos souvenirs en héritage littéraire.
                        <br className="hidden md:block" />
                        De la première conversation à la livraison de votre livre.
                    </p>

                    {/* Prix et CTA */}
                    <div className="bg-white border-2 border-[var(--loomina-gold)]/20 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
                        <div className="mb-4">
                            <span className="text-sm text-[#888] uppercase tracking-wider font-[family-name:var(--font-cinzel)]">Prix de lancement</span>
                            <div className="text-6xl md:text-7xl font-serif text-[var(--loomina-gold)] my-3">
                                219€
                            </div>
                            <p className="text-sm text-[#888]">Paiement unique • Tout inclus • Sans surprise</p>
                        </div>

                        <Button href="/order" variant="primary" size="lg" fullWidth>
                            Commencer mon livre
                        </Button>
                        <p className="text-xs text-[#888] mt-3">Garantie satisfait ou remboursé • Paiement sécurisé</p>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Ce qui est inclus */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fafafa]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">Tout est Inclus</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto mb-6"></div>
                        <p className="text-lg text-[#888] font-serif max-w-2xl mx-auto">
                            Un service complet, sans frais cachés, pour une expérience sereine.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {OFFER_FEATURES.map((feature, idx) => (
                            <div key={idx} className="group p-8 bg-gradient-to-b from-white to-[#fafafa] border border-gray-200/60 rounded-2xl hover:border-[var(--loomina-gold)]/40 hover:shadow-xl transition-all duration-500">
                                <div className="text-5xl mb-4 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-serif mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-[#666] font-serif leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Timeline du processus */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">Le Processus</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto mb-6"></div>
                        <p className="text-lg text-[#888] font-serif max-w-2xl mx-auto">
                            Un parcours en 3 étapes, simple et accompagné.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Étape 1 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--loomina-gold)]/10 border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                <span className="text-2xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">1</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif mb-2">Initialisation</h3>
                                <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-wider uppercase mb-3">~Semaine 1</p>
                                <p className="text-[#666] font-serif leading-relaxed">
                                    Premier appel pour faire connaissance et définir ensemble le ton de votre récit. Nous calibrons Loomina selon votre style et vos priorités.
                                </p>
                            </div>
                        </div>

                        {/* Étape 2 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--loomina-gold)]/10 border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                <span className="text-2xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">2</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif mb-2">Les Conversations</h3>
                                <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-wider uppercase mb-3">~Semaines 2-13</p>
                                <p className="text-[#666] font-serif leading-relaxed">
                                    14 appels thématiques pour explorer votre vie. Loomina rédige en temps réel, vous validez chaque chapitre avant de passer au suivant.
                                </p>
                            </div>
                        </div>

                        {/* Étape 3 */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[var(--loomina-gold)]/10 border-2 border-[var(--loomina-gold)]/30 flex items-center justify-center">
                                <span className="text-2xl font-[family-name:var(--font-cinzel)] text-[var(--loomina-gold)]">3</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif mb-2">L'Héritage</h3>
                                <p className="text-sm text-[var(--loomina-gold)] font-[family-name:var(--font-cinzel)] tracking-wider uppercase mb-3">~Semaine 14</p>
                                <p className="text-[#666] font-serif leading-relaxed">
                                    Mise en page premium, impression haut de gamme et livraison à domicile. Votre livre arrive chez vous, prêt à être transmis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* Témoignages */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fafafa]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">Ils Nous Font Confiance</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((testimonial, idx) => (
                            <div key={idx} className="p-8 bg-gradient-to-b from-white to-[#fafafa] border border-gray-200/60 rounded-2xl">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-[var(--loomina-gold)] text-lg">★</span>
                                    ))}
                                </div>
                                <p className="text-[#666] font-serif leading-relaxed mb-6 italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="font-semibold text-sm">{testimonial.name}</p>
                                    <p className="text-xs text-[#888]">{testimonial.age}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <ScrollSeparator />

            {/* FAQ */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">Questions Fréquentes</h2>
                        <div className="w-20 h-px bg-[var(--loomina-gold)] mx-auto"></div>
                    </div>

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div key={idx} className="border border-gray-200/60 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                    className="w-full p-6 text-left flex justify-between items-center hover:bg-[#fafafa] transition-colors"
                                >
                                    <span className="font-serif text-lg pr-4">{item.q}</span>
                                    <span className="text-[var(--loomina-gold)] text-2xl flex-shrink-0">
                                        {openFaqIndex === idx ? '−' : '+'}
                                    </span>
                                </button>
                                {openFaqIndex === idx && (
                                    <div className="px-6 pb-6">
                                        <p className="text-[#666] font-serif leading-relaxed">{item.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white text-center border-t border-gray-100">
                <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Prêt à Commencer ?</h2>
                <p className="text-lg text-[#888] font-serif mb-10 max-w-2xl mx-auto">
                    Rejoignez les familles qui ont déjà choisi Loomina pour préserver leurs histoires.
                </p>
                <Button href="/order" variant="primary" size="lg">
                    Commander mon livre
                </Button>
            </section>
        </main>
    );
}
