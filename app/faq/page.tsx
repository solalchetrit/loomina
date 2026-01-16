'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const FAQ_CATEGORIES = [
    {
        category: "Le Service",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        questions: [
            {
                q: "Comment fonctionne Loomina ?",
                a: "Loomina est un service de biographie assistée par IA. Vous racontez votre histoire lors d&apos;appels téléphoniques, notre IA transforme vos paroles en texte littéraire, vous validez chaque chapitre, puis nous imprimons et livrons votre livre."
            },
            {
                q: "Combien de temps dure le processus complet ?",
                a: "En moyenne 14 semaines, mais nous nous adaptons totalement à votre rythme. Certains clients préfèrent avancer rapidement (8-10 semaines), d&apos;autres prennent leur temps (jusqu&apos;à 6 mois). Il n&apos;y a aucune pression."
            },
            {
                q: "Combien d'appels sont nécessaires ?",
                a: "Nous recommandons 14 appels thématiques (un par chapitre), mais c&apos;est flexible. Si vous avez besoin de plus de temps sur un sujet ou de moins sur un autre, nous nous adaptons. Les appels sont illimités."
            },
            {
                q: "Quelle est la durée d'un appel ?",
                a: "Entre 30 minutes et 1 heure en moyenne. Certains chapitres peuvent être plus courts (20 min), d&apos;autres plus longs (1h30). Vous décidez quand vous avez terminé un sujet."
            }
        ]
    },
    {
        category: "Le Livre",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        questions: [
            {
                q: "Combien de pages fait le livre final ?",
                a: "Cela dépend de votre histoire ! En moyenne, nos livres font entre 150 et 250 pages. Nous nous adaptons à la richesse de votre récit. Il n&apos;y a pas de limite minimum ou maximum."
            },
            {
                q: "Puis-je ajouter des photos ?",
                a: "Absolument ! Vous pouvez nous envoyer vos photos (format numérique) et nous les intégrons dans le livre. Nous vous aidons à choisir les meilleurs emplacements pour un rendu harmonieux."
            },
            {
                q: "Quel est le format du livre ?",
                a: "Format standard 15x23 cm (proche du format roman), couverture rigide personnalisée, papier ivoire 90g, reliure cousue. Un objet de qualité conçu pour durer."
            },
            {
                q: "Puis-je relire et modifier le texte ?",
                a: "Oui, c&apos;est même obligatoire ! Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu&apos;à votre satisfaction complète. C&apos;est VOTRE livre."
            },
            {
                q: "Recevrai-je une version numérique ?",
                a: "Oui, vous recevez un ebook (PDF et EPUB) en plus du livre physique. Idéal pour partager facilement avec votre famille, même à distance."
            }
        ]
    },
    {
        category: "Tarifs & Paiement",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        questions: [
            {
                q: "Quel est le prix exact ?",
                a: "219€ tout compris. Ce prix inclut : tous les appels, la rédaction, les corrections, l&apos;intégration de photos, la mise en page, l&apos;impression, la version numérique et la livraison. Aucun frais caché."
            },
            {
                q: "Y a-t-il des frais supplémentaires ?",
                a: "Non, absolument aucun. Le prix de 219€ couvre l&apos;intégralité du service, du premier appel à la livraison de votre livre."
            },
            {
                q: "Puis-je payer en plusieurs fois ?",
                a: "Actuellement, nous acceptons uniquement le paiement en une fois par carte bancaire via Stripe (100% sécurisé). Des options de paiement en plusieurs fois seront bientôt disponibles."
            },
            {
                q: "Y a-t-il une garantie ?",
                a: "Oui. Si après le premier appel vous n&apos;êtes pas satisfait, nous vous remboursons intégralement, sans question. Votre satisfaction est notre priorité."
            }
        ]
    },
    {
        category: "Confidentialité & Sécurité",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        questions: [
            {
                q: "Mes données sont-elles sécurisées ?",
                a: "Totalement. Vos enregistrements et textes sont chiffrés (AES-256), stockés sur des serveurs sécurisés en Europe (conformité RGPD), et jamais partagés avec des tiers. Vous pouvez demander leur suppression à tout moment."
            },
            {
                q: "Qui a accès à mon histoire ?",
                a: "Uniquement vous et notre équipe technique (pour la rédaction et la mise en page). Nous signons un accord de confidentialité strict. Votre histoire reste privée."
            },
            {
                q: "Que deviennent mes données après la livraison ?",
                a: "Nous conservons vos données pendant 1 an après livraison (au cas où vous souhaiteriez des modifications ou réimpressions). Passé ce délai, elles sont automatiquement supprimées, sauf si vous demandez leur conservation."
            }
        ]
    },
    {
        category: "Cadeau & Livraison",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
        ),
        questions: [
            {
                q: "Puis-je offrir Loomina en cadeau ?",
                a: "Absolument ! C&apos;est l&apos;un des cadeaux les plus appréciés. Après commande, nous vous envoyons un bon cadeau élégant (PDF imprimable) à offrir. La personne nous contacte ensuite pour démarrer son livre."
            },
            {
                q: "Combien de temps pour la livraison ?",
                a: "Une fois le livre finalisé et validé, comptez 2-3 semaines pour l'impression et la livraison en France métropolitaine. Nous expédions via Colissimo avec suivi."
            },
            {
                q: "Livrez-vous à l'international ?",
                a: "Actuellement, nous livrons uniquement en France métropolitaine et en Europe (frais de port supplémentaires selon pays). Contactez-nous pour les autres destinations."
            },
            {
                q: "Puis-je commander plusieurs exemplaires ?",
                a: "Oui ! Après réception de votre livre, vous pouvez commander des exemplaires supplémentaires à tarif réduit (nous consulter). Idéal pour offrir à toute la famille."
            }
        ]
    },
    {
        category: "Technique",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        questions: [
            {
                q: "Ai-je besoin d'un ordinateur ou smartphone ?",
                a: "Non ! Tout se passe par téléphone. Nous vous appelons aux horaires convenus. Si vous souhaitez envoyer des photos, un email suffit (nous pouvons aussi vous aider par téléphone)."
            },
            {
                q: "Que se passe-t-il si je rate un appel ?",
                a: "Aucun problème ! Nous reprogrammons simplement à un autre moment qui vous convient. Il n&apos;y a aucune pénalité ni frais supplémentaire."
            },
            {
                q: "L'IA remplace-t-elle un vrai biographe ?",
                a: "Notre IA est un outil au service de votre histoire. Elle transforme vos paroles en texte, mais c&apos;est VOUS qui racontez, et des rédacteurs humains relisent et corrigent chaque chapitre. Le meilleur des deux mondes."
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
        <main className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[600px] h-[600px] top-[-200px] right-[-200px] opacity-15" />
                <div className="ambient-orb aurora w-[400px] h-[400px] bottom-[20%] left-[-150px] opacity-10" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-8 px-6 md:px-12 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="mx-6 text-xs font-semibold tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                            FAQ
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <h1 className="heading-display font-serif mb-10">
                        Questions
                        <span className="block text-gradient-gold mt-2">Fréquentes</span>
                    </h1>

                    <p className="text-xl text-[var(--text-secondary)] font-serif max-w-3xl mx-auto leading-relaxed">
                        Toutes les réponses à vos questions sur Loomina.
                        <br className="hidden md:block" />
                        Vous ne trouvez pas votre réponse ? <Link href="/contact" className="text-[var(--loomina-gold)] hover:underline">Contactez-nous</Link>.
                    </p>
                </motion.div>
            </section>

            <ScrollSeparator />

            {/* FAQ Content */}
            <section className="pt-8 pb-16 px-6 md:px-12 lg:px-24 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    {FAQ_CATEGORIES.map((category, catIndex) => (
                        <motion.div
                            key={catIndex}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                        >
                            {/* Category Title */}
                            <div className="mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--loomina-gold)]/10 border border-[var(--loomina-gold)]/20 flex items-center justify-center text-[var(--loomina-gold)]">
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-serif text-[var(--text-primary)]">{category.category}</h2>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                {category.questions.map((item, qIndex) => {
                                    const key = `${catIndex}-${qIndex}`;
                                    const isOpen = openIndex === key;

                                    return (
                                        <motion.div
                                            key={qIndex}
                                            className="glass rounded-xl overflow-hidden"
                                            initial={false}
                                        >
                                            <button
                                                onClick={() => toggleQuestion(catIndex, qIndex)}
                                                className="w-full p-6 text-left flex justify-between items-center hover:bg-[var(--loomina-mist)]/30 transition-colors"
                                            >
                                                <span className="font-serif text-lg pr-4 text-[var(--text-primary)]">{item.q}</span>
                                                <motion.span
                                                    animate={{ rotate: isOpen ? 45 : 0 }}
                                                    className="text-[var(--loomina-gold)] text-2xl flex-shrink-0"
                                                >
                                                    +
                                                </motion.span>
                                            </button>
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    height: isOpen ? "auto" : 0,
                                                    opacity: isOpen ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-6">
                                                    <p className="text-[var(--text-secondary)] font-serif leading-relaxed">{item.a}</p>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6 md:px-12 lg:px-24 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="ambient-orb gold w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="heading-section font-serif text-[var(--text-primary)] mb-6">Vous avez d&apos;autres questions ?</h2>
                    <p className="text-lg text-[var(--text-secondary)] font-serif mb-10">
                        Notre équipe est là pour vous répondre et vous accompagner.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button href="/contact" variant="primary" size="lg">
                            Nous contacter
                        </Button>
                        <Button href="/offre" variant="secondary" size="lg">
                            Découvrir l&apos;offre
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
