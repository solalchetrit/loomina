import Image from "next/image";
import Link from "next/link";
import FAQ from "@/components/FAQ";

export default function Home() {
    return (
        <main className="min-h-screen w-full bg-[var(--loomina-cream)] text-[var(--loomina-text)]">
            <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f7f3ec]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f1e7d8,transparent_45%)]" aria-hidden />

                <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 md:flex-row md:items-center md:py-28">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--loomina-burgundy)] shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" />
                            Votre héritage, transmis avec douceur
                        </div>

                        <h1 className="text-4xl font-bold leading-tight text-[var(--loomina-text)] md:text-5xl">
                            Lúmina capture votre histoire pour la transmettre en livre et en jumeau mémoriel.
                        </h1>
                        <p className="max-w-2xl text-lg text-[var(--loomina-text-light)]">
                            Nous combinons une IA empathique et l&apos;œil d&apos;un éditeur pour transformer vos souvenirs en un ouvrage d&apos;art, prêt à être offert aux générations futures.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/offres"
                                className="rounded-full bg-[var(--loomina-burgundy)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-[var(--loomina-burgundy)]/25 transition hover:brightness-110"
                            >
                                Découvrir nos offres
                            </Link>
                            <Link
                                href="/mission"
                                className="rounded-full border border-[var(--loomina-burgundy)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--loomina-burgundy)] transition hover:bg-[var(--loomina-burgundy)] hover:text-white"
                            >
                                Notre mission
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm text-[var(--loomina-text-light)] md:grid-cols-3">
                            {["Interview guidée par l’IA", "Rédaction et mise en page premium", "Livre imprimé + version digitale"].map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-xl bg-white/70 p-4 shadow-sm">
                                    <span className="text-xl text-[var(--loomina-gold)]">✦</span>
                                    <span className="font-medium text-[var(--loomina-text)]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex-1 rounded-3xl bg-white/80 p-8 shadow-2xl shadow-[var(--loomina-burgundy)]/10">
                        <div className="absolute inset-0 rounded-3xl border border-[var(--loomina-gold)]/50" aria-hidden />
                        <div className="relative h-full space-y-8">
                            <div className="relative mx-auto h-14 w-40">
                                <Image src="/header_logo.png" alt="Logo Lúmina" fill className="object-contain" priority />
                            </div>
                            <p className="text-lg leading-relaxed text-[var(--loomina-text-light)]">
                                « Nous donnons une voix nouvelle à vos souvenirs et les transformons en un livre que vos proches pourront tenir entre leurs mains. »
                            </p>
                            <div className="flex items-center gap-4 rounded-2xl bg-[#f9f4ea] p-4 text-sm text-[var(--loomina-text)]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--loomina-burgundy)] text-white">
                                    IA
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">Interview guidée</p>
                                    <p className="text-[var(--loomina-text-light)]">Questions personnalisées, sans limite de temps.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20">
                <div className="grid gap-8 rounded-3xl bg-white/70 p-10 shadow-xl shadow-[var(--loomina-burgundy)]/5 md:grid-cols-3">
                    {[{
                        title: "Parlez librement",
                        desc: "Laissez l’IA vous guider dans vos souvenirs, à votre rythme, sans jugement.",
                    }, {
                        title: "Nous rédigeons",
                        desc: "L’équipe édite et met en page un manuscrit élégant, fidèle à votre voix.",
                    }, {
                        title: "Vous transmettez",
                        desc: "Recevez votre livre imprimé et un jumeau mémoriel pour partager en ligne.",
                    }].map((item) => (
                        <div key={item.title} className="space-y-3 rounded-2xl bg-[#faf7f2] p-6">
                            <div className="h-10 w-10 rounded-full bg-[var(--loomina-burgundy)]/10 text-center text-2xl leading-[2.6rem] text-[var(--loomina-burgundy)]">✶</div>
                            <h3 className="text-xl font-semibold text-[var(--loomina-text)]">{item.title}</h3>
                            <p className="text-[var(--loomina-text-light)]">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#191514] py-16 text-white">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
                    <p className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--loomina-gold)]">Nouveau</p>
                    <h2 className="text-3xl font-semibold md:text-4xl">Prêt à allumer la lumière sur votre histoire ?</h2>
                    <p className="max-w-2xl text-white/70">
                        Commencez dès aujourd’hui. Une conversation suffit pour initier le livre que vos proches conserveront toute leur vie.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/offres"
                            className="rounded-full bg-[var(--loomina-gold)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--loomina-burgundy)] shadow-lg shadow-black/30 transition hover:brightness-110"
                        >
                            Choisir une offre
                        </Link>
                        <Link
                            href="mailto:contact@loomina.fr"
                            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
                        >
                            Écrire à l’équipe
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 py-16">
                <h2 className="mb-10 text-center text-3xl font-semibold text-[var(--loomina-text)]">Questions fréquentes</h2>
                <div className="mx-auto">
                    <FAQ />
                </div>
            </section>
        </main>
    );
}
