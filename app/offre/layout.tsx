import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L’Offre",
  description: "Le Coffret Biographie Complet à 219 € tout compris : entretiens illimités, rédaction, photos, livre relié livré chez vous.",
  alternates: { canonical: "/offre" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
