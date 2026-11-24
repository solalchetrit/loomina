import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview, getAgenda, configWarnings, voiceHealth, listOrders, type AgendaSlot } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, INTERVIEW_STATUS, EVENT_STATUS } from "@/lib/admin/format";
import { Badge, Panel, Empty, PageHeader, Avatar, NightFigure, Delta, Fold } from "@/components/admin/ui";
import { getAudience, audienceConfigured, type Audience } from "@/lib/admin/audience";
import { getSpend, monthRange } from "@/lib/admin/spend";
import { realRevenue } from "@/lib/admin/revenue";
import { fmtEur } from "@/lib/admin/costs";
import { STAGE_ADMIN } from "@/lib/loomina/fulfillment";
import { PromiseNote } from "@/components/admin/BookSteps";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Aujourd’hui" };

const NUMBERS = ["Aucune", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf"];

const DOT: Record<"ok" | "wait" | "bad" | "muted", string> = { ok: "var(--success)", wait: "var(--amber)", bad: "var(--danger)", muted: "var(--ink-3)" };

/** Une ligne de la liste « À faire » : un point de couleur, de quoi il s'agit, puis le geste à droite. */
function Todo({ tone, tag, children, action }: { tone: "ok" | "wait" | "bad" | "muted"; tag: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-t border-[var(--line)] px-4 py-3.5 text-[14px] first:border-t-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span aria-hidden="true" className="mt-[7px] size-[7px] rounded-full" style={{ background: DOT[tone], boxShadow: `0 0 0 3px color-mix(in srgb, ${DOT[tone]} 16%, transparent)` }} />
      <div className="min-w-0">
        <span className="block text-[12px] text-[var(--ink-3)]">{tag}</span>
        {children}
      </div>
      {action && <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:justify-end">{action}</div>}
    </li>
  );
}

const linkCls = "adm-btn adm-btn-sec";

const dayLabel = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "short", day: "numeric" });

