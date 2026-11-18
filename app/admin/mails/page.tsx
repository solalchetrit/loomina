import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { FOLDERS, isFolder, listMails, mailboxConfigured, mailboxUser, type Folder } from "@/lib/admin/mailbox";
import { fmtDate } from "@/lib/admin/format";
import { PageHeader, Panel, Empty } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Mails" };
export const maxDuration = 60;

const PER_PAGE = 30;
/** « Jeanne Martin <j@x.fr> » → « Jeanne Martin ». */
const short = (who: string) => who.split(",")[0].replace(/<[^>]*>/g, "").replace(/"/g, "").trim() || who;

/** La boîte contact@loomina.eu, lue en direct chez l'hébergeur. */
export default async function AdminMails({ searchParams }: { searchParams: Promise<{ dossier?: string; page?: string; fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const folder: Folder = isFolder(sp.dossier) ? sp.dossier : "inbox";
  const page = Math.max(1, Number(sp.page) || 1);

  let data: Awaited<ReturnType<typeof listMails>> | null = null;
  let error: string | null = null;
  if (!mailboxConfigured()) error = "Le mot de passe de la boîte n’est pas posé sur Vercel (SMTP_PASS).";
  else {
    try {
      data = await listMails(folder, page, PER_PAGE);
    } catch (err) {
      error = `La boîte ne répond pas : ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  const pages = data ? Math.max(1, Math.ceil(data.total / PER_PAGE)) : 1;
  const link = (f: Folder, p = 1) => `/admin/mails?dossier=${f}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <div>
      <PageHeader
        eyebrow="Mails"
        title="Votre boîte"
        action={<Link href="/admin/mails/nouveau" className="press inline-flex h-11 items-center gap-2 rounded-[14px] bg-[var(--ink)] px-4 text-[15px] font-bold text-white"><AIcon name="pen" size={16} /> Écrire un mail</Link>}
      >
        {mailboxUser()}, lue en direct. Ce que vous faites ici (lire, répondre, mettre à la corbeille) se retrouve dans votre logiciel de messagerie, et inversement.
      </PageHeader>

      {(sp.fait || sp.erreur) && (
        <p role="status" className={`mb-5 rounded-[16px] px-4 py-3 text-[15px] font-semibold ${sp.fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[#a8402f]"}`}>{sp.fait ?? sp.erreur}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <Link
            key={f.key}
            href={link(f.key)}
            aria-current={f.key === folder ? "page" : undefined}
            className={`press whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-bold ${f.key === folder ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--ink)] shadow-[0_0_0_1px_var(--line)]"}`}
          >
            {f.label}
            {f.key === folder && data && f.key === "inbox" && data.unseen > 0 ? ` · ${data.unseen} non lu(s)` : ""}
          </Link>
        ))}
      </div>

      <Panel>
        {error ? (
          <Empty>{error}</Empty>
        ) : !data || data.missing ? (
          <Empty>Ce dossier n’existe pas encore dans la boîte.</Empty>
        ) : data.messages.length === 0 ? (
          <Empty>Aucun message dans ce dossier.</Empty>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {data.messages.map((m) => (
              <li key={m.uid}>
                <Link href={`/admin/mails/${m.uid}?dossier=${folder}`} className="-mx-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[14px] px-3 py-3 hover:bg-[var(--canvas)]">
                  <span className={`w-full min-w-0 truncate text-[16px] sm:w-[220px] sm:shrink-0 ${m.seen ? "text-[var(--ink-2)]" : "font-extrabold"}`}>
                    {!m.seen && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--amber)] align-middle" aria-label="Non lu" />}
                    {short(folder === "sent" ? m.to : m.from)}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-[16px] ${m.seen ? "text-[var(--ink-2)]" : "font-bold"}`}>
                    {m.subject}
                    {m.answered ? <span className="ml-2 text-[13px] font-semibold text-[var(--success)]">répondu</span> : null}
                    {m.attachments ? <span className="ml-2 text-[13px] font-semibold text-[var(--ink-3)]">pièce jointe</span> : null}
                  </span>
                  <span className="shrink-0 text-[14px] tabular-nums text-[var(--ink-3)]">{fmtDate(m.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {data && pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[15px]">
          {page > 1 ? <Link className="link font-semibold" href={link(folder, page - 1)}>Plus récents</Link> : <span />}
          <span className="text-[var(--ink-3)]">Page {page} sur {pages} · {data.total} message(s)</span>
          {page < pages ? <Link className="link font-semibold" href={link(folder, page + 1)}>Plus anciens</Link> : <span />}
        </div>
      )}
    </div>
  );
}
