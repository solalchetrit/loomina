import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getCrm, RELANCE_AFTER_DAYS, INACTIVE_AFTER_DAYS } from "@/lib/admin/data";
import type { CrmClient, CrmHealth, CrmStage } from "@/lib/admin/data";
import { fmtDate, fmtNumber } from "@/lib/admin/format";
import type { Tone } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { STAGE_ADMIN } from "@/lib/loomina/fulfillment";
import { Badge, Panel, NightFigure, Empty, PageHeader, Avatar, Progress, Segmented } from "@/components/admin/ui";

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
          <span className="text-[13.5px] font-semibold tabular-nums">{d.value}</span>
          <span className="w-full rounded-t-[4px] bg-[var(--amber)]" style={{ height: `${Math.max(d.value ? 6 : 2, (d.value / max) * 120)}px`, opacity: d.value ? 1 : 0.25 }} />
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
      <Link href={`/admin/clients/${c.id}`} className="-mx-3 flex min-w-0 flex-1 flex-wrap items-center gap-3 rounded-[10px] px-3 py-3 hover:bg-[var(--canvas)]">
        <Avatar name={c.name} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{c.name}</span>
            <Badge tone={h.tone}>{h.label}</Badge>
            {c.isGift && <Badge tone="wait">Offert</Badge>}
          </span>
          <span className="t-small mt-0.5 block">{children}</span>
        </span>
        <span className="t-small hidden shrink-0 tabular-nums sm:block">{c.phone ?? ""}</span>
      </Link>
      {relance && (
        <form action={`/api/admin/clients/${c.id}/relance?retour=suivi`} method="post">
          <button className="adm-btn">Relancer</button>
        </form>
      )}
    </li>
  );
}

type View = "tous" | "relancer" | "actifs" | "termines" | "tests";

