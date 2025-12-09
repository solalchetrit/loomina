"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#mission", label: "Notre Mission" },
  { href: "#process", label: "Le Parcours" },
  { href: "#offres", label: "Offre" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="relative z-10 flex shrink-0 items-center">
          <div className="relative h-8 w-40">
            <Image
              src="/header-logo-trimmed.png"
              alt="Logo Loomina"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 144px, 192px"
            />
          </div>
        </Link>

        {/* Clean Navigation */}
        {/* Clean Navigation - Mobile Scrollable & Desktop Capsule */}
        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar w-full md:w-auto px-6 md:px-6 pb-4 md:pb-2 pt-2 md:pt-2 absolute md:relative top-20 md:top-0 left-0 md:left-auto bg-white/95 md:bg-neutral-100/50 md:backdrop-blur-md md:rounded-full md:border md:border-black/5 border-b md:border-none border-neutral-100 md:justify-end transition-all">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-black tracking-wide whitespace-nowrap px-3 py-1.5 hover:bg-white rounded-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
