import type { Metadata } from "next";
import { SITE } from "@/config/site";

/**
 * Les métadonnées d'une page publique, au complet : titre, description, adresse
 * canonique, et l'aperçu affiché quand on partage la page (WhatsApp, Facebook, iMessage…).
 * Sans cela, toutes les pages partagées montraient le titre de l'accueil.
 * `title` : 50 caractères au plus (« | Loomina » s'ajoute tout seul).
 */
export function pageMeta({ title, description, path, image = "/og-image.jpg", imageAlt = "Quatre livres Loomina en toile" }: {
  title: string;
  description: string;
  /** Adresse de la page, par exemple "/offre". */
  path: string;
  image?: string;
  imageAlt?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      locale: "fr_FR",
      type: "website",
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
