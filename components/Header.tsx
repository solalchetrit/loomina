"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
    { href: "/offres", label: "Découvrir" }, // "Découvrir" pointe vers offres aussi, en style lien simple
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 md:px-10">
                
                {/* LOGO ORIGINAL RESTAURÉ */}
                <Link href="/" className="relative h-[52px] w-[170px] shrink-0">
                    <Image
                        src="/header_logo.png"
                        alt="Lúmina"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                {/* NAVIGATION STYLE UNLOCKY (Noir, Gras, Espacé, Visible) */}
                <nav className="flex items-center gap-10 font-[family-name:var(--font-plus-jakarta-sans)] text-sm font-bold text-black">
                    {NAV_LINKS.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`transition-opacity hover:opacity-70 ${
                                    isActive ? "opacity-100" : "opacity-90"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
