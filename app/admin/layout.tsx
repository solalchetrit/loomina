import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import { AdminSidebar, AdminTopBar } from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/admin/auth";
import { voiceHealthKept } from "@/lib/admin/cached";
import "./admin.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Loomina" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/** Le choix clair ou sombre, gardé dans un cookie pour que la page arrive déjà dans le bon thème. */
const THEME_COOKIE = "loomina_admin_theme";

/** L'état du serveur vocal, en bas de la colonne. Chargé à part : il ne retarde pas la page. */
async function VoiceStatus() {
  const v = await voiceHealthKept();
  return (
    <p className="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] text-[var(--ink-2)]" title={v.detail}>
      <span className="size-[7px] shrink-0 rounded-full" style={{ background: v.ok ? "var(--success)" : "var(--danger)", boxShadow: `0 0 0 3px ${v.ok ? "var(--success-soft)" : "var(--danger-soft)"}` }} />
      {v.ok ? "Serveur vocal en ligne" : "Serveur vocal injoignable"}
    </p>
  );
}

/**
 * La coquille de l'admin (refonte du 24/11/2026) : une colonne de rubriques
 * sur toute la hauteur, une barre fine en haut, le contenu à droite.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  const theme = (await cookies()).get(THEME_COOKIE)?.value === "light" ? "light" : "dark";
  if (!admin) {
    return (
      <div className={`adm ${geist.variable}`} data-theme={theme}>
        {children}
      </div>
    );
  }
  return (
    <div className={`adm ${geist.variable}`} data-theme={theme} id="adm-root">
      <div className="adm-app">
        <AdminSidebar
          health={
            <Suspense fallback={<p className="px-2.5 py-1.5 text-[12.5px] text-[var(--ink-3)]">Serveur vocal…</p>}>
              <VoiceStatus />
            </Suspense>
          }
        />
        <div className="adm-main">
          <AdminTopBar />
          <main className="adm-page">{children}</main>
        </div>
      </div>
    </div>
  );
}
