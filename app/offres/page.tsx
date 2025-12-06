export default function Offres() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--loomina-text)] py-24 px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.14),transparent_35%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_30%)]" />
            <div className="relative max-w-6xl mx-auto space-y-16">
                <header className="text-center space-y-4 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Formats et accompagnement</p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white">Nos offres pour transmettre</h1>
                    <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
                        Deux expériences pour préserver votre histoire : une version numérique vivante ou un livre d'art imprimé, toujours guidés par notre équipe éditoriale.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-2xl shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] hover:border-[var(--loomina-gold)]/40 transition-colors flex flex-col">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Entretien continu</p>
                        <h3 className="text-2xl font-semibold text-white mb-2">Écho Numérique</h3>
                        <div className="text-4xl font-bold text-[var(--loomina-gold)] mb-6">118 €</div>
                        <p className="text-[var(--loomina-text-light)] mb-6 flex-grow">
                            L'essentiel pour capturer votre voix et vos souvenirs dans un format digital interactif, accessible en permanence par vos proches.
                        </p>
                        <ul className="space-y-3 mb-8 text-white/90">
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Jumeau mémoriel illimité avec relances personnalisées</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Entretiens guidés + synthèse mensuelle relue par un éditeur</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold)]">✦</span>Espace privé et chiffré pour partager avec la famille</li>
                        </ul>
                        <button className="w-full py-3 rounded-full border border-[var(--loomina-gold)] text-white font-medium hover:bg-[var(--loomina-gold)]/15 transition-colors">
                            Choisir l'Écho
                        </button>
                    </div>

                    <div className="relative bg-gradient-to-br from-[#120f26]/90 via-[#11182d]/80 to-[#0a1224]/90 p-10 rounded-2xl border border-[var(--loomina-gold)]/60 shadow-[0_25px_80px_-45px_rgba(34,211,238,0.8)] flex flex-col">
                        <div className="absolute -inset-x-6 -top-6 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.2),transparent_60%)] blur-3xl" />
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 bg-[var(--loomina-gold)] text-[#051226] px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] rounded-full shadow-lg">
                                ✦ Recommandé
                            </div>
                            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Livre + numérique</p>
                            <h3 className="text-2xl font-semibold text-white mb-2">Héritage Complet</h3>
                            <div className="text-4xl font-bold text-[var(--loomina-gold-light)] mb-6">248 €</div>
                        </div>
                        <p className="text-[var(--loomina-text-light)] mb-6 flex-grow">
                            L'expérience la plus aboutie : un livre relié, mis en page par notre studio, et un jumeau numérique pour continuer à échanger après l'impression.
                        </p>
                        <ul className="space-y-3 mb-8 text-white/90">
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold-light)]">✦</span><strong>Livre physique haut de gamme (5 exemplaires)</strong></li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold-light)]">✦</span>Direction éditoriale + relectures humaines illimitées</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold-light)]">✦</span>Mise en page artistique avec sélection photo et annexes</li>
                            <li className="flex items-start gap-3"><span className="text-[var(--loomina-gold-light)]">✦</span>Jumeau mémoriel privé pour prolonger l'histoire</li>
                        </ul>
                        <button className="relative w-full py-4 rounded-full bg-[var(--loomina-gold)] text-[#051226] font-semibold hover:brightness-110 transition-all shadow-[0_18px_45px_-35px_rgba(34,211,238,0.9)]">
                            Commencer l'Héritage
                        </button>
                    </div>
                </section>

                <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.7)]">
                    <div className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-start">
                        <div className="space-y-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Services inclus</p>
                            <h2 className="text-3xl font-semibold text-[var(--loomina-text)]">Toujours accompagnés, jamais seuls</h2>
                            <p className="text-[var(--loomina-text-light)] leading-relaxed">
                                Chaque offre inclut un interlocuteur dédié, la sécurisation des données en Europe et des points de validation réguliers. Nous adaptons la cadence des entretiens à votre disponibilité et à votre confort.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-white rounded-lg p-4 border border-[var(--loomina-burgundy)]/10 shadow-sm">
                                    <p className="font-semibold text-[var(--loomina-text)]">Coordination éditoriale</p>
                                    <p className="text-[var(--loomina-text-light)] mt-2">Planification, suivi des interviews, propositions de chapitrage et relectures.</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-[var(--loomina-burgundy)]/10 shadow-sm">
                                    <p className="font-semibold text-[var(--loomina-text)]">Support continu</p>
                                    <p className="text-[var(--loomina-text-light)] mt-2">Assistance sous 24h, possibilité d'ajouter des contributeurs familiaux et mise à jour du jumeau mémoriel.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#ffe5da] via-[#fff3ec] to-[#e9fbf5] text-[var(--loomina-text)] rounded-2xl p-8 space-y-4 border border-[var(--loomina-burgundy)]/10">
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Besoin d'un format spécial ?</p>
                            <h3 className="text-2xl font-semibold">Options sur mesure</h3>
                            <ul className="space-y-3 text-[var(--loomina-text-light)]">
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-burgundy)]">✦</span>Traduction bilingue ou édition internationale</li>
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-burgundy)]">✦</span>Ajout d'archives familiales (audio, photos, lettres)</li>
                                <li className="flex gap-3 items-start"><span className="text-[var(--loomina-burgundy)]">✦</span>Réimpressions ou coffret collector</li>
                            </ul>
                            <a
                                href="mailto:offres@loomina.fr"
                                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold hover:bg-[var(--loomina-burgundy-dark)] transition"
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
