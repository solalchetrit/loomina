"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MagicButton from "./ui/MagicButton";

const NAV_LINKS = [
  { href: "#mission", label: "Notre Mission" },
  { href: "#process", label: "Le Parcours" },
  { href: "#audio-details", label: "L'Expérience" },
  { href: "#offres", label: "Offre" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white shadow-[0_12px_50px_-36px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center px-4 md:h-24 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-4 rounded-full py-2 pl-0 pr-4 transition hover:-translate-y-[1px] hover:shadow-[0_18px_50px_-40px_rgba(0,0,0,0.55)]"
        >
          <div className="relative h-10 w-36 md:h-12 md:w-48 -mt-1">
            <Image src="/header-logo-trimmed.png" alt="Logo Loomina" fill className="object-contain object-left" priority sizes="(max-width: 768px) 144px, 192px" />
          </div>
        </Link>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3 md:gap-4">


          <nav className="order-2 flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-2 py-1 text-sm font-semibold shadow-sm md:gap-3 md:px-4">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 transition hover:bg-[var(--loomina-cloud)] md:px-4 ${isActive
                    ? "bg-[var(--loomina-cloud)] text-[var(--loomina-amber-strong)] border border-black/5"
                    : "text-[var(--loomina-ink)]"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
