const logos = ["France Mémoire", "Fondations privées", "Musées partenaires", "Réseaux familiaux"];

export default function TrustBand() {
  return (
    <section className="w-full bg-[var(--loomina-surface)]/70 py-10 px-6 border-y border-[var(--loomina-border)] backdrop-blur">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold text-center">
          Ils nous font confiance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center justify-items-center text-[var(--loomina-text-light)] font-semibold">
          {logos.map((logo) => (
            <div
              key={logo}
              className="w-full text-center py-3 px-4 rounded-xl bg-[var(--loomina-cream)]/70 border border-[var(--loomina-border)] shadow-[0_18px_40px_-32px_rgba(0,0,0,0.7)]"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
