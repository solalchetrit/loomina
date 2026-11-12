import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Durée, prix, livre, confidentialité, cadeau : les réponses aux questions que l’on nous pose sur Loomina, la biographie par téléphone.",
  alternates: { canonical: "/faq" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
