import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Comment ça marche : raconter sa vie au téléphone",
    description: "Avant, pendant, après : comment vos appels téléphoniques deviennent un livre, étape par étape, et les 14 thèmes proposés.",
    path: "/experience",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
