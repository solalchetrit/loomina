import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#fff1e6] via-[#fff7ef] to-[#e8fbf5] py-20 px-6">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-10 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(242,93,122,0.2),transparent_52%)] blur-3xl" />
        <div className="absolute -right-16 -bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(43,183,163,0.2),transparent_55%)] blur-3xl" />
        <div className="absolute left-1/3 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(183,246,231,0.18),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-[var(--loomina-burgundy)]/15 px-4 py-2 rounded-full shadow-sm text-sm text-[var(--loomina-burgundy-dark)] font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-burgundy)]"></span>
            Livre mémoriel assisté par IA
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--loomina-text)] leading-tight">
            Préservez les voix de votre famille, dans un livre qui ne s'éteint jamais
          </h1>
          <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed max-w-xl">
            Loomina combine des entretiens guidés, un montage éditorial et un accompagnement humain pour transmettre les souvenirs importants, sans perdre les détails.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold shadow-[0_20px_60px_-30px_rgba(217,54,98,0.5)] hover:bg-[var(--loomina-burgundy-dark)] transition-colors"
              href="#comment"
            >
              Découvrir le parcours
            </a>
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[var(--loomina-burgundy)]/30 text-[var(--loomina-text)] font-semibold hover:border-[var(--loomina-burgundy-dark)] hover:text-[var(--loomina-burgundy-dark)] transition-colors bg-white/70"
              href="#faq"
            >
              Poser une question
            </a>
          </div>
          <div className="flex items-center gap-6 pt-2 text-[var(--loomina-text-light)]">
            <div>
              <p className="text-3xl font-semibold text-[var(--loomina-burgundy)]">72%</p>
              <p className="text-sm">des familles terminent en 2 semaines</p>
            </div>
            <div className="w-px h-12 bg-[var(--loomina-burgundy)]/15"></div>
            <div>
              <p className="text-3xl font-semibold text-[var(--loomina-burgundy)]">4.9/5</p>
              <p className="text-sm">note moyenne sur les projets accompagnés</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(242,93,122,0.12),transparent_60%)] blur-3xl"></div>
          <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(43,183,163,0.16),transparent_55%)] blur-3xl"></div>
          <div className="relative bg-white/90 border border-[var(--loomina-burgundy)]/10 rounded-[28px] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.22)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--loomina-burgundy)] text-white flex items-center justify-center font-semibold">
                  L
                </div>
                <div>
                  <p className="font-semibold text-[var(--loomina-text)]">Atelier Loomina</p>
                  <p className="text-sm text-[var(--loomina-text-light)]">Session en cours</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--loomina-cream)] text-xs font-semibold text-[var(--loomina-burgundy)] border border-[var(--loomina-burgundy)]/20">
                Enregistrement
              </span>
            </div>

            <div className="space-y-4">
              {["Parlez-moi de votre enfance", "Qu'est-ce qui vous rend fier aujourd'hui ?", "Quel conseil laisseriez-vous à vos petits-enfants ?"].map((prompt) => (
                <div
                  key={prompt}
                  className="p-4 rounded-2xl border border-[var(--loomina-burgundy)]/10 bg-white text-[var(--loomina-text)]"
                >
                  {prompt}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-[var(--loomina-burgundy)]/10 bg-[var(--loomina-cream)]">
              <Image src="/window.svg" alt="Aperçu du livre" width={520} height={320} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
