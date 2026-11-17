import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Connexion" };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { erreur } = await searchParams;
  const configured = adminConfigured();
  return (
    <div className="card card-float mx-auto mt-6 w-full max-w-[460px] p-7 sm:p-10">
      <p className="t-eyebrow">Espace réservé à l’équipe</p>
      <h1 className="t-title mt-3">Accès admin</h1>
      {configured ? (
        <form action="/api/admin/login" method="post" className="mt-8">
          <label htmlFor="admin-password" className="field-label">Mot de passe</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus className="field" aria-invalid={erreur ? true : undefined} />
          {erreur && <p role="alert" className="mt-3 text-[15px] font-medium text-[var(--danger)]">Mot de passe incorrect.</p>}
          <button className="press mt-6 inline-flex h-14 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--ink)] text-[17px] font-bold text-white hover:bg-[var(--ink-soft)]">Entrer</button>
        </form>
      ) : (
        <p className="t-body mt-5">
          L’admin est fermée : la variable <code className="font-mono">ADMIN_PASSWORD</code> (8 caractères au moins) n’est pas posée sur le serveur.
        </p>
      )}
    </div>
  );
}
