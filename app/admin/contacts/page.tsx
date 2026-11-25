import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { GROUP_LABELS, listContacts, type Contact, type ContactGroup } from "@/lib/admin/contacts";
import { Badge, Empty, Panel, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Contacts" };

const GROUPS: ContactGroup[] = ["client", "proche", "visiteur"];
const HELP: Record<ContactGroup, string> = {
  client: "Les auteurs qui écrivent leur livre.",
  proche: "Ceux qui ont offert un livre, et les proches ajoutés à l’espace famille.",
  visiteur: "Ceux qui ont essayé la démo ou écrit par le formulaire, sans être clients.",
};

function Row({ c }: { c: Contact }) {
  return (
    <tr className="border-t border-[var(--line-soft)] align-top">
      <td className="py-2.5 pr-4 font-semibold">{[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}</td>
      <td className="py-2.5 pr-4">{c.email ?? "—"}</td>
      <td className="py-2.5 pr-4 tabular-nums whitespace-nowrap">{c.phone ?? "—"}</td>
      <td className="py-2.5 pr-4 text-[var(--ink-2)]">{c.source}</td>
      <td className="py-2.5">{c.optedOut ? <Badge tone="bad">Désinscrit</Badge> : null}</td>
    </tr>
  );
}

/** Les e-mails et téléphones collectés, triés : clients, proches, visiteurs (25/11/2026). */
export default async function AdminContacts({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  await requireAdmin();
  const { g } = await searchParams;
  const group: ContactGroup = GROUPS.includes(g as ContactGroup) ? (g as ContactGroup) : "client";
  let contacts: Contact[] = [];
  let erreur = "";
  try {
    contacts = await listContacts();
  } catch (err) {
    erreur = err instanceof Error ? err.message : String(err);
  }
  const rows = contacts.filter((c) => c.group === group);
  const count = (x: ContactGroup) => contacts.filter((c) => c.group === x).length;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Contacts"
        title="Les contacts collectés"
        action={<a href="/api/admin/contacts-csv" className="inline-flex h-9 items-center rounded-full border border-[var(--line)] px-4 text-[13.5px] font-semibold hover:bg-[var(--surface-2)]">Télécharger en CSV</a>}
      >
        Chaque personne apparaît une fois, dans son groupe le plus proche (client, puis proche, puis visiteur). Les livres de test sont écartés.
      </PageHeader>

      <nav className="flex flex-wrap gap-2" aria-label="Groupes">
        {GROUPS.map((x) => (
          <Link key={x} href={`/admin/contacts?g=${x}`} aria-current={x === group ? "page" : undefined}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold ${x === group ? "border-transparent bg-[var(--ink)] text-[var(--canvas)]" : "border-[var(--line)] hover:bg-[var(--surface-2)]"}`}>
            {GROUP_LABELS[x]} <span className="tabular-nums opacity-70">{count(x)}</span>
          </Link>
        ))}
      </nav>

      <Panel title={`${GROUP_LABELS[group]} (${rows.length})`}>
        <p className="px-4 pt-3 text-[13.5px] text-[var(--ink-3)]">{HELP[group]}</p>
        {erreur ? (
          <Empty>La base ne répond pas : {erreur}</Empty>
        ) : rows.length === 0 ? (
          <Empty>Personne dans ce groupe pour l’instant.</Empty>
        ) : (
          <div className="overflow-x-auto px-4 pb-3">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="text-[12px] text-[var(--ink-3)]">
                  <th className="py-2 pr-4 font-medium">Nom</th>
                  <th className="py-2 pr-4 font-medium">E-mail</th>
                  <th className="py-2 pr-4 font-medium">Téléphone</th>
                  <th className="py-2 pr-4 font-medium">Origine</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>{rows.map((c, i) => <Row key={`${c.phone ?? c.email}-${i}`} c={c} />)}</tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
