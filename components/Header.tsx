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
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
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

                <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--loomina-text)] md:flex">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-1 py-2 transition-colors duration-200 ${
                                    isActive
                                        ? "text-[var(--loomina-burgundy)] underline underline-offset-8 decoration-2"
                                        : "text-[var(--loomina-text-light)] hover:text-[var(--loomina-burgundy)] hover:underline hover:underline-offset-8 hover:decoration-2"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="rounded-full border border-[var(--loomina-burgundy)] px-4 py-2 text-[var(--loomina-burgundy)] transition hover:bg-[var(--loomina-burgundy)] hover:text-white"
                    >
                        Découvrir
                    </Link>
                </nav>

                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white/80 p-2 text-[var(--loomina-text)] shadow-sm transition hover:bg-slate-100 md:hidden"
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
                                className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--loomina-burgundy)] hover:text-[var(--loomina-burgundy)] ${
                                    isActive ? "text-[var(--loomina-burgundy)]" : "text-[var(--loomina-text-light)]"
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                                <span className="h-[3px] w-5 rounded-full bg-[var(--loomina-burgundy)]" aria-hidden />
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="flex items-center justify-center rounded-lg border border-[var(--loomina-burgundy)] bg-[var(--loomina-burgundy)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110"
                        onClick={() => setIsOpen(false)}
                    >
                        Découvrir nos offres
                    </Link>
                </div>
            )}
        </header>
    );
}
