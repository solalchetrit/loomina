import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La carte à offrir",
  robots: { index: false, follow: false },
};

export default function CarteCadeauLayout({ children }: { children: React.ReactNode }) {
  return children;
}
