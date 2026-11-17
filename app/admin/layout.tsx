import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import AIcon from "@/components/admin/icons";
import { isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Loomina" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function Logo() {
  return (
    <Link href="/admin" className="flex shrink-0 items-center gap-2.5" aria-label="Admin Loomina, accueil">
      <span className="relative block h-7 w-[118px] md:h-[30px] md:w-[128px]">
        <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" priority sizes="128px" />
      </span>
      <span className="pill pill-amber">Admin</span>
    </Link>
  );
}

/** Même menu flottant que le site : une barre blanche arrondie au-dessus de la page. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[22px] border border-[var(--line)] bg-white/90 py-2.5 pl-5 pr-2.5 shadow-[var(--shadow-bar)] backdrop-blur-md md:min-h-[68px] md:pl-6">
          <Logo />
          {admin && (
            <>
              <div className="order-3 w-full min-w-0 lg:order-2 lg:w-auto"><AdminNav /></div>
              <form action="/api/admin/logout" method="post" className="order-2 lg:order-3">
                <button aria-label="Se déconnecter" className="press inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--surface-2)] lg:px-4">
                  <AIcon name="logout" size={18} />
                  <span className="hidden lg:inline">Se déconnecter</span>
                </button>
              </form>
            </>
          )}
        </div>
      </header>
      <main className={`mx-auto w-full max-w-[1240px] px-5 pb-20 sm:px-6 ${admin ? "pt-[10.5rem] lg:pt-[8.5rem]" : "pt-[7rem]"}`}>{children}</main>
    </div>
  );
}
