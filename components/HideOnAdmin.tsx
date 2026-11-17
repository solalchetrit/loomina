"use client";

import { usePathname } from "next/navigation";

/** Le menu, le pied de page et le bouton mobile du site ne s'affichent pas dans l'admin. */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
