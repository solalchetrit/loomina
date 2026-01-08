'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const FAQ_CATEGORIES = [
    {
        category: "Le Service Loomina",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
        ),
        questions: [
            {
                q: "Comment fonctionne Loomina concrètement ?",
                a: "C'est simple : vous nous appelez et vous racontez votre vie. Notre IA biographe vous guide avec des questions pertinentes, transforme vos paroles en texte littéraire de qualité, et vous validez chaque chapitre. À la fin, vous recevez un magnifique livre relié chez vous."
            },
            {
                q: "Combien de temps faut-il pour créer mon livre ?",
                a: "Comptez en moyenne 14 semaines, mais nous nous adaptons entièrement à votre rythme. Certains avancent rapidement en 8 semaines, d'autres préfèrent prendre leur temps sur 6 mois. Aucune pression — votre confort est notre priorité."
            },
            {
                q: "Combien d'appels téléphoniques sont prévus ?",
                a: "Nous recommandons 14 conversations thématiques — une par chapitre de votre vie. Mais c'est totalement flexible : si un sujet vous passionne, on prend le temps. Les appels sont illimités et inclus dans le prix."
            },
            {
                q: "Quelle est la durée moyenne d'un appel ?",
                a: "Entre 30 minutes et 1 heure généralement. Parfois 20 minutes pour un sujet court, parfois 1h30 quand les souvenirs affluent. Vous décidez quand vous souhaitez vous arrêter — c'est vous le narrateur."
            }
        ]
    },
    {
        category: "Votre Livre",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        questions: [
            {
                q: "Combien de pages fera mon livre ?",
                a: "Cela dépend de la richesse de votre histoire ! Nos livres font généralement entre 150 et 250 pages. Pas de limite minimum ni maximum — nous nous adaptons à votre récit."
            },
            {
                q: "Puis-je intégrer mes photos personnelles ?",
                a: "Absolument ! Envoyez-nous vos photos numériques et nous les intégrons harmonieusement dans votre livre. Photos de famille, lieux de votre passé, moments marquants — tout ce qui illustre votre histoire."
            },
            {
                q: "Quel est le format et la qualité du livre ?",
                a: "Format élégant 15×23 cm, couverture rigide personnalisée, papier ivoire 90g de qualité archive, reliure cousue artisanale. Un objet précieux conçu pour traverser les générations."
            },
            {
                q: "Puis-je relire et corriger avant impression ?",
                a: "C'est même obligatoire ! Vous validez chaque chapitre avant de passer au suivant. Modifications illimitées jusqu'à votre entière satisfaction. C'est VOTRE histoire — vous avez le dernier mot."
            },
            {
                q: "Aurais-je aussi une version numérique ?",
                a: "Oui, vous recevez automatiquement un ebook (PDF et EPUB) en plus de votre livre physique. Parfait pour partager avec la famille, même à l'autre bout du monde."
            }
        ]
    },
    {
        category: "Tarifs & Paiement",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M8 10h8M8 14h8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        questions: [
            {
                q: "Quel est le prix de Loomina ?",
                a: "219€ tout compris. Ce prix unique inclut : appels illimités, rédaction professionnelle, corrections, intégration de vos photos, mise en page éditoriale, impression premium, version numérique et livraison. Aucun supplément."
            },
            {
                q: "Y a-t-il des frais cachés ?",
                a: "Absolument aucun. Les 219€ couvrent l'intégralité du service, du premier appel à la livraison de votre livre entre vos mains. Zéro surprise."
            },
            {
                q: "Puis-je payer en plusieurs fois ?",
                a: "Pour le moment, nous acceptons le paiement unique par carte bancaire via Stripe (100% sécurisé). Le paiement en plusieurs fois sera bientôt disponible."
            },
            {
                q: "Y a-t-il une garantie de satisfaction ?",
                a: "Oui ! Si après votre premier appel vous n'êtes pas convaincu, nous vous remboursons intégralement, sans question ni justification. Zéro risque pour vous."
            }
        ]
    },
    {
        category: "Confidentialité & Sécurité",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        questions: [
            {
                q: "Mes données personnelles sont-elles protégées ?",
                a: "Totalement. Vos enregistrements et textes sont chiffrés (AES-256), stockés sur des serveurs sécurisés en Europe (conformité RGPD). Jamais partagés avec des tiers."
            },
            {
                q: "Qui peut accéder à mon histoire ?",
                a: "Uniquement vous et notre équipe technique (pour la rédaction). Tous nos collaborateurs signent des accords de confidentialité stricts. Votre histoire reste absolument privée."
            },
            {
                q: "Que deviennent mes données après livraison ?",
                a: "Nous conservons vos données 1 an après livraison (pour d'éventuelles modifications ou réimpressions). Après ce délai, suppression automatique — sauf demande contraire de votre part."
            }
        ]
    },
    {
        category: "Cadeau & Livraison",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
        ),
        questions: [
            {
                q: "Puis-je offrir Loomina en cadeau ?",
                a: "C'est l'un des cadeaux les plus touchants qui soient ! Après commande, vous recevez un élégant bon cadeau (PDF imprimable) à offrir. La personne nous contacte ensuite pour démarrer son livre à son rythme."
            },
            {
                q: "Quel est le délai de livraison ?",
                a: "Une fois votre livre validé, comptez 2-3 semaines pour l'impression artisanale et la livraison en France métropolitaine. Expédition soignée via Colissimo avec suivi."
            },
            {
                q: "Livrez-vous hors de France ?",
                a: "Oui ! Nous livrons en France métropolitaine (inclus) et dans toute l'Europe (frais selon pays). Pour les autres destinations, contactez-nous."
            },
            {
                q: "Puis-je commander plusieurs exemplaires ?",
                a: "Bien sûr ! Après réception de votre livre, commandez des exemplaires supplémentaires à tarif préférentiel. Idéal pour offrir à chaque branche de la famille."
            }
        ]
    },
    {
        category: "Questions Techniques",
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        questions: [
            {
                q: "Ai-je besoin d'un smartphone ou ordinateur ?",
                a: "Non ! Tout fonctionne par téléphone fixe ou mobile. C'est nous qui vous appelons aux horaires convenus. Pour les photos, un simple email suffit (on peut vous aider par téléphone si besoin)."
            },
            {
                q: "Que se passe-t-il si je manque un appel ?",
                a: "Aucun problème ! On reprogramme simplement à un moment qui vous arrange. Pas de pénalité, pas de stress — votre emploi du temps prime."
            },
            {
                q: "L'IA remplace-t-elle un vrai biographe humain ?",
                a: "Notre IA est un outil puissant, mais vous restez au cœur du processus. C'est VOUS qui racontez, et des rédacteurs humains relisent chaque chapitre. Le meilleur des deux mondes : technologie + sensibilité humaine."
            }
        ]
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = React.useState<string | null>(null);

    const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === key ? null : key);
    };

    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white via-white to-[#fefdfb]">
                {/* Background decoration */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--loomina-gold)]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    className="max-w-4xl mx-auto text-center relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-center mb-12">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            Support
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif mb-10 leading-[1.1] tracking-tight">
                        Questions
                        <span className="block text-[var(--loomina-gold)] mt-2 italic">Fréquentes</span>
                    </h1>

                    <p className="text-xl text-[#555] font-serif max-w-3xl mx-auto leading-relaxed">
                        Tout ce que vous devez savoir sur Loomina, expliqué simplement.
                        <br className="hidden md:block" />
                        Une question qui n'est pas listée ? <Link href="/contact" className="text-[var(--loomina-gold)] hover:underline underline-offset-4 transition-colors">Contactez-nous directement</Link>.
                    </p>
                </motion.div>
            </section>

            <ScrollSeparator />

            {/* FAQ Content */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto space-y-16">
                    {FAQ_CATEGORIES.map((category, catIndex) => (
                        <motion.div
                            key={catIndex}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                        >
                            {/* Category Title */}
                            <div className="mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--loomina-gold)]/10 to-[var(--loomina-amber)]/5 flex items-center justify-center text-[var(--loomina-gold)]">
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif tracking-tight">{category.category}</h2>
                                    <div className="w-12 h-0.5 bg-[var(--loomina-gold)]/30 mt-2 rounded-full"></div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-3">
                                {category.questions.map((item, qIndex) => {
                                    const key = `${catIndex}-${qIndex}`;
                                    const isOpen = openIndex === key;

                                    return (
                                        <div
                                            key={qIndex}
                                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen
                                                    ? 'border-[var(--loomina-gold)]/40 shadow-lg shadow-[var(--loomina-gold)]/5 bg-gradient-to-b from-white to-[#fefdfb]'
                                                    : 'border-gray-200/60 bg-white hover:border-[var(--loomina-gold)]/30'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleQuestion(catIndex, qIndex)}
                                                className="w-full p-6 text-left flex justify-between items-center group"
                                            >
                                                <span className={`font-serif text-lg pr-4 transition-colors ${isOpen ? 'text-[#1a1a1a]' : 'text-[#333]'}`}>
                                                    {item.q}
                                                </span>
                                                <span
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen
                                                            ? 'bg-[var(--loomina-gold)] text-white rotate-45'
                                                            : 'bg-[var(--loomina-gold)]/10 text-[var(--loomina-gold)] group-hover:bg-[var(--loomina-gold)]/20'
                                                        }`}
                                                >
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <line x1="12" y1="5" x2="12" y2="19" />
                                                        <line x1="5" y1="12" x2="19" y2="12" />
                                                    </svg>
                                                </span>
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 pb-6">
                                                            <div className="pt-2 border-t border-gray-100">
                                                                <p className="text-[#555] font-serif leading-relaxed pt-4">
                                                                    {item.a}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] text-center relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--loomina-gold)]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">
                        Vous avez d'autres questions ?
                    </h2>
                    <p className="text-lg text-[#666] font-serif mb-10 max-w-2xl mx-auto">
                        Notre équipe est disponible pour vous répondre et vous accompagner
                        dans votre projet de livre.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/contact" variant="primary" size="lg">
                            Nous contacter
                        </Button>
                        <Button href="/offre" variant="secondary" size="lg">
                            Découvrir l'offre
                        </Button>
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
