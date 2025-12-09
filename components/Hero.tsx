import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pt-24 md:pt-32 pb-20 bg-white">
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
        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-center sm:justify-center pt-6">
          <MagicButton
            href="#offres"
            size="lg"
            variant="primary"
          >
            Commencer mon livre
          </MagicButton>
          <MagicButton
            href="tel:+33159169357"
            size="lg"
            variant="secondary"
          >
            Appeler Loomina
          </MagicButton>
        </div>


      </div>
    </section>
  );
}
