import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getCrm, RELANCE_AFTER_DAYS, INACTIVE_AFTER_DAYS } from "@/lib/admin/data";
import type { CrmClient, CrmHealth, CrmStage } from "@/lib/admin/data";
import { fmtDate, fmtNumber } from "@/lib/admin/format";
import type { Tone } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { STAGE_ADMIN } from "@/lib/loomina/fulfillment";
import { Badge, Panel, Stat, Empty, PageHeader, Avatar, Progress, Segmented } from "@/components/admin/ui";

export const metadata = { title: "Clients" };

const HEALTH: Record<CrmHealth, { label: string; tone: Tone }> = {
  attente: { label: "Attend son premier appel", tone: "wait" },
  relancer: { label: "À relancer", tone: "bad" },
  actif: { label: "Actif", tone: "ok" },
  inactif: { label: "Inactif", tone: "bad" },
  termine: { label: "Livre terminé", tone: "muted" },
};

/** Les étapes du parcours d'un client, dans l'ordre. Chaque étape contient les suivantes. */
const STAGES: Array<{ key: CrmStage; label: string; hint: string }> = [
  { key: "commande", label: "A commandé", hint: "Compte et livre créés" },
  { key: "onboarde", label: "Embarqué", hint: "A fait un premier vrai appel" },
  { key: "recit", label: "Premier récit écrit", hint: "Au moins un récit dans son livre" },
  { key: "avance", label: "Phase 2 ou plus", hint: "A dépassé la vue d’ensemble" },
  { key: "termine", label: "Livre terminé", hint: "A dit que son livre est complet" },
];
const ORDER: CrmStage[] = ["commande", "onboarde", "recit", "avance", "termine"];

function avg(values: number[]): number | null {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
}

