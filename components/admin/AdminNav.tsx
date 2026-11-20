"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AIcon, { type AdminIconName } from "./icons";

type Item = { href: string; label: string; icon: AdminIconName };

/** Les rubriques de l'admin, rangées par usage (refonte du 20/11/2026, puis audit du même jour). */
export const GROUPS: Array<{ title: string; items: Item[] }> = [
  {
    title: "Piloter",
    items: [
      { href: "/admin", label: "Aujourd’hui", icon: "home" },
      { href: "/admin/clients", label: "Clients", icon: "users" },
      { href: "/admin/livres", label: "Livres", icon: "book" },
      { href: "/admin/demos", label: "Démos", icon: "phone" },
    ],
  },
  {
    title: "Chiffres",
    items: [
      { href: "/admin/argent", label: "Argent", icon: "euro" },
      { href: "/admin/audience", label: "Audience", icon: "chart" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: "/admin/mails", label: "Mails", icon: "message" },
      { href: "/admin/technique", label: "Technique", icon: "server" },
    ],
  },
];

/** Les pages rangées sous une rubrique (la rubrique reste allumée). */
const ALIASES: Record<string, string[]> = {
  "/admin/technique": ["/admin/parcours", "/admin/structure", "/admin/ia"],
  "/admin/clients": ["/admin/suivi"],
  "/admin/argent": ["/admin/couts"],
};

const ALL = GROUPS.flatMap((g) => g.items);

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/admin" ? pathname === "/admin" : [href, ...(ALIASES[href] ?? [])].some((h) => pathname.startsWith(h)));
}

function NavLink({ item, active, compact = false }: { item: Item; active: boolean; compact?: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`press flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[14px] font-bold transition-colors duration-150 ${compact ? "h-10 px-3 text-[14.5px]" : "h-11 px-3.5 text-[15px]"} ${
        active ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
      }`}
    >
      <AIcon name={item.icon} size={18} className={active ? "text-[var(--amber)]" : "text-[var(--ink-3)]"} />
      {item.label}
    </Link>
  );
}

/** Ordinateur : une colonne à gauche, fixe, groupée. */
export function AdminSidebar() {
  const active = useActive();
  return (
    <nav aria-label="Rubriques de l’admin" className="sticky top-[6.25rem] hidden max-h-[calc(100vh-7.5rem)] w-[224px] shrink-0 overflow-y-auto lg:block">
      <div className="grid gap-5 rounded-[22px] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-bar)]">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="px-3.5 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{g.title}</p>
            <ul className="grid gap-0.5">
              {g.items.map((i) => (
                <li key={i.href}>
                  <NavLink item={i} active={active(i.href)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * Téléphone et tablette : la rubrique en cours, et un bouton qui déplie
 * toutes les rubriques, groupées comme sur ordinateur (au lieu d'une rangée
 * de huit onglets qui débordait de l'écran).
 */
export default function AdminNav() {
  const active = useActive();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ALL.find((i) => active(i.href)) ?? ALL[0];
  // Une page ouverte referme le menu.
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return (
    <nav aria-label="Rubriques de l’admin" className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-menu"
        onClick={() => setOpen((o) => !o)}
        className="press flex h-11 w-full items-center gap-2.5 rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--canvas)]"
      >
        <AIcon name={current.icon} size={18} className="text-[var(--amber-ink)]" />
        <span className="flex-1 text-left">{current.label}</span>
        <span className="text-[14px] font-semibold text-[var(--ink-3)]">{open ? "Fermer" : "Rubriques"}</span>
        <AIcon name="chevron" size={16} className={`text-[var(--ink-3)] transition-transform duration-200 ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>
      {open && (
        <div id="admin-menu" className="grid gap-4 px-1 pb-2 pt-3 sm:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-3 pb-1 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{g.title}</p>
              <ul className="grid gap-0.5">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <NavLink item={i} active={active(i.href)} compact />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