/** Les rendez-vous de la semaine : jour et heure, qui, et ce que l'appel a donné. */
function Agenda({ slots }: { slots: AgendaSlot[] }) {
  if (!slots.length) return <div className="p-4"><Empty>Aucun auteur n’a réglé de rendez-vous cette semaine.</Empty></div>;
  return (
    <ul className="px-4 py-1">
      {slots.map((s) => (
        <li key={`${s.profileId}-${s.day}`} className="border-t border-[var(--line)] first:border-t-0">
          <Link href={`/admin/clients/${s.profileId}`} className="grid grid-cols-[92px_minmax(0,1fr)_auto] items-center gap-2.5 py-2.5 text-[13.5px] hover:text-[var(--ink)]">
            <time className={`whitespace-nowrap tabular-nums first-letter:uppercase ${s.next ? "font-semibold text-[var(--amber-ink)]" : "text-[var(--ink-3)]"}`}>
              {dayLabel.format(new Date(`${s.day}T12:00:00Z`)).replace(".", "")}, {s.time}
            </time>
            <span className="truncate font-medium">{s.client}</span>
            <span className={`whitespace-nowrap text-[12.5px] ${s.state === "done" ? "text-[var(--success)]" : s.state === "missed" ? "text-[var(--danger)]" : s.next ? "text-[var(--amber-ink)]" : "text-[var(--ink-3)]"}`}>
              {s.state === "done" ? `fait, ${s.minutes} min` : s.state === "missed" ? "manqué" : s.first ? "premier appel" : "prévu"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * La page d'accueil de l'admin : ce qu'il faut faire aujourd'hui, puis la
 * semaine en quatre chiffres et les derniers appels (audit du 20/11/2026).
 */
export default async function AdminHome({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { fait, erreur } = await searchParams;
  const [o, agenda, voice, audience, spend, orders] = await Promise.all([
    getOverview(),
    getAgenda().catch((): AgendaSlot[] => []),
    voiceHealth(),
    audienceConfigured() ? getAudience(7).catch((): Audience | null => null) : Promise.resolve(null),
    getSpend("mois").catch(() => null),
    listOrders().catch(() => []),
  ]);
  const revenue = await realRevenue(orders.filter((x) => !x.test).map((x) => x.sessionId), monthRange("mois")).catch(() => null);
  const margin = revenue && spend ? revenue.net - spend.total : null;
  const warnings = configWarnings();

  const todo = (voice.ok ? 0 : 1) + warnings.length + o.problems.length + o.stuckEditions.length + o.newOrders.length + o.booksToAct.length + o.contacts.length;

  const done = agenda.filter((a) => a.state === "done").length;
  const missed = agenda.filter((a) => a.state === "missed").length;
  const coming = agenda.length - done - missed;
  const month = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", month: "long" }).format(new Date());

  return (
    <div className="grid grid-cols-1 gap-[22px]">
      <PageHeader
        title={todo === 0 ? "Rien à faire aujourd’hui" : `${NUMBERS[todo] ?? todo} chose${todo > 1 ? "s" : ""} à regarder aujourd’hui`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/mails" className="adm-btn adm-btn-sec"><AIcon name="message" size={15} /> Écrire un mail</Link>
            <Link href="/admin/clients" className="adm-btn"><AIcon name="users" size={15} /> Voir les clients</Link>
          </div>
        }
      >
        {todo === 0 ? "Tout tourne normalement : aucun message, aucun appel en échec, aucun livre en attente." : "Le détail est juste en dessous, avec le geste à faire sur chaque ligne."}
      </PageHeader>

      {(fait || erreur) && (
        <p role="status" className={`rounded-[8px] px-4 py-2.5 text-[13.5px] font-medium ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{fait ?? erreur}</p>
      )}

      <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel flush title="À faire" action={<span className="text-[12.5px] text-[var(--ink-3)]">{todo === 0 ? "rien d’ouvert" : `${todo} ouvert${todo > 1 ? "s" : ""}`}</span>}>
          {todo === 0 && <div className="p-4"><Empty>Rien à traiter. Les messages, les appels en échec et les livres à relire arrivent ici.</Empty></div>}
          <ul>
            {!voice.ok && (
              <Todo tone="bad" tag="Appels coupés">
                <b>Le serveur vocal ne répond pas : personne ne peut appeler Loomina.</b>
                <span className="mt-0.5 block text-[13px] text-[var(--ink-2)]">Ouvrir Render, service loomina-voice, et regarder les journaux ou le relancer. Détail : {voice.detail}.</span>
              </Todo>
            )}
            {o.problems.map((e) => {
              const st = EVENT_STATUS[String(e.status)] ?? { label: String(e.status), tone: "muted" as const };
              return (
                <Todo key={String(e.id)} tone="bad" tag={`Appel · ${st.label}`} action={e.profileId ? <Link className={linkCls} href={`/admin/clients/${e.profileId}`}>Ouvrir la fiche</Link> : undefined}>
                  Le récit de l’appel de <b>{e.client ?? "un client"}</b> du {fmtDate(e.created_at)} n’a pas pu être écrit ({Number(e.attempts) || 0} essai(s)). Le bouton « Relancer le traitement » est dans le journal technique de sa fiche.
                  {e.error ? <span className="mt-0.5 block text-[13px] text-[var(--ink-3)]">{String(e.error).slice(0, 200)}</span> : null}
                </Todo>
              );
            })}
            {o.stuckEditions.map((e) => (
              <Todo key={String(e.id)} tone="bad" tag="Livre">
                La mise en page automatique d’un livre a échoué le {fmtDate(e.updated_at)}. Elle se relance au prochain appel ; si cela dure, regardez la fiche du client.
                <span className="mt-0.5 block text-[13px] text-[var(--ink-3)]">{String(e.error ?? "").slice(0, 200)}</span>
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
                  <span className="flex shrink-0 flex-row-reverse items-center gap-2">
                    {m.email ? <Link className="adm-btn" href={`/admin/mails?ecrire=${encodeURIComponent(String(m.email))}&objet=${encodeURIComponent(`Re: ${String(m.subject ?? "votre message")}`)}`}>Répondre</Link> : null}
                    <form action={`/api/admin/contacts/${String(m.id)}`} method="post">
                      <button className="adm-btn adm-btn-sec"><AIcon name="check" size={15} /> Traité</button>
                    </form>
                  </span>
                }
              >
                <b>{String(m.name ?? "Sans nom")}</b> <span className="text-[var(--ink-3)]">{String(m.email ?? "")} · {fmtDate(m.created_at)}</span>
                {m.subject ? <span className="mt-0.5 block font-medium">{String(m.subject)}</span> : null}
                <span className="mt-0.5 block whitespace-pre-wrap text-[13px] text-[var(--ink-2)]">{String(m.message ?? "")}</span>
              </Todo>
            ))}
            {warnings.map((w) => (
              <Todo key={w.variable} tone="wait" tag="Réglage">
                <b>{w.problem}</b>
                <span className="mt-0.5 block text-[13px] text-[var(--ink-2)]">{w.fix}</span>
              </Todo>
            ))}
          </ul>
        </Panel>
        <Panel flush title="Appels de la semaine" action={<span className="text-[12.5px] text-[var(--ink-3)]">{agenda.length ? [done ? `${done} fait${done > 1 ? "s" : ""}` : "", missed ? `${missed} manqué${missed > 1 ? "s" : ""}` : "", coming ? `${coming} à venir` : ""].filter(Boolean).join(", ") : "aucun"}</span>}>
          <Agenda slots={agenda} />
        </Panel>
      </div>

      <section aria-label="Les chiffres de la semaine" className="adm-figs">
        <NightFigure href="/admin/argent" label="Commandes, 7 jours" value={o.ordersWeek} hint={`${o.clients} client${o.clients > 1 ? "s" : ""} en tout`} />
        <NightFigure href="/admin/clients" label="Appels clients, 7 jours" value={o.callsWeek} hint={`${o.minutesWeek} min au total`} />
        <NightFigure href="/admin/argent" label={`Marge de ${month}`} value={margin == null ? "—" : fmtEur(margin)} hint={revenue && spend ? `${fmtEur(revenue.net)} encaissés, ${fmtEur(spend.total)} dépensés` : "Stripe ou les coûts ne répondent pas"} />
        <NightFigure href="/admin/audience?jours=7" label="Visiteurs du site, 7 jours" value={audience ? fmtNumber(audience.users) : "—"} hint={audience ? <span className="inline-flex flex-wrap items-center gap-x-2"><Delta now={audience.users} before={audience.previous.users} /> {fmtNumber(audience.events.demo)} clic(s) sur la démo</span> : "Google Analytics non branché"} />
      </section>

      <Panel flush title="Derniers appels" action={<Link href="/admin/clients" className="text-[12.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">Tous les clients</Link>}>
        {o.recentCalls.length === 0 ? (
          <div className="p-4"><Empty>Aucun appel pour l’instant.</Empty></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
              <thead>
                <tr className="text-[12px] text-[var(--ink-3)] [&>th]:px-4 [&>th]:py-2.5">
                  <th>Client</th>
                  <th>Sujet</th>
                  <th>État</th>
                  <th className="text-right">Durée</th>
                  <th className="text-right">Quand</th>
                </tr>
              </thead>
              <tbody>
                {o.recentCalls.map((c) => {
                  const st = INTERVIEW_STATUS[String(c.processing_status)] ?? { label: String(c.processing_status), tone: "muted" as const };
                  const name = c.client ?? "Client inconnu";
                  return (
                    <tr key={String(c.id)} className="[&>td]:border-t [&>td]:border-[var(--line)] [&>td]:px-4 [&>td]:py-2.5 hover:[&>td]:bg-[var(--canvas)]">
                      <td>
                        {c.profileId ? (
                          <Link href={`/admin/clients/${c.profileId}`} className="flex items-center gap-2.5 whitespace-nowrap font-medium hover:underline"><Avatar name={name} size={28} /> {name}</Link>
                        ) : (
                          <span className="flex items-center gap-2.5 whitespace-nowrap font-medium"><Avatar name={name} size={28} /> {name}</span>
                        )}
                      </td>
                      <td className="max-w-[420px] truncate text-[var(--ink-2)]">{String(c.topics_summary ?? "") || "Pas de résumé"}</td>
                      <td><span className="flex gap-1.5"><Badge tone={st.tone}>{st.label}</Badge>{c.test && <Badge>test</Badge>}</span></td>
                      <td className="whitespace-nowrap text-right tabular-nums">{fmtDuration(c.duration_seconds)}</td>
                      <td className="whitespace-nowrap text-right tabular-nums text-[var(--ink-3)]">{fmtDate(c.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {o.contactsHandled.length > 0 && (
        <div id="messages">
          <Fold summary={`Messages déjà traités (${o.contactsHandled.length})`}>
            <ul className="grid gap-3 font-sans">
              {o.contactsHandled.map((m) => (
                <li key={String(m.id)} className="flex flex-wrap items-start gap-3 text-[14px]">
                  <span className="min-w-0 flex-1">
                    <b>{String(m.name ?? "")}</b> <span className="text-[var(--ink-3)]">{String(m.email ?? "")} · reçu le {fmtDate(m.created_at)}, traité le {fmtDate(m.handled_at)}</span>
                    {m.subject ? <span className="block font-medium">{String(m.subject)}</span> : null}
                    <span className="block whitespace-pre-wrap text-[var(--ink-2)]">{String(m.message ?? "")}</span>
                  </span>
                  <form action={`/api/admin/contacts/${String(m.id)}`} method="post">
                    <input type="hidden" name="annuler" value="1" />
                    <button className="text-[13px] font-semibold text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink)]">Remettre à traiter</button>
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
