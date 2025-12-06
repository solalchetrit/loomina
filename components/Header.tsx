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
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-5 md:px-12">
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
                    className="flex flex-1 flex-wrap items-center justify-end gap-x-16 gap-y-4 text-base font-medium text-black"
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
                                className="px-3 py-2 text-black"
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="rounded-full border border-black/15 bg-black px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white"
                    >
                        Découvrir
                    </Link>
                </nav>
            </div>
        </header>
    );
}
