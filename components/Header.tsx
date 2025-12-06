"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--loomina-gold)]/30 bg-white/95 shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-10">
                <Link href="/" className="relative h-[52px] w-[170px] shrink-0">
                    <Image
                        src="/header_logo.png"
                        alt="Lúmina"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                <nav
                    className="flex flex-1 flex-wrap items-center justify-end gap-x-12 gap-y-4 text-sm font-medium text-black"
                    style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
                >
                    {NAV_LINKS.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`rounded-full px-3 py-2 transition-colors ${
                                    isActive
                                        ? "text-[var(--loomina-burgundy)] underline decoration-[var(--loomina-gold)] decoration-2 underline-offset-4"
                                        : "text-black hover:text-[var(--loomina-burgundy)]"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="rounded-full border border-black/10 bg-black px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md hover:shadow-black/20"
                    >
                        Découvrir
                    </Link>
                </nav>
            </div>
        </header>
    );
}
