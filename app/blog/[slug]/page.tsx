import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Photo from "@/components/ui/Photo";
import Button from "@/components/ui/Button";
import Closing from "@/components/Closing";
import Markdown from "@/components/blog/Markdown";
import { allPosts, anchor, frenchDate, getPost } from "@/lib/blog";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

/** L'auteur affiché sous chaque article : Google veut savoir qui écrit. */
const AUTHOR = { name: "Solal Chetrit", role: "fondateur de Loomina" };

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: AUTHOR.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: SITE.name,
      locale: "fr_FR",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [AUTHOR.name],
      images: [{ url: `/photos/${post.photo}.jpg`, alt: post.photoAlt }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [`/photos/${post.photo}.jpg`] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE.url}/blog/${post.slug}`;
  const sections = post.blocks.filter((b) => b.type === "h2").map((b) => (b as { text: string }).text);
  const others = allPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        image: `${SITE.url}/photos/${post.photo}.jpg`,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        inLanguage: "fr-FR",
        mainEntityOfPage: url,
        author: { "@type": "Person", name: AUTHOR.name, jobTitle: "Fondateur de Loomina", url: SITE.url },
        publisher: { "@id": `${SITE.url}/#organisation` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <article className="page-top w-full">
        <div className="mx-auto w-full max-w-[760px] px-5 sm:px-6">
          <nav aria-label="Fil d’Ariane" className="rise t-small">
            <Link href="/blog" className="link">
              Le blog
            </Link>
          </nav>
          <h1 className="rise t-display mt-5 text-balance">{post.title}</h1>
          <p className="rise t-lead mt-5">{post.description}</p>
          <p className="rise t-small mt-5">
            Par {AUTHOR.name}, {AUTHOR.role} · <time dateTime={post.date}>{frenchDate(post.date)}</time>
            {post.updated && post.updated !== post.date && <> · mis à jour le <time dateTime={post.updated}>{frenchDate(post.updated)}</time></>}
            {" "}· {post.minutes} min de lecture
          </p>
          <Photo name={post.photo} alt={post.photoAlt} ratio="aspect-[3/2]" priority sizes="(min-width: 768px) 720px, 100vw" className="rise mt-9 w-full" />

          {sections.length > 2 && (
            <nav aria-label="Sommaire" className="card mt-9 p-6">
              <p className="text-[15px] font-bold text-[var(--ink)]">Dans cet article</p>
              <ol className="mt-3 space-y-2 text-[17px]">
                {sections.map((s) => (
                  <li key={s}>
                    <a href={`#${anchor(s)}`} className="link">
                      {s}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-10">
            <Markdown blocks={post.blocks} />
          </div>

          <aside className="card mt-14 p-7">
            <p className="t-heading">Et si vous le racontiez au téléphone ?</p>
            <p className="t-body mt-2">
              Avec Loomina, vous racontez votre vie au téléphone et nous en faisons un livre imprimé. La démo dure {OFFER.demoMinutes} minutes et elle est gratuite.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button href={`tel:${SITE.phone}`}>Essayer la démo : {SITE.phoneDisplay}</Button>
              <Button href="/experience" variant="ghost">
                Comment ça marche
              </Button>
            </div>
          </aside>

          {others.length > 0 && (
            <nav aria-label="À lire aussi" className="mt-14 border-t border-[var(--line)] pt-8">
              <p className="text-[15px] font-bold text-[var(--ink)]">À lire aussi</p>
              <ul className="mt-3 space-y-2 text-[17px]">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="link">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </article>
      <div className="section-y !pb-0" />
      <Closing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
