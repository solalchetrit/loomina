import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur votre projet de livre ? L’équipe Loomina vous répond sous 24 h.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
