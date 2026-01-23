import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace client",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
