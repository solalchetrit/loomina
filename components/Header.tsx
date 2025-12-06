"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
    { href: "/decouvrir", label: "Découvrir" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        // Z-index très élevé pour passer au dessus de tout
        <header className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                
                {/* 1. Logo - Utilisation de logo.png avec dimensions fixes */}
                <Link href="/" className="flex items-center shrink-0">
                    <Image
                        src="/logo.png" 
                        alt="Lúmina Logo"
                        width={150}
                        height={50}
                        className="object-contain"
                        priority
                    />
                </Link>

                {/* 2. Navigation - VISIBLE PAR DÉFAUT (flex au lieu de hidden) */}
                <nav className="flex items-center gap-8 font-[family-name:var(--font-plus-jakarta-sans)]">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-bold transition-colors hover:text-gray-600 ${
                                    isActive ? "text-black underline underline-offset-4" : "text-black"
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
