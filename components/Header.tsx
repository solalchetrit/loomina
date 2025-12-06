"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
];

export default function Header() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white/90 via-white/85 to-white/90 border-b border-[var(--loomina-gold)]/30 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
                <Link href="/" className="relative h-[52px] w-[170px] shrink-0">
                    <Image
                        src="/header_logo.png"
                        alt="Lúmina"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative rounded-full px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
                                    isActive
                                        ? "text-[var(--loomina-burgundy)]"
                                        : "text-[var(--loomina-text-light)] hover:text-[var(--loomina-burgundy)]"
                                }`}
                            >
                                <span className="relative z-10">{item.label}</span>
                                <span
                                    className={`absolute inset-0 rounded-full bg-[var(--loomina-gold)]/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                                        isActive ? "opacity-100" : ""
                                    }`}
                                    aria-hidden
                                />
                                <span
                                    className={`absolute left-1/2 bottom-1 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[var(--loomina-gold)] transition-all duration-300 group-hover:w-10 ${
                                        isActive ? "w-10" : ""
                                    }`}
                                    aria-hidden
                                />
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="ml-3 rounded-full border border-[var(--loomina-gold)]/60 bg-[var(--loomina-burgundy)] px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md hover:shadow-[var(--loomina-gold)]/20"
                    >
                        Découvrir
                    </Link>
                </nav>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--loomina-gold)]/40 bg-white/80 p-2 text-[var(--loomina-text)] shadow-sm transition hover:bg-[var(--loomina-gold)]/10 md:hidden"
                    aria-label="Ouvrir le menu"
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        {isOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        )}
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-6 md:hidden">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between rounded-xl border border-[var(--loomina-gold)]/30 bg-white/95 px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.15em] shadow-sm transition hover:-translate-y-[1px] hover:border-[var(--loomina-gold)]/60 hover:shadow ${
                                    isActive ? "text-[var(--loomina-burgundy)]" : "text-[var(--loomina-text-light)]"
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                                <span className="h-2 w-2 rounded-full bg-[var(--loomina-gold)]" aria-hidden />
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="flex items-center justify-center rounded-xl bg-[var(--loomina-burgundy)] px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.15em] text-white shadow-md shadow-[var(--loomina-gold)]/20 transition hover:-translate-y-[1px]"
                        onClick={() => setIsOpen(false)}
                    >
                        Découvrir nos offres
                    </Link>
                </div>
            )}
        </header>
    );
}
