import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { openAiBillConfigured, type Period } from "@/lib/admin/spend";
import { getSpendKept, realRevenueKept } from "@/lib/admin/cached";
import { fmtEur } from "@/lib/admin/costs";
import { fmtDate, fmtDuration } from "@/lib/admin/format";
import { COSTS } from "@/config/costs";
import { OFFER } from "@/config/offer";
import { Badge, Panel, Stat, Empty, PageHeader, Segmented, BarList, NightFigure, Fold } from "@/components/admin/ui";
import { listOrders, getCrm } from "@/lib/admin/data";

export const metadata = { title: "Argent" };

const DEMO_STATUS: Record<string, string> = {
  pending: "en cours",
  written: "récit écrit",
  unusable: "pas assez de matière",
  refused: "SMS refusé",
  failed: "échec",
  no_sms: "son seul",
};

function Th({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-2 pb-2.5 text-[12px] font-medium text-[var(--ink-3)] ${right ? "text-right" : ""}`}>{children}</th>;
}

const money = (n: number) => fmtEur(n);
/** Un livre type : une dizaine d’appels de 20 minutes. */
const BOOK_CALLS = 10;
const cents = (n: number) => (n < 0.995 ? `${(n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} c` : fmtEur(n));

export default async function AdminMoney({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  await requireAdmin();
  const { periode } = await searchParams;
  const period: Period = periode === "precedent" ? "precedent" : "mois";
  const [s, orders, crm] = await Promise.all([getSpendKept(period), listOrders(), getCrm()]);
  // Ce qui rentre : lu dans Stripe, vrais clients seulement (les tests et les commandes à 0 € n'y sont pas).
  const realOrders = orders.filter((o) => !o.test);
  const testOrders = orders.length - realOrders.length;
  const revenue = await realRevenueKept(realOrders.map((o) => o.sessionId), s.range);
  const periodOrders = realOrders.filter((o) => revenue?.sessions.has(o.sessionId));
  const net = revenue?.net ?? null;
  const margin = net == null ? null : net - s.total;
  const perOrder = revenue && revenue.orders ? revenue.net / revenue.orders : null;

  const tw = s.twilio.value;
  const oa = s.openai.value;
  const realCalls = s.calls.filter((c) => c.seconds >= 60);
  const perCall = realCalls.length ? realCalls.reduce((t, c) => t + c.cost.total, 0) / realCalls.length : null;
  const callMinutes = s.calls.reduce((t, c) => t + c.seconds, 0) / 60;
  const perMinute = callMinutes ? s.sums.calls.total / callMinutes : null;
  const perDemo = s.demos.length ? s.sums.demos / s.demos.length : null;
  const clientsWithCalls = new Set(s.calls.map((c) => c.profileId)).size;

  // Qui coûte quoi : la répartition du mois par usage.
  const breakdown = [
    { label: "Appels des clients", value: s.sums.calls.total },
    { label: "Démos", value: s.sums.demos },
    { label: "Compositions automatiques du livre", value: s.sums.compositions },
    { label: "Abonnements fixes", value: s.subs.total },
    { label: "Frais Stripe", value: s.stripe ?? 0 },
  ].filter((b) => b.value > 0);
  // Ce qu'OpenAI facture en plus du détail suivi (photos, tests, recompositions…).
  const openAiOther = oa ? Math.max(0, oa.total - s.sums.callsAi - s.sums.demosAi) : null;

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Argent"
        title="Ce qui rentre, ce qui sort"
        action={
          <Segmented
            value={period}
            options={[
              { value: "mois", label: "Ce mois-ci", href: "/admin/argent" },
              { value: "precedent", label: "Mois dernier", href: "/admin/argent?periode=precedent" },
            ]}
          />
        }
      >
        {s.range.label.charAt(0).toUpperCase() + s.range.label.slice(1)} : ce que les clients ont payé (lu dans Stripe, remboursements déduits), ce que Loomina a dépensé (factures Twilio{oa ? ", OpenAI" : ""} et Stripe, abonnements, hors taxes), et la différence.
      </PageHeader>

      <section aria-label={`Bilan de ${s.range.label}`}>
        <div className="adm-figs">
          <NightFigure label="Encaissé" value={net == null ? "—" : money(net)} hint={revenue ? `${revenue.orders} commande(s)${revenue.refunded > 0 ? `, ${money(revenue.refunded)} remboursé(s)` : ""}` : "Stripe ne répond pas"} />
          <NightFigure label="Dépensé" value={money(s.total)} hint={s.projected != null ? `vers ${money(s.projected)} en fin de mois` : `${money(s.total * (1 + COSTS.vat))} TTC`} />
          <NightFigure label="Marge" value={margin == null ? "—" : money(margin)} hint={net == null ? "Stripe ne répond pas" : net ? `${Math.round((100 * (margin ?? 0)) / net)} % de l’encaissé, hors impression et envoi` : "pas encore de commande sur la période"} />
          <NightFigure label="Une commande" value={perOrder == null ? "—" : money(perOrder)} hint={revenue && revenue.discounts > 0 ? `après ${money(revenue.discounts)} de codes promo` : `prix affiché ${OFFER.price} €`} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel icon="card" title={`Commandes de ${s.range.label} (${periodOrders.length})`}>
          {!revenue ? (
            <Empty>Stripe ne répond pas : la liste des commandes est indisponible pour le moment.</Empty>
          ) : periodOrders.length === 0 ? (
            <Empty>Aucune commande payée sur la période{testOrders ? ` (vos ${testOrders} commande(s) de test ne comptent pas)` : ""}.</Empty>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-[14px]">
                <thead><tr><Th>Client</Th><Th>Date</Th><Th right>Payé</Th><Th right>Remboursé</Th></tr></thead>
                <tbody>
                  {periodOrders.map((o) => {
                    const line = revenue?.sessions.get(o.sessionId);
                    return (
                      <tr key={o.sessionId} className="[&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-2 [&>td]:py-2.5">
                        <td className="font-semibold"><Link className="hover:underline" href={`/admin/clients/${o.profileId}`}>{o.client}</Link>{o.isGift ? <span className="t-small"> · offert</span> : null}</td>
                        <td className="whitespace-nowrap tabular-nums text-[var(--ink-2)]">{fmtDate(o.at)}</td>
                        <td className="text-right font-semibold tabular-nums">{line ? money(line.paid) : "—"}{line && line.discount > 0 ? <span className="t-small block !text-[12px] font-normal">−{money(line.discount)} de code promo</span> : null}</td>
                        <td className="text-right tabular-nums">{line && line.refunded > 0 ? money(line.refunded) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        <Panel icon="chart" title="Commandes par mois">
          <BarList items={crm.months.map((m) => ({ key: m.label, label: m.label, value: m.orders, display: String(m.orders) }))} empty="Aucune commande." />
          <p className="t-small mt-3">Six derniers mois, vrais clients seulement.</p>
        </Panel>
      </div>

      <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">Le détail des dépenses</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {s.projected != null ? (
            <Stat icon="clock" label="Projection fin de mois" value={money(s.projected)} hint={`au rythme de ${s.range.elapsedDays} jour(s)`} />
          ) : (
            <Stat icon="clock" label="Par jour en moyenne" value={money(s.total / s.range.totalDays)} />
          )}
          <Stat icon="phone" tone="amber" label="Un appel client" value={perCall == null ? "—" : money(perCall)} hint={perMinute == null ? "pas encore d’appel" : `${cents(perMinute)} la minute`} />
          <Stat icon="phone" label="Une démo" value={perDemo == null ? "—" : money(perDemo)} hint={`${s.demos.length} démo(s) sur la période`} />
      </div>

      {s.errors.length > 0 && (
        <ul className="grid gap-2">
          {s.errors.map((e) => (
            <li key={e} className="rounded-[8px] bg-[var(--danger-soft)] px-4 py-2.5 text-[14px] font-semibold text-[var(--danger)]">{e}</li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Panel icon="euro" title="Où part l’argent">
          <BarList items={breakdown.map((b) => ({ key: b.label, label: b.label, value: b.value, display: money(b.value) }))} empty="Aucune dépense sur la période." />
          <p className="t-small mt-4">
            Pour un livre de {BOOK_CALLS} appels, la conversation et l’écriture coûtent environ {perCall == null ? "—" : money(perCall * BOOK_CALLS)}, soit {perCall == null ? "—" : `${((100 * perCall * BOOK_CALLS) / OFFER.price).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`} des {OFFER.price} € (hors impression et envoi).
          </p>
        </Panel>

        <Panel icon="layers" title="Factures des fournisseurs">
          <div className="grid gap-3">
            <Fold summary={<span className="flex items-center gap-2">Twilio {tw ? <Badge tone="ok">réel</Badge> : <Badge tone="wait">estimé</Badge>}</span>} meta={tw ? money(tw.total) : "—"}>
              {tw ? (
                <div className="grid gap-1 font-sans text-[14px]">
                  {tw.lines.map((l) => (
                    <p key={l.label} className="flex justify-between gap-3"><span>{l.label} <span className="text-[var(--ink-3)]">· {l.usage}</span></span><b className="tabular-nums">{money(l.amount)}</b></p>
                  ))}
                  {tw.balance != null && <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">Crédit restant chez Twilio : <b className="text-[var(--ink)]">{money(tw.balance)}</b></p>}
                </div>
              ) : (
                "Twilio ne répond pas : la ligne et la voix sont estimées à partir des appels."
              )}
            </Fold>
            <Fold summary={<span className="flex items-center gap-2">OpenAI {oa ? <Badge tone="ok">réel</Badge> : <Badge tone="wait">estimé</Badge>}</span>} meta={money(oa?.total ?? s.sums.callsAi + s.sums.demosAi + s.sums.compositions)}>
              {oa ? (
                <div className="grid gap-1 font-sans text-[14px]">
                  {oa.lines.map((l) => (
                    <p key={l.label} className="flex justify-between gap-3"><span>{l.label}</span><b className="tabular-nums">{money(l.amount)}</b></p>
                  ))}
                  {openAiOther != null && openAiOther > 0.01 && <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">Dont {money(openAiOther)} hors appels et démos : compositions du livre, photos, tests.</p>}
                </div>
              ) : (
                <span className="font-sans text-[14px]">
                  Calculé à partir des jetons de chaque appel et démo, plus {money(COSTS.compositionFallbackPerEdition * COSTS.usdToEur)} par composition du livre (estimation).{" "}
                  {!openAiBillConfigured() && "Pour lire la vraie facture : créer une clé d’administration en lecture sur platform.openai.com (Settings, Admin keys) et la poser sur Vercel sous OPENAI_ADMIN_KEY."}
                </span>
              )}
            </Fold>
            <Fold summary="Stripe (frais de paiement)" meta={s.stripe == null ? "—" : money(s.stripe)}>
              <span className="font-sans text-[14px]">Les frais prélevés par Stripe sur les paiements et remboursements de la période, lus en direct.</span>
            </Fold>
            <Fold summary="Abonnements fixes" meta={money(s.subs.total)}>
              <div className="grid gap-1 font-sans text-[14px]">
                {s.subs.lines.map((l) => (
                  <p key={l.name} className="flex justify-between gap-3">
                    <span>{l.name}{l.note ? <span className="text-[var(--ink-3)]"> · {l.note}</span> : null}</span>
                    <b className="tabular-nums">{l.amount == null ? "à renseigner" : money(l.amount)}</b>
                  </p>
                ))}
                <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">Liste et montants dans config/costs.ts.</p>
              </div>
            </Fold>
          </div>
        </Panel>
      </div>

      <Panel icon="phone" title={`Chaque appel client (${s.calls.length})`}>
        {s.calls.length === 0 ? (
          <Empty>Aucun appel client sur la période.</Empty>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              {([["Ligne", s.sums.calls.line], ["Voix et écoute", s.sums.calls.voice], ["IA de la conversation", s.sums.calls.conversation], ["Analyse et écriture", s.sums.calls.writing], ["Total", s.sums.calls.total]] as const).map(([l, v]) => (
                <div key={l} className="rounded-[10px] bg-[var(--canvas)] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[var(--ink-3)]">{l}</p>
                  <p className="mt-0.5 text-[20px] font-semibold tabular-nums tracking-[-0.02em]">{money(v)}</p>
                </div>
              ))}
            </div>
            <div className="-mx-2 max-h-[560px] overflow-auto">
              <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left text-[14px]">
                <thead className="sticky top-0 bg-[var(--surface)]">
                  <tr>
                    <Th>Client</Th><Th>Date</Th><Th right>Durée</Th><Th right>Ligne</Th><Th right>Voix</Th><Th right>IA conv.</Th><Th right>Écriture</Th><Th right>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {s.calls.map((c) => (
                    <tr key={c.id} className="[&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-2 [&>td]:py-2.5">
                      <td className="font-semibold">{c.profileId ? <Link className="hover:underline" href={`/admin/clients/${c.profileId}`}>{c.client}</Link> : c.client}{c.test ? <span className="ml-2"><Badge>test</Badge></span> : null}</td>
                      <td className="whitespace-nowrap tabular-nums text-[var(--ink-2)]">{fmtDate(c.at)}</td>
                      <td className="text-right tabular-nums">{fmtDuration(c.seconds)}</td>
                      <td className="text-right tabular-nums">{cents(c.cost.line)}</td>
                      <td className="text-right tabular-nums">{cents(c.cost.voice)}</td>
                      <td className="text-right tabular-nums">{cents(c.cost.conversation)}</td>
                      <td className="text-right tabular-nums">{cents(c.cost.writing)}</td>
                      <td className="text-right font-semibold tabular-nums">{money(c.cost.total)}{c.cost.estimated ? <span className="t-small block !text-[12px] font-normal">estimé</span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel icon="phone" title={`Chaque démo (${s.demos.length})`}>
          {s.demos.length === 0 ? (
            <Empty>Aucune démo sur la période.</Empty>
          ) : (
            <div className="-mx-2 max-h-[480px] overflow-auto">
              <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-[14px]">
                <thead className="sticky top-0 bg-[var(--surface)]">
                  <tr><Th>Démo</Th><Th right>Durée</Th><Th right>Téléphone</Th><Th right>IA</Th><Th right>Total</Th></tr>
                </thead>
                <tbody>
                  {s.demos.map((d) => (
                    <tr key={d.id} className="[&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-2 [&>td]:py-2.5">
                      <td><span className="font-semibold">{d.name}</span><span className="t-small block !text-[13px]">{fmtDate(d.at)} · {DEMO_STATUS[d.status] ?? d.status}</span></td>
                      <td className="text-right tabular-nums">{fmtDuration(d.seconds)}</td>
                      <td className="text-right tabular-nums">{cents(d.line + d.voice)}</td>
                      <td className="text-right tabular-nums">{cents(d.conversation + d.writing)}</td>
                      <td className="text-right font-semibold tabular-nums">{money(d.total)}{d.estimated ? <span className="t-small block !text-[12px] font-normal">estimé</span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel icon="book" title="Compositions automatiques du livre">
          {s.compositions.length === 0 ? (
            <Empty>Aucune composition sur la période.</Empty>
          ) : (
            <>
              <BarList items={s.compositions.map((c) => ({ key: c.projectId, label: c.profileId ? <Link className="hover:underline" href={`/admin/clients/${c.profileId}`}>{c.client}</Link> : c.client, value: c.count, display: `${c.count} · ${money(c.total)}` }))} />
              <p className="t-small mt-3">Le livre s’écrit à la fin de chaque étape de Mémo (4 fois par livre), et une correction est reportée dans les chapitres concernés. Coût estimé à {money(COSTS.compositionFallbackPerEdition * COSTS.usdToEur)} par composition{oa ? " ; la facture OpenAI ci-dessus donne le vrai total" : ""}.</p>
            </>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="phone" label="Minutes d’appel client" value={Math.round(callMinutes).toLocaleString("fr-FR")} hint={`${realCalls.length} vrai(s) appel(s) d’une minute ou plus`} />
        <Stat icon="users" label="Clients appelés" value={clientsWithCalls} />
        <Stat icon="book" label="Compositions" value={s.compositions.reduce((t, c) => t + c.count, 0)} />
        <Stat icon="card" label="TVA" value={`${Math.round(COSTS.vat * 100)} %`} hint="ajoutée pour les montants TTC" />
      </div>

      <p className="t-small">
        « réel » : lu chez le fournisseur. « estimé » : recalculé avec la grille de config/costs.ts (dollar à {COSTS.usdToEur.toLocaleString("fr-FR")} €). Le prix de la ligne de chaque appel et de chaque démo est lu chez Twilio, appel par appel.
      </p>
    </div>
  );
}
