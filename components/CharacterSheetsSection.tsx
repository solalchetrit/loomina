export default function CharacterSheetsSection() {
  return (
    <section className="w-full bg-white py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#f3edff] text-[#6f31c5] text-sm font-semibold rounded-full uppercase tracking-[0.08em]">
            <span className="w-2 h-2 rounded-full bg-[#f0488c]"></span>
            Section
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
            Fiches personnages prêtes à remplir
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Physique, caractère, évolution... Autant de caractéristiques auxquelles vous pensez lors de la création de vos personnages.
            Remplissez-les dans une fiche dédiée et retrouvez ces infos facilement durant l&apos;écriture.
          </p>
          <div className="flex gap-4">
            <span className="px-4 py-2 rounded-full bg-[#fdf2f7] text-[#f0488c] font-semibold text-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#f0488c]"></span>
              Personnages
            </span>
            <span className="px-4 py-2 rounded-full bg-[#ebe8ff] text-[#6f31c5] font-semibold text-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#6f31c5]"></span>
              Ancrage
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 w-20 h-20 rounded-3xl bg-[#fdf2f7] opacity-70 blur-2xl"></div>
          <div className="absolute -right-8 -bottom-10 w-24 h-24 rounded-full bg-[#e9f3ff] opacity-80 blur-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-lg border border-[#e7e1ef] p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#f1ecfa] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ebe8ff] flex items-center justify-center">
                    <span className="text-[#6f31c5] text-2xl">🙂</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Ancrage</p>
                    <p className="font-semibold text-neutral-900">Camille</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="h-2.5 bg-[#f7f4ff] rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-[#f7f4ff] rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-[#f7f4ff] rounded-full w-2/3"></div>
                </div>
              </div>

              <div className="bg-white border border-[#f1ecfa] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ffeaf3] flex items-center justify-center">
                    <span className="text-[#f0488c] text-2xl">🙂</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Ancrage</p>
                    <p className="font-semibold text-neutral-900">Chloe</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="h-2.5 bg-[#fff4f9] rounded-full w-4/6"></div>
                  <div className="h-2.5 bg-[#fff4f9] rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-[#fff4f9] rounded-full w-3/4"></div>
                </div>
              </div>

              <div className="sm:col-span-2 bg-white border border-[#f1ecfa] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ffe4d9] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="w-6 h-6 text-[#e35a14]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 14.25-2.91-.97a1.95 1.95 0 0 1-1.25-1.25l-.97-2.91a1.95 1.95 0 0 0-1.25-1.25l-2.91-.97a1.95 1.95 0 0 1-1.25-1.25L6 2.25"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5.25 19.5 1-3.03c.2-.6.73-1.04 1.36-1.1l3.22-.32c.47-.05.9-.34 1.12-.77l1.67-3.17"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide">Ancrage</p>
                    <p className="font-semibold text-neutral-900">Arthur</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="h-2.5 bg-[#fff1e8] rounded-full w-11/12"></div>
                  <div className="h-2.5 bg-[#fff1e8] rounded-full w-10/12"></div>
                  <div className="h-2.5 bg-[#fff1e8] rounded-full w-9/12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
