import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview, configWarnings, voiceHealth, listOrders } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, INTERVIEW_STATUS, EVENT_STATUS } from "@/lib/admin/format";
import { Badge, Panel, Empty, PageHeader, Avatar, NightPanel, NightFigure, Delta, Fold } from "@/components/admin/ui";
import { getAudience, audienceConfigured, type Audience } from "@/lib/admin/audience";
import { getSpend, monthRange } from "@/lib/admin/spend";
import { realRevenue } from "@/lib/admin/revenue";
import { fmtEur } from "@/lib/admin/costs";
import { STAGE_ADMIN } from "@/lib/loomina/fulfillment";
import { PromiseNote } from "@/components/admin/BookSteps";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Aujourd’hui" };

function today(): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

/** Une ligne de la liste « À faire ». */
function Todo({ tone, tag, children, action }: { tone: "ok" | "wait" | "bad" | "muted"; tag: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <li className={`flex flex-wrap items-start gap-3 rounded-[14px] px-4 py-3 text-[15px] ${tone === "bad" ? "bg-[#fbe6e2]/60" : tone === "ok" ? "bg-[var(--success-soft)]/60" : "bg-[var(--canvas)]"}`}>
      <Badge tone={tone}>{tag}</Badge>
      <span className="min-w-[min(100%,240px)] flex-1">{children}</span>
      {action}
    </li>
  );
}

const linkCls = "shrink-0 text-[14.5px] font-semibold underline underline-offset-4";

/**
 * La page d'accueil de l'admin : ce qu'il faut faire aujourd'hui, puis la
 * semaine en quatre chiffres et les derniers appels (audit du 20/11/2026).
 */
