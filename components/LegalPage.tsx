import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/Section";

/** Gabarit des pages légales : le texte dans une carte, les autres pages à côté. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} text={`Dernière mise à jour : ${updated}.`} />
      <section className="w-full pb-24 md:pb-32">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <aside className="card self-start p-7 lg:sticky lg:top-32">
              <p className="text-[15px] font-bold text-[var(--ink-3)]">Autres pages</p>
              <ul className="mt-3 space-y-2">
                {[
                  { href: "/cgv", label: "Conditions générales de vente" },
                  { href: "/legal", label: "Mentions légales" },
                  { href: "/privacy", label: "Politique de confidentialité" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link text-[16px]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="t-small mt-6">
                Une question sur ces textes ? Écrivez à{" "}
                <a href="mailto:contact@loomina.eu" className="link">
                  contact@loomina.eu
                </a>
                .
              </p>
            </aside>
            <div className="card p-7 md:p-12">
              <div className="prose-loomina max-w-2xl">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
