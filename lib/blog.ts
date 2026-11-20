import fs from "node:fs";
import path from "node:path";

/**
 * Le blog : un article = un fichier Markdown dans content/blog.
 * Le nom du fichier donne l'adresse (content/blog/mon-article.md -> /blog/mon-article).
 * Pour publier : ajouter le fichier, c'est tout. Liste, plan du site, flux RSS et
 * données pour Google se mettent à jour seuls. Mode d'emploi : content/blog/LISEZ-MOI.md.
 */

export type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** Date de publication, AAAA-MM-JJ. */
  date: string;
  /** Date de dernière mise à jour, si l'article a été repris. */
  updated?: string;
  /** Nom d'une photo de /public/photos, sans l'extension. */
  photo: string;
  photoAlt: string;
  blocks: Block[];
  minutes: number;
};

/** Espaces insécables de la typographie française : pas de « ? » ou de « : » seul en début de ligne. */
const fr = (t: string) => t.replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

const DIR = path.join(process.cwd(), "content", "blog");

function parse(slug: string, raw: string): Post {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Article ${slug} : en-tête manquant (bloc entre ---).`);
  const head: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) head[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  for (const key of ["title", "description", "date", "photo", "photoAlt"]) {
    if (!head[key]) throw new Error(`Article ${slug} : « ${key} » manque dans l'en-tête.`);
  }

  const blocks: Block[] = [];
  for (const chunk of m[2].split(/\n\s*\n/)) {
    const lines = chunk.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines[0].startsWith("### ")) blocks.push({ type: "h3", text: fr(lines[0].slice(4)) });
    else if (lines[0].startsWith("## ")) blocks.push({ type: "h2", text: fr(lines[0].slice(3)) });
    else if (lines.every((l) => l.startsWith("- "))) blocks.push({ type: "ul", items: lines.map((l) => fr(l.slice(2))) });
    else if (lines.every((l) => /^\d+\. /.test(l))) blocks.push({ type: "ol", items: lines.map((l) => fr(l.replace(/^\d+\. /, ""))) });
    else if (lines.every((l) => l.startsWith("> "))) blocks.push({ type: "quote", text: fr(lines.map((l) => l.slice(2)).join(" ")) });
    else blocks.push({ type: "p", text: fr(lines.join(" ")) });
  }

  const words = m[2].split(/\s+/).length;
  return {
    slug,
    title: fr(head.title),
    description: fr(head.description),
    date: head.date,
    updated: head.updated,
    photo: head.photo,
    photoAlt: head.photoAlt,
    blocks,
    minutes: Math.max(1, Math.round(words / 200)),
  };
}

/** Tous les articles, du plus récent au plus ancien. */
export function allPosts(): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md") && f !== "LISEZ-MOI.md")
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

/** « 20 novembre 2026 ». */
export function frenchDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Ancre d'un titre de section, pour le sommaire. */
export function anchor(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
