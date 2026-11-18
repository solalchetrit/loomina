import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { isFolder, readMail, quote, type Folder } from "@/lib/admin/mailbox";
import { fmtDate } from "@/lib/admin/format";
import { Panel } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Mail" };
export const maxDuration = 60;

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);

/** Un message de la boîte, avec la réponse juste en dessous. */
export default async function AdminMail({ params, searchParams }: { params: Promise<{ uid: string }>; searchParams: Promise<{ dossier?: string; erreur?: string }> }) {
  await requireAdmin();
  const uid = Number((await params).uid);
  const sp = await searchParams;
  const folder: Folder = isFolder(sp.dossier) ? sp.dossier : "inbox";
  if (!Number.isInteger(uid) || uid < 1) notFound();

  let mail: Awaited<ReturnType<typeof readMail>> = null;
  let error: string | null = null;
  try {
    mail = await readMail(folder, uid);
  } catch (err) {
    error = `La boîte ne répond pas : ${err instanceof Error ? err.message : String(err)}`;
  }
  if (!mail && !error) notFound();

  const replySubject = mail ? (/^re\s*:/i.test(mail.subject) ? mail.subject : `Re: ${mail.subject}`) : "";

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <Link href={`/admin/mails?dossier=${folder}`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]">
          <AIcon name="chevron" size={14} className="rotate-180" /> Mails
        </Link>
        {sp.erreur && <p role="status" className="mt-4 rounded-[16px] bg-[#fbeae6] px-4 py-3 text-[15px] font-semibold text-[#a8402f]">{sp.erreur}</p>}
        {error && <p className="mt-4 rounded-[16px] bg-[#fbeae6] px-4 py-3 text-[15px] font-semibold text-[#a8402f]">{error}</p>}
      </div>

      {mail && (
        <>
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="min-w-0 flex-1 text-[24px] font-extrabold leading-tight tracking-[-0.02em] [overflow-wrap:anywhere]">{mail.subject}</h1>
              {folder !== "trash" && (
                <form action={`/api/admin/mails/${uid}/trash?dossier=${folder}`} method="post">
                  <button className="press inline-flex h-10 items-center rounded-[12px] bg-white px-3.5 text-[14px] font-bold text-[#a8402f] shadow-[0_0_0_1px_var(--line)]">Mettre à la corbeille</button>
                </form>
              )}
            </div>
            <dl className="mt-3 grid gap-1 text-[15px] text-[var(--ink-2)]">
              <div><dt className="inline font-semibold text-[var(--ink)]">De : </dt><dd className="inline [overflow-wrap:anywhere]">{mail.from}</dd></div>
              <div><dt className="inline font-semibold text-[var(--ink)]">À : </dt><dd className="inline [overflow-wrap:anywhere]">{mail.to}</dd></div>
              {mail.cc && <div><dt className="inline font-semibold text-[var(--ink)]">Copie : </dt><dd className="inline [overflow-wrap:anywhere]">{mail.cc}</dd></div>}
              <div><dt className="inline font-semibold text-[var(--ink)]">Le : </dt><dd className="inline">{fmtDate(mail.date)}</dd></div>
            </dl>
            {mail.files.length > 0 && (
              <p className="mt-3 text-[14.5px] text-[var(--ink-3)]">
                Pièces jointes (à ouvrir dans votre logiciel de messagerie) : {mail.files.map((f) => `${f.name} (${kb(f.size)})`).join(", ")}
              </p>
            )}
            <div className="mt-5 border-t border-[var(--line-soft)] pt-5">
              {mail.html ? (
                // Cadre isolé : aucun script du message ne peut s'exécuter ni toucher à l'admin.
                <iframe title="Contenu du message" sandbox="" referrerPolicy="no-referrer" srcDoc={`<base target="_blank"><style>body{font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;color:#161616;margin:0;overflow-wrap:anywhere}img{max-width:100%;height:auto}</style>${mail.html}`} className="h-[60vh] min-h-[320px] w-full rounded-[12px] border border-[var(--line-soft)] bg-white" />
              ) : (
                <p className="whitespace-pre-wrap text-[16px] leading-relaxed [overflow-wrap:anywhere]">{mail.text || "(message vide)"}</p>
              )}
            </div>
          </Panel>

          {folder !== "sent" && mail.fromAddress && (
            <Panel icon="pen" title="Répondre">
              <form action="/api/admin/mails/send" method="post" className="grid gap-3">
                <input type="hidden" name="reply_folder" value={folder} />
                <input type="hidden" name="reply_uid" value={uid} />
                <label className="grid gap-1 text-[14px] font-semibold">
                  À
                  <input name="to" required type="email" defaultValue={mail.fromAddress} className="h-11 rounded-[12px] border border-[var(--line)] bg-white px-3 text-[16px] font-normal" />
                </label>
                <label className="grid gap-1 text-[14px] font-semibold">
                  Objet
                  <input name="subject" required maxLength={250} defaultValue={replySubject} className="h-11 rounded-[12px] border border-[var(--line)] bg-white px-3 text-[16px] font-normal" />
                </label>
                <label className="grid gap-1 text-[14px] font-semibold">
                  Votre réponse
                  <textarea name="text" required rows={12} defaultValue={quote(mail)} className="rounded-[12px] border border-[var(--line)] bg-white p-3 text-[16px] font-normal leading-relaxed" />
                </label>
                <div>
                  <button className="press inline-flex h-11 items-center rounded-[14px] bg-[var(--ink)] px-5 text-[15px] font-bold text-white">Envoyer la réponse</button>
                </div>
              </form>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
