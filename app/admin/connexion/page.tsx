import Image from "next/image";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Connexion" };

/** La porte de l'admin : à gauche ce qu'on y trouve, à droite le mot de passe. */
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { erreur } = await searchParams;
  const configured = adminConfigured();
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <div className="adm-login-art flex min-h-[300px] flex-col justify-between gap-10 p-8 sm:p-10">
        <span className="relative block h-[26px] w-[91px]">
          <Image src="/logo-loomina-blanc.png" alt="Loomina" fill sizes="91px" priority className="object-contain object-left" />
        </span>
        <div>
          <p className="max-w-[14ch] text-balance text-[clamp(28px,3.4vw,40px)] font-semibold leading-[1.06] tracking-[-0.03em]">Tout Loomina, au même endroit.</p>
          <p className="mt-3.5 max-w-[42ch] text-[15.5px] text-white/65">Les auteurs, leurs appels, leurs livres et les comptes, avec un seul accès.</p>
          <ul className="mt-6 grid max-w-[440px] grid-cols-3 gap-2.5 text-[13px]">
            {[
              ["Auteurs", "Qui avance, qui relancer"],
              ["Appels", "Écoute, récits, coûts"],
              ["Livres", "Relecture et envoi"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[10px] border border-white/[0.12] bg-white/[0.05] px-3 py-2.5 backdrop-blur-sm">
                <b className="block font-semibold">{t}</b>
                <span className="text-white/60">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid place-items-center px-4 py-12">
        <div className="w-full max-w-[340px]">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Connexion</h1>
          <p className="mt-1.5 text-[var(--ink-2)]">Réservée à l’équipe Loomina.</p>
          {configured ? (
            <form action="/api/admin/login" method="post" className="mt-7 grid gap-4">
              <div>
                <label htmlFor="admin-password" className="field-label">Mot de passe</label>
                <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus className="field" aria-invalid={erreur ? true : undefined} />
                {erreur && <p role="alert" className="mt-2 text-[13px] font-medium text-[var(--danger)]">Mot de passe incorrect.</p>}
              </div>
              <button className="adm-btn !h-10 w-full">Se connecter</button>
            </form>
          ) : (
            <p className="t-body mt-5">
              L’admin est fermée : la variable <code className="font-mono">ADMIN_PASSWORD</code> (8 caractères au moins) n’est pas posée sur le serveur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
