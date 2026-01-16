"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Accueil", path: "/" },
        { name: "Tarifs", path: "/tarifs" },
        { name: "Assistant IA", path: "/assistant" },
        { name: "Blog", path: "/blog" },
        { name: "Contact", path: "/contact" },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]">
            <nav className="flex gap-1 rounded-full border border-black/5 bg-white/80 p-1.5 shadow-lg shadow-black/[0.03] backdrop-blur-md dark:border-white/10 dark:bg-black/80">
                {navItems.map((item) => {
                    const isActive = item.path === pathname;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                ${isActive
                                    ? "bg-white text-black shadow-sm dark:bg-neutral-800 dark:text-white"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/10"
                                }
              `}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
