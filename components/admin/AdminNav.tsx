"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AIcon, { type AdminIconName } from "./icons";

const LINKS: Array<{ href: string; label: string; icon: AdminIconName }> = [
  { href: "/admin", label: "Vue d’ensemble", icon: "home" },
  { href: "/admin/clients", label: "Clients", icon: "users" },
  { href: "/admin/parcours", label: "Parcours", icon: "route" },
  { href: "/admin/structure", label: "Structure et IA", icon: "layers" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {LINKS.map((l) => {
        const on = active(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? "page" : undefined}
            className={`group flex shrink-0 items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] font-semibold transition-colors ${
              on ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <AIcon name={l.icon} className={on ? "text-[var(--amber)]" : "text-white/50 group-hover:text-white/80"} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
