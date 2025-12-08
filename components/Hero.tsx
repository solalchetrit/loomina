import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pb-16 pt-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(234,191,119,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(197,140,60,0.18),transparent_30%),linear-gradient(135deg,#05060d,#0b0f1a,#0e111c)]" aria-hidden />
      <div className="relative mx-auto max-w-5xl p-8 md:p-12">
        <div className="grid grid-cols-1 items-center gap-10">
          <div className="space-y-7 text-white">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/10 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--loomina-amber)]" />
              Loomina accompagne vos souvenirs
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-[var(--loomina-amber-strong)] font-semibold">Livre mémoriel humain</p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                Votre histoire prend la parole avec une équipe qui vous écoute
              </h1>
            </div>
            <p className="text-lg text-neutral-300 leading-relaxed max-w-2xl">
              Interviews guidés, réécriture attentive, maquette prête à offrir : nous prenons le temps de comprendre vos souvenirs et de les transmettre avec douceur, en version imprimée et numérique.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagicButton
                href="#offres"
                className="bg-white text-black shadow-lg border border-white/10 hover:bg-neutral-200/90"
              >
                Découvrir les offres
              </MagicButton>
              <MagicButton
                href="mailto:contact@loomina.fr"
                variant="secondary"
                className="bg-transparent text-white border border-white/20 shadow-md hover:bg-white/10"
              >
                Organiser un premier appel
              </MagicButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Interviews enregistrés avec bienveillance", "Maquette élégante et photos retouchées", "Livres reliés et version numérique sécurisée"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-neutral-300">
              <div>
                <p className="text-3xl font-semibold text-white">4.9/5</p>
                <p className="text-sm">sur les projets accompagnés</p>
              </div>
              <div className="hidden h-12 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-white">2-3 semaines</p>
                <p className="text-sm">pour un livre prêt à offrir</p>
              </div>
              <div className="hidden h-12 w-px bg-white/10 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-white">100% humain</p>
                <p className="text-sm">contrôle éditorial par notre équipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
