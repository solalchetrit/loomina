export default function Offres() {
    return (
        <div className="py-24 px-6 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-5xl font-serif text-[var(--loomina-burgundy)] text-center mb-6">Nos Offres</h1>
                <p className="text-center text-[var(--loomina-text-light)] max-w-2xl mx-auto mb-20 text-lg">
                    Choisissez la manière dont vous souhaitez préserver et transmettre votre histoire.
                </p>

                <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">

                    {/* Écho Numérique */}
                    <div className="bg-white p-10 rounded-sm shadow-md border border-[var(--loomina-burgundy)]/10 hover:shadow-xl transition-shadow flex flex-col">
                        <h3 className="text-2xl font-serif font-bold text-[var(--loomina-burgundy)] mb-4">Écho Numérique</h3>
                        <div className="text-4xl font-bold text-[var(--loomina-text)] mb-6">118 €</div>
                        <p className="text-[var(--loomina-text-light)] mb-8 flex-grow">
                            L'essentiel pour capturer votre voix et vos souvenirs dans un format digital interactif.
                        </p>
                        <ul className="space-y-4 mb-8 text-[var(--loomina-text)]">
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-gold)]">✦</span> Jumeau Mémoriel (IA)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-gold)]">✦</span> Interview illimitée
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-gold)]">✦</span> Accès cloud sécurisé
                            </li>
                        </ul>
                        <button className="w-full py-3 border border-[var(--loomina-burgundy)] text-[var(--loomina-burgundy)] font-medium hover:bg-[var(--loomina-burgundy)] hover:text-white transition-colors">
                            Choisir l'Écho
                        </button>
                    </div>

                    {/* Héritage Complet - Premium */}
                    <div className="bg-[#fffbf0] p-10 rounded-sm shadow-xl border-2 border-[var(--loomina-gold)] relative flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--loomina-gold)] text-[var(--loomina-burgundy)] px-4 py-1 text-sm font-bold uppercase tracking-widest shadow-sm">
                            Recommandé
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-[var(--loomina-burgundy)] mb-4">Héritage Complet</h3>
                        <div className="text-4xl font-bold text-[var(--loomina-text)] mb-6">248 €</div>
                        <p className="text-[var(--loomina-text-light)] mb-8 flex-grow">
                            L'expérience ultime : votre histoire immortalisée dans un livre d'art et un jumeau numérique.
                        </p>
                        <ul className="space-y-4 mb-8 text-[var(--loomina-text)]">
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-burgundy)]">✦</span> <strong>Livre physique haut de gamme</strong>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-burgundy)]">✦</span> Jumeau Mémoriel (IA)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-burgundy)]">✦</span> Mise en page artistique
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-[var(--loomina-burgundy)]">✦</span> 5 exemplaires imprimés
                            </li>
                        </ul>
                        <button className="w-full py-4 bg-[var(--loomina-burgundy)] text-white font-medium hover:brightness-110 transition-all shadow-lg">
                            Commencer l'Héritage
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