export default async function AdminHome({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { fait, erreur } = await searchParams;
  const [o, voice, audience, spend, orders] = await Promise.all([
    getOverview(),
    voiceHealth(),
    audienceConfigured() ? getAudience(7).catch((): Audience | null => null) : Promise.resolve(null),
    getSpend("mois").catch(() => null),
    listOrders().catch(() => []),
  ]);
  const revenue = await realRevenue(orders.filter((x) => !x.test).map((x) => x.sessionId), monthRange("mois")).catch(() => null);
  const margin = revenue && spend ? revenue.net - spend.total : null;
  const warnings = configWarnings();

  const todo = (voice.ok ? 0 : 1) + warnings.length + o.problems.length + o.stuckEditions.length + o.newOrders.length + o.booksToAct.length + o.contacts.length;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader eyebrow={today()} title="Aujourd’hui">
        {todo === 0 ? "Rien à faire : tout tourne normalement." : `${todo} chose${todo > 1 ? "s" : ""} à regarder.`}
      </PageHeader>

      {(fait || erreur) && (
        <p role="status" className={`rounded-[16px] px-4 py-3 text-[15px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[#a8402f]"}`}>{fait ?? erreur}</p>
      )}

      {todo > 0 && (
        <Panel icon="check" title="À faire">
          <ul className="grid grid-cols-1 gap-2">
            {!voice.ok && (
              <Todo tone="bad" tag="Appels coupés">
                <b>Le serveur vocal ne répond pas : personne ne peut appeler Loomina.</b>
                <span className="mt-0.5 block text-[14px] text-[var(--ink-2)]">Ouvrir Render, service loomina-voice, et regarder les journaux ou le relancer. Détail : {voice.detail}.</span>
              </Todo>
            )}
            {o.problems.map((e) => {
              const st = EVENT_STATUS[String(e.status)] ?? { label: String(e.status), tone: "muted" as const };
              return (
                <Todo key={String(e.id)} tone="bad" tag={`Appel · ${st.label}`} action={e.profileId ? <Link className={linkCls} href={`/admin/clients/${e.profileId}`}>Ouvrir la fiche</Link> : undefined}>
                  Le récit de l’appel de <b>{e.client ?? "un client"}</b> du {fmtDate(e.created_at)} n’a pas pu être écrit ({Number(e.attempts) || 0} essai(s)). Le bouton « Relancer le traitement » est dans le journal technique de sa fiche.
                  {e.error ? <span className="mt-0.5 block text-[13.5px] text-[var(--ink-3)]">{String(e.error).slice(0, 200)}</span> : null}
                </Todo>
              );
            })}
            {o.stuckEditions.map((e) => (
              <Todo key={String(e.id)} tone="bad" tag="Livre">
                La mise en page automatique d’un livre a échoué le {fmtDate(e.updated_at)}. Elle se relance au prochain appel ; si cela dure, regardez la fiche du client.
                <span className="mt-0.5 block text-[13.5px] text-[var(--ink-3)]">{String(e.error ?? "").slice(0, 200)}</span>
              </Todo>
            ))}
            {o.newOrders.map((n, i) => (
              <Todo key={`${n.profileId ?? i}-${n.at}`} tone="ok" tag="Nouvelle commande" action={n.profileId ? <Link className={linkCls} href={`/admin/clients/${n.profileId}`}>Voir la fiche</Link> : undefined}>
                <b>{n.client ?? "Client sans nom"}</b>{n.isGift ? " (livre offert)" : ""} a commandé le {fmtDate(n.at)}. Vérifiez qu’il a bien fait son premier appel.
              </Todo>
            ))}
            {o.booksToAct.map((b) => (
              <Todo key={b.projectId} tone="wait" tag={STAGE_ADMIN[b.fulfillment.stage].label} action={<Link className={linkCls} href={b.fulfillment.stage === "completed" ? `/admin/clients/${b.profileId}/livre` : "/admin/livres"}>{b.fulfillment.stage === "completed" ? "Relire le livre" : "Ouvrir Livres"}</Link>}>
                Le livre de <b>{b.client}</b>
                {b.fulfillment.stage === "completed" ? " est terminé et attend votre relecture." : b.fulfillment.stage === "reviewed" ? " est relu : à envoyer à l’imprimeur." : " est à l’impression : à expédier dès réception."}
                {!b.hasAddress && " L’adresse d’envoi manque encore."}
                {b.fulfillment.stage === "completed" && <span className="mt-0.5 block"><PromiseNote completedAt={b.completedAt} /></span>}
              </Todo>
            ))}
            {o.contacts.map((m) => (
              <Todo
                key={String(m.id)}
                tone="wait"
                tag="Message"
                action={
                  <span className="flex shrink-0 items-center gap-3">
                    {m.email ? <Link className={linkCls} href={`/admin/mails?ecrire=${encodeURIComponent(String(m.email))}&objet=${encodeURIComponent(`Re: ${String(m.subject ?? "votre message")}`)}`}>Répondre</Link> : null}
                    <form action={`/api/admin/contacts/${String(m.id)}`} method="post">
                      <button className="press inline-flex h-9 items-center gap-1.5 rounded-[12px] bg-white px-3 text-[14px] font-bold shadow-[0_0_0_1px_var(--line)]"><AIcon name="check" size={15} /> Traité</button>
                    </form>
                  </span>
                }
              >
                <b>{String(m.name ?? "Sans nom")}</b> <span className="text-[var(--ink-3)]">{String(m.email ?? "")} · {fmtDate(m.created_at)}</span>
                {m.subject ? <span className="mt-0.5 block font-medium">{String(m.subject)}</span> : null}
                <span className="mt-0.5 block whitespace-pre-wrap text-[var(--ink-2)]">{String(m.message ?? "")}</span>
              </Todo>
            ))}
            {warnings.map((w) => (
              <Todo key={w.variable} tone="wait" tag="Réglage">
                <b>{w.problem}</b>
                <span className="mt-0.5 block text-[14px] text-[var(--ink-2)]">{w.fix}</span>
              </Todo>
            ))}
          </ul>
        </Panel>
      )}

      <NightPanel title="Cette semaine">
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <NightFigure href="/admin/argent" label="Commandes, 7 jours" value={o.ordersWeek} hint={`${o.clients} client(s) en tout`} />
          <NightFigure href="/admin/clients" label="Appels clients, 7 jours" value={o.callsWeek} hint={`${o.minutesWeek} min au total`} />
          <NightFigure href="/admin/argent" label="Marge du mois" value={margin == null ? "—" : fmtEur(margin)} hint={revenue && spend ? `${fmtEur(revenue.net)} encaissés, ${fmtEur(spend.total)} dépensés` : "Stripe ou les coûts ne répondent pas"} />
          <NightFigure href="/admin/audience?jours=7" label="Visiteurs du site, 7 jours" value={audience ? fmtNumber(audience.users) : "—"} hint={audience ? <span className="inline-flex items-center gap-2">{fmtNumber(audience.events.demo)} clic(s) sur la démo <Delta now={audience.users} before={audience.previous.users} /></span> : "Google Analytics non branché"} />
        </div>
      </NightPanel>

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
                      {c.test && <Badge>test</Badge>}
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

      {o.contactsHandled.length > 0 && (
        <div id="messages">
          <Fold summary={`Messages déjà traités (${o.contactsHandled.length})`}>
            <ul className="grid gap-3 font-sans">
              {o.contactsHandled.map((m) => (
                <li key={String(m.id)} className="flex flex-wrap items-start gap-3 text-[15px]">
                  <span className="min-w-0 flex-1">
                    <b>{String(m.name ?? "")}</b> <span className="text-[var(--ink-3)]">{String(m.email ?? "")} · reçu le {fmtDate(m.created_at)}, traité le {fmtDate(m.handled_at)}</span>
                    {m.subject ? <span className="block font-medium">{String(m.subject)}</span> : null}
                    <span className="block whitespace-pre-wrap text-[var(--ink-2)]">{String(m.message ?? "")}</span>
                  </span>
                  <form action={`/api/admin/contacts/${String(m.id)}`} method="post">
                    <input type="hidden" name="annuler" value="1" />
                    <button className="text-[13.5px] font-semibold text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink)]">Remettre à traiter</button>
                  </form>
                </li>
              ))}
            </ul>
          </Fold>
        </div>
      )}
    </div>
  );
}
