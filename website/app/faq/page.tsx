'use client';

import React from 'react';
import Link from 'next/link';
import ScrollSeparator from '@/components/ui/ScrollSeparator';
import Button from '@/components/ui/Button';

const FAQ_CATEGORIES = [
    {
        category: "Le Service",
        questions: [
            {
                q: "Comment fonctionne Loomina ?",
                a: "Loomina est un service de biographie assistée par IA. Vous racontez votre histoire lors d'appels téléphoniques, notre IA transforme vos paroles en texte littéraire, vous validez chaque chapitre, puis nous imprimons et livrons votre livre."
            },
            {
                q: "Combien de temps dure le processus complet ?",
                a: "En moyenne 14 semaines, mais nous nous adaptons totalement à votre rythme. Certains clients préfèrent avancer rapidement (8-10 semaines), d'autres prennent leur temps (jusqu'à 6 mois). Il n'y a aucune pression."
            },
            {
                q: "Combien d'appels sont nécessaires ?",
                a: "Nous recommandons 14 appels thématiques (un par chapitre), mais c'est flexible. Si vous avez besoin de plus de temps sur un sujet ou de moins sur un autre, nous nous adaptons. Les appels sont illimités."
            },
            {
                q: "Quelle est la durée d'un appel ?",
                a: "Entre 30 minutes et 1 heure en moyenne. Certains chapitres peuvent être plus courts (20 min), d'autres plus longs (1h30). Vous décidez quand vous avez terminé un sujet."
            }
        ]
    },
    {
        category: "Le Livre",
        questions: [
            {
                q: "Combien de pages fait le livre final ?",
                a: "Cela dépend de votre histoire ! En moyenne, nos livres font entre 150 et 250 pages. Nous nous adaptons à la richesse de votre récit. Il n'y a pas de limite minimum ou maximum."
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
                a: "Oui, c'est même obligatoire ! Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu'à votre satisfaction complète. C'est VOTRE livre."
            },
            {
                q: "Recevrai-je une version numérique ?",
                a: "Oui, vous recevez un ebook (PDF et EPUB) en plus du livre physique. Idéal pour partager facilement avec votre famille, même à distance."
            }
        ]
    },
    {
        category: "Tarifs & Paiement",
        questions: [
            {
                q: "Quel est le prix exact ?",
                a: "219€ tout compris. Ce prix inclut : tous les appels, la rédaction, les corrections, l'intégration de photos, la mise en page, l'impression, la version numérique et la livraison. Aucun frais caché."
            },
            {
                q: "Y a-t-il des frais supplémentaires ?",
                a: "Non, absolument aucun. Le prix de 219€ couvre l'intégralité du service, du premier appel à la livraison de votre livre."
            },
            {
                q: "Puis-je payer en plusieurs fois ?",
                a: "Actuellement, nous acceptons uniquement le paiement en une fois par carte bancaire via Stripe (100% sécurisé). Des options de paiement en plusieurs fois seront bientôt disponibles."
            },
            {
                q: "Y a-t-il une garantie ?",
                a: "Oui. Si après le premier appel vous n'êtes pas satisfait, nous vous remboursons intégralement, sans question. Votre satisfaction est notre priorité."
            }
        ]
    },
    {
        category: "Confidentialité & Sécurité",
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
        questions: [
            {
                q: "Puis-je offrir Loomina en cadeau ?",
                a: "Absolument ! C'est l'un des cadeaux les plus appréciés. Après commande, nous vous envoyons un bon cadeau élégant (PDF imprimable) à offrir. La personne nous contacte ensuite pour démarrer son livre."
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
        questions: [
            {
                q: "Ai-je besoin d'un ordinateur ou smartphone ?",
                a: "Non ! Tout se passe par téléphone. Nous vous appelons aux horaires convenus. Si vous souhaitez envoyer des photos, un email suffit (nous pouvons aussi vous aider par téléphone)."
            },
            {
                q: "Que se passe-t-il si je rate un appel ?",
                a: "Aucun problème ! Nous reprogrammons simplement à un autre moment qui vous convient. Il n'y a aucune pénalité ni frais supplémentaire."
            },
            {
                q: "L'IA remplace-t-elle un vrai biographe ?",
                a: "Notre IA est un outil au service de votre histoire. Elle transforme vos paroles en texte, mais c'est VOUS qui racontez, et des rédacteurs humains relisent et corrigent chaque chapitre. Le meilleur des deux mondes."
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
            <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center mb-12">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                        <span className="mx-6 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.4em] text-[var(--loomina-gold)] uppercase">
                            FAQ
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-serif mb-10 leading-[1.1] tracking-tight">
                        Questions
                        <span className="block text-[var(--loomina-gold)] mt-2">Fréquentes</span>
                    </h1>

                    <p className="text-xl text-[#666] font-serif max-w-3xl mx-auto leading-relaxed">
                        Toutes les réponses à vos questions sur Loomina.
                        <br className="hidden md:block" />
                        Vous ne trouvez pas votre réponse ? <Link href="/contact" className="text-[var(--loomina-gold)] hover:underline">Contactez-nous</Link>.
                    </p>
                </div>
            </section>

            <ScrollSeparator />

            {/* FAQ Content */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto space-y-16">
                    {FAQ_CATEGORIES.map((category, catIndex) => (
                        <div key={catIndex}>
                            {/* Category Title */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-serif mb-4 tracking-tight">{category.category}</h2>
                                <div className="w-16 h-px bg-[var(--loomina-gold)]"></div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                {category.questions.map((item, qIndex) => {
                                    const key = `${catIndex}-${qIndex}`;
                                    const isOpen = openIndex === key;

                                    return (
                                        <div key={qIndex} className="border border-gray-200/60 rounded-xl overflow-hidden bg-white hover:border-[var(--loomina-gold)]/30 transition-colors">
                                            <button
                                                onClick={() => toggleQuestion(catIndex, qIndex)}
                                                className="w-full p-6 text-left flex justify-between items-center hover:bg-[#fafafa] transition-colors"
                                            >
                                                <span className="font-serif text-lg pr-4 text-[#1a1a1a]">{item.q}</span>
                                                <span className="text-[var(--loomina-gold)] text-2xl flex-shrink-0 transition-transform duration-300" style={{
                                                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                                                }}>
                                                    +
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-6 animate-fadeIn">
                                                    <p className="text-[#666] font-serif leading-relaxed">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white text-center border-t border-gray-100">
                <h2 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight">Vous avez d'autres questions ?</h2>
                <p className="text-lg text-[#888] font-serif mb-10 max-w-2xl mx-auto">
                    Notre équipe est là pour vous répondre et vous accompagner.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button href="/contact" variant="primary" size="lg">
                        Nous contacter
                    </Button>
                    <Button href="/offre" variant="secondary" size="lg">
                        Découvrir l'offre
                    </Button>
                </div>
            </section>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </main>
    );
}
