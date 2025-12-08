import Image from "next/image";

import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 pb-14 pt-10 bg-white">
      <div className="mx-auto max-w-6xl p-8 md:p-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-black border border-black/5">
              <span className="h-2.5 w-2.5 rounded-full bg-black" />
              Loomina accompagne vos souvenirs
            </div>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.34em] text-neutral-500 font-semibold">Livre mémoriel humain</p>
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
                className="bg-white text-black border border-black/10 shadow-md hover:bg-neutral-50"
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
            <div className="flex flex-wrap items-center gap-6 pt-2 text-neutral-500">
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

          <div className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3 text-black border border-black/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white text-lg font-semibold">
                    L
                  </div>
                  <div>
                    <p className="font-semibold">Atelier Loomina</p>
                    <p className="text-sm text-neutral-500">Rencontre audio + prise de notes</p>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black border border-black/5">
                  Démarrage prévu
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {["Parlez-moi de votre enfance", "Quels moments vous ont transformé ?", "Quel message laisser à vos proches ?"].map((prompt) => (
                  <div
                    key={prompt}
                    className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-black shadow-sm"
                  >
                    {prompt}
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-neutral-50">
                <Image src="/window.svg" alt="Aperçu du livre" width={520} height={320} className="h-auto w-full object-cover" />
              </div>

              <div className="mt-4 rounded-2xl border border-black/5 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                "L'équipe m'a aidée à poser des mots simples sur des souvenirs compliqués. On se sent vraiment accompagnés." – Adèle, 63 ans
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
