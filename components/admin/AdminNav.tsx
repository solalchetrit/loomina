"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AIcon, { type AdminIconName } from "./icons";

type Item = { href: string; label: string; icon: AdminIconName };

/** Les rubriques de l'admin, rangées par usage (refonte du 20/11/2026). */
export const GROUPS: Array<{ title: string; items: Item[] }> = [
  {
    title: "Piloter",
    items: [
      { href: "/admin", label: "Aujourd’hui", icon: "home" },
      { href: "/admin/suivi", label: "Suivi client", icon: "route" },
      { href: "/admin/clients", label: "Clients", icon: "users" },
      { href: "/admin/demos", label: "Démos", icon: "phone" },
    ],
  },
  {
    title: "Chiffres",
    items: [
      { href: "/admin/audience", label: "Audience", icon: "chart" },
      { href: "/admin/couts", label: "Coûts", icon: "euro" },
    ],
  },
  {
    title: "Outils",
    items: [{ href: "/admin/mails", label: "Mails", icon: "message" }],
  },
  {
    title: "Coulisses",
    items: [
      { href: "/admin/parcours", label: "La carte", icon: "layers" },
      { href: "/admin/structure", label: "Structure", icon: "server" },
      { href: "/admin/ia", label: "Les IA", icon: "spark" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
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

/** Téléphone et tablette : une rangée qui défile sous la barre. */
export default function AdminNav() {
  const active = useActive();
  return (
    <nav aria-label="Rubriques de l’admin" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] lg:hidden">
      {ALL.map((i) => (
        <NavLink key={i.href} item={i} active={active(i.href)} compact />
      ))}
    </nav>
  );
}
