import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

type Frequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/** Pages publiques, de la plus importante à la moins importante. */
const PAGES: [path: string, priority: number, changeFrequency: Frequency][] = [
  ["", 1, "monthly"],
  ["/offre", 0.9, "monthly"],
  ["/experience", 0.8, "monthly"],
  // Pages guides, écrites pour des recherches Google précises.
  ["/ecrire-ses-memoires", 0.7, "monthly"],
  ["/cadeau-grands-parents", 0.7, "monthly"],
  ["/biographe-familial", 0.7, "monthly"],
  // « Notre histoire » (/about) n'est pas prête (Solal, 19/11/2026) : hors du plan du site tant qu'elle ne l'est pas.
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
