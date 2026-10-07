import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/Section";

/** Gabarit des pages légales : une colonne de lecture, des titres à filets, pas de cartes. */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="w-full">
      <PageHeader eyebrow={eyebrow} title={title} text={`Dernière mise à jour : ${updated}.`} />
      <section className="w-full pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
            <aside className="rule-top pt-5 lg:sticky lg:top-28 lg:self-start">
              <p className="t-eyebrow">Autres pages</p>
              <ul className="mt-3 space-y-2">
                {[
                  { href: "/cgv", label: "Conditions générales de vente" },
                  { href: "/legal", label: "Mentions légales" },
                  { href: "/privacy", label: "Politique de confidentialité" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link font-sans text-[16px]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="t-small mt-8 max-w-xs">
                Une question sur ces textes ? Écrivez à{" "}
                <a href="mailto:contact@loomina.eu" className="link">
                  contact@loomina.eu
                </a>
                .
              </p>
            </aside>
            <div className="prose-loomina max-w-2xl">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
