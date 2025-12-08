import Image from "next/image";
import Link from "next/link";

const legalLinks = [
  { href: "#", label: "CGV" },
  { href: "#", label: "Confidentialité" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-28 md:h-9 md:w-32">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              sizes="140px"
            />
          </div>
          <p className="text-sm text-neutral-500">Le livre qui s'écrit à votre rythme.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--loomina-ink)]">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-black/5 bg-white px-4 py-2 transition hover:bg-[var(--loomina-cloud)]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:contact@loomina.fr"
            className="rounded-full border border-black/5 bg-[var(--loomina-cloud)] px-4 py-2 font-semibold text-[var(--loomina-ink)] transition hover:-translate-y-[1px] hover:shadow-sm"
          >
            contact@loomina.fr
          </a>
        </div>
      </div>
    </footer>
  );
}