function Bars({ data, unit }: { data: Array<{ label: string; value: number; hint?: string }>; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-[190px] items-end gap-2 sm:gap-3" role="img" aria-label={data.map((d) => `${d.label} : ${d.value} ${unit}`).join(", ")}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[14px] font-bold tabular-nums">{d.value}</span>
          <span className="w-full rounded-t-[10px] bg-[var(--amber)]" style={{ height: `${Math.max(d.value ? 6 : 2, (d.value / max) * 120)}px`, opacity: d.value ? 1 : 0.25 }} />
          <span className="t-small w-full truncate text-center !text-[13px]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function Row({ c, children, relance = false }: { c: CrmClient; children?: React.ReactNode; relance?: boolean }) {
  const h = HEALTH[c.health];
  return (
    <li className="flex flex-wrap items-center gap-2">
      <Link href={`/admin/clients/${c.id}`} className="-mx-3 flex min-w-0 flex-1 flex-wrap items-center gap-3 rounded-[16px] px-3 py-3 hover:bg-[var(--canvas)]">
        <Avatar name={c.name} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-bold">{c.name}</span>
            <Badge tone={h.tone}>{h.label}</Badge>
            {c.isGift && <Badge tone="wait">Offert</Badge>}
          </span>
          <span className="t-small mt-0.5 block">{children}</span>
        </span>
        <span className="t-small shrink-0 tabular-nums">{c.phone ?? ""}</span>
      </Link>
      {relance && (
        <form action={`/api/admin/clients/${c.id}/relance?retour=suivi`} method="post">
          <button className="press inline-flex h-10 items-center whitespace-nowrap rounded-[12px] bg-[var(--ink)] px-3.5 text-[14px] font-bold text-white">Relancer</button>
        </form>
      )}
    </li>
  );
}

type View = "tous" | "relancer" | "actifs" | "termines" | "tests";

/** Une seule page pour les clients (fusion de « Suivi client » et « Clients », 20/11/2026). */
export default async function AdminClients({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string; vue?: string }> }) {
  await requireAdmin();
  const { fait, erreur, vue } = await searchParams;
  const { clients: everyone, weeks } = await getCrm();

  // Les chiffres ne comptent que les vrais clients ; les tests ont leur onglet.
  const tests = everyone.filter((c) => c.test);
  const clients = everyone.filter((c) => !c.test);
  const total = clients.length;
  const onboarded = clients.filter((c) => c.realCalls > 0);
  const waiting = clients.filter((c) => c.health === "attente" || c.health === "relancer");
  const active = clients.filter((c) => c.health === "actif");
  const done = clients.filter((c) => c.health === "termine");
  const followUp = clients.filter((c) => c.health === "relancer" || c.health === "inactif" || c.failedEvents > 0);
  const gifts = clients.filter((c) => c.isGift).length;
  const pct = (n: number) => (total ? Math.round((100 * n) / total) : 0);

  const toFirst = avg(onboarded.map((c) => c.daysToFirstCall ?? 0));
  const callsPer = avg(onboarded.map((c) => c.realCalls));
  const minPerCall = onboarded.reduce((s, c) => s + c.realCalls, 0) ? onboarded.reduce((s, c) => s + c.minutes, 0) / onboarded.reduce((s, c) => s + c.realCalls, 0) : null;
  const wordsPer = avg(clients.filter((c) => c.chapters > 0).map((c) => c.words));
  const one = (v: number | null, unit: string) => (v === null ? "—" : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v)} ${unit}`);

  const reached = (stage: CrmStage) => clients.filter((c) => ORDER.indexOf(c.stage) >= ORDER.indexOf(stage)).length;

  const view: View = (["tous", "relancer", "actifs", "termines", "tests"] as const).includes(vue as View) ? (vue as View) : "tous";
  const shown = (view === "tests" ? tests : view === "relancer" ? followUp : view === "actifs" ? active : view === "termines" ? done : clients)
    .slice()
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const tab = (v: View, label: string, n: number) => ({ value: v, label: `${label} ${n}`, href: v === "tous" ? "/admin/clients#liste" : `/admin/clients?vue=${v}#liste` });

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader eyebrow="Clients" title={total === 0 ? "Pas encore de client" : `${total} client${total > 1 ? "s" : ""}`}>
        Qui a commandé, qui a commencé, qui avance, et qui il faut relancer.{tests.length === 1 ? " Votre client de test est rangé à part et ne compte pas." : tests.length > 1 ? ` Vos ${tests.length} clients de test sont rangés à part et ne comptent pas.` : ""}
      </PageHeader>

      {(fait || erreur) && (
        <p role="status" className={`rounded-[14px] px-4 py-2.5 text-[15px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[#a8402f]"}`}>{fait ?? erreur}</p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="users" label="Clients" value={total} hint={`${gifts} offert(s) · ${total - gifts} pour soi`} />
        <Stat icon="phone" tone="amber" label="Embarqués" value={onboarded.length} hint={`${pct(onboarded.length)} % ont fait un premier vrai appel`} />
        <Stat icon="clock" tone={waiting.length ? "red" : "neutral"} label="Attendent leur premier appel" value={waiting.length} hint={`dont ${clients.filter((c) => c.health === "relancer").length} depuis plus de ${RELANCE_AFTER_DAYS} jours`} />
        <Stat icon="book" tone="green" label="Livres terminés" value={done.length} hint={`${active.length} client(s) actif(s) sur ${INACTIVE_AFTER_DAYS} jours`} />
      </div>

      {followUp.length > 0 && (
        <Panel icon="alert" title={`À relancer (${followUp.length})`}>
          <ul className="divide-y divide-[var(--line-soft)]">
            {followUp.map((c) => (
              <Row key={c.id} c={c} relance>
                {c.health === "relancer"
                  ? `A commandé il y a ${c.daysSinceOrder} jours et n’a pas encore fait de vrai appel${c.shortCalls ? ` (${c.shortCalls} appel(s) trop court(s))` : ""}.`
                  : c.health === "inactif"
                    ? `Dernier appel il y a ${c.daysSinceLastCall} jours${c.schedule ? `, rendez-vous ${c.schedule}` : ", sans rendez-vous réglé"}.`
                    : ""}
                {c.failedEvents > 0 ? ` ${c.failedEvents} appel(s) dont le traitement a échoué.` : ""}
              </Row>
            ))}
          </ul>
        </Panel>
      )}

      <Panel id="liste" icon="users" title="Tous les clients">
        <div className="-mx-1 mb-4 overflow-x-auto px-1 [scrollbar-width:none]">
          <Segmented value={view} options={[tab("tous", "Tous", total), tab("relancer", "À relancer", followUp.length), tab("actifs", "Actifs", active.length), tab("termines", "Terminés", done.length), tab("tests", "Tests", tests.length)]} />
        </div>
        {shown.length === 0 ? (
          <Empty>{view === "tests" ? "Aucun client de test. Le bouton « C’est un client de test » est sur chaque fiche." : view === "tous" ? "Aucun client pour l’instant." : "Personne dans cette liste."}</Empty>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-[15px]">
              <thead>
                <tr className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">
                  <th className="px-2 pb-3">Client</th>
                  <th className="px-2 pb-3">État</th>
                  <th className="px-2 pb-3">Commande</th>
                  <th className="px-2 pb-3">Phase</th>
                  <th className="px-2 pb-3 text-right">Appels</th>
                  <th className="px-2 pb-3 text-right">Récits</th>
                  <th className="px-2 pb-3">Dernier appel</th>
                  <th className="px-2 pb-3">Rendez-vous</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const h = c.health === "termine" ? { label: STAGE_ADMIN[c.fulfillment.stage].label, tone: STAGE_ADMIN[c.fulfillment.stage].tone } : HEALTH[c.health];
                  const phase = c.phase ? toPhase(c.phase) : null;
                  return (
                    <tr key={c.id} className="group align-middle [&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-2 [&>td]:py-3 hover:[&>td]:bg-[var(--canvas)]">
                      <td>
                        <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3">
                          <Avatar name={c.name} size={36} />
                          <span className="min-w-0">
                            <span className="block font-bold group-hover:underline">{c.name}</span>
                            <span className="block text-[13px] tabular-nums text-[var(--ink-3)]">{c.phone ?? "pas de numéro"}</span>
                          </span>
                        </Link>
                      </td>
                      <td><Badge tone={h.tone}>{h.label}</Badge></td>
                      <td className="whitespace-nowrap tabular-nums">{fmtDate(c.orderedAt, false)}<span className="t-small block !text-[13px]">{c.isGift ? "offert" : "pour soi"}{c.paid ? "" : " · sans paiement"}</span></td>
                      <td className="min-w-[150px]">
                        {phase ? (
                          <>
                            <span className="flex justify-between gap-2 text-[14px]"><span className="font-semibold">{phase}. {PHASE_LABELS[phase]}</span><span className="tabular-nums text-[var(--ink-3)]">{c.progress} %</span></span>
                            <span className="mt-1.5 block"><Progress value={c.progress} /></span>
                          </>
                        ) : "—"}
                      </td>
                      <td className="text-right tabular-nums"><span className="font-semibold">{c.realCalls}</span><span className="t-small block !text-[13px]">{c.minutes} min</span></td>
                      <td className="text-right tabular-nums"><span className="font-semibold">{c.chapters}</span><span className="t-small block !text-[13px]">{fmtNumber(c.words)} mots</span></td>
                      <td className="whitespace-nowrap tabular-nums">{!c.lastCallAt ? "jamais" : c.daysSinceLastCall === 0 ? "aujourd’hui" : `il y a ${c.daysSinceLastCall} j`}</td>
                      <td className="t-small">{c.schedule ?? "aucun"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {total > 0 && (
        <Panel icon="route" title="Le parcours de vos clients">
          <ol className="grid gap-3">
            {STAGES.map((s, i) => {
              const n = reached(s.key);
              const prev = i === 0 ? total : reached(STAGES[i - 1].key);
              return (
                <li key={s.key} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[220px_1fr_110px]">
                  <div>
                    <p className="text-[17px] font-bold">{s.label}</p>
                    <p className="t-small">{s.hint}</p>
                  </div>
                  <div className="h-9 overflow-hidden rounded-[12px] bg-[var(--surface-2)]">
                    {n > 0 && (
                      <div className="flex h-full items-center rounded-[12px] bg-[var(--amber)] px-3 text-[15px] font-extrabold text-[var(--ink)]" style={{ width: `${Math.max((100 * n) / total, 8)}%` }}>
                        {n}
                      </div>
                    )}
                  </div>
                  <p className="t-small tabular-nums sm:text-right">{i === 0 ? `${n} client(s)` : prev ? `${Math.round((100 * n) / prev)} % de l’étape d’avant` : "—"}</p>
                </li>
              );
            })}
          </ol>
        </Panel>
      )}

      {onboarded.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel icon="phone" title="Appels par semaine">
            <Bars unit="appels" data={weeks.map((w) => ({ label: w.label, value: w.calls }))} />
            <p className="t-small mt-4">Vrais appels des huit dernières semaines (plus d’une minute). Semaine du lundi indiqué.</p>
          </Panel>
          <Panel icon="spark" title="En moyenne">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["De la commande au premier appel", one(toFirst, "jours")],
                ["Appels par client embarqué", one(callsPer, "appels")],
                ["Durée d’un appel", one(minPerCall, "min")],
                ["Mots écrits par livre commencé", wordsPer === null ? "—" : `${fmtNumber(Math.round(wordsPer))} mots`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] bg-[var(--canvas)] p-4">
                  <p className="text-[24px] font-extrabold leading-tight tracking-[-0.03em] tabular-nums">{value}</p>
                  <p className="t-small mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      <p className="t-small">
        Embarqué : le client a fait au moins un appel de plus d’une minute. À relancer : pas de vrai appel {RELANCE_AFTER_DAYS} jours après la commande. Inactif : pas d’appel depuis {INACTIVE_AFTER_DAYS} jours.
      </p>
    </div>
  );
}
