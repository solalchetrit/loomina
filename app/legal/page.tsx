'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LegalPage() {
    return (
        <main className="w-full">

            {/* Hero Section */}
            <section className="relative pt-28 pb-8 md:pt-40 md:pb-10 px-5 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <p className="eyebrow">Informations Légales</p>

                    <h1 className="heading-section mt-4 mb-5 max-w-3xl">
                        Mentions Légales
                    </h1>

                    <p className="font-sans text-[14px] text-[var(--text-muted)]">
                        Dernière mise à jour : 23 décembre 2024
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="pt-6 pb-20 md:pb-28 px-5 sm:px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="prose-loomina space-y-6">

                        {/* Éditeur du site */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">1. Éditeur du Site</h2>
                            <p className="mb-4">
                                Le site internet <strong className="text-[var(--text-primary)]">www.loomina.eu</strong> (ci-après « le Site ») est édité par :
                            </p>
                            <div className="rounded-2xl bg-[var(--loomina-night)] p-5 sm:p-6 font-sans text-[15px] space-y-2">
                                <p><strong className="text-[var(--text-primary)]">Raison sociale :</strong> Loomina</p>
                                <p><strong className="text-[var(--text-primary)]">Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
                                <p><strong className="text-[var(--text-primary)]">Capital social :</strong> [MONTANT] euros</p>
                                <p><strong className="text-[var(--text-primary)]">Siège social :</strong> [ADRESSE COMPLÈTE]</p>
                                <p><strong className="text-[var(--text-primary)]">RCS :</strong> [VILLE] [NUMÉRO]</p>
                                <p><strong className="text-[var(--text-primary)]">SIRET :</strong> [NUMÉRO]</p>
                                <p><strong className="text-[var(--text-primary)]">TVA intracommunautaire :</strong> [NUMÉRO]</p>
                                <p><strong className="text-[var(--text-primary)]">Email :</strong> <span className="text-[var(--gold-ink)]">contact@loomina.eu</span></p>
                                <p><strong className="text-[var(--text-primary)]">Téléphone :</strong> 01 59 16 93 57</p>
                            </div>
                            <p className="mt-4">
                                <strong className="text-[var(--text-primary)]">Directeur de la publication :</strong> Solal Chetrit, Président
                            </p>
                        </div>

                        {/* Hébergement */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">2. Hébergement</h2>
                            <p className="mb-4">
                                Le Site est hébergé par :
                            </p>
                            <div className="rounded-2xl bg-[var(--loomina-night)] p-5 sm:p-6 font-sans text-[15px] space-y-2">
                                <p><strong className="text-[var(--text-primary)]">Hébergeur :</strong> Vercel Inc.</p>
                                <p><strong className="text-[var(--text-primary)]">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                                <p><strong className="text-[var(--text-primary)]">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">vercel.com</a></p>
                            </div>
                        </div>

                        {/* Propriété intellectuelle */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">3. Propriété Intellectuelle</h2>
                            <p>
                                L’ensemble des éléments composant le Site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.)
                                est la propriété exclusive de Loomina ou de ses partenaires, sauf mention contraire.
                            </p>
                            <p className="mt-4">
                                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du Site,
                                quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Loomina.
                            </p>
                            <p className="mt-4">
                                Toute exploitation non autorisée du Site ou de l’un quelconque des éléments qu’il contient sera considérée comme
                                constitutive d’une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de la Propriété Intellectuelle.
                            </p>
                        </div>

                        {/* Protection des données */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">4. Protection des Données Personnelles</h2>
                            <p>
                                Loomina accorde une grande importance à la protection de vos données personnelles.
                            </p>
                            <p className="mt-4">
                                Les données collectées sur le Site sont traitées conformément au Règlement Général sur la Protection des Données (RGPD)
                                et à la loi Informatique et Libertés.
                            </p>
                            <p className="mt-4">
                                Pour en savoir plus sur la collecte, l’utilisation et la protection de vos données personnelles,
                                consultez notre <Link href="/privacy" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4 font-semibold">Politique de Confidentialité</Link>.
                            </p>
                            <div className="rounded-2xl bg-[var(--loomina-night)] p-5 sm:p-6 font-sans text-[15px] mt-6 space-y-2">
                                <p><strong className="text-[var(--text-primary)]">Responsable du traitement :</strong> Loomina</p>
                                <p><strong className="text-[var(--text-primary)]">Délégué à la Protection des Données (DPO) :</strong> <span className="text-[var(--gold-ink)]">contact@loomina.eu</span></p>
                            </div>
                            <p className="mt-4">
                                Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, de suppression, de limitation,
                                d’opposition et de portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l’adresse :
                                <strong className="text-[var(--gold-ink)]"> contact@loomina.eu</strong>.
                            </p>
                        </div>

                        {/* Cookies */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">5. Cookies</h2>
                            <p>
                                Le Site utilise des cookies pour améliorer l’expérience utilisateur et analyser le trafic.
                            </p>
                            <p className="mt-4">
                                Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur le Site.
                                Les cookies que nous utilisons sont :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li><strong className="text-[var(--text-primary)]">Cookies techniques :</strong> Nécessaires au fonctionnement du Site (session, panier, etc.)</li>
                                <li><strong className="text-[var(--text-primary)]">Cookies analytiques :</strong> Pour mesurer l’audience et améliorer le Site (Google Analytics, etc.)</li>
                            </ul>
                            <p className="mt-4">
                                Nous guidons chaque proche avec un fil rouge simple : un temps d’écoute, un atelier de mise en forme, puis des
                                supports prêts à offrir. L’accueil de la page reflète cette promesse pour rassurer et donner envie d’avancer.
                            </p>
                            <p className="mt-4">
                                Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
                                Toutefois, cela peut affecter certaines fonctionnalités du Site.
                            </p>
                        </div>

                        {/* Responsabilité */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">6. Limitation de Responsabilité</h2>
                            <p>
                                Loomina s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur le Site,
                                mais ne peut garantir l’exactitude, la précision ou l’exhaustivité des informations mises à disposition.
                            </p>
                            <p className="mt-4">
                                Loomina ne saurait être tenue responsable :
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Des interruptions ou dysfonctionnements du Site</li>
                                <li>De l’impossibilité d’accéder au Site</li>
                                <li>Des dommages directs ou indirects résultant de l’utilisation du Site</li>
                                <li>Du contenu des sites tiers vers lesquels le Site pourrait renvoyer</li>
                            </ul>
                        </div>

                        {/* Liens hypertextes */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">7. Liens Hypertextes</h2>
                            <p>
                                Le Site peut contenir des liens hypertextes vers d’autres sites internet.
                                Loomina n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                            </p>
                            <p className="mt-4">
                                La création de liens hypertextes vers le Site est soumise à l’autorisation préalable de Loomina.
                                Pour toute demande, contactez-nous à : <strong className="text-[var(--gold-ink)]">contact@loomina.eu</strong>.
                            </p>
                        </div>

                        {/* Droit applicable */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">8. Droit Applicable et Juridiction Compétente</h2>
                            <p>
                                Les présentes mentions légales sont régies par le droit français.
                            </p>
                            <p className="mt-4">
                                En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
                            </p>
                        </div>

                        {/* Crédits */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">9. Crédits</h2>
                            <p>
                                <strong className="text-[var(--text-primary)]">Conception et développement :</strong> Loomina
                            </p>
                            <p className="mt-2">
                                <strong className="text-[var(--text-primary)]">Design :</strong> Loomina
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="card rounded-3xl p-6 sm:p-8">
                            <h2 className="mb-4 text-[24px] leading-tight tracking-[-0.02em] text-[var(--ink)]">Contact</h2>
                            <p>
                                Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter :
                            </p>
                            <div className="rounded-2xl bg-[var(--loomina-night)] p-5 sm:p-6 font-sans text-[15px] mt-4 space-y-2">
                                <p><strong className="text-[var(--text-primary)]">Email :</strong> <span className="text-[var(--gold-ink)]">contact@loomina.eu</span></p>
                                <p><strong className="text-[var(--text-primary)]">Téléphone :</strong> 01 59 16 93 57</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12 lg:px-24 text-center">
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
