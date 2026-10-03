import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Durée, prix, livre, confidentialité, cadeau : toutes les réponses sur le service de biographie par téléphone Loomina.",
  alternates: { canonical: "/faq" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
