export default function Accompagnement() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--loomina-cream)] text-[var(--loomina-text)] py-20 px-6">
            <div className="relative max-w-6xl mx-auto space-y-16">
                <header className="text-center space-y-6 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Une présence humaine renforcée par l'IA</p>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[var(--loomina-text)] leading-tight">
                        Un accompagnement complet pour raconter et préserver votre histoire
                    </h1>
                    <p className="text-lg text-[var(--loomina-text)] leading-relaxed">
                        De la première conversation au livre entre vos mains, Loomina coordonne l'écoute, l'écriture et la transmission numérique pour que chaque détail reste vivant.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-10">
                    {[{
                        step: "Étape 1",
                        title: "Découverte et cadrage",
                        description: "Un premier rendez-vous pour cerner vos attentes, comprendre les événements clés à documenter et définir les voix à interviewer. Nous construisons ensemble le fil rouge de votre récit.",
                        bullets: [
                            "Analyse des sujets sensibles et du ton à adopter",
                            "Plan d'entretien personnalisé et calendrier partagé",
                        ],
                    }, {
                        step: "Étape 2",
                        title: "Collecte guidée par IA",
                        description: "Votre jumeau mémoriel écoute sans relâche, relance avec délicatesse et organise les souvenirs. Chaque session est supervisée par un rédacteur pour garantir chaleur et cohérence.",
                        bullets: [
                            "Questions adaptatives en fonction de vos réponses",
                            "Transcription sécurisée et vérification humaine",
                        ],
                    }, {
                        step: "Étape 3",
                        title: "Écriture et mise en forme",
                        description: "Un auteur transforme les entretiens en un récit fluide, chapitre après chapitre. Nous vous partageons des épreuves pour ajuster les détails, les photos et la voix narrative.",
                        bullets: [
                            "Mise en page artisanale et palette personnalisée",
                            "Validation itérative avant impression",
                        ],
                    }, {
                        step: "Étape 4",
                        title: "Transmission vivante",
                        description: "Vous recevez vos exemplaires imprimés ainsi que l'accès au jumeau mémoriel. Nous restons disponibles pour ajouter de nouveaux chapitres ou intégrer des contributions familiales.",
                        bullets: [
                            "Livraison suivie et service de réimpression à la demande",
                            "Accès privé pour les proches avec droits paramétrables",
                        ],
                    }].map((block, index) => (
                        <div
                            key={index}
                            className="bg-[var(--loomina-cream)] rounded-2xl border border-[var(--loomina-burgundy)]/10 p-8 space-y-4 shadow-lg"
                        >
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">{block.step}</p>
                            <h2 className="text-2xl font-semibold text-[var(--loomina-burgundy)]">{block.title}</h2>
                            <p className="text-[var(--loomina-text)] leading-relaxed">{block.description}</p>
                            <ul className="space-y-2 text-[var(--loomina-text)]">
                                {block.bullets.map((item, bulletIndex) => (
                                    <li key={bulletIndex} className="flex gap-3 items-start">
                                        <span className="text-[var(--loomina-gold)]">✦</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <section className="bg-[var(--loomina-cream)] text-[var(--loomina-text)] rounded-2xl p-10 flex flex-col md:flex-row gap-8 items-center border border-[var(--loomina-burgundy)]/10">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Ce que nous garantissons</p>
                        <h3 className="text-3xl font-semibold">Confidentialité, patience et soin éditorial</h3>
                        <p className="text-[var(--loomina-text)] leading-relaxed">
                            Les souvenirs sont précieux. Nous chiffrons vos données, limitons les accès et appliquons des règles de confidentialité strictes. Chaque récit est lu et relu par un humain avant publication.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            {[{
                                title: "Accompagnement humain",
                                content: "Un interlocuteur dédié qui répond en moins de 24h et suit l'avancée de votre projet.",
                            }, {
                                title: "Sécurité & droits",
                                content: "Données stockées en Europe, partage contrôlé et possibilité de suppression complète sur simple demande.",
                            }, {
                                title: "Finitions sur mesure",
                                content: "Papier, reliure, photos et annexes choisis avec vous pour un livre vraiment à votre image.",
                            }].map((item, cardIndex) => (
                                <div key={cardIndex} className="bg-white border border-[var(--loomina-burgundy)]/10 rounded-lg p-4 shadow-sm">
                                    <p className="font-semibold text-[var(--loomina-text)]">{item.title}</p>
                                    <p className="text-[var(--loomina-text)] mt-2">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="bg-white text-[var(--loomina-text)] rounded-2xl shadow-2xl p-6 space-y-3 max-w-sm">
                            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--loomina-burgundy)]">Vous lancer</p>
                            <p className="text-lg leading-relaxed text-[var(--loomina-text)]">
                                Planifions une session découverte pour identifier la meilleure façon de préserver votre héritage.
                            </p>
                            <a
                                href="mailto:contact@loomina.fr"
                                className="block text-center w-full px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold hover:brightness-110 transition"
                            >
                                Écrire à l'équipe
                            </a>
                            <p className="text-sm text-[var(--loomina-text)] text-center">Réponse en moins de 24h, sans engagement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
