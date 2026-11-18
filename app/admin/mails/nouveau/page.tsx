import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { mailboxUser } from "@/lib/admin/mailbox";
import { Panel, PageHeader } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Écrire un mail" };

/** Écrire un nouveau message depuis la boîte de Loomina. `?a=` préremplit le destinataire (depuis une fiche client). */
export default async function AdminNewMail({ searchParams }: { searchParams: Promise<{ a?: string; objet?: string; erreur?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  return (
    <div>
      <Link href="/admin/mails" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]">
        <AIcon name="chevron" size={14} className="rotate-180" /> Mails
      </Link>
      <div className="mt-4">
        <PageHeader eyebrow="Mails" title="Écrire un mail">Envoyé depuis {mailboxUser()}. Une copie est rangée dans « Envoyés ».</PageHeader>
      </div>
      {sp.erreur && <p role="status" className="mb-5 rounded-[16px] bg-[#fbeae6] px-4 py-3 text-[15px] font-semibold text-[#a8402f]">{sp.erreur}</p>}
      <Panel>
        <form action="/api/admin/mails/send" method="post" className="grid gap-3">
          <label className="grid gap-1 text-[14px] font-semibold">
            À
            <input name="to" required type="email" defaultValue={sp.a ?? ""} placeholder="adresse@exemple.fr" className="h-11 rounded-[12px] border border-[var(--line)] bg-white px-3 text-[16px] font-normal" />
          </label>
          <label className="grid gap-1 text-[14px] font-semibold">
            Objet
            <input name="subject" required maxLength={250} defaultValue={sp.objet ?? ""} className="h-11 rounded-[12px] border border-[var(--line)] bg-white px-3 text-[16px] font-normal" />
          </label>
          <label className="grid gap-1 text-[14px] font-semibold">
            Message
            <textarea name="text" required rows={14} className="rounded-[12px] border border-[var(--line)] bg-white p-3 text-[16px] font-normal leading-relaxed" />
          </label>
          <div>
            <button className="press inline-flex h-11 items-center rounded-[14px] bg-[var(--ink)] px-5 text-[15px] font-bold text-white">Envoyer</button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
