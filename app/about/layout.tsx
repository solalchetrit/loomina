import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "Loomina est née d’une histoire de famille : une grand-mère dont la vie méritait un livre, et un petit-fils qui l’a laissée parler.",
  alternates: { canonical: "/about" },
  // La page n'est pas prête (Solal, 19/11/2026) : aucun lien n'y mène, et les moteurs de recherche ne la proposent pas.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
