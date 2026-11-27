import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { OFFER, SHOW_PRICE } from "@/config/offer";

export const metadata: Metadata = {
  ...pageMeta({
    title: SHOW_PRICE ? `Prix du livre de votre vie : ${OFFER.price} € tout compris` : "Le livre de votre vie, tout compris",
    description: `${SHOW_PRICE ? `${OFFER.price} € tout compris` : "Tout compris"} : les appels, l’écriture, la relecture humaine, vos photos, le livre imprimé livré chez vous et sa version numérique.`,
    path: "/offre",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ProductJsonLd />
    </>
  );
}
