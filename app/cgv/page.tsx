'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function CGVPage() {
    return (
        <main className="min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] relative overflow-hidden">
            {/* Background ambient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="ambient-orb gold w-[400px] h-[400px] top-[-100px] right-[-100px] opacity-10" />
            </div>

            {/* Hero Section */}
            <section className="relative py-32 px-6 md:px-12 lg:px-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center mb-8">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                        <span className="mx-4 text-xs font-semibold tracking-[0.3em] text-[var(--loomina-gold)] uppercase">
                            L’Offre
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
                    </div>

                    <h1 className="heading-display font-serif mb-6">
                        Conditions Générales de Vente
                    </h1>

                    <p className="text-[var(--text-muted)] font-serif">
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </motion.div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-12 text-[var(--text-secondary)] font-serif leading-relaxed">

                        {/* Article 1 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">1. Objet</h2>
                            <p>
                                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong className="text-[var(--text-primary)]">Loomina</strong>,
                                société par actions simplifiée au capital de [MONTANT] euros, immatriculée au RCS de [VILLE] sous le numéro [NUMÉRO],
                                dont le siège social est situé [ADRESSE] (ci-après « Loomina » ou « le Prestataire »),
                                et toute personne physique ou morale souhaitant bénéficier des services proposés par Loomina (ci-après « le Client »).
                            </p>
                            <p className="mt-4">
                                Les présentes CGV s’appliquent à toute commande passée sur le site internet <strong className="text-[var(--text-primary)]">www.loomina.eu</strong>
                                ou par tout autre moyen de communication mis à disposition par Loomina.
                            </p>
                        </div>

                        {/* Article 2 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">2. Description des Services</h2>
                            <p>
                                Loomina propose un service de création de biographies personnalisées assisté par intelligence artificielle, comprenant :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Des entretiens téléphoniques illimités avec le Client pour recueillir son récit de vie</li>
                                <li>La transformation des enregistrements en texte littéraire via notre technologie d’IA</li>
                                <li>La relecture et correction professionnelle de chaque chapitre</li>
                                <li>L’intégration de photographies fournies par le Client</li>
                                <li>La mise en page éditoriale et la création d’une couverture personnalisée</li>
                                <li>L’impression d’un exemplaire physique du livre (format 15x23 cm, couverture rigide)</li>
                                <li>La fourniture d’une version numérique (PDF et EPUB)</li>
                                <li>La livraison à domicile en France métropolitaine</li>
                            </ul>
                        </div>

                        {/* Article 3 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">3. Commande et Formation du Contrat</h2>
                            <p>
                                La commande est finalisée lorsque le Client :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Remplit le formulaire de commande en ligne</li>
                                <li>Accepte expressément les présentes CGV</li>
                                <li>Procède au paiement intégral du service</li>
                            </ul>
                            <p className="mt-4">
                                Une confirmation de commande est envoyée par email au Client. Le contrat est réputé conclu à la date de réception du paiement.
                            </p>
                        </div>

                        {/* Article 4 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">4. Prix et Modalités de Paiement</h2>
                            <p>
                                Le prix du service est de <strong className="text-[var(--loomina-gold)]">219 euros TTC</strong>, tout compris, sans frais cachés.
                            </p>
                            <p className="mt-4">
                                Le paiement s’effectue en une fois par carte bancaire via la plateforme sécurisée <strong className="text-[var(--text-primary)]">Stripe</strong>.
                                Loomina ne conserve aucune donnée bancaire.
                            </p>
                            <p className="mt-4">
                                Les prix affichés sur le site sont susceptibles de modification, mais le prix applicable est celui en vigueur
                                au moment de la validation de la commande par le Client.
                            </p>
                        </div>

                        {/* Article 5 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">5. Droit de Rétractation</h2>
                            <p className="mt-4">
                                Conformément à l’article L221-28 du Code de la consommation, le Client dispose d’un délai de <strong className="text-[var(--text-primary)]">14 jours</strong>
                                à compter de la conclusion du contrat pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalité.
                            </p>
                            <p className="mt-4">
                                Toutefois, si le Client demande expressément que la prestation commence avant la fin du délai de rétractation,
                                il renonce à son droit de rétractation dès le début de l’exécution du service.
                            </p>
                            <p className="mt-4">
                                Pour exercer son droit de rétractation, le Client doit notifier Loomina par email à <strong className="text-[var(--loomina-gold)]">contact@loomina.eu</strong>.
                            </p>
                        </div>

                        {/* Article 6 */}
                        <div className="glass-gold rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">6. Garantie Satisfait ou Remboursé</h2>
                            <p>
                                Loomina s’engage à rembourser intégralement le Client si, après le premier entretien téléphonique,
                                le service, sans avoir à se justifier.
                            </p>
                            <p className="mt-4">
                                Cette garantie s’applique uniquement si la demande de remboursement est formulée dans les <strong className="text-[var(--text-primary)]">7 jours</strong>
                                suivant le premier appel.
                            </p>
                        </div>

                        {/* Article 7 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">7. Délais de Réalisation et Livraison</h2>
                            <p>
                                Le délai moyen de réalisation du service est de <strong className="text-[var(--text-primary)]">14 semaines</strong> à compter du premier entretien,
                                mais peut varier en fonction du rythme du Client et de la complexité du projet.
                            </p>
                            <p className="mt-4">
                                Une fois le livre finalisé et validé par le Client, l’impression et la livraison prennent entre <strong className="text-[var(--text-primary)]">2 et 3 semaines</strong>.
                            </p>
                            <p className="mt-4">
                                La livraison est effectuée à l’adresse indiquée par le Client lors de la commande, en France métropolitaine.
                                Pour les livraisons en Europe ou à l’international, des frais supplémentaires peuvent s’appliquer.
                            </p>
                        </div>

                        {/* Article 8 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">8. Propriété Intellectuelle</h2>
                            <p>
                                Le Client conserve l’intégralité des droits d’auteur sur le contenu de son récit de vie.
                                Loomina s’engage à ne jamais utiliser, reproduire ou diffuser le contenu du livre sans l’autorisation expresse du Client.
                            </p>
                            <p className="mt-4">
                                Le Client accorde à Loomina une licence non exclusive pour utiliser le contenu uniquement dans le cadre de la réalisation du service
                                (rédaction, mise en page, impression).
                            </p>
                        </div>

                        {/* Article 9 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">9. Protection des Données Personnelles</h2>
                            <p>
                                Les données personnelles collectées par Loomina sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
                                Pour plus d’informations sur la gestion de vos données personnelles,
                                consultez notre <Link href="/privacy" className="text-[var(--loomina-gold)] hover:underline">Politique de Confidentialité</Link>.
                            </p>
                        </div>

                        {/* Article 10 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">10. Responsabilité</h2>
                            <p>
                                Loomina s’engage à fournir un service de qualité conforme aux standards professionnels.
                                Toutefois, la responsabilité de Loomina ne saurait être engagée en cas de :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Force majeure ou événement indépendant de sa volonté</li>
                                <li>Inexactitude des informations fournies par le Client</li>
                                <li>Mauvaise utilisation du service par le Client</li>
                            </ul>
                        </div>

                        {/* Article 11 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">11. Résolution des Litiges</h2>
                            <p>
                                En cas de litige, le Client est invité à contacter Loomina en priorité à l’adresse <strong className="text-[var(--loomina-gold)]">contact@loomina.eu</strong>
                                afin de rechercher une solution amiable.
                            </p>
                            <p className="mt-4">
                                Conformément à l’article L612-1 du Code de la consommation, le Client peut recourir gratuitement à un médiateur de la consommation
                                en cas de litige non résolu. Les coordonnées du médiateur compétent seront communiquées sur demande.
                            </p>
                            <p className="mt-4">
                                À défaut de résolution amiable, tout litige relèvera de la compétence exclusive des tribunaux français.
                            </p>
                        </div>

                        {/* Article 12 */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">12. Modification des CGV</h2>
                            <p>
                                Nous guidons chaque proche avec un fil rouge simple : un temps d’écoute, un atelier de mise en forme, puis des
                                supports prêts à offrir. L’accueil de la page reflète cette promesse pour rassurer et donner envie d’avancer.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="glass-gold rounded-2xl p-8">
                            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">Contact</h2>
                            <p>
                                Pour toute question relative aux présentes CGV, vous pouvez nous contacter :
                            </p>
                            <ul className="list-none mt-4 space-y-2">
                                <li><strong className="text-[var(--text-primary)]">Email :</strong> contact@loomina.eu</li>
                                <li><strong className="text-[var(--text-primary)]">Téléphone :</strong> 01 59 16 93 57</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 text-center">
                <Button href="/offre" variant="primary" size="lg">
                    Découvrir l’offre
                </Button>
            </section>
        </main>
    );
}
