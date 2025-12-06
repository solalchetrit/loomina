export default function Accompagnement() {
    const steps = [
        {
            step: "Étape 1",
            title: "Découverte et cadrage",
            description: "Un premier rendez-vous pour cerner vos attentes et définir les voix à interviewer. Nous dessinons le fil rouge du récit.",
            bullets: [
                "Analyse des sujets sensibles et du ton à adopter",
                "Plan d'entretien personnalisé et calendrier partagé",
            ],
        },
        {
            step: "Étape 2",
            title: "Collecte guidée par IA",
            description: "Votre jumeau mémoriel écoute sans relâche et relance avec délicatesse. Chaque session est supervisée par un rédacteur.",
            bullets: [
                "Questions adaptatives en fonction de vos réponses",
                "Transcription sécurisée et vérification humaine",
            ],
        },
        {
            step: "Étape 3",
            title: "Écriture et mise en forme",
            description: "Un auteur transforme les entretiens en un récit fluide. Nous ajustons les photos et la voix narrative avec vous.",
            bullets: [
                "Mise en page artisanale et palette personnalisée",
                "Validation itérative avant impression",
            ],
        },
        {
            step: "Étape 4",
            title: "Transmission vivante",
            description: "Livre imprimé, jumeau mémoriel et contributions familiales possibles. Nous restons disponibles pour enrichir l'histoire.",
            bullets: [
                "Livraison suivie et service de réimpression à la demande",
                "Accès privé pour les proches avec droits paramétrables",
            ],
        },
    ];

    const guarantees = [
        {
            title: "Accompagnement humain",
            content: "Un interlocuteur dédié qui répond en moins de 24h et suit l'avancée de votre projet.",
        },
        {
            title: "Sécurité & droits",
            content: "Données stockées en Europe, partage contrôlé et possibilité de suppression complète sur simple demande.",
        },
        {
            title: "Finitions sur mesure",
            content: "Papier, reliure, photos et annexes choisis avec vous pour un livre vraiment à votre image.",
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--loomina-cloud)] text-[var(--loomina-ink)] px-6 py-20">
            <div className="absolute -top-14 right-10 h-40 w-40 rounded-full bg-[var(--loomina-amber)]/30 blur-3xl" aria-hidden />
            <div className="absolute bottom-0 left-6 h-48 w-48 rounded-full bg-[var(--loomina-sand)]/30 blur-3xl" aria-hidden />

            <div className="relative mx-auto max-w-6xl space-y-16">
                <header className="text-center space-y-6 max-w-3xl mx-auto">
                    <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Une présence humaine renforcée par l'IA</p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Un accompagnement complet pour raconter et préserver votre histoire</h1>
                    <p className="text-lg text-[var(--loomina-muted)] leading-relaxed">
                        Nous simplifions chaque écran pour que Loomina soit lisible partout : mêmes boutons, mêmes couleurs, et un chemin clair de la première conversation jusqu'au livre entre vos mains.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-10">
                    {steps.map((block) => (
                        <div
                            key={block.step}
                            className="glow-ring h-full rounded-2xl border border-black/5 bg-white/90 p-8 space-y-4"
                        >
                            <p className="text-sm uppercase tracking-[0.26em] text-[var(--loomina-amber-strong)] font-semibold">{block.step}</p>
                            <h2 className="text-2xl font-semibold text-[var(--loomina-ink)]">{block.title}</h2>
                            <p className="text-[var(--loomina-muted)] leading-relaxed">{block.description}</p>
                            <ul className="space-y-2 text-[var(--loomina-muted)]">
                                {block.bullets.map((item) => (
                                    <li key={item} className="flex gap-3 items-start">
                                        <span className="text-[var(--loomina-amber-strong)]">✦</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                <section className="glow-ring flex flex-col gap-8 rounded-3xl border border-black/5 bg-white/90 p-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Ce que nous garantissons</p>
                        <h3 className="text-3xl font-semibold">Confidentialité, patience et soin éditorial</h3>
                        <p className="text-[var(--loomina-muted)] leading-relaxed">
                            Les souvenirs sont précieux. Nous chiffrons vos données, limitons les accès et appliquons des règles de confidentialité strictes. Chaque récit est lu et relu par un humain avant publication.
                        </p>
                        <div className="grid gap-4 text-sm md:grid-cols-3">
                            {guarantees.map((item) => (
                                <div key={item.title} className="glow-ring rounded-xl border border-black/5 bg-[var(--loomina-cloud)] p-4 shadow-sm">
                                    <p className="font-semibold text-[var(--loomina-ink)]">{item.title}</p>
                                    <p className="text-[var(--loomina-muted)] mt-2 leading-relaxed">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="glow-ring max-w-sm space-y-3 rounded-2xl border border-black/5 bg-white p-6">
                            <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[var(--loomina-ink)]">Vous lancer</p>
                            <p className="text-lg leading-relaxed text-[var(--loomina-muted)]">
                                Planifions une session découverte pour identifier la meilleure façon de préserver votre héritage.
                            </p>
                            <a
                                href="mailto:contact@loomina.fr"
                                className="block text-center w-full rounded-full bg-[var(--loomina-amber)] px-5 py-3 font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
                            >
                                Écrire à l'équipe
                            </a>
                            <p className="text-sm text-[var(--loomina-muted)] text-center">Réponse en moins de 24h, sans engagement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
