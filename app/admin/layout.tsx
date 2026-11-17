import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Loomina" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="text-[18px] font-extrabold tracking-[-0.02em]">
            Loomina <span className="text-[var(--amber-ink)]">admin</span>
          </Link>
          {admin && (
            <div className="flex flex-wrap items-center gap-3">
              <AdminNav />
              <form action="/api/admin/logout" method="post">
                <button className="rounded-full px-3 py-1.5 text-[14px] font-semibold text-[var(--ink-3)] hover:bg-[var(--surface-2)]">Se déconnecter</button>
              </form>
            </div>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
