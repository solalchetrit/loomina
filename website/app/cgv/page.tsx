'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

export default function CGVPage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center mb-8">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]"></div>
                            <span className="mx-4 text-xs font-[family-name:var(--font-cinzel)] tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                                Informations Légales
                            </span>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]"></div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight tracking-tight">
                            Conditions Générales de Vente
                        </h1>

                        <p className="text-base text-[#888] font-serif">
                            Dernière mise à jour : 8 janvier 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-12 text-[#555] font-serif leading-relaxed">

                        {/* Article 1 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">1</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Objet</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Loomina</strong>,
                                    société par actions simplifiée dont le siège social est situé en France (ci-après « Loomina » ou « le Prestataire »),
                                    et toute personne physique ou morale souhaitant bénéficier des services proposés par Loomina (ci-après « le Client »).
                                </p>
                                <p>
                                    Les présentes CGV s'appliquent à toute commande passée sur le site internet <strong>www.loomina.eu</strong>
                                    ou par tout autre moyen de communication mis à disposition par Loomina.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 2 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">2</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Description des Services</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Loomina propose un service de création de biographies personnalisées assisté par intelligence artificielle, comprenant :
                                </p>
                                <div className="bg-[#fefdfb] border border-[var(--loomina-gold)]/10 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>Des entretiens téléphoniques illimités avec le Client pour recueillir son récit de vie</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>La transformation des enregistrements en texte littéraire via notre technologie d'IA</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>La relecture et correction professionnelle de chaque chapitre</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>L'intégration de photographies fournies par le Client</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>La mise en page éditoriale et la création d'une couverture personnalisée</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>L'impression d'un exemplaire physique du livre (format 15×23 cm, couverture rigide)</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>La fourniture d'une version numérique (PDF et EPUB)</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-[var(--loomina-gold)] mt-1">✓</span>
                                        <span>La livraison à domicile en France métropolitaine</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 3 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">3</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Commande et Formation du Contrat</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">La commande est finalisée lorsque le Client :</p>
                                <ul className="list-none space-y-2 mb-4">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Remplit le formulaire de commande en ligne</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Accepte expressément les présentes CGV</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Procède au paiement intégral du service</span>
                                    </li>
                                </ul>
                                <p>
                                    Une confirmation de commande est envoyée par email au Client. Le contrat est réputé conclu à la date de réception du paiement.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 4 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">4</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Prix et Modalités de Paiement</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-gradient-to-br from-[var(--loomina-gold)]/5 to-transparent border border-[var(--loomina-gold)]/20 rounded-2xl p-6 mb-4">
                                    <p className="text-2xl font-serif text-[var(--loomina-gold)] mb-2">219€ TTC</p>
                                    <p className="text-sm">Prix tout compris, sans frais cachés</p>
                                </div>
                                <p className="mb-4">
                                    Le paiement s'effectue en une fois par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>.
                                    Loomina ne conserve aucune donnée bancaire.
                                </p>
                                <p>
                                    Les prix affichés sur le site sont susceptibles de modification, mais le prix applicable est celui en vigueur
                                    au moment de la validation de la commande par le Client.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 5 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">5</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Droit de Rétractation</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Conformément à l'article L221-28 du Code de la consommation, le Client dispose d'un délai de <strong>14 jours</strong>
                                    à compter de la conclusion du contrat pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalité.
                                </p>
                                <p className="mb-4">
                                    Toutefois, si le Client demande expressément que la prestation commence avant la fin du délai de rétractation,
                                    il renonce à son droit de rétractation dès le début de l'exécution du service.
                                </p>
                                <p>
                                    Pour exercer son droit de rétractation, le Client doit notifier Loomina par email à <strong>contact@loomina.eu</strong>.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 6 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">6</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Garantie Satisfait ou Remboursé</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-[#fefdfb] border-l-4 border-[var(--loomina-gold)] rounded-r-xl p-6 mb-4">
                                    <p className="font-semibold text-[#1a1a1a] mb-2">Notre engagement qualité</p>
                                    <p>
                                        Loomina s'engage à rembourser intégralement le Client si, après le premier entretien téléphonique,
                                        celui-ci n'est pas satisfait du service, sans avoir à se justifier.
                                    </p>
                                </div>
                                <p>
                                    Cette garantie s'applique uniquement si la demande de remboursement est formulée dans les <strong>7 jours</strong>
                                    suivant le premier appel.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 7 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">7</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Délais de Réalisation et Livraison</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Le délai moyen de réalisation du service est de <strong>14 semaines</strong> à compter du premier entretien,
                                    mais peut varier en fonction du rythme du Client et de la complexité du projet.
                                </p>
                                <p className="mb-4">
                                    Une fois le livre finalisé et validé par le Client, l'impression et la livraison prennent entre <strong>2 et 3 semaines</strong>.
                                </p>
                                <p>
                                    La livraison est effectuée à l'adresse indiquée par le Client lors de la commande, en France métropolitaine.
                                    Pour les livraisons en Europe ou à l'international, des frais supplémentaires peuvent s'appliquer.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 8 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">8</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Propriété Intellectuelle</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Le Client conserve l'intégralité des droits d'auteur sur le contenu de son récit de vie.
                                    Loomina s'engage à ne jamais utiliser, reproduire ou diffuser le contenu du livre sans l'autorisation expresse du Client.
                                </p>
                                <p>
                                    Le Client accorde à Loomina une licence non exclusive pour utiliser le contenu uniquement dans le cadre de la réalisation du service
                                    (rédaction, mise en page, impression).
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 9 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">9</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Protection des Données Personnelles</h2>
                            </div>
                            <div className="pl-14">
                                <p>
                                    Les données personnelles collectées par Loomina sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
                                    Pour plus d'informations, consultez notre <Link href="/privacy" className="text-[var(--loomina-gold)] hover:underline underline-offset-2">Politique de Confidentialité</Link>.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 10 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">10</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Responsabilité</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    Loomina s'engage à fournir un service de qualité conforme aux standards professionnels.
                                    Toutefois, la responsabilité de Loomina ne saurait être engagée en cas de :
                                </p>
                                <ul className="list-none space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Force majeure ou événement indépendant de sa volonté</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Inexactitude des informations fournies par le Client</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[var(--loomina-gold)]">•</span>
                                        <span>Mauvaise utilisation du service par le Client</span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 11 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">11</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Résolution des Litiges</h2>
                            </div>
                            <div className="pl-14">
                                <p className="mb-4">
                                    En cas de litige, le Client est invité à contacter Loomina en priorité à l'adresse <strong>contact@loomina.eu</strong>
                                    afin de rechercher une solution amiable.
                                </p>
                                <p className="mb-4">
                                    Conformément à l'article L612-1 du Code de la consommation, le Client peut recourir gratuitement à un médiateur de la consommation
                                    en cas de litige non résolu. Les coordonnées du médiateur compétent seront communiquées sur demande.
                                </p>
                                <p>
                                    À défaut de résolution amiable, tout litige relèvera de la compétence exclusive des tribunaux français.
                                </p>
                            </div>
                        </motion.div>

                        <div className="border-t border-gray-100"></div>

                        {/* Article 12 */}
                        <motion.div {...fadeInUp}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[var(--loomina-gold)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[var(--loomina-gold)] font-serif font-semibold">12</span>
                                </div>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] tracking-tight pt-1">Modification des CGV</h2>
                            </div>
                            <div className="pl-14">
                                <p>
                                    Loomina se réserve le droit de modifier les présentes CGV à tout moment.
                                    Les CGV applicables sont celles en vigueur à la date de la commande.
                                </p>
                            </div>
                        </motion.div>

                        {/* Contact */}
                        <div className="border-t-2 border-[var(--loomina-gold)]/20 pt-12 mt-12">
                            <motion.div {...fadeInUp}>
                                <h2 className="text-2xl font-serif text-[#1a1a1a] mb-6 tracking-tight">Contact</h2>
                                <p className="mb-4">Pour toute question relative aux présentes CGV, vous pouvez nous contacter :</p>
                                <div className="bg-gradient-to-br from-[#fefdfb] to-white border border-[var(--loomina-gold)]/20 rounded-2xl p-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Email : </span>
                                            <a href="mailto:contact@loomina.eu" className="text-[var(--loomina-gold)] hover:underline">contact@loomina.eu</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Adresse : </span>
                                            <span>France</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-[var(--loomina-gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <div>
                                            <span className="text-sm text-[#888]">Site web : </span>
                                            <a href="https://www.loomina.eu" className="text-[var(--loomina-gold)] hover:underline">www.loomina.eu</a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fefdfb] text-center border-t border-gray-100">
                <motion.div {...fadeInUp}>
                    <Button href="/offre" variant="primary" size="lg">
                        Découvrir l'offre
                    </Button>
                </motion.div>
            </section>
        </main>
    );
}
