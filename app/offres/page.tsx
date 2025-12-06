export default function Offres() {
    return (
        <div className="bg-[#f2efeb] min-h-screen py-24 px-6">
            <div className="max-w-6xl mx-auto space-y-16">
                <header className="text-center space-y-4 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Formats et accompagnement</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[var(--loomina-burgundy)] leading-tight">Nos offres pour transmettre</h1>
                    <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
                        Deux expériences pour préserver votre histoire : une version numérique vivante ou un livre d'art imprimé, toujours guidés par notre équipe éditoriale.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="bg-white p-10 rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 hover:shadow-xl transition-shadow flex flex-col">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Entretien continu</p>
                        <h3 className="text-2xl font-serif font-bold text-[var(--loomina-burgundy)] mb-2">Écho Numérique</h3>
                        <div className="text-4xl font-bold text-[var(--loomina-text)] mb-6">118 €</div>
                        <p className="text-[var(--loomina-text-light)] mb-6 flex-grow">
                            L'essentiel pour capturer votre voix et vos souvenirs dans un format digital interactif, accessible en permanence par vos proches.
                        </p>
                        <ul className="space-y-3 mb-8 text-[var(--loomina-text)]">
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Jumeau mémoriel illimité avec relances personnalisées</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Entretiens guidés + synthèse mensuelle relue par un éditeur</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Espace privé et chiffré pour partager avec la famille</li>
                        </ul>
                        <button className="w-full py-3 border border-[var(--loomina-burgundy)] text-[var(--loomina-burgundy)] font-medium hover:bg-[var(--loomina-burgundy)] hover:text-white transition-colors">
                            Choisir l'Écho
                        </button>
                    </div>

                    <div className="bg-[#fffbf0] p-10 rounded-lg shadow-xl border-2 border-[var(--loomina-gold)] relative flex flex-col transform md:-translate-y-3">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--loomina-gold)] text-[var(--loomina-burgundy)] px-4 py-1 text-sm font-bold uppercase tracking-widest shadow-sm">
                            Recommandé
                        </div>
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Livre + numérique</p>
                        <h3 className="text-2xl font-serif font-bold text-[var(--loomina-burgundy)] mb-2">Héritage Complet</h3>
                        <div className="text-4xl font-bold text-[var(--loomina-text)] mb-6">248 €</div>
                        <p className="text-[var(--loomina-text-light)] mb-6 flex-grow">
                            L'expérience la plus aboutie : un livre relié, mis en page par notre studio, et un jumeau numérique pour continuer à échanger après l'impression.
                        </p>
                        <ul className="space-y-3 mb-8 text-[var(--loomina-text)]">
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-burgundy)]">✦</span><strong>Livre physique haut de gamme (5 exemplaires)</strong></li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-burgundy)]">✦</span>Direction éditoriale + relectures humaines illimitées</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-burgundy)]">✦</span>Mise en page artistique avec sélection photo et annexes</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-burgundy)]">✦</span>Jumeau mémoriel privé pour prolonger l'histoire</li>
                        </ul>
                        <button className="w-full py-4 bg-[var(--loomina-burgundy)] text-white font-medium hover:brightness-110 transition-all shadow-lg">
                            Commencer l'Héritage
                        </button>
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 p-8 md:p-10">
                    <div className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
                        <div className="space-y-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Services inclus</p>
                            <h2 className="text-3xl font-serif text-[var(--loomina-burgundy)]">Toujours accompagnés, jamais seuls</h2>
                            <p className="text-[var(--loomina-text-light)] leading-relaxed">
                                Chaque offre inclut un interlocuteur dédié, la sécurisation des données en Europe et des points de validation réguliers. Nous adaptons la cadence des entretiens à votre disponibilité et à votre confort.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-[var(--loomina-cream)] rounded-md p-4 border border-[var(--loomina-burgundy)]/10">
                                    <p className="font-semibold text-[var(--loomina-burgundy)]">Coordination éditoriale</p>
                                    <p className="text-[var(--loomina-text-light)] mt-2">Planification, suivi des interviews, propositions de chapitrage et relectures.</p>
                                </div>
                                <div className="bg-[var(--loomina-cream)] rounded-md p-4 border border-[var(--loomina-burgundy)]/10">
                                    <p className="font-semibold text-[var(--loomina-burgundy)]">Support continu</p>
                                    <p className="text-[var(--loomina-text-light)] mt-2">Assistance sous 24h, possibilité d'ajouter des contributeurs familiaux et mise à jour du jumeau mémoriel.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[var(--loomina-burgundy)] text-white rounded-lg p-8 space-y-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Besoin d'un format spécial ?</p>
                            <h3 className="text-2xl font-serif font-semibold">Options sur mesure</h3>
                            <ul className="space-y-3 text-white/85">
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Traduction bilingue ou édition internationale</li>
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Ajout d'archives familiales (audio, photos, lettres)</li>
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Réimpressions ou coffret collector</li>
                            </ul>
                            <a
                                href="mailto:offres@loomina.fr"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-[var(--loomina-burgundy)] font-semibold hover:bg-[var(--loomina-gold-light)] transition"
                            >
                                Discuter d'une adaptation
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
