import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le livre et le prix",
  description: "449 € tout compris : les appels, l’écriture, la relecture humaine, vos photos, le livre relié livré chez vous et sa version numérique.",
  alternates: { canonical: "/offre" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
