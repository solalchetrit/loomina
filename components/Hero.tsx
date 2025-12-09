import Image from "next/image";

import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pb-20 pt-16 bg-white">
      <div className="mx-auto max-w-4xl p-8 md:p-12 flex flex-col items-center text-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-neutral-50 px-4 py-2 text-sm font-semibold text-black border border-black/5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-black animate-pulse" />
            GARDIENS DE LA MÉMOIRE FAMILIALE
          </div>

          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.34em] text-neutral-500 font-semibold">Livre mémoriel humain</p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-black tracking-tight">
              Loomina : Chaque vie mérite d'être lue
            </h1>
          </div>

          <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Il n'y a pas de vie ordinaire. Transformez vos souvenirs en un livre éternel, simplement en nous les racontant au téléphone.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center pt-4">
            <MagicButton
              href="#offres"
              className="bg-black text-white shadow-xl border border-black hover:bg-neutral-800 px-8 py-4 text-lg"
            >
              Commencer mon livre
            </MagicButton>
            <MagicButton
              href="#audio-details"
              className="bg-white !text-black border border-black/10 shadow-lg hover:bg-neutral-50 px-8 py-4 text-lg font-bold"
            >
              Écouter un extrait
            </MagicButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-8 w-full max-w-3xl mx-auto">
            {["Interviews enregistrés avec bienveillance", "Maquette élégante et photos retouchées", "Livres reliés et version numérique sécurisée"].map((item) => (
              <div key={item} className="rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-6 text-neutral-500">
            <div>
              <p className="text-3xl font-bold text-black">4.9/5</p>
              <p className="text-sm font-medium">sur les projets accompagnés</p>
            </div>
            <div className="hidden h-12 w-px bg-black/10 sm:block" />
            <div>
              <p className="text-3xl font-bold text-black">2-3 semaines</p>
              <p className="text-sm font-medium">pour un livre prêt à offrir</p>
            </div>
            <div className="hidden h-12 w-px bg-black/10 sm:block" />
            <div>
              <p className="text-3xl font-bold text-black">100% humain</p>
              <p className="text-sm font-medium">contrôle éditorial par notre équipe</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
