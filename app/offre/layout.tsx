import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { OFFER } from "@/config/offer";

export const metadata: Metadata = {
  ...pageMeta({
    title: `Prix du livre de votre vie : ${OFFER.price} € tout compris`,
    description: `${OFFER.price} € tout compris : les appels, l’écriture, la relecture humaine, vos photos, le livre imprimé livré chez vous et sa version numérique.`,
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
