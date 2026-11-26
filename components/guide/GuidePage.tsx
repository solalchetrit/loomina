import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Closing from "@/components/Closing";
import ChristmasOffer from "@/components/home/ChristmasOffer";
import { SITE } from "@/config/site";
import { OFFER_PAGE_LABEL } from "@/config/offer";

export type GuideSection = { title: string; body: ReactNode };

/**
 * Pages guides, écrites pour répondre à une recherche Google précise
 * (« écrire ses mémoires », « cadeau grand-mère », « biographe familial »).
 * Même gabarit pour toutes : en-tête avec photo, sections de texte, questions, démo.
 */
export default function GuidePage({
  title,
  intro,
  photo,
  sections,
  questions,
  related,
}: {
  title: string;
  intro: string;
  photo: { name: string; alt: string; focus?: string; ratio?: string };
  sections: GuideSection[];
  questions: { q: string; a: string }[];
  related: { href: string; label: string }[];
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <>
      <PageHeader
        title={title}
        text={intro}
        photo={photo}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button href={`tel:${SITE.phone}`} size="lg">
              Essayer la démo : {SITE.phoneDisplay}
            </Button>
            <Button href="/offre" variant="ghost" size="lg">
              {OFFER_PAGE_LABEL}
            </Button>
          </div>
        }
      />

      <Section>
        <article className="mx-auto max-w-[720px] space-y-14">
          {sections.map((s) => (
            <section key={s.title} data-reveal>
              <h2 className="t-title">{s.title}</h2>
              <div className="t-body mt-5 space-y-4 text-[18px] leading-relaxed">{s.body}</div>
            </section>
          ))}

          <section data-reveal>
            <h2 className="t-title">Questions fréquentes</h2>
            <dl className="mt-6 space-y-6">
              {questions.map(({ q, a }) => (
                <div key={q} className="card p-6">
                  <dt className="t-heading">{q}</dt>
                  <dd className="t-body mt-2">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav aria-label="À lire aussi" className="border-t border-[var(--line)] pt-8">
            <p className="text-[15px] font-bold text-[var(--ink)]">À lire aussi</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[17px]">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="link">
                    {r.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="link">
                  Le blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="link">
                  Toutes les questions
                </Link>
              </li>
            </ul>
          </nav>
        </article>
      </Section>
      {/* L’offre de lancement de Noël, aussi hors de l’accueil (Solal, 26/11/2026). Disparaît seule après le 24 décembre. */}
      <ChristmasOffer />
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}
