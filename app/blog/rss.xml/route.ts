import { allPosts } from "@/lib/blog";
import { SITE } from "@/config/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Flux RSS du blog : les lecteurs de flux et certains moteurs le suivent pour voir les nouveaux articles. */
export function GET() {
  const items = allPosts()
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${SITE.url}/blog/${p.slug}</link><guid>${SITE.url}/blog/${p.slug}</guid><pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Le blog de Loomina</title><link>${SITE.url}/blog</link><description>Raconter, écrire et transmettre son histoire.</description><language>fr-FR</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
