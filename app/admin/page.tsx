import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview, configWarnings, voiceHealth } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, INTERVIEW_STATUS, EVENT_STATUS } from "@/lib/admin/format";
import { Badge, Panel, Stat, Empty } from "@/components/admin/ui";

export const metadata = { title: "Vue d’ensemble" };

export default async function AdminHome() {
  await requireAdmin();
  const [o, voice] = await Promise.all([getOverview(), voiceHealth()]);
  const warnings = configWarnings();

  return (
    <div className="grid gap-6">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Vue d’ensemble</h1>

      {(warnings.length > 0 || !voice.ok || o.problems.length > 0 || o.stuckEditions.length > 0) && (
        <Panel title="À surveiller">
          <ul className="grid gap-2 text-[15px]">
            {!voice.ok && (
              <li className="flex gap-2"><Badge tone="bad">Serveur vocal</Badge> injoignable : {voice.detail}. Les appels ne passent plus.</li>
            )}
            {warnings.map((w) => (
              <li key={w} className="flex gap-2"><Badge tone="wait">Réglage</Badge> {w}</li>
            ))}
            {o.problems.map((e) => {
              const st = EVENT_STATUS[String(e.status)] ?? { label: String(e.status), tone: "muted" as const };
              return (
                <li key={String(e.id)} className="flex flex-wrap gap-2">
                  <Badge tone={st.tone}>Appel · {st.label}</Badge>
                  {fmtDate(e.created_at)} ·{" "}
                  {e.profileId ? <Link className="underline" href={`/admin/clients/${e.profileId}`}>{e.client ?? "client"}</Link> : "client inconnu"}
                  {" "}· {Number(e.attempts) || 0} essai(s){e.error ? ` · ${String(e.error).slice(0, 160)}` : ""}
                </li>
              );
            })}
            {o.stuckEditions.map((e) => (
              <li key={String(e.id)} className="flex gap-2"><Badge tone="bad">Livre</Badge> composition en échec le {fmtDate(e.updated_at)} : {String(e.error ?? "").slice(0, 160)}</li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Clients" value={o.clients} hint={`${o.activeBooks} livre(s) en cours · ${o.completedBooks} terminé(s)`} />
        <Stat label="Appels sur 7 jours" value={o.callsWeek} hint={`${o.minutesWeek} min au total`} />
        <Stat label="Récits écrits" value={o.chapters} hint={`${fmtNumber(o.words)} mots`} />
        <Stat label="Serveur vocal" value={voice.ok ? "En ligne" : "Hors ligne"} hint={voice.detail} />
      </div>

      <Panel title="Derniers appels" action={<Link href="/admin/clients" className="text-[15px] font-semibold underline">Tous les clients</Link>}>
        {o.recentCalls.length === 0 ? (
          <Empty>Aucun appel pour l’instant.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead className="text-[13px] uppercase tracking-[0.05em] text-[var(--ink-3)]">
                <tr><th className="py-2 pr-3">Date</th><th className="pr-3">Client</th><th className="pr-3">Durée</th><th className="pr-3">Phase</th><th className="pr-3">État</th><th>Résumé</th></tr>
              </thead>
              <tbody>
                {o.recentCalls.map((c) => {
                  const st = INTERVIEW_STATUS[String(c.processing_status)] ?? { label: String(c.processing_status), tone: "muted" as const };
                  return (
                    <tr key={String(c.id)} className="border-t border-[var(--line-soft)] align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(c.created_at)}</td>
                      <td className="pr-3">{c.profileId ? <Link className="font-semibold underline" href={`/admin/clients/${c.profileId}`}>{c.client ?? "—"}</Link> : "—"}</td>
                      <td className="pr-3 whitespace-nowrap">{fmtDuration(c.duration_seconds)}</td>
                      <td className="pr-3">{String(c.phase ?? "—")}</td>
                      <td className="pr-3"><Badge tone={st.tone}>{st.label}</Badge></td>
                      <td className="text-[var(--ink-2)]">{String(c.topics_summary ?? "").slice(0, 140) || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Messages du formulaire de contact">
        {o.contacts.length === 0 ? (
          <Empty>Aucun message.</Empty>
        ) : (
          <ul className="grid gap-3">
            {o.contacts.map((m) => (
              <li key={String(m.id)} className="rounded-[12px] bg-[var(--canvas)] p-3 text-[15px]">
                <p className="font-semibold">{String(m.name ?? "")} · <a className="underline" href={`mailto:${String(m.email ?? "")}`}>{String(m.email ?? "")}</a> <span className="font-normal text-[var(--ink-3)]">· {fmtDate(m.created_at)}</span></p>
                {m.subject ? <p className="mt-1 font-medium">{String(m.subject)}</p> : null}
                <p className="mt-1 whitespace-pre-wrap text-[var(--ink-2)]">{String(m.message ?? "")}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
