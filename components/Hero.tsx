import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pt-32 pb-20 bg-white">
      <div className="mx-auto max-w-5xl flex flex-col items-center text-center space-y-10">

        {/* Titre Principal - Noir, massif mais élégant */}
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-black tracking-tight">
          Loomina : <br className="hidden md:block" />
          <span className="text-neutral-800">Chaque vie mérite d'être lue.</span>
        </h1>

        {/* Sous-titre - Gris chaud, largeur limitée pour la lecture */}
        <p className="text-xl md:text-2xl text-neutral-500 leading-relaxed max-w-2xl mx-auto font-light">
          Il n'y a pas de vie ordinaire. Transformez vos souvenirs en un livre éternel, simplement en nous les racontant au téléphone.
        </p>

        {/* Actions - Espacées */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center pt-6">
          <MagicButton
            href="#offres"
            className="bg-black text-white px-10 py-5 text-lg"
          >
            Commencer mon livre
          </MagicButton>
          <MagicButton
            href="tel:+33159169357"
            className="bg-white !text-black border border-neutral-200 hover:bg-neutral-50 px-10 py-5 text-lg"
          >
            Appeler Loomina
          </MagicButton>
        </div>

        {/* Preuve sociale minimaliste */}
        <div className="pt-12 opacity-60 text-sm font-medium text-neutral-400 uppercase tracking-widest">
          Biographies réalisées pour +150 familles
        </div>
      </div>
    </section>
  );
}
