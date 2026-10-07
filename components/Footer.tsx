import Link from "next/link";
import Image from "next/image";
import { LOOMINA_CONFIG } from "@/config/loomina";

const COLUMNS = [
  {
    title: "Loomina",
    links: [
      { href: "/experience", label: "Comment ça marche" },
      { href: "/offre", label: "Le livre et le prix" },
      { href: "/faq", label: "Questions" },
      { href: "/about", label: "Notre histoire" },
    ],
  },
  {
    title: "Votre livre",
    links: [
      { href: "/order", label: "Commander" },
      { href: "/dashboard", label: "Espace auteur" },
      { href: "/contact", label: "Nous écrire" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/cgv", label: "Conditions de vente" },
      { href: "/legal", label: "Mentions légales" },
      { href: "/privacy", label: "Confidentialité" },
    ],
  },
];

/** Pied de page en colophon : qui écrit, où écrire, où appeler. */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-[var(--rule)] bg-[var(--paper-deep)]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-14 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="inline-block" aria-label="Loomina, accueil">
              <div className="relative h-8 w-36">
                <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" />
              </div>
            </Link>
            <p className="t-body mt-5 max-w-xs">Vous racontez votre vie au téléphone. Nous en faisons un livre.</p>
            <p className="mt-6 font-sans text-[16px] text-[var(--ink-2)]">
              Pour essayer :{" "}
              <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="link font-semibold">
                {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
              </a>
            </p>
            <p className="mt-1 font-sans text-[16px] text-[var(--ink-2)]">
              Pour nous écrire :{" "}
              <a href="mailto:contact@loomina.eu" className="link font-semibold">
                contact@loomina.eu
              </a>
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="t-eyebrow !font-sans">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="font-sans text-[16px] text-[var(--ink-2)] underline-offset-4 hover:text-[var(--ink)] hover:underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--rule)] pt-6 font-sans text-[14px] text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Loomina. Projet porté par Solal Chetrit, Paris.</p>
          <p>Loomina est une intelligence artificielle ; chaque page est relue par une personne.</p>
        </div>
      </div>
    </footer>
  );
}
