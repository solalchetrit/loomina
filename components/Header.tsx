"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// J'ai unifié tous les liens ici pour qu'ils aient le même traitement
const NAV_LINKS = [
    { href: "/", label: "Accueil" },
    { href: "/mission", label: "Mission" },
    { href: "/offres", label: "Offres" },
    { href: "/decouvrir", label: "Découvrir" }, // "Découvrir" est maintenant un lien simple
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-8">
                
                {/* 1. Logo à Gauche */}
                <Link href="/" className="relative flex h-10 w-32 shrink-0 items-center">
                    <Image
                        src="/header_logo.png" 
                        alt="Lúmina"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>

                {/* 2. Navigation Unifiée (Tout le monde a le même style) */}
                <nav className="hidden md:flex items-center gap-12 font-[family-name:var(--font-plus-jakarta-sans)] font-medium text-sm text-neutral-600">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`transition-colors duration-200 hover:text-black ${
                                    isActive ? "text-black font-bold" : ""
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* 3. Mobile Menu (Placeholder) - Optionnel si tu veux garder le côté épuré à droite */}
                <div className="flex md:hidden">
                    <button className="text-black">
                        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
                
                {/* Bloc vide pour équilibrer le logo si on veut centrer le menu parfaitement, sinon on peut laisser vide */}
                <div className="hidden md:block w-32"></div> 
            </div>
        </header>
    );
}
