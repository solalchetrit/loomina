import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AdminNav, { AdminSidebar } from "@/components/admin/AdminNav";
import AIcon from "@/components/admin/icons";
import { isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Loomina" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** Le logo bleu et sa mention, comme l'espace auteur (« Auteur » y devient « Admin »). */
function Logo() {
  return (
    <Link href="/" className="flex shrink-0 flex-col" aria-label="Loomina, admin. Retour au site">
      <span className="relative block h-[26px] w-[91px] md:h-[28px] md:w-[98px]">
        <Image src="/header-logo-bleu.png" alt="" fill className="object-contain object-left" priority sizes="98px" />
      </span>
      <span aria-hidden="true" className="mt-[5px] flex items-center gap-2">
        <span className="h-px flex-1 bg-[var(--amber)]" />
        <span className="-mr-[0.32em] text-[9.5px] font-bold uppercase leading-none tracking-[0.32em] text-[var(--amber-ink)]">Admin</span>
      </span>
    </Link>
  );
}

/** La barre flottante de l'espace auteur, et une colonne de rubriques à gauche sur ordinateur. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto max-w-[1360px] rounded-[22px] border border-white/70 bg-white/80 shadow-[var(--shadow-bar)] backdrop-blur-xl backdrop-saturate-150">
          <div className="flex h-16 items-center justify-between gap-3 pl-5 pr-2.5 md:h-[68px] md:pl-6">
            <Logo />
            {admin && (
              <div className="flex items-center gap-1">
                <a href="https://www.loomina.eu" target="_blank" rel="noreferrer" className="press hidden h-11 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink-2)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] sm:inline-flex">
                  <AIcon name="external" size={17} /> Voir le site
                </a>
                <form action="/api/admin/logout" method="post">
                  <button aria-label="Se déconnecter" className="press inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--canvas)]">
                    <AIcon name="logout" size={18} />
                    <span className="hidden lg:inline">Se déconnecter</span>
                  </button>
                </form>
              </div>
            )}
          </div>
          {admin && (
            <div className="border-t border-[var(--line-soft)] px-2.5 py-2 lg:hidden">
              <AdminNav />
            </div>
          )}
        </div>
      </header>
      <div className={`mx-auto flex w-full max-w-[1360px] gap-6 px-4 pb-20 sm:px-5 ${admin ? "pt-[9.6rem] lg:pt-[6.25rem]" : "pt-[7rem]"}`}>
        {admin && <AdminSidebar />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
