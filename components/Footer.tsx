import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";

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

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-[var(--line)] bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:px-6 md:pt-24">
        {/* La devise de Loomina, en clôture de chaque page. */}
        <p data-reveal className="mb-16 md:mb-24">
          <span className="block text-[clamp(2.4rem,6.2vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">Vos souvenirs méritent</span>
          <span className="block text-[clamp(2.4rem,6.2vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--amber-display)]">l’éternité.</span>
        </p>
        <div className="grid gap-12 md:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="/" className="inline-block" aria-label="Loomina, accueil">
              <span className="relative block h-[30px] w-[128px]">
                <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" sizes="128px" />
              </span>
            </Link>
            <p className="t-body mt-5 max-w-xs">Vous racontez votre vie au téléphone. Nous en faisons un livre.</p>
            <dl className="mt-6 space-y-1 text-[16px]">
              <div>
                <dt className="inline text-[var(--ink-3)]">Démo gratuite : </dt>
                <dd className="inline">
                  <a href={`tel:${SITE.phone}`} className="link">
                    {SITE.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="inline text-[var(--ink-3)]">Nous écrire : </dt>
                <dd className="inline">
                  <a href="mailto:contact@loomina.eu" className="link">
                    contact@loomina.eu
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-[15px] font-bold tracking-normal text-[var(--ink)]">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[16px] text-[var(--ink-2)] hover:text-[var(--ink)] hover:underline hover:underline-offset-4">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-[14px] text-[var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Loomina. Projet porté par Solal Chetrit, Paris.</p>
          <p>Loomina est une intelligence artificielle ; chaque page est relue par une personne.</p>
        </div>
      </div>
    </footer>
  );
}
