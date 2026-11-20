import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/ui/Section";
import Photo from "@/components/ui/Photo";
import Closing from "@/components/Closing";
import { allPosts, frenchDate } from "@/lib/blog";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Le blog : raconter, écrire et transmettre son histoire",
  description: "Conseils pour raconter sa vie, questions à poser à ses parents et grands-parents, idées pour garder les souvenirs de famille dans un livre.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default function Page() {
  const posts = allPosts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Le blog de Loomina",
    url: `${SITE.url}/blog`,
    inLanguage: "fr-FR",
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE.url}/blog/${p.slug}`, datePublished: p.date })),
  };
  return (
    <>
      <PageHeader
        eyebrow="Le blog"
        title="Raconter, écrire et transmettre son histoire"
        text="Des conseils simples pour garder les souvenirs de votre famille : quoi demander, comment s’y prendre, par où commencer."
      />
      <Section>
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <li key={p.slug} data-reveal>
              <Link href={`/blog/${p.slug}`} className="group block">
                <Photo name={p.photo} alt={p.photoAlt} ratio="aspect-[3/2]" sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" priority={i < 3} />
                <p className="t-small mt-5">
                  <time dateTime={p.date}>{frenchDate(p.date)}</time> · {p.minutes} min de lecture
                </p>
                <h2 className="t-heading mt-2 text-balance group-hover:underline group-hover:decoration-[var(--amber)] group-hover:decoration-2 group-hover:underline-offset-4">
                  {p.title}
                </h2>
                <p className="t-body mt-2">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
