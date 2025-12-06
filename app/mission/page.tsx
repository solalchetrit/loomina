export default function Mission() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--loomina-cream)] text-[var(--loomina-text)] py-24 px-6">
            <div className="relative max-w-5xl mx-auto space-y-16">
                <header className="space-y-4 text-center md:text-left">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Pourquoi Loomina existe</p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-[var(--loomina-text)]">Garder la lumière allumée, pour toujours</h1>
                    <p className="text-lg text-[var(--loomina-text)] leading-relaxed max-w-3xl">
                        Nous créons des livres et des jumeaux mémoriels qui traversent les décennies. Notre mission est de préserver la voix, les valeurs et les nuances d'une vie, sans jamais trahir l'intention de ceux qui se confient.
                    </p>
                </header>

                <section className="bg-[var(--loomina-cream)] rounded-2xl border border-[var(--loomina-burgundy)]/10 p-8 md:p-10 space-y-6 shadow-lg">
                    <blockquote className="border-l-4 border-[var(--loomina-gold)] pl-6 italic text-2xl text-[var(--loomina-burgundy)]">
                        "Nous ne sommes pas une entreprise technologique. Nous sommes des gardiens de mémoire."
                    </blockquote>
                    <p className="text-[var(--loomina-text)] leading-relaxed text-lg">
                        Loomina est née d'un regret : celui des questions restées en suspens une fois qu'un proche est parti. Nous avons voulu offrir un espace d'écoute infinie, où l'IA amplifie l'attention humaine au lieu de la remplacer.
                    </p>
                    <p className="text-[var(--loomina-text)] leading-relaxed text-lg">
                        Notre promesse est simple : capturer l'authenticité des récits et les transmettre avec la chaleur d'un livre d'art. Chaque projet est géré par une équipe éditoriale qui respecte votre rythme, vos sujets sensibles et votre voix.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-8">
                    {[{
                        title: "Écoute radicale",
                        description: "Des entretiens guidés par IA pour réveiller les souvenirs, toujours supervisés par un rédacteur qui veille au ton et au respect.",
                    }, {
                        title: "Transmission incarnée",
                        description: "Un objet physique à feuilleter, des exemplaires pour la famille et un accès numérique vivant pour que l'histoire continue de s'écrire.",
                    }, {
                        title: "Respect & sécurité",
                        description: "Des données chiffrées, hébergées en Europe, avec un contrôle total sur ce qui est partagé ou détruit à tout moment.",
                    }].map((value, index) => (
                        <div
                            key={index}
                            className="bg-white h-full rounded-2xl border border-[var(--loomina-burgundy)]/10 p-7 space-y-3 shadow-lg"
                        >
                            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Notre boussole</p>
                            <h3 className="text-2xl font-semibold text-[var(--loomina-text)]">{value.title}</h3>
                            <p className="text-[var(--loomina-text)] leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </section>

                <section className="bg-[var(--loomina-cream)] text-[var(--loomina-text)] rounded-2xl p-10 flex flex-col md:flex-row gap-10 items-center border border-[var(--loomina-burgundy)]/10">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Ce qui nous anime</p>
                        <h3 className="text-3xl font-semibold">Allier technologie et humanité</h3>
                        <p className="text-[var(--loomina-text)] leading-relaxed">
                            L'IA permet des heures d'écoute sans fatigue et une capacité d'analyse inégalée. Mais nous restons persuadés qu'aucun algorithme ne remplace l'empathie. C'est pourquoi chaque projet Loomina est suivi par une équipe éditoriale qui relit, réécrit, et s'assure que chaque page sonne juste.
                        </p>
                        <p className="text-[var(--loomina-text)] leading-relaxed">
                            Notre ambition : que votre histoire reste lumineuse, intacte et transmissible, pour ceux qui sont là aujourd'hui et ceux qui viendront demain.
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="bg-white text-[var(--loomina-text)] rounded-2xl shadow-xl p-6 space-y-3 max-w-sm border border-[var(--loomina-burgundy)]/10">
                            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--loomina-burgundy)]">Envie d'en parler ?</p>
                            <p className="text-lg leading-relaxed text-[var(--loomina-text)]">
                                Partagez vos besoins, nous construisons un parcours sur mesure pour vous ou vos proches.
                            </p>
                            <a
                                href="mailto:mission@loomina.fr"
                                className="block text-center w-full px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold hover:brightness-110 transition"
                            >
                                Échanger avec l'équipe
                            </a>
                            <p className="text-sm text-[var(--loomina-text)] text-center">Réponse en moins de 24h, sans engagement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
