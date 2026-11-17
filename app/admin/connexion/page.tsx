import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Connexion" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { erreur } = await searchParams;
  const configured = adminConfigured();
  return (
    <div className="w-full max-w-[400px] rounded-[24px] bg-white p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] sm:p-9">
      <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">Bon retour</h1>
      <p className="mt-1 text-[15px] text-[var(--ink-3)]">Espace réservé à l’équipe Loomina.</p>
      {configured ? (
        <form action="/api/admin/login" method="post" className="mt-7 grid gap-4">
          <label htmlFor="admin-password" className="text-[14px] font-semibold">Mot de passe</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus className="-mt-2 min-h-12 rounded-[14px] border border-[var(--line)] bg-[var(--canvas)] px-4 text-[16px] outline-none focus:border-[var(--ink)] focus:bg-white" />
          {erreur && <p role="alert" className="rounded-[12px] bg-[#fbeae6] px-3 py-2 text-[14px] font-medium text-[var(--danger)]">Mot de passe incorrect.</p>}
          <button className="mt-1 min-h-12 rounded-full bg-[var(--ink)] px-5 text-[16px] font-bold text-white hover:bg-black">Entrer</button>
        </form>
      ) : (
        <p className="mt-5 rounded-[14px] bg-[var(--amber-soft)] p-4 text-[15px] text-[var(--amber-deep)]">
          L’admin est fermée : la variable <code className="font-mono">ADMIN_PASSWORD</code> (8 caractères au moins) n’est pas posée sur le serveur.
        </p>
      )}
    </div>
  );
}
