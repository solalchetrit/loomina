'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CGVPage() {
    return (
        <main className="min-h-screen bg-white text-[#1a1a1a]">
            {/* Hero Section */}
            <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#fafafa] border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
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
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto prose prose-lg">
                    <div className="space-y-12 text-[#555] font-serif leading-relaxed">

                        {/* Article 1 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">1. Objet</h2>
                            <p>
                                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Loomina</strong>,
                                société par actions simplifiée au capital de [MONTANT] euros, immatriculée au RCS de [VILLE] sous le numéro [NUMÉRO],
                                dont le siège social est situé [ADRESSE] (ci-après « Loomina » ou « le Prestataire »),
                                et toute personne physique ou morale souhaitant bénéficier des services proposés par Loomina (ci-après « le Client »).
                            </p>
                            <p className="mt-4">
                                Les présentes CGV s'appliquent à toute commande passée sur le site internet <strong>www.loomina.fr</strong>
                                ou par tout autre moyen de communication mis à disposition par Loomina.
                            </p>
                        </div>

                        {/* Article 2 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">2. Description des Services</h2>
                            <p>
                                Loomina propose un service de création de biographies personnalisées assisté par intelligence artificielle, comprenant :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Des entretiens téléphoniques illimités avec le Client pour recueillir son récit de vie</li>
                                <li>La transformation des enregistrements en texte littéraire via notre technologie d'IA</li>
                                <li>La relecture et correction professionnelle de chaque chapitre</li>
                                <li>L'intégration de photographies fournies par le Client</li>
                                <li>La mise en page éditoriale et la création d'une couverture personnalisée</li>
                                <li>L'impression d'un exemplaire physique du livre (format 15x23 cm, couverture rigide)</li>
                                <li>La fourniture d'une version numérique (PDF et EPUB)</li>
                                <li>La livraison à domicile en France métropolitaine</li>
                            </ul>
                        </div>

                        {/* Article 3 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">3. Commande et Formation du Contrat</h2>
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
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">4. Prix et Modalités de Paiement</h2>
                            <p>
                                Le prix du service est de <strong>219 euros TTC</strong>, tout compris, sans frais cachés.
                            </p>
                            <p className="mt-4">
                                Le paiement s'effectue en une fois par carte bancaire via la plateforme sécurisée <strong>Stripe</strong>.
                                Loomina ne conserve aucune donnée bancaire.
                            </p>
                            <p className="mt-4">
                                Les prix affichés sur le site sont susceptibles de modification, mais le prix applicable est celui en vigueur
                                au moment de la validation de la commande par le Client.
                            </p>
                        </div>

                        {/* Article 5 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">5. Droit de Rétractation</h2>
                            <p>
                                Conformément à l'article L221-28 du Code de la consommation, le Client dispose d'un délai de <strong>14 jours</strong>
                                à compter de la conclusion du contrat pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalité.
                            </p>
                            <p className="mt-4">
                                Toutefois, si le Client demande expressément que la prestation commence avant la fin du délai de rétractation,
                                il renonce à son droit de rétractation dès le début de l'exécution du service.
                            </p>
                            <p className="mt-4">
                                Pour exercer son droit de rétractation, le Client doit notifier Loomina par email à <strong>contact@loomina.fr</strong>.
                            </p>
                        </div>

                        {/* Article 6 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">6. Garantie Satisfait ou Remboursé</h2>
                            <p>
                                Loomina s'engage à rembourser intégralement le Client si, après le premier entretien téléphonique,
                                celui-ci n'est pas satisfait du service, sans avoir à se justifier.
                            </p>
                            <p className="mt-4">
                                Cette garantie s'applique uniquement si la demande de remboursement est formulée dans les <strong>7 jours</strong>
                                suivant le premier appel.
                            </p>
                        </div>

                        {/* Article 7 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">7. Délais de Réalisation et Livraison</h2>
                            <p>
                                Le délai moyen de réalisation du service est de <strong>14 semaines</strong> à compter du premier entretien,
                                mais peut varier en fonction du rythme du Client et de la complexité du projet.
                            </p>
                            <p className="mt-4">
                                Une fois le livre finalisé et validé par le Client, l'impression et la livraison prennent entre <strong>2 et 3 semaines</strong>.
                            </p>
                            <p className="mt-4">
                                La livraison est effectuée à l'adresse indiquée par le Client lors de la commande, en France métropolitaine.
                                Pour les livraisons en Europe ou à l'international, des frais supplémentaires peuvent s'appliquer.
                            </p>
                        </div>

                        {/* Article 8 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">8. Propriété Intellectuelle</h2>
                            <p>
                                Le Client conserve l'intégralité des droits d'auteur sur le contenu de son récit de vie.
                                Loomina s'engage à ne jamais utiliser, reproduire ou diffuser le contenu du livre sans l'autorisation expresse du Client.
                            </p>
                            <p className="mt-4">
                                Le Client accorde à Loomina une licence non exclusive pour utiliser le contenu uniquement dans le cadre de la réalisation du service
                                (rédaction, mise en page, impression).
                            </p>
                        </div>

                        {/* Article 9 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">9. Protection des Données Personnelles</h2>
                            <p>
                                Les données personnelles collectées par Loomina sont traitées conformément au Règlement Général sur la Protection des Données (RGPD).
                                Pour plus d'informations, consultez notre <Link href="/privacy" className="text-[var(--loomina-gold)] hover:underline">Politique de Confidentialité</Link>.
                            </p>
                        </div>

                        {/* Article 10 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">10. Responsabilité</h2>
                            <p>
                                Loomina s'engage à fournir un service de qualité conforme aux standards professionnels.
                                Toutefois, la responsabilité de Loomina ne saurait être engagée en cas de :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Force majeure ou événement indépendant de sa volonté</li>
                                <li>Inexactitude des informations fournies par le Client</li>
                                <li>Mauvaise utilisation du service par le Client</li>
                            </ul>
                        </div>

                        {/* Article 11 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">11. Résolution des Litiges</h2>
                            <p>
                                En cas de litige, le Client est invité à contacter Loomina en priorité à l'adresse <strong>contact@loomina.fr</strong>
                                afin de rechercher une solution amiable.
                            </p>
                            <p className="mt-4">
                                Conformément à l'article L612-1 du Code de la consommation, le Client peut recourir gratuitement à un médiateur de la consommation
                                en cas de litige non résolu. Les coordonnées du médiateur compétent seront communiquées sur demande.
                            </p>
                            <p className="mt-4">
                                À défaut de résolution amiable, tout litige relèvera de la compétence exclusive des tribunaux français.
                            </p>
                        </div>

                        {/* Article 12 */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">12. Modification des CGV</h2>
                            <p>
                                Loomina se réserve le droit de modifier les présentes CGV à tout moment.
                                Les CGV applicables sont celles en vigueur à la date de la commande.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t border-gray-200 pt-8 mt-12">
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">Contact</h2>
                            <p>
                                Pour toute question relative aux présentes CGV, vous pouvez nous contacter :
                            </p>
                            <ul className="list-none mt-4 space-y-2">
                                <li><strong>Email :</strong> contact@loomina.fr</li>
                                <li><strong>Adresse :</strong> [ADRESSE COMPLÈTE]</li>
                                <li><strong>Téléphone :</strong> [NUMÉRO]</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-[#fafafa] text-center border-t border-gray-100">
                <Button href="/offre" variant="primary" size="lg">
                    Découvrir l'offre
                </Button>
            </section>
        </main>
    );
}
