"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
    { href: "/accompagnement", label: "Accompagnement" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-8">
                
                {/* LOGO */}
                <Link href="/" className="relative h-[52px] w-[170px] shrink-0">
                    <Image
                        src="/header_logo.png"
                        alt="Lúmina"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                {/* NAVIGATION - Note le 'gap-12' pour l'espace et 'text-black' pour la couleur */}
                <nav className="flex items-center gap-12 font-[family-name:var(--font-plus-jakarta-sans)] text-[15px] font-bold text-black">
                    {NAV_LINKS.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`transition-opacity hover:opacity-60 ${
                                    isActive ? "opacity-100 underline underline-offset-4" : "opacity-100 no-underline"
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
