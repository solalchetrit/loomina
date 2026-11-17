import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import AIcon from "@/components/admin/icons";
import { isAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Loomina" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 text-white">
      <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[var(--amber)] text-[var(--ink)]">
        <AIcon name="star" size={18} />
      </span>
      <span className="leading-tight">
        <span className="block text-[17px] font-extrabold tracking-[-0.02em]">Loomina</span>
        <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-white/50">Admin</span>
      </span>
    </Link>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  if (!admin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink)] px-4 py-10">
        <div className="mb-8"><Brand /></div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 z-30 bg-[var(--ink)] px-3 py-3 lg:flex lg:h-screen lg:flex-col lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-3 px-1 lg:mb-8 lg:px-2">
          <Brand />
          <form action="/api/admin/logout" method="post" className="lg:hidden">
            <button className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[14px] font-semibold text-white/60 hover:text-white" aria-label="Se déconnecter">
              <AIcon name="logout" />
            </button>
          </form>
        </div>
        <div className="mt-3 lg:mt-0 lg:flex-1"><AdminNav /></div>
        <form action="/api/admin/logout" method="post" className="hidden lg:block">
          <button className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] font-semibold text-white/50 hover:bg-white/5 hover:text-white">
            <AIcon name="logout" /> Se déconnecter
          </button>
        </form>
      </aside>
      <div className="min-w-0">
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
