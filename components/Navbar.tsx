"use client";

import Link from "next/link";



const navItems = [
    { name: "Accueil", link: "/" },
    { name: "À propos", link: "/about" },
    { name: "Projets", link: "/projects" },
    { name: "Contact", link: "/contact" },
];

export default function Navbar() {
    return (
        <div className="fixed top-6 inset-x-0 max-w-2xl mx-auto z-50">
            <nav className="relative flex flex-row items-center justify-center gap-6 rounded-full border border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md p-2 shadow-lg font-[var(--font-plus-jakarta-sans)]">
                {navItems.map((item) => (
                    <Link
                        key={item.link}
                        href={item.link}
                        className="
              relative px-4 py-2 text-sm font-medium rounded-full
              text-black
              transition-all duration-200
              hover:bg-gray-200 dark:hover:bg-white/10
              hover:text-black
            "
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
