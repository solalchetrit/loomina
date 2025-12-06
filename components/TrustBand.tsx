const logos = ["France Mémoire", "Fondations privées", "Musées partenaires", "Réseaux familiaux"];

export default function TrustBand() {
  return (
    <section className="w-full bg-white py-10 px-6 border-y border-[#eadfce]">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold text-center">
          Ils nous font confiance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center text-[var(--loomina-text-light)] font-semibold">
          {logos.map((logo) => (
            <div
              key={logo}
              className="w-full text-center py-3 px-4 rounded-xl bg-[var(--loomina-cream)] border border-[#eadfce] shadow-sm"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
