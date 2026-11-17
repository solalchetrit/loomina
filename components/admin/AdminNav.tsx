"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Vue d’ensemble" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/structure", label: "Structure et IA" },
  { href: "/admin/parcours", label: "Parcours" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Admin">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-[15px] font-semibold ${active(l.href) ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]"}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
