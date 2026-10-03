import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "L’histoire de Loomina, née d’un besoin personnel : permettre à chacun de transmettre son histoire sans avoir à l’écrire.",
  alternates: { canonical: "/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
