import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Questions fréquentes : biographie par téléphone",
    description: "Durée, prix, livre, confidentialité, cadeau : les réponses aux questions que l’on nous pose sur Loomina, la biographie par téléphone.",
    path: "/faq",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
