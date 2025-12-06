const offers = [
    {
        title: "Édition Signature",
        badge: "Livre & digital",
        price: "222 €",
        description:
            "Votre histoire prend forme dans un livre imprimé et une version numérique animée. Vous êtes accompagné de la prise de notes jusqu'à la mise en page finale.",
        highlights: [
            "6 exemplaires imprimés en Finition Premium",
            "Direction éditoriale et relectures humaines illimitées",
            "Mise en page artisanale avec photos et couverture sur mesure",
            "Accès privé au jumeau mémoriel numérique pour continuer à transmettre",
        ],
        cta: "Préparer mon livre",
    },
    {
        title: "Écho Numérique",
        badge: "Entretien continu",
        price: "118 €",
        description:
            "L'essentiel pour démarrer : un journal interactif guidé, des relances personnalisées et un espace sécurisé à partager avec vos proches.",
        highlights: [
            "Entretiens guidés avec synthèse mensuelle",
            "Relances intelligentes pour ne rien oublier",
            "Espace privé et chiffré pour la famille",
        ],
        cta: "Choisir l'option numérique",
    },
];

const essentials = [
    {
        title: "Accompagnement humain",
        text: "Un interlocuteur unique pour planifier, interviewer, relire et vous conseiller à chaque étape.",
    },
    {
        title: "Sérénité juridique",
        text: "Données hébergées en Europe, confidentialité contractuelle et sauvegardes régulières.",
    },
    {
        title: "Esthétique soignée",
        text: "Choix typographiques et retouches légères pour un rendu élégant et cohérent.",
    },
    {
        title: "Transmission durable",
        text: "Formats imprimés et numériques pensés pour traverser le temps et se partager facilement en famille.",
    },
];

export default function Offres() {
    return (
        <div className="min-h-screen bg-[var(--loomina-cloud)] text-[var(--loomina-ink)]">
            <div className="relative mx-auto max-w-6xl px-6 py-20 space-y-16">
                <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-[var(--loomina-amber)]/22 blur-3xl" aria-hidden />
                <header className="text-center space-y-4 max-w-3xl mx-auto">
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[var(--loomina-amber-strong)] font-semibold">
                        Offres Loomina
                    </p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Vos souvenirs, mis en beauté</h1>
                    <p className="text-lg leading-relaxed text-[var(--loomina-muted)]">
                        Deux offres, un même design apaisé. Palette constante, boutons doux, et explications courtes pour comprendre immédiatement votre accompagnement.
                    </p>
                </header>

                <section className="grid md:grid-cols-2 gap-8">
                    {offers.map((offer, index) => (
                        <div
                            key={offer.title}
                            className={`glow-ring relative overflow-hidden rounded-3xl border border-black/5 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${
                                index === 0 ? "bg-[var(--loomina-ink)] text-[var(--loomina-cloud)]" : "bg-white/90"
                            }`}
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] rounded-full border ${
                                            index === 0
                                                ? "bg-white/10 border-white/20 text-[var(--loomina-cloud)]"
                                                : "bg-[var(--loomina-cloud)] border-black/6 text-[var(--loomina-ink)]"
                                        }`}
                                    >
                                        ✦ {offer.badge}
                                    </span>
                                    <span className={`text-sm font-semibold ${index === 0 ? "text-[var(--loomina-amber)]" : "text-[var(--loomina-amber-strong)]"}`}>
                                        Accompagnement dédié
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold">{offer.title}</h3>
                                    <p className={`text-sm uppercase tracking-[0.18em] font-semibold ${index === 0 ? "text-[var(--loomina-amber)]" : "text-[var(--loomina-amber-strong)]"}`}>
                                        Offre claire
                                    </p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-[var(--loomina-amber)]">{offer.price}</span>
                                    {index === 0 && (
                                        <span className="text-xs uppercase tracking-[0.24em] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                            Livre + numérique
                                        </span>
                                    )}
                                </div>
                                <p className={`leading-relaxed ${index === 0 ? "text-[var(--loomina-cloud)]/80" : "text-[var(--loomina-muted)]"}`}>
                                    {offer.description}
                                </p>
                                <ul className="space-y-3 text-sm">
                                    {offer.highlights.map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <span className={`mt-1 h-2 w-2 rounded-full ${index === 0 ? "bg-[var(--loomina-amber)]" : "bg-[var(--loomina-amber-strong)]"}`} />
                                            <span className={`${index === 0 ? "text-[var(--loomina-cloud)]" : "text-[var(--loomina-ink)]"}`}>
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={`p-8 border-t ${index === 0 ? "border-white/10" : "border-black/5"}`}>
                                <button
                                    className={`w-full py-4 rounded-full font-semibold transition-all shadow-md ${
                                        index === 0
                                            ? "bg-[var(--loomina-amber)] text-[var(--loomina-ink)] hover:brightness-110"
                                            : "bg-[var(--loomina-ink)] text-[var(--loomina-cloud)] hover:-translate-y-[1px]"
                                    }`}
                                >
                                    {offer.cta}
                                </button>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid lg:grid-cols-[1.2fr,0.9fr] gap-10 items-center bg-white/90 rounded-3xl p-10 border border-black/5 glow-ring">
                    <div className="space-y-6">
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)] font-semibold">Ce qui ne change pas</p>
                        <h2 className="text-3xl font-semibold">Chaque projet est suivi par des humains</h2>
                        <p className="text-[var(--loomina-muted)] leading-relaxed">
                            Nous construisons votre récit avec vous : préparation des interviews, validation des chapitres, harmonisation du ton et des photos. Vous gardez la main à chaque étape.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {essentials.map((item) => (
                                <div
                                    key={item.title}
                                    className="glow-ring rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-4"
                                >
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-[var(--loomina-muted)] mt-2 leading-relaxed">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="glow-ring rounded-3xl bg-[var(--loomina-ink)] text-[var(--loomina-cloud)] p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute -top-10 -left-6 h-28 w-28 rounded-full bg-[var(--loomina-amber)]/30 blur-3xl" aria-hidden />
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-amber)] font-semibold">Témoignage</p>
                        <blockquote className="text-xl leading-relaxed">
                            "Je me suis sentie prise en main, sans jamais perdre ma voix. Le livre ressemble à ce que j'aurais rêvé transmettre à mes enfants."
                        </blockquote>
                        <div className="space-y-1">
                            <p className="font-semibold">Françoise, 68 ans</p>
                            <p className="text-sm text-[var(--loomina-amber)]">Projet terminé en 6 semaines</p>
                        </div>
                        <a
                            href="mailto:offres@loomina.fr"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-amber)] text-[var(--loomina-ink)] font-semibold hover:brightness-110 transition shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)]"
                        >
                            Parler avec l'équipe éditoriale
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
