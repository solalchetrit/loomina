"use client";

import { usePathname } from "next/navigation";

/**
 * Le menu, le pied de page et le bouton mobile du site ne s'affichent pas dans l'admin.
 * Avec `checkout`, ils disparaissent aussi pendant la commande et sur la page de
 * bienvenue : un parcours de paiement sans distraction, avec sa propre barre
 * (demande de Solal, 18/11/2026).
 */
export default function HideOnAdmin({ children, checkout = false }: { children: React.ReactNode; checkout?: boolean }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  if (checkout && (pathname.startsWith("/order") || pathname.startsWith("/bienvenue"))) return null;
  return <>{children}</>;
}
