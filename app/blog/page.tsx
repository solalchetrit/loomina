import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import Photo from "@/components/ui/Photo";
import Closing from "@/components/Closing";
import { allPosts, frenchDate, type Post } from "@/lib/blog";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Le blog : raconter, écrire et transmettre son histoire",
  description: "Conseils pour raconter sa vie, questions à poser à ses parents et grands-parents, idées pour garder les souvenirs de famille dans un livre.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

function Meta({ post }: { post: Post }) {
  return (
    <p className="t-small">
      <time dateTime={post.date}>{frenchDate(post.date)}</time> · {post.minutes} min de lecture
    </p>
  );
}

const READ = "link mt-5 inline-block text-[16px]";

export default function Page() {
  const [first, ...rest] = allPosts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Le blog de Loomina",
    url: `${SITE.url}/blog`,
    inLanguage: "fr-FR",
    publisher: { "@id": `${SITE.url}/#organisation` },
    blogPost: [first, ...rest].map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE.url}/blog/${p.slug}`, datePublished: p.date })),
  };
  return (
    <>
      <section className="page-top w-full">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
          <div className="rise max-w-3xl">
            <p className="t-eyebrow">Le blog</p>
            <h1 className="t-display mt-3 text-balance">Raconter, écrire et transmettre son histoire</h1>
            <p className="t-lead mt-4 max-w-xl md:mt-5">Des conseils simples pour garder les souvenirs de votre famille : quoi demander, comment s’y prendre, par où commencer.</p>
          </div>

          {/* Le dernier article, en grand : c'est lui qu'on lit en premier. */}
          <Link href={`/blog/${first.slug}`} className="rise card group mt-12 grid overflow-hidden !p-3 md:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <Photo name={first.photo} alt={first.photoAlt} ratio="aspect-[3/2]" focus="center 25%" priority sizes="(min-width: 1024px) 640px, 100vw" className="!rounded-[18px]" />
            <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12">
              <p className="t-eyebrow">Dernier article</p>
              <h2 className="t-title mt-3 text-balance">{first.title}</h2>
              <p className="t-body mt-4">{first.description}</p>
              <div className="mt-5">
                <Meta post={first} />
              </div>
              <span className={`${READ} self-start`}>Lire l’article</span>
            </div>
          </Link>
        </div>
      </section>

      {rest.length > 0 && (
        <Section>
          <h2 className="t-title" data-reveal>
            Tous les articles
          </h2>
          <ul className={`mt-8 grid gap-5 md:mt-10 md:grid-cols-2 ${rest.length > 2 ? "lg:grid-cols-3" : ""}`}>
            {rest.map((p) => (
              <li key={p.slug} data-reveal className="flex">
                <Link href={`/blog/${p.slug}`} className="card group flex w-full flex-col !p-3">
                  <Photo name={p.photo} alt={p.photoAlt} ratio="aspect-[16/9]" sizes="(min-width: 768px) 600px, 100vw" className="!rounded-[18px]" />
                  <div className="flex flex-1 flex-col p-4 pt-6 sm:p-6">
                    <Meta post={p} />
                    <h3 className="t-heading mt-2 text-balance">{p.title}</h3>
                    <p className="t-body mt-2">{p.description}</p>
                    <span className={`${READ} mt-auto self-start pt-5`}>Lire l’article</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {rest.length === 0 && <div className="section-y !pb-0" />}
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
