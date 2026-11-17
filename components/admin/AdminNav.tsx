"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Vue d’ensemble" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/parcours", label: "La carte" },
  { href: "/admin/structure", label: "Structure et IA" },
];

/** Les liens de l'admin, dans le style du menu du site. */
export default function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="-mx-1 flex gap-0.5 overflow-x-auto px-1">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={`shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${
            active(l.href) ? "bg-[var(--surface-2)] text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
