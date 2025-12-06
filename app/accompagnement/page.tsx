export default function Accompagnement() {
    return (
        <div className="bg-[#f2efeb] min-h-screen py-20 px-6 text-[var(--loomina-text)]">
            <div className="max-w-6xl mx-auto space-y-16">
                <header className="text-center space-y-6 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Une présence humaine renforcée par l'IA</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-[var(--loomina-burgundy)] leading-tight">
                        Un accompagnement complet pour raconter et préserver votre histoire
                    </h1>
                    <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
                        De la première conversation au livre entre vos mains, Loomina coordonne l'écoute, l'écriture et la transmission numérique pour que chaque détail reste vivant.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-10">
                    <div className="bg-white rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 p-8 space-y-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Étape 1</p>
                        <h2 className="text-2xl font-serif text-[var(--loomina-burgundy)]">Découverte et cadrage</h2>
                        <p className="text-[var(--loomina-text-light)] leading-relaxed">
                            Un premier rendez-vous pour cerner vos attentes, comprendre les événements clés à documenter et définir les voix à interviewer. Nous construisons ensemble le fil rouge de votre récit.
                        </p>
                        <ul className="space-y-2 text-[var(--loomina-text)]">
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Analyse des sujets sensibles et du ton à adopter</li>
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Plan d'entretien personnalisé et calendrier partagé</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 p-8 space-y-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Étape 2</p>
                        <h2 className="text-2xl font-serif text-[var(--loomina-burgundy)]">Collecte guidée par IA</h2>
                        <p className="text-[var(--loomina-text-light)] leading-relaxed">
                            Votre jumeau mémoriel écoute sans relâche, relance avec délicatesse et organise les souvenirs. Chaque session est supervisée par un rédacteur pour garantir chaleur et cohérence.
                        </p>
                        <ul className="space-y-2 text-[var(--loomina-text)]">
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Questions adaptatives en fonction de vos réponses</li>
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Transcription sécurisée et vérification humaine</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 p-8 space-y-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Étape 3</p>
                        <h2 className="text-2xl font-serif text-[var(--loomina-burgundy)]">Écriture et mise en forme</h2>
                        <p className="text-[var(--loomina-text-light)] leading-relaxed">
                            Un auteur transforme les entretiens en un récit fluide, chapitre après chapitre. Nous vous partageons des épreuves pour ajuster les détails, les photos et la voix narrative.
                        </p>
                        <ul className="space-y-2 text-[var(--loomina-text)]">
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Mise en page artisanale et palette personnalisée</li>
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Validation itérative avant impression</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-[var(--loomina-burgundy)]/10 p-8 space-y-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">Étape 4</p>
                        <h2 className="text-2xl font-serif text-[var(--loomina-burgundy)]">Transmission vivante</h2>
                        <p className="text-[var(--loomina-text-light)] leading-relaxed">
                            Vous recevez vos exemplaires imprimés ainsi que l'accès au jumeau mémoriel. Nous restons disponibles pour ajouter de nouveaux chapitres ou intégrer des contributions familiales.
                        </p>
                        <ul className="space-y-2 text-[var(--loomina-text)]">
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Livraison suivie et service de réimpression à la demande</li>
                            <li className="flex gap-3 items-start"><span className="text-[var(--loomina-gold)]">✦</span>Accès privé pour les proches avec droits paramétrables</li>
                        </ul>
                    </div>
                </section>

                <section className="bg-[var(--loomina-burgundy)] text-white rounded-lg p-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">Ce que nous garantissons</p>
                        <h3 className="text-3xl font-serif font-semibold">Confidentialité, patience et soin éditorial</h3>
                        <p className="text-white/80 leading-relaxed">
                            Les souvenirs sont précieux. Nous chiffrons vos données, limitons les accès et appliquons des règles de confidentialité strictes. Chaque récit est lu et relu par un humain avant publication.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white/10 border border-white/10 rounded-md p-4">
                                <p className="font-semibold">Accompagnement humain</p>
                                <p className="text-white/80 mt-2">Un interlocuteur dédié qui répond en moins de 24h et suit l'avancée de votre projet.</p>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-md p-4">
                                <p className="font-semibold">Sécurité & droits</p>
                                <p className="text-white/80 mt-2">Données stockées en Europe, partage contrôlé et possibilité de suppression complète sur simple demande.</p>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-md p-4">
                                <p className="font-semibold">Finitions sur mesure</p>
                                <p className="text-white/80 mt-2">Papier, reliure, photos et annexes choisis avec vous pour un livre vraiment à votre image.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="bg-white text-[var(--loomina-burgundy)] rounded-lg shadow-lg p-6 space-y-3 max-w-sm">
                            <p className="text-sm uppercase tracking-[0.2em] font-semibold">Vous lancer</p>
                            <p className="text-lg leading-relaxed">
                                Planifions une session découverte pour identifier la meilleure façon de préserver votre héritage.
                            </p>
                            <a
                                href="mailto:contact@loomina.fr"
                                className="block text-center w-full px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold hover:brightness-110 transition"
                            >
                                Écrire à l'équipe
                            </a>
                            <p className="text-sm text-[var(--loomina-text-light)] text-center">Réponse en moins de 24h, sans engagement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
