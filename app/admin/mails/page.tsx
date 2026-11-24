import { requireAdmin } from "@/lib/admin/auth";
import { FOLDERS, isFolder, listMails, mailboxConfigured, mailboxUser, searchMails, type Folder, type MailList } from "@/lib/admin/mailbox";
import { MailApp } from "./app";

export const metadata = { title: "Mails" };
export const maxDuration = 60;

/** La boîte contact@loomina.eu, au format webmail (comme sur L'Étincelle). */
export default async function AdminMails({ searchParams }: { searchParams: Promise<{ folder?: string; q?: string; m?: string; ecrire?: string; objet?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const folder: Folder = isFolder(sp.folder) ? sp.folder : "inbox";
  const q = (sp.q ?? "").trim().slice(0, 100);
  const ecrire = sp.ecrire && /^[^@\s]+@[^@\s]+$/.test(sp.ecrire) ? { to: sp.ecrire, objet: (sp.objet ?? "").slice(0, 200) } : null;

  let liste: MailList | null = null;
  let erreur = "";
  if (!mailboxConfigured()) erreur = "Le mot de passe de la boîte (SMTP_PASS) n’est pas posé sur Vercel.";
  else {
    try {
      liste = q.length >= 2 ? await searchMails(folder, q) : await listMails(folder);
    } catch (err) {
      erreur = `La boîte ne répond pas : ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return (
    <div className="w-full">
      {liste ? (
        <MailApp key={`${folder}:${q}`} user={mailboxUser()} folders={FOLDERS} folder={folder} q={q} liste={liste} ouvrir={Number(sp.m) || null} ecrire={ecrire} />
      ) : (
        <div className="card p-10 text-center">
          <p className="text-[18px] font-semibold">Boîte mail indisponible</p>
          <p className="mt-2 text-[14px] text-[var(--ink-3)]">{erreur}</p>
        </div>
      )}
    </div>
  );
}
