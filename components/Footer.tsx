import Link from "next/link";

const footerLinks = [
  { href: "/mission", label: "Mission" },
  { href: "/offres", label: "Offres" },
  { href: "/accompagnement", label: "Accompagnement" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--loomina-amber-strong)] font-semibold">Loomina</p>
            <h3 className="text-2xl md:text-3xl font-semibold text-[var(--loomina-ink)]">Le nom au centre, la voix en douceur</h3>
            <p className="text-[var(--loomina-muted)] max-w-xl">
              Un design réduit à l'essentiel pour que l'attention reste sur les souvenirs. Une seule palette, des boutons clairs, et un accompagnement humain constant.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:contact@loomina.fr"
              className="inline-flex items-center justify-center rounded-full bg-[var(--loomina-amber)] px-5 py-3 font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
            >
              Écrire à l'équipe Loomina
            </a>
            <Link
              href="/offres"
              className="inline-flex items-center justify-center rounded-full border border-black/6 bg-white px-5 py-3 font-semibold text-[var(--loomina-ink)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_44px_-38px_rgba(0,0,0,0.65)]"
            >
              Voir les offres
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-black/5 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-sm text-[var(--loomina-ink)]">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-black/5 bg-white/70 px-4 py-2 transition hover:border-[var(--loomina-amber-strong)] hover:text-[var(--loomina-amber-strong)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="text-sm text-[var(--loomina-muted)] md:text-right">
            © {new Date().getFullYear()} Loomina — design apaisé, récits protégés.
          </div>
        </div>
      </div>
    </footer>
  );
}
