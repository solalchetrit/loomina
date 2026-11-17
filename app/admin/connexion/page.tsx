import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Connexion" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { erreur } = await searchParams;
  const configured = adminConfigured();
  return (
    <div className="mx-auto mt-10 max-w-[420px] rounded-[20px] border border-[var(--line)] bg-white p-6 sm:p-8">
      <h1 className="text-[24px] font-extrabold tracking-[-0.02em]">Accès admin</h1>
      {configured ? (
        <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-[15px] font-semibold">
            Mot de passe
            <input name="password" type="password" autoComplete="current-password" required autoFocus className="min-h-12 rounded-[12px] border border-[var(--rule-strong,#d6d4cc)] px-3 text-[16px] font-normal" />
          </label>
          {erreur && <p role="alert" className="text-[15px] font-medium text-[var(--danger)]">Mot de passe incorrect.</p>}
          <button className="min-h-12 rounded-full bg-[var(--ink)] px-5 text-[16px] font-bold text-white">Entrer</button>
        </form>
      ) : (
        <p className="mt-4 text-[15px] text-[var(--ink-2)]">
          L’admin est fermée : la variable <code className="font-mono">ADMIN_PASSWORD</code> (8 caractères au moins) n’est pas posée sur le serveur.
        </p>
      )}
    </div>
  );
}
