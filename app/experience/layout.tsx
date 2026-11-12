import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description: "Avant, pendant, après : comment vos appels téléphoniques deviennent un livre relié, étape par étape, et les 14 thèmes proposés.",
  alternates: { canonical: "/experience" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
