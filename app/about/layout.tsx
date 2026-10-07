import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "Loomina est née d’une histoire de famille : une grand-mère dont la vie méritait un livre, et un petit-fils qui l’a laissée parler.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
