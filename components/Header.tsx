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
        <header className="sticky top-0 z-50 w-full border-b border-[var(--loomina-gold)]/40 bg-black shadow-sm backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-5 md:px-10">
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
                    className="flex flex-1 flex-wrap items-center justify-end gap-x-16 gap-y-4 text-sm font-semibold text-white"
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
                                className={`rounded-full px-3 py-2 ${
                                    isActive
                                        ? "underline decoration-[var(--loomina-gold)] decoration-2 underline-offset-6"
                                        : ""
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/offres"
                        className="rounded-full border border-white/20 bg-white px-6 py-[10px] text-[13px] font-semibold uppercase tracking-[0.18em] text-black"
                        >
                        Découvrir
                    </Link>
                </nav>
            </div>
        </header>
    );
}
