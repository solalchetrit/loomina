import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pb-14 pt-10">
      <div className="absolute left-12 top-8 hidden h-28 w-28 rounded-full bg-[var(--loomina-amber)]/25 blur-3xl lg:block" aria-hidden />
      <div className="mx-auto max-w-6xl rounded-[32px] border border-black/5 bg-white/85 p-8 md:p-12 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full bg-[var(--loomina-cloud)] px-4 py-2 text-sm font-semibold text-[var(--loomina-ink)] border border-black/5 shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--loomina-amber-strong)]" />
              Loomina accompagne vos souvenirs
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-[var(--loomina-amber-strong)] font-semibold">Livre mémoriel humain</p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-[var(--loomina-ink)]">
                Votre histoire prend la parole avec une équipe qui vous écoute
              </h1>
            </div>
            <p className="text-lg text-[var(--loomina-muted)] leading-relaxed max-w-2xl">
              Interviews guidés, réécriture attentive, maquette prête à offrir : nous prenons le temps de comprendre vos souvenirs et de les transmettre avec douceur, en version imprimée et numérique.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--loomina-amber)] px-6 py-3 font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.6)] transition hover:brightness-110"
                href="#offres"
              >
                Découvrir les offres
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white px-6 py-3 font-semibold text-[var(--loomina-ink)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_44px_-38px_rgba(0,0,0,0.65)]"
                href="mailto:contact@loomina.fr"
              >
                Organiser un premier appel
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Interviews enregistrés avec bienveillance", "Maquette élégante et photos retouchées", "Livres reliés et version numérique sécurisée"].map((item) => (
                <div key={item} className="rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] px-4 py-3 text-sm text-[var(--loomina-ink)] shadow-inner">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-[var(--loomina-muted)]">
              <div>
                <p className="text-3xl font-semibold text-[var(--loomina-amber-strong)]">4.9/5</p>
                <p className="text-sm">sur les projets accompagnés</p>
              </div>
              <div className="hidden h-12 w-px bg-[var(--loomina-muted)]/15 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-[var(--loomina-amber-strong)]">2-3 semaines</p>
                <p className="text-sm">pour un livre prêt à offrir</p>
              </div>
              <div className="hidden h-12 w-px bg-[var(--loomina-muted)]/15 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-[var(--loomina-amber-strong)]">100% humain</p>
                <p className="text-sm">contrôle éditorial par notre équipe</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--loomina-amber)]/25 blur-3xl" aria-hidden />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-[var(--loomina-sand)] blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--loomina-cloud)] px-4 py-3 text-[var(--loomina-ink)] border border-black/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--loomina-ink)] text-white text-lg font-semibold">
                    L
                  </div>
                  <div>
                    <p className="font-semibold">Atelier Loomina</p>
                    <p className="text-sm text-[var(--loomina-muted)]">Rencontre audio + prise de notes</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--loomina-ink)] border border-black/5">
                  Démarrage prévu
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {["Parlez-moi de votre enfance", "Quels moments vous ont transformé ?", "Quel message laisser à vos proches ?"].map((prompt) => (
                  <div
                    key={prompt}
                    className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-[var(--loomina-ink)] shadow-inner"
                  >
                    {prompt}
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/6 bg-[var(--loomina-cloud)]">
                <Image src="/window.svg" alt="Aperçu du livre" width={520} height={320} className="h-auto w-full object-cover" />
              </div>

              <div className="mt-4 rounded-2xl border border-black/5 bg-[var(--loomina-cloud)] px-4 py-3 text-sm text-[var(--loomina-muted)]">
                "L'équipe m'a aidée à poser des mots simples sur des souvenirs compliqués. On se sent vraiment accompagnés." – Adèle, 63 ans
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
