import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview, configWarnings, voiceHealth } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, INTERVIEW_STATUS, EVENT_STATUS } from "@/lib/admin/format";
import { Badge, Panel, Stat, Empty, PageHeader, Avatar, NightPanel, NightFigure, Delta } from "@/components/admin/ui";
import { getAudience, audienceConfigured, type Audience } from "@/lib/admin/audience";
import { getSpend } from "@/lib/admin/spend";
import { fmtEur } from "@/lib/admin/costs";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Aujourd’hui" };

function today(): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

export default async function AdminHome() {
  await requireAdmin();
  const [o, voice, audience, spend] = await Promise.all([
    getOverview(),
    voiceHealth(),
    audienceConfigured() ? getAudience(7).catch((): Audience | null => null) : Promise.resolve(null),
    getSpend("mois").catch(() => null),
  ]);
  const warnings = configWarnings();
  const alerts = warnings.length + (voice.ok ? 0 : 1) + o.problems.length + o.stuckEditions.length;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader eyebrow={today()} title="Aujourd’hui">
        {alerts === 0 ? "Tout tourne normalement." : `${alerts} point(s) à surveiller.`}
      </PageHeader>

      <NightPanel title="Cette semaine">
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <NightFigure href="/admin/audience?jours=7" label="Visiteurs du site, 7 jours" value={audience ? fmtNumber(audience.users) : "—"} hint={audience ? <span className="inline-flex items-center gap-2">{fmtNumber(audience.sessions)} visites <Delta now={audience.users} before={audience.previous.users} /></span> : "Google Analytics non branché"} />
          <NightFigure href="/admin/audience?jours=7" label="Clics sur la démo" value={audience ? fmtNumber(audience.events.demo) : "—"} hint={audience ? `${fmtNumber(audience.events.purchase)} achat(s) sur le site` : undefined} />
          <NightFigure href="/admin/clients" label="Appels clients" value={o.callsWeek} hint={`${o.minutesWeek} min au total`} />
          <NightFigure href="/admin/couts" label="Dépensé ce mois-ci" value={spend ? fmtEur(spend.total) : "—"} hint={spend?.projected != null ? `vers ${fmtEur(spend.projected)} en fin de mois` : "coûts indisponibles"} />
        </div>
      </NightPanel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon="users" label="Clients" value={o.clients} hint={`${o.activeBooks} en cours · ${o.completedBooks} terminé(s)`} />
        <Stat icon="book" tone="amber" label="Récits écrits" value={o.chapters} hint={`${fmtNumber(o.words)} mots`} />
        <Stat icon="server" tone={voice.ok ? "green" : "red"} label="Serveur vocal" value={voice.ok ? "En ligne" : "Coupé"} hint={voice.detail} />
      </div>

      {o.newOrders.length > 0 && (
        <Panel icon="card" title={`Nouvelles commandes, 7 derniers jours (${o.newOrders.length})`}>
          <ul className="grid grid-cols-1 gap-2">
            {o.newOrders.map((n, i) => (
              <li key={n.profileId ?? i} className="flex flex-wrap items-center gap-3 rounded-[14px] bg-[var(--success-soft)]/60 px-4 py-3 text-[15px]">
                <Badge tone="ok">Nouvelle commande</Badge>
                <span className="min-w-0 flex-1 font-semibold">{n.client ?? "Client sans nom"}{n.isGift ? " (livre offert)" : ""}</span>
                <span className="text-[14px] tabular-nums text-[var(--ink-3)]">{fmtDate(n.at)}</span>
                {n.profileId && <Link className="font-semibold underline" href={`/admin/clients/${n.profileId}`}>Voir la fiche</Link>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {o.toReview.length > 0 && (
        <Panel icon="book" title={`Livres à relire (${o.toReview.length})`}>
          <ul className="grid grid-cols-1 gap-2">
            {o.toReview.map((b, n) => (
              <li key={b.profileId ?? n} className="flex flex-wrap items-center gap-3 rounded-[14px] bg-[var(--canvas)] px-4 py-3 text-[15px]">
                <Badge tone="wait">Terminé par l’auteur</Badge>
                <span className="min-w-0 flex-1 font-semibold">{b.client ?? "Client inconnu"}</span>
                {b.profileId && <Link className="font-semibold underline" href={`/admin/clients/${b.profileId}/livre`}>Relire le livre</Link>}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {alerts > 0 && (
        <Panel icon="alert" title="À surveiller">
          <ul className="grid grid-cols-1 gap-2">
            {!voice.ok && (
              <li className="flex flex-wrap items-start gap-3 rounded-[14px] bg-[#fbe6e2]/60 px-4 py-3 text-[15px]">
                <Badge tone="bad">Serveur vocal</Badge>
                <span className="min-w-0 flex-1">Injoignable ({voice.detail}). Les appels ne passent plus.</span>
              </li>
            )}
            {o.problems.map((e) => {
              const st = EVENT_STATUS[String(e.status)] ?? { label: String(e.status), tone: "muted" as const };
              return (
                <li key={String(e.id)} className="flex flex-wrap items-start gap-3 rounded-[14px] bg-[var(--canvas)] px-4 py-3 text-[15px]">
                  <Badge tone={st.tone}>Appel · {st.label}</Badge>
                  <span className="min-w-0 flex-1">
                    {e.profileId ? <Link className="font-semibold underline" href={`/admin/clients/${e.profileId}`}>{e.client ?? "client"}</Link> : "Client inconnu"}
                    <span className="text-[var(--ink-3)]"> · {fmtDate(e.created_at)} · {Number(e.attempts) || 0} essai(s)</span>
                    {e.error ? <span className="mt-0.5 block text-[14px] text-[var(--ink-2)]">{String(e.error).slice(0, 200)}</span> : null}
                  </span>
                </li>
              );
            })}
            {o.stuckEditions.map((e) => (
              <li key={String(e.id)} className="flex flex-wrap items-start gap-3 rounded-[14px] bg-[var(--canvas)] px-4 py-3 text-[15px]">
                <Badge tone="bad">Livre</Badge>
                <span className="min-w-0 flex-1">Composition en échec le {fmtDate(e.updated_at)}<span className="mt-0.5 block text-[14px] text-[var(--ink-2)]">{String(e.error ?? "").slice(0, 200)}</span></span>
              </li>
            ))}
            {warnings.map((w) => (
              <li key={w} className="flex flex-wrap items-start gap-3 rounded-[14px] bg-[var(--canvas)] px-4 py-3 text-[15px]">
                <Badge tone="wait">Réglage</Badge>
                <span className="min-w-0 flex-1">{w}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel icon="phone" title="Derniers appels" action={<Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Tous les clients <AIcon name="arrow" size={14} /></Link>}>
        {o.recentCalls.length === 0 ? (
          <Empty>Aucun appel pour l’instant.</Empty>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {o.recentCalls.map((c) => {
              const st = INTERVIEW_STATUS[String(c.processing_status)] ?? { label: String(c.processing_status), tone: "muted" as const };
              const name = c.client ?? "Client inconnu";
              const inner = (
                <>
                  <Avatar name={name} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold">{name}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[14px] text-[var(--ink-3)]">{String(c.topics_summary ?? "") || "Pas de résumé"}</span>
                  </span>
                  <span className="shrink-0 text-right text-[13.5px] tabular-nums text-[var(--ink-3)]">
                    <span className="block font-semibold text-[var(--ink-2)]">{fmtDuration(c.duration_seconds)}</span>
                    {fmtDate(c.created_at)}
                  </span>
                </>
              );
              return (
                <li key={String(c.id)}>
                  {c.profileId ? (
                    <Link href={`/admin/clients/${c.profileId}`} className="-mx-3 flex items-center gap-3 rounded-[14px] px-3 py-3 hover:bg-[var(--canvas)]">{inner}</Link>
                  ) : (
                    <div className="flex items-center gap-3 py-3">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel icon="message" title="Messages du formulaire de contact">
        {o.contacts.length === 0 ? (
          <Empty>Aucun message pour l’instant.</Empty>
        ) : (
          <ul className="grid gap-3">
            {o.contacts.map((m) => (
              <li key={String(m.id)} className="rounded-[16px] bg-[var(--canvas)] p-4 text-[15px]">
                <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                  {String(m.name ?? "")}
                  <span className="font-normal text-[var(--ink-3)]">{String(m.email ?? "")} · {fmtDate(m.created_at)}</span>
                </p>
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
