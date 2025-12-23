'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LegalPage() {
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
                        Mentions Légales
                    </h1>

                    <p className="text-base text-[#888] font-serif">
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-12 text-[#555] font-serif leading-relaxed">

                        {/* Éditeur du site */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">1. Éditeur du Site</h2>
                            <p className="mb-4">
                                Le site internet <strong>www.loomina.fr</strong> (ci-après « le Site ») est édité par :
                            </p>
                            <div className="bg-[#fafafa] border border-gray-200/60 rounded-xl p-6 space-y-2">
                                <p><strong>Raison sociale :</strong> Loomina</p>
                                <p><strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
                                <p><strong>Capital social :</strong> [MONTANT] euros</p>
                                <p><strong>Siège social :</strong> [ADRESSE COMPLÈTE]</p>
                                <p><strong>RCS :</strong> [VILLE] [NUMÉRO]</p>
                                <p><strong>SIRET :</strong> [NUMÉRO]</p>
                                <p><strong>TVA intracommunautaire :</strong> [NUMÉRO]</p>
                                <p><strong>Email :</strong> contact@loomina.fr</p>
                                <p><strong>Téléphone :</strong> [NUMÉRO]</p>
                            </div>
                            <p className="mt-4">
                                <strong>Directeur de la publication :</strong> Solal Chetrit, Président
                            </p>
                        </div>

                        {/* Hébergement */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">2. Hébergement</h2>
                            <p className="mb-4">
                                Le Site est hébergé par :
                            </p>
                            <div className="bg-[#fafafa] border border-gray-200/60 rounded-xl p-6 space-y-2">
                                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                                <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--loomina-gold)] hover:underline">vercel.com</a></p>
                            </div>
                        </div>

                        {/* Propriété intellectuelle */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">3. Propriété Intellectuelle</h2>
                            <p>
                                L'ensemble des éléments composant le Site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.)
                                est la propriété exclusive de Loomina ou de ses partenaires, sauf mention contraire.
                            </p>
                            <p className="mt-4">
                                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site,
                                quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Loomina.
                            </p>
                            <p className="mt-4">
                                Toute exploitation non autorisée du Site ou de l'un quelconque des éléments qu'il contient sera considérée comme
                                constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
                            </p>
                        </div>

                        {/* Protection des données */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">4. Protection des Données Personnelles</h2>
                            <p>
                                Loomina accorde une grande importance à la protection de vos données personnelles.
                            </p>
                            <p className="mt-4">
                                Les données collectées sur le Site sont traitées conformément au Règlement Général sur la Protection des Données (RGPD)
                                et à la loi Informatique et Libertés.
                            </p>
                            <p className="mt-4">
                                Pour en savoir plus sur la collecte, l'utilisation et la protection de vos données personnelles,
                                consultez notre <Link href="/privacy" className="text-[var(--loomina-gold)] hover:underline font-semibold">Politique de Confidentialité</Link>.
                            </p>
                            <div className="bg-[#fafafa] border border-gray-200/60 rounded-xl p-6 mt-6">
                                <p><strong>Responsable du traitement :</strong> Loomina</p>
                                <p className="mt-2"><strong>Délégué à la Protection des Données (DPO) :</strong> contact@loomina.fr</p>
                            </div>
                            <p className="mt-4">
                                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de limitation,
                                d'opposition et de portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l'adresse :
                                <strong> contact@loomina.fr</strong>.
                            </p>
                        </div>

                        {/* Cookies */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">5. Cookies</h2>
                            <p>
                                Le Site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
                            </p>
                            <p className="mt-4">
                                Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur le Site.
                                Les cookies que nous utilisons sont :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li><strong>Cookies techniques :</strong> Nécessaires au fonctionnement du Site (session, panier, etc.)</li>
                                <li><strong>Cookies analytiques :</strong> Pour mesurer l'audience et améliorer le Site (Google Analytics, etc.)</li>
                            </ul>
                            <p className="mt-4">
                                Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
                                Toutefois, cela peut affecter certaines fonctionnalités du Site.
                            </p>
                        </div>

                        {/* Responsabilité */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">6. Limitation de Responsabilité</h2>
                            <p>
                                Loomina s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le Site,
                                mais ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
                            </p>
                            <p className="mt-4">
                                Loomina ne saurait être tenue responsable :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Des interruptions ou dysfonctionnements du Site</li>
                                <li>De l'impossibilité d'accéder au Site</li>
                                <li>Des dommages directs ou indirects résultant de l'utilisation du Site</li>
                                <li>Du contenu des sites tiers vers lesquels le Site pourrait renvoyer</li>
                            </ul>
                        </div>

                        {/* Liens hypertextes */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">7. Liens Hypertextes</h2>
                            <p>
                                Le Site peut contenir des liens hypertextes vers d'autres sites internet.
                                Loomina n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                            </p>
                            <p className="mt-4">
                                La création de liens hypertextes vers le Site est soumise à l'autorisation préalable de Loomina.
                                Pour toute demande, contactez-nous à : <strong>contact@loomina.fr</strong>.
                            </p>
                        </div>

                        {/* Droit applicable */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">8. Droit Applicable et Juridiction Compétente</h2>
                            <p>
                                Les présentes mentions légales sont régies par le droit français.
                            </p>
                            <p className="mt-4">
                                En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
                            </p>
                        </div>

                        {/* Crédits */}
                        <div>
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">9. Crédits</h2>
                            <p>
                                <strong>Conception et développement :</strong> Loomina
                            </p>
                            <p className="mt-2">
                                <strong>Design :</strong> Loomina
                            </p>
                            <p className="mt-2">
                                <strong>Icônes et illustrations :</strong> Emojis (Unicode Consortium)
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="border-t border-gray-200 pt-8 mt-12">
                            <h2 className="text-2xl font-serif text-[#1a1a1a] mb-4 tracking-tight">Contact</h2>
                            <p>
                                Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter :
                            </p>
                            <div className="bg-[#fafafa] border border-gray-200/60 rounded-xl p-6 mt-4 space-y-2">
                                <p><strong>Email :</strong> contact@loomina.fr</p>
                                <p><strong>Adresse :</strong> [ADRESSE COMPLÈTE]</p>
                                <p><strong>Téléphone :</strong> [NUMÉRO]</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-[#fafafa] text-center border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button href="/privacy" variant="secondary" size="lg">
                        Politique de confidentialité
                    </Button>
                    <Button href="/cgv" variant="secondary" size="lg">
                        CGV
                    </Button>
                </div>
            </section>
        </main>
    );
}
