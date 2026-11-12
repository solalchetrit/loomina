"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";

/** Sur téléphone, les deux actions restent à portée de pouce une fois le haut de page passé. */
export default function MobileCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hidden = pathname.startsWith("/order") || pathname.startsWith("/dashboard");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hidden) return null;

  return (
    <>
      <div aria-hidden="true" className="h-24 xl:hidden" />
      <div
        className={`fixed inset-x-0 bottom-0 z-[900] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 xl:hidden ${
          visible ? "translate-y-0" : "translate-y-[120%]"
        }`}
      >
        <div className="mx-auto flex max-w-md gap-2 rounded-[22px] border border-[var(--line)] bg-white/95 p-2 shadow-[var(--shadow-bar)] backdrop-blur-md">
          <a
            href={`tel:${SITE.phone}`}
            tabIndex={visible ? 0 : -1}
            className="press flex h-12 flex-1 items-center justify-center rounded-[14px] bg-[var(--amber-soft)] text-[16px] font-bold text-[var(--amber-deep)]"
          >
            Essayer la démo
          </a>
          <Link
            href="/order"
            tabIndex={visible ? 0 : -1}
            className="press flex h-12 flex-1 items-center justify-center rounded-[14px] bg-[var(--ink)] text-[16px] font-bold text-white"
          >
            Commander
          </Link>
        </div>
      </div>
    </>
  );
}
