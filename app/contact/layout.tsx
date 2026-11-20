import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Nous écrire",
    description: "Une question sur votre livre, un cadeau à préparer ? Écrivez-nous : c’est le fondateur de Loomina qui vous répond.",
    path: "/contact",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
