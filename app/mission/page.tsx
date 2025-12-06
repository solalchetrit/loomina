export default function Mission() {
    const pillars = [
        {
            title: "Écoute radicale",
            description: "Des entretiens guidés par IA, toujours supervisés par un rédacteur qui veille au ton et au respect.",
        },
        {
            title: "Transmission incarnée",
            description: "Un objet physique à feuilleter, des exemplaires pour la famille et un accès numérique vivant.",
        },
        {
            title: "Respect & sécurité",
            description: "Données chiffrées, hébergées en Europe, avec un contrôle total sur ce qui est partagé ou détruit.",
        },
    ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--loomina-cloud)] text-[var(--loomina-ink)] px-6 py-24">
            <div className="absolute -top-20 -left-16 h-48 w-48 rounded-full bg-[var(--loomina-amber)]/25 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-[var(--loomina-sand)]/30 blur-3xl" aria-hidden />

            <div className="relative mx-auto flex max-w-5xl flex-col gap-16">
                <header className="space-y-4 text-center md:text-left">
                    <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Pourquoi Loomina existe</p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Garder la lumière allumée, avec simplicité</h1>
                    <p className="text-lg text-[var(--loomina-muted)] leading-relaxed max-w-3xl">
                        Nous épurons le design pour mettre Loomina en avant. Notre mission : préserver la voix, les valeurs et les nuances d'une vie, avec un parcours lisible et des couleurs constantes.
                    </p>
                </header>

                <section className="glow-ring rounded-3xl border border-black/5 bg-white/90 p-8 md:p-10 space-y-6">
                    <blockquote className="border-l-4 border-[var(--loomina-amber-strong)] pl-6 italic text-2xl text-[var(--loomina-ink)]">
                        "Nous ne sommes pas une entreprise technologique. Nous sommes des gardiens de mémoire."
                    </blockquote>
                    <p className="text-[var(--loomina-muted)] leading-relaxed text-lg">
                        Loomina est née d'un regret : celui des questions restées en suspens une fois qu'un proche est parti. Nous avons voulu offrir un espace d'écoute infinie, où l'IA amplifie l'attention humaine au lieu de la remplacer.
                    </p>
                    <p className="text-[var(--loomina-muted)] leading-relaxed text-lg">
                        Notre promesse est simple : capturer l'authenticité des récits et les transmettre avec la chaleur d'un livre d'art. Chaque projet est géré par une équipe éditoriale qui respecte votre rythme, vos sujets sensibles et votre voix.
                    </p>
                </section>

                <section className="grid gap-8 md:grid-cols-3">
                    {pillars.map((value) => (
                        <div key={value.title} className="glow-ring h-full rounded-2xl border border-black/5 bg-white/90 p-7 space-y-3">
                            <p className="text-xs uppercase tracking-[0.26em] text-[var(--loomina-amber-strong)] font-semibold">Notre boussole</p>
                            <h3 className="text-2xl font-semibold text-[var(--loomina-ink)]">{value.title}</h3>
                            <p className="text-[var(--loomina-muted)] leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </section>

                <section className="glow-ring flex flex-col items-center gap-10 rounded-3xl border border-black/5 bg-white/90 p-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.28em] text-[var(--loomina-amber-strong)] font-semibold">Ce qui nous anime</p>
                        <h3 className="text-3xl font-semibold">Allier technologie et humanité</h3>
                        <p className="text-[var(--loomina-muted)] leading-relaxed">
                            L'IA permet des heures d'écoute sans fatigue et une capacité d'analyse inégalée. Mais nous restons persuadés qu'aucun algorithme ne remplace l'empathie. Chaque projet Loomina est suivi par une équipe éditoriale qui relit, réécrit et s'assure que chaque page sonne juste.
                        </p>
                        <p className="text-[var(--loomina-muted)] leading-relaxed">
                            Notre ambition : que votre histoire reste lumineuse, intacte et transmissible, pour ceux qui sont là aujourd'hui et ceux qui viendront demain.
                        </p>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="glow-ring max-w-sm space-y-3 rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-6">
                            <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[var(--loomina-ink)]">Envie d'en parler ?</p>
                            <p className="text-lg leading-relaxed text-[var(--loomina-muted)]">
                                Partagez vos besoins, nous construisons un parcours sur mesure pour vous ou vos proches.
                            </p>
                            <a
                                href="mailto:mission@loomina.fr"
                                className="block w-full rounded-full bg-[var(--loomina-amber)] px-5 py-3 text-center font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
                            >
                                Échanger avec l'équipe
                            </a>
                            <p className="text-sm text-[var(--loomina-muted)] text-center">Réponse en moins de 24h, sans engagement.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
