export default function CharacterSheetsSection() {
  return (
    <section className="w-full bg-[var(--loomina-cream)] py-24 px-6 font-[family-name:var(--font-plus-jakarta-sans)] border-t border-[var(--loomina-burgundy)]/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white text-[var(--loomina-burgundy-dark)] text-sm font-semibold rounded-full uppercase tracking-[0.08em] shadow-sm border border-[var(--loomina-burgundy)]/15">
            <span className="w-2 h-2 rounded-full bg-[var(--loomina-burgundy)]"></span>
            Outil d'ancrage
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--loomina-text)] leading-tight">
            Chapitres prêts à remplir
          </h2>
          <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
            Moments fondateurs, rencontres marquantes, voyages, habitudes... nous préparons des fiches simples pour organiser les souvenirs et choisir ce qui comptera dans le livre.
          </p>
          <div className="flex gap-4">
            <span className="px-4 py-2 rounded-full bg-white text-[var(--loomina-burgundy)] font-semibold text-sm border border-[var(--loomina-burgundy)]/15 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--loomina-burgundy)]"></span>
              Moments clés
            </span>
            <span className="px-4 py-2 rounded-full bg-white text-[var(--loomina-gold)] font-semibold text-sm border border-[var(--loomina-burgundy)]/15 shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--loomina-gold)]"></span>
              Photos
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 w-24 h-24 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(242,93,122,0.14),transparent_55%)] opacity-80 blur-2xl"></div>
          <div className="absolute -right-8 -bottom-10 w-28 h-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(43,183,163,0.16),transparent_55%)] opacity-80 blur-3xl"></div>
          <div className="relative bg-white rounded-3xl shadow-[0_30px_80px_-60px_rgba(217,54,98,0.55)] border border-[var(--loomina-burgundy)]/10 p-6 md:p-8 backdrop-blur">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--loomina-cream)] border border-[var(--loomina-burgundy)]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <span className="text-[var(--loomina-burgundy)] text-2xl">🙂</span>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--loomina-text-light)] uppercase tracking-wide">Chapitre</p>
                    <p className="font-semibold text-[var(--loomina-text)]">Enfance</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[var(--loomina-text-light)]">
                  <div className="h-2.5 bg-white rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-white rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-white rounded-full w-2/3"></div>
                </div>
              </div>

              <div className="bg-[var(--loomina-cream)] border border-[var(--loomina-burgundy)]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <span className="text-[var(--loomina-gold)] text-2xl">🙂</span>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--loomina-text-light)] uppercase tracking-wide">Chapitre</p>
                    <p className="font-semibold text-[var(--loomina-text)]">Rencontres</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[var(--loomina-text-light)]">
                  <div className="h-2.5 bg-white rounded-full w-4/6"></div>
                  <div className="h-2.5 bg-white rounded-full w-5/6"></div>
                  <div className="h-2.5 bg-white rounded-full w-3/4"></div>
                </div>
              </div>

              <div className="sm:col-span-2 bg-[var(--loomina-cream)] border border-[var(--loomina-burgundy)]/10 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="w-6 h-6 text-[var(--loomina-gold)]"
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
                    <p className="text-xs text-[var(--loomina-text-light)] uppercase tracking-wide">Chapitre</p>
                    <p className="font-semibold text-[var(--loomina-text)]">Transmission</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[var(--loomina-text-light)]">
                  <div className="h-2.5 bg-white rounded-full w-11/12"></div>
                  <div className="h-2.5 bg-white rounded-full w-10/12"></div>
                  <div className="h-2.5 bg-white rounded-full w-9/12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
