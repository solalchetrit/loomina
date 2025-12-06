import Link from "next/link";

const footerLinks = [
  { href: "/mission", label: "Mission" },
  { href: "/offres", label: "Offres" },
  { href: "/accompagnement", label: "Accompagnement" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--loomina-black)] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Loomina</p>
            <h3 className="text-2xl md:text-3xl font-semibold">Garder la lumière allumée</h3>
            <p className="text-white/80 max-w-xl">
              Livres mémoriels, jumeaux numériques et accompagnement humain pour que la voix des proches reste vivante.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:contact@loomina.fr"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-gold)] text-[var(--loomina-black)] font-semibold shadow-md hover:brightness-110 transition"
            >
              Écrire à l'équipe
            </a>
            <Link
              href="/offres"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-black)] border border-white/20 text-white font-semibold hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)] transition-colors"
            >
              Découvrir les offres
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6 items-center">
          <div className="flex flex-wrap gap-4 text-sm text-white">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/15 hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="text-sm text-white/80 md:text-right">
            © {new Date().getFullYear()} Loomina. Voix et récits protégés.
          </div>
        </div>
      </div>
    </footer>
  );
}
