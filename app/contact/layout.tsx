import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nous écrire",
  description: "Une question sur votre livre, un cadeau à préparer ? Écrivez-nous : c’est le fondateur de Loomina qui vous répond.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
