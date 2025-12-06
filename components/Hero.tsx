import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[var(--loomina-surface-muted)] via-[var(--loomina-surface)] to-[var(--loomina-surface-muted)] py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-[var(--loomina-border)] px-4 py-2 rounded-full shadow-sm text-sm text-[var(--loomina-gold)] font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)] shadow-[0_0_12px_rgba(64,243,210,0.8)]"></span>
            Livre mémoriel assisté par IA
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
            Préservez les voix de votre famille, dans un livre qui ne s'éteint jamais
          </h1>
          <p className="text-lg text-[var(--loomina-text-light)] leading-relaxed">
            Loomina combine des entretiens guidés, un montage éditorial et un accompagnement humain pour transmettre les souvenirs importants, sans perdre les détails.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-burgundy)] text-white font-semibold shadow-lg shadow-[0_20px_50px_-28px_rgba(124,93,255,0.75)] hover:bg-[var(--loomina-burgundy-dark)] transition-colors"
              href="#comment"
            >
              Découvrir le parcours
            </a>
            <a
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-[var(--loomina-border)] text-[var(--loomina-text)] bg-white/5 font-semibold hover:bg-white/10 transition-colors backdrop-blur"
              href="#faq"
            >
              Poser une question
            </a>
          </div>
          <div className="flex items-center gap-6 pt-2 text-[var(--loomina-text-light)]">
            <div>
              <p className="text-3xl font-semibold text-[var(--loomina-gold)]">72%</p>
              <p className="text-sm">des familles terminent en 2 semaines</p>
            </div>
            <div className="w-px h-12 bg-[var(--loomina-border)]"></div>
            <div>
              <p className="text-3xl font-semibold text-[var(--loomina-gold)]">4.9/5</p>
              <p className="text-sm">note moyenne sur les projets accompagnés</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-[var(--loomina-gold)] opacity-30 blur-3xl"></div>
          <div className="absolute -right-12 -bottom-16 w-40 h-40 rounded-full bg-[var(--loomina-burgundy)] opacity-20 blur-3xl"></div>
          <div className="relative bg-[var(--loomina-cream)]/90 border border-[var(--loomina-border)] rounded-[28px] shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--loomina-burgundy)] text-white flex items-center justify-center font-semibold shadow-[0_10px_30px_-15px_rgba(124,93,255,0.8)]">
                  L
                </div>
                <div>
                  <p className="font-semibold text-[var(--loomina-text)]">Atelier Loomina</p>
                  <p className="text-sm text-[var(--loomina-text-light)]">Session en cours</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-[var(--loomina-gold)] border border-[var(--loomina-border)]">Enregistrement</span>
            </div>

            <div className="space-y-4">
              {["Parlez-moi de votre enfance", "Qu'est-ce qui vous rend fier aujourd'hui ?", "Quel conseil laisseriez-vous à vos petits-enfants ?"].map((prompt) => (
                <div
                  key={prompt}
                  className="p-4 rounded-2xl border border-[var(--loomina-border)] bg-[var(--loomina-surface)] text-[var(--loomina-text)] shadow-[0_20px_50px_-40px_rgba(0,0,0,0.8)]"
                >
                  {prompt}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-[var(--loomina-border)] bg-[var(--loomina-surface)]">
              <Image src="/window.svg" alt="Aperçu du livre" width={520} height={320} className="w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
