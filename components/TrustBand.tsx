const logos = ["France Mémoire", "Fondations privées", "Musées partenaires", "Réseaux familiaux"];

export default function TrustBand() {
  return (
    <section className="w-full bg-[#0b1224] py-10 px-6 border-y border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold text-center">
          Ils nous font confiance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center text-white font-semibold">
          {logos.map((logo) => (
            <div
              key={logo}
              className="w-full text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10 shadow-[0_20px_60px_-50px_rgba(165,243,252,0.7)] backdrop-blur"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
