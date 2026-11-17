import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listClients } from "@/lib/admin/data";
import { fmtDate, fmtNumber, PROJECT_STATUS } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { Badge, Panel, Empty, PageHeader, Avatar, Progress } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Clients" };

export default async function AdminClients() {
  await requireAdmin();
  const clients = await listClients();

  return (
    <div>
      <PageHeader eyebrow="Clients" title={`${clients.length} narrateur${clients.length > 1 ? "s" : ""}`}>
        Du plus récent au plus ancien. Cliquez sur un nom pour ouvrir sa fiche.
      </PageHeader>
      <Panel>
        {clients.length === 0 ? (
          <Empty>Aucun client pour l’instant.</Empty>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-[15px]">
              <thead>
                <tr className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
                  <th className="px-2 pb-3">Narrateur</th>
                  <th className="px-2 pb-3">Commande</th>
                  <th className="px-2 pb-3">Phase</th>
                  <th className="px-2 pb-3 text-right">Appels</th>
                  <th className="px-2 pb-3 text-right">Récits</th>
                  <th className="px-2 pb-3">Dernier appel</th>
                  <th className="px-2 pb-3"><span className="sr-only">Ouvrir</span></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const name = `${c.profile.first_name ?? ""} ${c.profile.last_name ?? ""}`.trim() || c.profile.full_name || "Sans nom";
                  const st = c.project ? PROJECT_STATUS[c.project.status] ?? { label: c.project.status, tone: "muted" as const } : null;
                  const phase = c.project ? toPhase(c.project.phase) : null;
                  const href = `/admin/clients/${c.profile.id}`;
                  return (
                    <tr key={c.profile.id} className="group align-middle [&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-2 [&>td]:py-3.5 hover:[&>td]:bg-[var(--canvas)]">
                      <td className="rounded-l-[14px]">
                        <Link href={href} className="flex items-center gap-3">
                          <Avatar name={name} />
                          <span className="min-w-0">
                            <span className="block font-bold group-hover:underline">{name}</span>
                            <span className="block text-[13.5px] tabular-nums text-[var(--ink-3)]">{c.profile.phone_number ?? "pas de numéro"}</span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="block tabular-nums">{fmtDate(c.project?.created_at ?? c.profile.created_at, false)}</span>
                        <span className="mt-0.5 flex flex-wrap gap-1.5">
                          {c.isGift ? <Badge tone="wait">Offert{c.giverName ? ` par ${c.giverName}` : ""}</Badge> : <Badge>Pour soi</Badge>}
                          {st ? <Badge tone={st.tone}>{st.label}</Badge> : <Badge tone="bad">Pas de livre</Badge>}
                        </span>
                      </td>
                      <td className="min-w-[170px]">
                        {phase ? (
                          <>
                            <span className="flex items-baseline justify-between gap-2 text-[14px]"><span className="font-semibold">{phase}. {PHASE_LABELS[phase]}</span><span className="tabular-nums text-[var(--ink-3)]">{c.project?.phase_progress ?? 0} %</span></span>
                            <span className="mt-1.5 block"><Progress value={c.project?.phase_progress ?? 0} /></span>
                          </>
                        ) : "—"}
                      </td>
                      <td className="text-right tabular-nums">
                        <span className="block font-semibold">{c.calls}</span>
                        <span className="block text-[13px] text-[var(--ink-3)]">{c.minutes} min</span>
                        {c.failedEvents > 0 && <span className="mt-1 inline-block"><Badge tone="bad">{c.failedEvents} en échec</Badge></span>}
                      </td>
                      <td className="text-right tabular-nums">
                        <span className="block font-semibold">{c.chapters}</span>
                        <span className="block text-[13px] text-[var(--ink-3)]">{fmtNumber(c.words)} mots</span>
                      </td>
                      <td className="whitespace-nowrap tabular-nums text-[var(--ink-2)]">{fmtDate(c.lastCallAt)}</td>
                      <td className="rounded-r-[14px] text-right">
                        <Link href={href} aria-label={`Ouvrir la fiche de ${name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-3)] group-hover:bg-white group-hover:text-[var(--ink)]">
                          <AIcon name="chevron" size={16} />
                        </Link>
                      </td>
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
