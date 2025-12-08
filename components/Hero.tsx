import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6 pb-16 pt-12 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20" id="top">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-black/5 bg-white/80 p-8 shadow-lg md:p-12">
        <div className="grid grid-cols-1 items-center gap-10">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-black border border-black/5">
                <span className="h-2.5 w-2.5 rounded-full bg-black" />
                Loomina accompagne vos souvenirs
              </div>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-neutral-600 font-semibold">Livre mémoriel humain</p>
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-black">
                  Votre histoire prend la parole avec une équipe qui vous écoute
                </h1>
              </div>
              <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
              Interviews guidés, réécriture attentive, maquette prête à offrir : nous prenons le temps de comprendre vos souvenirs et de les transmettre avec douceur, en version imprimée et numérique.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagicButton
                href="#offres"
                className="bg-black text-white shadow-lg border border-black hover:bg-neutral-800"
              >
                Découvrir les offres
              </MagicButton>
              <MagicButton
                href="mailto:contact@loomina.fr"
                variant="secondary"
                className="bg-white text-black border border-black/10 shadow-md hover:bg-neutral-50 !text-black"
              >
                Organiser un premier appel
              </MagicButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["Interviews enregistrés avec bienveillance", "Maquette élégante et photos retouchées", "Livres reliés et version numérique sécurisée"].map((item) => (
                <div key={item} className="rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-neutral-600">
              <div>
                <p className="text-3xl font-semibold text-black">4.9/5</p>
                <p className="text-sm">sur les projets accompagnés</p>
              </div>
              <div className="hidden h-12 w-px bg-black/10 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-black">2-3 semaines</p>
                <p className="text-sm">pour un livre prêt à offrir</p>
              </div>
              <div className="hidden h-12 w-px bg-black/10 sm:block" />
              <div>
                <p className="text-3xl font-semibold text-black">100% humain</p>
                <p className="text-sm">contrôle éditorial par notre équipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
