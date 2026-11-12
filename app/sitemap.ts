import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/** Pages publiques, de la plus importante à la moins importante. */
const PAGES: [path: string, priority: number, changeFrequency: Frequency][] = [
  ["", 1, "monthly"],
  ["/offre", 0.9, "monthly"],
  ["/experience", 0.8, "monthly"],
  ["/about", 0.6, "yearly"],
  ["/faq", 0.6, "yearly"],
  ["/contact", 0.5, "yearly"],
  ["/legal", 0.3, "yearly"],
  ["/privacy", 0.3, "yearly"],
  ["/cgv", 0.3, "yearly"],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(([path, priority, changeFrequency]) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
