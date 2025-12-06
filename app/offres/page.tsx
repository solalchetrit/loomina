import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Offre unique Loomina | Livre & accompagnement numérique",
    description:
        "Une offre simple : livre imprimé et version numérique sécurisée, accompagnés par l'équipe Loomina pour transmettre vos souvenirs.",
};

const offer = {
    title: "Lumina, livre & numérique",
    badge: "Offre unique",
    price: "222 €",
    originalPrice: "279 €",
    description:
        "Une formule claire : interviews guidés, réécriture avec votre voix, maquette artisanale et diffusion numérique sécurisée.",
    highlights: [
        "5 exemplaires imprimés inclus (papier premium)",
        "Co-écriture et relectures illimitées avec l'équipe Loomina",
        "Mise en page lumineuse avec vos photos retouchées",
        "Version numérique protégée et prête à partager",
    ],
    cta: "Préparer mon livre Lumina",
};

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

const buildOfferMailto = (title: string) => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(
        "Je souhaite en savoir plus sur l'offre " +
            title +
            ". Pouvez-vous m'indiquer les prochaines disponibilités ?",
    );

    return `mailto:contact@loomina.fr?subject=${subject}&body=${body}`;
};

export default function Offres() {
    return (
        <div className="min-h-screen bg-[var(--loomina-cloud)] text-[var(--loomina-ink)]">
            <div className="relative mx-auto max-w-6xl px-6 py-20 space-y-16">
                <div className="absolute -top-24 -right-10 h-48 w-48 rounded-full bg-[var(--loomina-amber)]/22 blur-3xl" aria-hidden />
                <header className="text-center space-y-4 max-w-3xl mx-auto">
                    <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[var(--loomina-amber-strong)] font-semibold">
                        Offre unique Loomina
                    </p>
                    <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Lumina : un seul parcours, tout compris</h1>
                    <p className="text-lg leading-relaxed text-[var(--loomina-muted)]">
                        Nous avons simplifié l'expérience : une seule offre, la même exigence éditoriale et une livraison qui inclut le livre imprimé et sa version numérique protégée.
                    </p>
                </header>

                <section className="grid md:grid-cols-[1.15fr,0.85fr] gap-8 items-start">
                    <div className="glow-ring relative overflow-hidden rounded-3xl border border-black/5 flex flex-col h-full bg-[var(--loomina-ink)] text-[var(--loomina-cloud)]">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] rounded-full border bg-white/10 border-white/20 text-[var(--loomina-cloud)]">
                                    ✦ {offer.badge}
                                </span>
                                <span className="text-sm font-semibold text-[var(--loomina-amber)]">Accompagnement dédié</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold">{offer.title}</h3>
                                <p className="text-sm uppercase tracking-[0.18em] font-semibold text-[var(--loomina-amber)]">Offre claire</p>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-bold text-[var(--loomina-amber)]">{offer.price}</span>
                                <span className="text-sm text-[var(--loomina-cloud)]/70 line-through">{offer.originalPrice}</span>
                                <span className="text-xs uppercase tracking-[0.24em] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                                    Livre + numérique
                                </span>
                            </div>
                            <p className="leading-relaxed text-[var(--loomina-cloud)]/80">{offer.description}</p>
                            <ul className="space-y-3 text-sm">
                                {offer.highlights.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber)]" />
                                        <span className="text-[var(--loomina-cloud)]">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-8 border-t border-white/10">
                            <a
                                href={buildOfferMailto(offer.title)}
                                className="block text-center w-full py-4 rounded-full font-semibold transition-all shadow-md bg-[var(--loomina-amber)] text-[var(--loomina-ink)] hover:brightness-110"
                            >
                                {offer.cta}
                            </a>
                        </div>
                    </div>

                    <div className="glow-ring rounded-3xl bg-white/90 border border-black/5 p-8 space-y-6 h-full flex flex-col">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--loomina-cloud)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--loomina-ink)] border border-black/5">
                            Inclus dans Lumina
                        </div>
                        <h3 className="text-2xl font-semibold">Ce que vous recevez</h3>
                        <p className="text-[var(--loomina-muted)] leading-relaxed">
                            De la première prise de notes à la remise des exemplaires, l'équipe Loomina reste votre interlocuteur unique. Nous gérons les interviews, la rédaction, la maquette et la version numérique sécurisée.
                        </p>
                        <ul className="space-y-3 text-sm text-[var(--loomina-ink)]">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                                <span>Calendrier partagé et relances douces pour rester serein.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                                <span>Relectures humaines illimitées jusqu'à validation finale.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--loomina-amber-strong)]" />
                                <span>Guide de partage familial pour offrir le livre et le lien numérique.</span>
                            </li>
                        </ul>
                        <div className="mt-auto inline-flex items-center gap-2 rounded-full bg-[var(--loomina-cloud)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--loomina-ink)] border border-black/5">
                            Réponse sous 48h · Impression incluse
                        </div>
                    </div>
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
                            href="mailto:contact@loomina.fr?subject=Discuter%20de%20mon%20projet%20Loomina"
                            className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-amber)] text-[var(--loomina-ink)] font-semibold hover:brightness-110 transition shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)]"
                        >
                            Parler avec l'équipe éditoriale
                        </a>
                    </div>
                </section>

                <section className="glow-ring rounded-3xl border border-black/5 bg-white/90 p-8 space-y-6">
                    <div className="flex flex-col gap-2 text-center md:text-left md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.24em] text-[var(--loomina-amber-strong)] font-semibold">
                                Infos pratiques
                            </p>
                            <h2 className="text-2xl font-semibold text-[var(--loomina-ink)]">
                                Ce qui est inclus dès le premier échange
                            </h2>
                        </div>
                        <p className="text-sm text-[var(--loomina-muted)] max-w-xl">
                            Nous précisons le planning, les droits et les livrables avant de commencer pour éviter toute zone d'ombre.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-4 space-y-2">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--loomina-amber-strong)] font-semibold">
                                Délais maîtrisés
                            </p>
                            <p className="text-[var(--loomina-ink)] font-semibold">Calendrier partagé</p>
                            <p className="text-[var(--loomina-muted)] text-sm leading-relaxed">
                                Dates d'interviews, validation des chapitres et remise des épreuves alignées dès la prise de brief.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-4 space-y-2">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--loomina-amber-strong)] font-semibold">
                                Support continu
                            </p>
                            <p className="text-[var(--loomina-ink)] font-semibold">Réponse en moins de 24h</p>
                            <p className="text-[var(--loomina-muted)] text-sm leading-relaxed">
                                Un interlocuteur unique pour l'ensemble des étapes, disponible par e-mail ou visio.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] p-4 space-y-2">
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--loomina-amber-strong)] font-semibold">
                                Transparence juridique
                            </p>
                            <p className="text-[var(--loomina-ink)] font-semibold">Contrat et droits d'usage</p>
                            <p className="text-[var(--loomina-muted)] text-sm leading-relaxed">
                                Confidentialité contractuelle, choix des destinataires et possibilité de suppression complète des données.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
