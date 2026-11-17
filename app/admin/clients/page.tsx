import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listClients } from "@/lib/admin/data";
import { fmtDate, fmtNumber, PROJECT_STATUS } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { Badge, Panel, Empty } from "@/components/admin/ui";

export const metadata = { title: "Clients" };

export default async function AdminClients() {
  await requireAdmin();
  const clients = await listClients();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Clients</h1>
        <p className="text-[15px] text-[var(--ink-3)]">{clients.length} narrateur(s), du plus récent au plus ancien</p>
      </div>
      <Panel>
        {clients.length === 0 ? (
          <Empty>Aucun client pour l’instant.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[15px]">
              <thead className="text-[13px] uppercase tracking-[0.05em] text-[var(--ink-3)]">
                <tr>
                  <th className="py-2 pr-3">Narrateur</th>
                  <th className="pr-3">Commande</th>
                  <th className="pr-3">Livre</th>
                  <th className="pr-3">Phase</th>
                  <th className="pr-3">Appels</th>
                  <th className="pr-3">Récits</th>
                  <th>Dernier appel</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const name = `${c.profile.first_name ?? ""} ${c.profile.last_name ?? ""}`.trim() || c.profile.full_name || "Sans nom";
                  const st = c.project ? PROJECT_STATUS[c.project.status] ?? { label: c.project.status, tone: "muted" as const } : null;
                  const phase = c.project ? toPhase(c.project.phase) : null;
                  return (
                    <tr key={c.profile.id} className="border-t border-[var(--line-soft)] align-top">
                      <td className="py-2.5 pr-3">
                        <Link href={`/admin/clients/${c.profile.id}`} className="font-bold underline">{name}</Link>
                        <p className="text-[14px] text-[var(--ink-3)]">{c.profile.phone_number ?? "pas de numéro"}</p>
                      </td>
                      <td className="pr-3">
                        <p>{fmtDate(c.project?.created_at ?? c.profile.created_at, false)}</p>
                        <p className="text-[14px] text-[var(--ink-3)]">{c.isGift ? `Offert${c.giverName ? ` par ${c.giverName}` : ""}` : "Pour soi"}</p>
                      </td>
                      <td className="pr-3">
                        {st ? <Badge tone={st.tone}>{st.label}</Badge> : <Badge tone="bad">Pas de livre</Badge>}
                        {c.failedEvents > 0 && <p className="mt-1"><Badge tone="bad">{c.failedEvents} appel(s) en échec</Badge></p>}
                      </td>
                      <td className="pr-3">{phase ? `${phase}. ${PHASE_LABELS[phase]}` : "—"}<p className="text-[14px] text-[var(--ink-3)]">{c.project?.phase_progress ?? 0} %</p></td>
                      <td className="pr-3">{c.calls}<p className="text-[14px] text-[var(--ink-3)]">{c.minutes} min</p></td>
                      <td className="pr-3">{c.chapters}<p className="text-[14px] text-[var(--ink-3)]">{fmtNumber(c.words)} mots</p></td>
                      <td className="whitespace-nowrap">{fmtDate(c.lastCallAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
