import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L’Expérience",
  description: "Trois phases, quatorze chapitres : comment Loomina transforme vos conversations téléphoniques en un livre de vie relié.",
  alternates: { canonical: "/experience" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
