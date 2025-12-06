import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-[var(--loomina-cream)] to-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-[#eadfce] px-4 py-2 rounded-full shadow-sm text-sm text-[var(--loomina-burgundy)] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]"></span>
            Livre mémoriel assisté par IA
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--loomina-text)] leading-tight">
            Préservez les voix de votre famille, dans un livre qui ne s'éteint jamais
          </h1>
          <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
            Loomina combine des entretiens guidés, un montage éditorial et un accompagnement humain pour transmettre les souvenirs importants, sans perdre les détails.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold shadow-lg shadow-[rgba(104,24,41,0.2)] hover:bg-[var(--loomina-burgundy-dark)] transition-colors"
              href="#comment"
            >
              Découvrir le parcours
            </a>
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[var(--loomina-burgundy)] text-[var(--loomina-burgundy)] font-semibold hover:bg-[var(--loomina-burgundy)] hover:text-white transition-colors"
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
            <div className="w-px h-12 bg-[#eadfce]"></div>
            <div>
              <p className="text-3xl font-semibold text-[var(--loomina-burgundy)]">4.9/5</p>
              <p className="text-sm">note moyenne sur les projets accompagnés</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-[var(--loomina-gold-light)] opacity-30 blur-3xl"></div>
          <div className="absolute -right-12 -bottom-16 w-40 h-40 rounded-full bg-[var(--loomina-burgundy)] opacity-20 blur-3xl"></div>
          <div className="relative bg-white border border-[#eadfce] rounded-[28px] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.35)] p-6">
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
              <span className="px-3 py-1 rounded-full bg-[var(--loomina-cream)] text-xs font-semibold text-[var(--loomina-burgundy)]">Enregistrement</span>
            </div>

            <div className="space-y-4">
              {["Parlez-moi de votre enfance", "Qu'est-ce qui vous rend fier aujourd'hui ?", "Quel conseil laisseriez-vous à vos petits-enfants ?"].map((prompt) => (
                <div
                  key={prompt}
                  className="p-4 rounded-2xl border border-[#eadfce] bg-[var(--loomina-cream)] text-[var(--loomina-text)]"
                >
                  {prompt}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-[#eadfce] bg-[var(--loomina-cream)]">
              <Image src="/window.svg" alt="Aperçu du livre" width={520} height={320} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
