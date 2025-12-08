import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-6 pb-16 pt-12 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20" id="top">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-black/5 bg-white/80 p-8 shadow-lg md:p-12">
        <div className="grid grid-cols-1 items-center gap-10">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-black border border-black/5">
              <span className="h-2.5 w-2.5 rounded-full bg-black" />
              ✨ Vos souvenirs méritent d'être éternels
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-neutral-600 font-semibold">BIOGRAPHIE VOCALE & ÉDITION D'ART</p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-black">
                Votre vie devient un livre. Sans jamais l'écrire.
              </h1>
            </div>
            <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl">
              Ne laissez pas vos souvenirs s'effacer. Parlez-nous simplement au téléphone : nous transformons vos paroles en un magnifique ouvrage relié, corrigé par des experts et prêt à être transmis.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagicButton
                href="#offres"
                className="bg-black text-white shadow-lg border border-black hover:bg-neutral-800"
              >
                Commencer mon récit
              </MagicButton>
              <MagicButton
                href="tel:+33600000000"
                variant="secondary"
                className="bg-white text-black border border-black/10 shadow-md hover:bg-neutral-50 !text-black"
              >
                📞 Appeler Loomina
              </MagicButton>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm font-semibold text-neutral-700">
              <span>3 semaines pour recevoir votre livre</span>
              <span className="hidden h-4 w-px bg-black/10 sm:block" />
              <span>Aucune écriture nécessaire</span>
              <span className="hidden h-4 w-px bg-black/10 sm:block" />
              <span>Relecture 100% humaine</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
