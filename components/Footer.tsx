import Image from "next/image";
import Link from "next/link";

const legalLinks = [
  { href: "#", label: "CGV" },
  { href: "#", label: "Confidentialité" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.35)]">
          <div className="relative h-8 w-28 md:h-9 md:w-32">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              sizes="140px"
            />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--loomina-amber-strong)]">
            Le livre qui s'écrit à votre rythme.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--loomina-ink)]">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/5 bg-white/80 px-4 py-2 font-semibold transition hover:border-[var(--loomina-amber-strong)] hover:text-[var(--loomina-amber-strong)]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:contact@loomina.fr"
            className="rounded-full border border-black/5 bg-[var(--loomina-amber)]/90 px-5 py-3 font-semibold text-[var(--loomina-ink)] shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] transition hover:brightness-110"
          >
            contact@loomina.fr
          </a>
        </div>
      </div>
    </footer>
  );
}