/** Une seule page pour les clients (fusion de « Suivi client » et « Clients », 20/11/2026). */
export default async function AdminClients({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string; vue?: string; q?: string }> }) {
  await requireAdmin();
  const { fait, erreur, vue, q } = await searchParams;
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
  // La recherche de la colonne (⌘K) : par nom ou par numéro, tests compris.
  const query = (q ?? "").trim();
  const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const digits = query.replace(/\D/g, "").replace(/^0/, "");
  const found = query ? everyone.filter((c) => norm(c.name).includes(norm(query)) || (digits.length >= 3 && (c.phone ?? "").replace(/\D/g, "").includes(digits))) : null;
  const shown = (found ?? (view === "tests" ? tests : view === "relancer" ? followUp : view === "actifs" ? active : view === "termines" ? done : clients))
    .slice()
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const tab = (v: View, label: string, n: number) => ({ value: v, label: `${label} ${n}`, href: v === "tous" ? "/admin/clients#liste" : `/admin/clients?vue=${v}#liste` });

  return (
    <div className="grid grid-cols-1 gap-[22px]">
      <PageHeader title={total === 0 ? "Pas encore de client" : `${total} client${total > 1 ? "s" : ""}${followUp.length ? `, dont ${followUp.length} à relancer` : ""}`}>
        Qui a commandé, qui a commencé, qui avance, et qui il faut relancer.{tests.length === 1 ? " Votre client de test est rangé à part et ne compte pas." : tests.length > 1 ? ` Vos ${tests.length} clients de test sont rangés à part et ne comptent pas.` : ""}
      </PageHeader>

      {(fait || erreur) && (
        <p role="status" className={`rounded-[8px] px-4 py-2.5 text-[14px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{fait ?? erreur}</p>
      )}

      <section aria-label="Les chiffres des clients" className="adm-figs">
        <NightFigure label="Embarqués" value={`${onboarded.length} sur ${total}`} hint={`${pct(onboarded.length)} % ont fait un premier vrai appel`} />
        <NightFigure label="Attendent leur premier appel" value={waiting.length} hint={`dont ${clients.filter((c) => c.health === "relancer").length} depuis plus de ${RELANCE_AFTER_DAYS} jours`} />
        <NightFigure label="Durée d’un appel" value={one(minPerCall, "min")} hint={`${onboarded.reduce((n, c) => n + c.realCalls, 0)} appels, ${onboarded.reduce((n, c) => n + c.minutes, 0)} min en tout`} />
        <NightFigure label="Livres terminés" value={done.length} hint={`${active.length} client(s) actif(s) sur ${INACTIVE_AFTER_DAYS} jours · ${gifts} livre(s) offert(s)`} />
      </section>

      {followUp.length > 0 && (
        <Panel flush title={`À relancer (${followUp.length})`}>
          <ul className="divide-y divide-[var(--line)] px-4">
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

      <Panel
        id="liste"
        flush
        title={found ? `Recherche « ${query} » : ${found.length} résultat${found.length > 1 ? "s" : ""}` : undefined}
        action={
          found ? (
            <Link href="/admin/clients#liste" className="text-[12.5px] text-[var(--ink-3)] hover:text-[var(--ink)]">Voir tous les clients</Link>
          ) : (
            <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
              <Segmented value={view} options={[tab("tous", "Tous", total), tab("relancer", "À relancer", followUp.length), tab("actifs", "Actifs", active.length), tab("termines", "Terminés", done.length), tab("tests", "Tests", tests.length)]} />
            </div>
          )
        }
      >
        {shown.length === 0 ? (
          <div className="p-4"><Empty>{found ? "Aucun client ne porte ce nom ou ce numéro." : view === "tests" ? "Aucun client de test. Le bouton « C’est un client de test » est sur chaque fiche." : view === "tous" ? "Aucun client pour l’instant." : "Personne dans cette liste."}</Empty></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left text-[13.5px]">
              <thead>
                <tr className="text-[12px] font-medium text-[var(--ink-3)]">
                  <th className="whitespace-nowrap px-4 py-2.5">Client</th>
                  <th className="whitespace-nowrap px-4 py-2.5">État</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Commande</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Phase</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right">Appels</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right">Récits</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Dernier appel</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Rendez-vous</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => {
                  const h = c.health === "termine" ? { label: STAGE_ADMIN[c.fulfillment.stage].label, tone: STAGE_ADMIN[c.fulfillment.stage].tone } : HEALTH[c.health];
                  const phase = c.phase ? toPhase(c.phase) : null;
                  return (
                    <tr key={c.id} className="group align-middle [&>td]:border-t [&>td]:border-[var(--line)] [&>td]:px-4 [&>td]:py-2.5 hover:[&>td]:bg-[var(--canvas)]">
                      <td>
                        <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3">
                          <Avatar name={c.name} size={30} />
                          <span className="min-w-0">
                            <span className="block whitespace-nowrap font-medium group-hover:underline">{c.name}</span>
                            <span className="block text-[13px] tabular-nums text-[var(--ink-3)]">{c.phone ?? "pas de numéro"}</span>
                          </span>
                        </Link>
                      </td>
                      <td><Badge tone={h.tone}>{h.label}</Badge></td>
                      <td className="whitespace-nowrap tabular-nums">{fmtDate(c.orderedAt, false)}<span className="t-small block !text-[13px]">{c.isGift ? "offert" : "pour soi"}{c.paid ? "" : " · sans paiement"}</span></td>
                      <td className="min-w-[150px]">
                        {phase ? (
                          <>
                            <span className="flex justify-between gap-2 whitespace-nowrap"><span>{phase}. {PHASE_LABELS[phase]}</span><span className="tabular-nums text-[var(--ink-3)]">{c.progress} %</span></span>
                            <span className="mt-1.5 block"><Progress value={c.progress} /></span>
                          </>
                        ) : "—"}
                      </td>
                      <td className="whitespace-nowrap text-right tabular-nums"><span>{c.realCalls}</span><span className="t-small block !text-[12.5px]">{c.minutes} min</span></td>
                      <td className="whitespace-nowrap text-right tabular-nums"><span>{c.chapters}</span><span className="t-small block !text-[12.5px]">{fmtNumber(c.words)} mots</span></td>
                      <td className="whitespace-nowrap tabular-nums">{!c.lastCallAt ? "jamais" : c.daysSinceLastCall === 0 ? "aujourd’hui" : `il y a ${c.daysSinceLastCall} j`}</td>
                      <td className="t-small whitespace-nowrap">{c.schedule ?? "aucun"}</td>
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
                    <p className="font-medium">{s.label}</p>
                    <p className="t-small">{s.hint}</p>
                  </div>
                  <div className="h-6 overflow-hidden rounded-[5px] bg-[var(--surface-2)]">
                    {n > 0 && (
                      <div className="flex h-full items-center rounded-[5px] bg-[var(--amber)] px-2 text-[12.5px] font-semibold text-[var(--on-btn)]" style={{ width: `${Math.max((100 * n) / total, 8)}%` }}>
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
                <div key={label} className="rounded-[8px] border border-[var(--line)] p-3.5">
                  <p className="text-[20px] font-semibold leading-tight tracking-[-0.03em] tabular-nums">{value}</p>
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
