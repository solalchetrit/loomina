"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AIcon, { type AdminIconName } from "./icons";

type Item = { href: string; label: string; icon: AdminIconName };

/** Les rubriques de l'admin, rangées par usage (refonte du 20/11/2026, puis audit du même jour). */
export const GROUPS: Array<{ title: string; items: Item[] }> = [
  {
    title: "Piloter",
    items: [
      { href: "/admin", label: "Aujourd’hui", icon: "home" },
      { href: "/admin/clients", label: "Clients", icon: "users" },
      { href: "/admin/contacts", label: "Contacts", icon: "user" },
      { href: "/admin/livres", label: "Livres", icon: "book" },
      { href: "/admin/demos", label: "Démos", icon: "phone" },
    ],
  },
  {
    title: "Chiffres",
    items: [
      { href: "/admin/argent", label: "Argent", icon: "euro" },
      { href: "/admin/codes", label: "Codes promo", icon: "gift" },
      { href: "/admin/audience", label: "Audience", icon: "chart" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: "/admin/mails", label: "Mails", icon: "message" },
      { href: "/admin/emails-types", label: "E-mails types", icon: "copy" },
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
const OPEN_EVENT = "loomina-admin-menu";
const THEME_COOKIE = "loomina_admin_theme";

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/admin" ? pathname === "/admin" : [href, ...(ALIASES[href] ?? [])].some((h) => pathname.startsWith(h)));
}

/** Le logo du site : blanc sur le sombre, bleu sur le clair. Les vrais fichiers, jamais redessinés. */
function Logo() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5" aria-label="Loomina, admin">
      <span className="relative block h-[22px] w-[77px]">
        <Image src="/logo-loomina-blanc.png" alt="" fill sizes="77px" priority className="adm-logo-dark object-contain object-left" />
        <Image src="/header-logo-bleu.png" alt="" fill sizes="77px" priority className="adm-logo-light object-contain object-left" />
      </span>
      <span className="rounded-full border border-[var(--rule-strong)] px-2 py-px text-[11px] font-medium text-[var(--ink-3)]">Admin</span>
    </Link>
  );
}

/** Clair ou sombre : le choix est écrit sur la page et dans un cookie d'un an. */
function ThemeButton() {
  const toggle = () => {
    const root = document.getElementById("adm-root");
    if (!root) return;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/admin; max-age=31536000; samesite=lax`;
  };
  return (
    <button type="button" onClick={toggle} className="adm-navlink">
      <AIcon name="spark" size={16} />
      Clair ou sombre
    </button>
  );
}

/**
 * La colonne de gauche : logo, recherche d'un client (⌘K), rubriques, puis
 * l'état du serveur vocal et les sorties. Sur téléphone, elle glisse depuis
 * la gauche au bouton « Rubriques » de la barre du haut.
 */
export function AdminSidebar({ health }: { health?: React.ReactNode }) {
  const active = useActive();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);

  // Une page ouverte referme la colonne.
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const onMenu = () => setOpen((o) => !o);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        search.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN_EVENT, onMenu);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onMenu);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {open && <button type="button" aria-label="Fermer les rubriques" className="fixed inset-0 z-[1050] cursor-default lg:hidden" onClick={() => setOpen(false)} />}
      <aside className="adm-side" data-open={open}>
        <div className="px-2 pt-1">
          <Logo />
        </div>
        <form action="/admin/clients" method="get" role="search" className="relative">
          <AIcon name="search" size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            ref={search}
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Chercher un client"
            aria-label="Chercher un client par son nom ou son numéro"
            className="h-[34px] w-full rounded-[7px] border border-[var(--line)] bg-[var(--surface)] pl-8 pr-10 text-[13px] placeholder:text-[var(--ink-3)]"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-[5px] border border-[var(--rule-strong)] px-1.5 font-sans text-[11px] font-medium text-[var(--ink-3)]">⌘K</kbd>
        </form>
        <nav aria-label="Rubriques de l’admin" className="grid gap-3.5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-2.5 pb-1 text-[11.5px] font-medium text-[var(--ink-3)]">{g.title}</p>
              <ul className="grid gap-px">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} aria-current={active(i.href) ? "page" : undefined} className="adm-navlink">
                      <AIcon name={i.icon} size={16} />
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-auto grid gap-px border-t border-[var(--line)] pt-3">
          {health}
          <ThemeButton />
          <a href="https://www.loomina.eu" target="_blank" rel="noreferrer" className="adm-navlink">
            <AIcon name="external" size={16} />
            Voir le site
          </a>
          <form action="/api/admin/logout" method="post">
            <button className="adm-navlink">
              <AIcon name="logout" size={16} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

/** La barre du haut : où l'on est, la date du jour à Paris, et le bouton qui relit les chiffres des fournisseurs. */
export function AdminTopBar() {
  const active = useActive();
  const pathname = usePathname();
  const current = ALL.find((i) => active(i.href)) ?? ALL[0];
  const deeper = pathname !== current.href && pathname.startsWith("/admin/clients/");
  const [now, setNow] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setNow(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(new Date())), 0);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div className="adm-top">
      <span className="lg:hidden">
        <button type="button" aria-label="Ouvrir les rubriques" className="adm-ghost" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
          <AIcon name="layers" size={15} />
          Rubriques
        </button>
      </span>
      <p className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--ink-3)]">
        {deeper ? (
          <>
            <Link href={current.href} className="hover:text-[var(--ink)]">{current.label}</Link>
            <span aria-hidden="true">/</span>
            <span className="truncate font-medium text-[var(--ink)]">Fiche</span>
          </>
        ) : (
          <span className="truncate font-medium text-[var(--ink)]">{current.label}</span>
        )}
      </p>
      <span className="flex-1" />
      {now && <span className="hidden sm:block"><span className="adm-ghost first-letter:uppercase">{now}</span></span>}
      <form action="/api/admin/rafraichir" method="post">
        <input type="hidden" name="retour" value={pathname} />
        <button className="adm-ghost" title="Relire tout de suite Stripe, Twilio, OpenAI et Google (sinon gardés quelques minutes)">
          <AIcon name="refresh" size={14} />
          Actualiser
        </button>
      </form>
    </div>
  );
}
