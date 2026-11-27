import { requireAdmin } from "@/lib/admin/auth";
import { getAudienceKept, getSearchKept } from "@/lib/admin/cached";
import { audienceConfigured, serviceAccountEmail, type Audience, type SearchStats } from "@/lib/admin/audience";
import { fmtNumber } from "@/lib/admin/format";
import { Panel, Stat, Empty, PageHeader, Delta, AreaChart, BarList, Segmented } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Audience" };

const PERIODS = [7, 28, 90] as const;

const day = (yyyymmdd: string) => {
  const d = yyyymmdd.replace(/-/g, "");
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8))));
};
const pct = (v: number, digits = 1) => `${(v * 100).toLocaleString("fr-FR", { maximumFractionDigits: digits })} %`;
const secs = (s: number) => (s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")}`);
const DEVICES: Record<string, string> = { mobile: "Téléphone", desktop: "Ordinateur", tablet: "Tablette" };

function Funnel({ a }: { a: Audience }) {
  const steps = [
    { label: "Visites", value: a.sessions, before: a.previous.sessions },
    { label: "Clics sur la démo", value: a.events.demo, before: a.previous.demo },
    { label: "Commandes commencées", value: a.events.checkout, before: a.previous.checkout },
    { label: "Achats", value: a.events.purchase, before: a.previous.purchase },
  ];
  const max = Math.max(1, steps[0].value);
  return (
    <ol className="grid gap-2.5">
      {steps.map((s, i) => (
        <li key={s.label} className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[190px_1fr_120px]">
          <p className="flex items-center gap-2 text-[15.5px] font-semibold">
            {s.label} <Delta now={s.value} before={s.before} />
          </p>
          <div className="h-9 overflow-hidden rounded-[8px] bg-[var(--surface-2)]">
            <div className="flex h-full items-center rounded-[8px] bg-[var(--amber)] px-3 text-[14px] font-semibold text-[var(--ink)]" style={{ width: `${Math.max(s.value ? (100 * s.value) / max : 0, s.value ? 7 : 0)}%` }}>
              {s.value ? fmtNumber(s.value) : ""}
            </div>
          </div>
          <p className="t-small tabular-nums sm:text-right">{i === 0 ? `${fmtNumber(s.value)} au total` : steps[i - 1].value ? `${pct(s.value / steps[i - 1].value)} de l’étape d’avant` : "—"}</p>
        </li>
      ))}
    </ol>
  );
}

export default async function AdminAudience({ searchParams }: { searchParams: Promise<{ jours?: string }> }) {
  await requireAdmin();
  const { jours } = await searchParams;
  const days = PERIODS.find((p) => String(p) === jours) ?? 28;

  let a: Audience | null = null;
  let aErr: string | null = null;
  let s: SearchStats | null = null;
  let sErr: string | null = null;
  if (audienceConfigured()) {
    const [ra, rs] = await Promise.allSettled([getAudienceKept(days), getSearchKept(days)]);
    if (ra.status === "fulfilled") a = ra.value;
    else aErr = ra.reason instanceof Error ? ra.reason.message : String(ra.reason);
    if (rs.status === "fulfilled") s = rs.value;
    else sErr = rs.reason instanceof Error ? rs.reason.message : String(rs.reason);
  }
  const robot = serviceAccountEmail();

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader
        eyebrow="Chiffres"
        title="Audience du site"
        action={<Segmented value={String(days)} options={PERIODS.map((p) => ({ value: String(p), label: `${p} jours`, href: `/admin/audience?jours=${p}` }))} />}
      >
        Qui vient sur loomina.eu, d’où, et combien vont jusqu’à la démo et à la commande. Comparé aux {days} jours d’avant.
      </PageHeader>

      {!audienceConfigured() && <Empty>Google n’est pas encore branché à l’admin (variable GA_SERVICE_ACCOUNT_KEY à poser sur Vercel).</Empty>}

      {/* ───────────── Google Analytics ───────────── */}
      {aErr && <Empty>Google Analytics ne répond pas : {aErr}</Empty>}
      {a && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat icon="users" tone="amber" label="Visiteurs" value={fmtNumber(a.users)} delta={<Delta now={a.users} before={a.previous.users} />} hint={`dont ${fmtNumber(a.newUsers)} nouveaux`} />
            <Stat icon="globe" label="Visites" value={fmtNumber(a.sessions)} delta={<Delta now={a.sessions} before={a.previous.sessions} />} hint={`${pct(a.engagedRate, 0)} de visites engagées`} />
            <Stat icon="layers" label="Pages vues" value={fmtNumber(a.pageViews)} delta={<Delta now={a.pageViews} before={a.previous.pageViews} />} hint={a.sessions ? `${(a.pageViews / a.sessions).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} par visite` : undefined} />
            <Stat icon="phone" tone="green" label="Clics sur la démo" value={fmtNumber(a.events.demo)} delta={<Delta now={a.events.demo} before={a.previous.demo} />} hint={`temps moyen : ${secs(a.engagement)} par visite`} />
          </div>

          <Panel icon="chart" title="Visites par jour" action={<a href={`https://analytics.google.com/analytics/web/#/p${process.env.GA_PROPERTY_ID?.trim() || "516095374"}/reports/intelligenthome`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Ouvrir Google Analytics <AIcon name="external" size={14} /></a>}>
            <AreaChart label="Visites par jour" data={a.daily.map((d) => ({ x: day(d.date), y: d.sessions }))} />
          </Panel>

          <Panel icon="route" title="Du visiteur à l’achat">
            <Funnel a={a} />
            <p className="t-small mt-4">{fmtNumber(a.events.contact)} message(s) envoyé(s) par le formulaire de contact sur la période.</p>
          </Panel>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <Panel icon="layers" title="Pages les plus vues">
              <BarList items={a.pages.map((p) => ({ key: p.path, label: p.path, value: p.views }))} />
            </Panel>
            <Panel icon="globe" title="D’où viennent les visiteurs">
              <BarList items={a.sources.map((x) => ({ key: x.source, label: x.source === "(direct)" ? "Accès direct (lien tapé, favori)" : x.source, value: x.sessions }))} />
            </Panel>
            <Panel icon="phone" title="Appareils">
              <BarList items={a.devices.map((d) => ({ key: d.device, label: DEVICES[d.device] ?? d.device, value: d.sessions, display: a!.sessions ? `${Math.round((100 * d.sessions) / a!.sessions)} %` : d.sessions }))} />
            </Panel>
            <Panel icon="home" title="Villes">
              <BarList items={a.cities.map((c) => ({ key: c.city, label: c.city, value: c.sessions }))} />
            </Panel>
          </div>
          <p className="t-small -mt-1">Google Analytics ne compte que les visiteurs qui ont accepté la mesure dans le bandeau cookies : les vrais chiffres sont plus hauts.</p>
        </>
      )}

      {/* ───────────── Search Console ───────────── */}
      {audienceConfigured() && (
        <>
          <h2 className="mt-4 flex items-center gap-3 text-[22px] font-semibold tracking-[-0.02em]">
            <span className="chip-icon !h-9 !w-9"><AIcon name="search" size={18} /></span>
            Google Search : ce que les gens cherchent
          </h2>
          {sErr || !s ? (
            <Panel>
              <p className="text-[14.5px] font-semibold">La Search Console n’est pas encore ouverte à l’admin.</p>
              <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-[15.5px] text-[var(--ink-2)]">
                <li>
                  Dans la <a className="link" href="https://search.google.com/search-console/users" target="_blank" rel="noreferrer">Search Console</a>, propriété loomina.eu : Paramètres, Utilisateurs et autorisations, Ajouter un utilisateur.
                </li>
                <li>
                  Coller l’adresse du compte technique {robot ? <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[13.5px]">{robot}</code> : "(celle de la clé GA_SERVICE_ACCOUNT_KEY)"}, droit « Restreint ».
                </li>
                <li>
                  Dans Google Cloud, activer l’API{" "}
                  <a className="link" href="https://console.cloud.google.com/apis/library/searchconsole.googleapis.com" target="_blank" rel="noreferrer">Google Search Console API</a> pour le projet de cette clé.
                </li>
              </ol>
              {sErr && <p className="t-small mt-3">Réponse de Google : {sErr}</p>}
            </Panel>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Stat icon="search" tone="amber" label="Clics depuis Google" value={fmtNumber(s.clicks)} delta={<Delta now={s.clicks} before={s.previous.clicks} />} />
                <Stat icon="globe" label="Apparitions dans Google" value={fmtNumber(s.impressions)} delta={<Delta now={s.impressions} before={s.previous.impressions} />} hint="fois où loomina.eu s’est affiché" />
                <Stat icon="check" label="Taux de clic" value={pct(s.ctr)} hint="clics ÷ apparitions" />
                <Stat icon="star" label="Position moyenne" value={s.position ? s.position.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) : "—"} hint="1 = premier résultat" />
              </div>
              <Panel icon="chart" title="Apparitions dans Google par jour" action={<a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Ouvrir la Search Console <AIcon name="external" size={14} /></a>}>
                <AreaChart label="Apparitions par jour" data={s.daily.map((d) => ({ x: day(d.date), y: d.impressions }))} />
              </Panel>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel icon="search" title="Les recherches qui mènent à Loomina">
                  {s.queries.length === 0 ? (
                    <Empty>Pas encore assez de recherches pour que Google les montre.</Empty>
                  ) : (
                    <div className="-mx-1 overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-[14px]">
                        <thead>
                          <tr className="text-[12px] font-medium text-[var(--ink-3)]">
                            <th className="px-1 pb-2">Recherche</th>
                            <th className="px-1 pb-2 text-right">Clics</th>
                            <th className="px-1 pb-2 text-right">Vues</th>
                            <th className="px-1 pb-2 text-right">Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.queries.map((q) => (
                            <tr key={q.query} className="[&>td]:border-t [&>td]:border-[var(--line-soft)] [&>td]:px-1 [&>td]:py-2">
                              <td className="max-w-[260px] truncate font-semibold">{q.query}</td>
                              <td className="text-right tabular-nums">{fmtNumber(q.clicks)}</td>
                              <td className="text-right tabular-nums">{fmtNumber(q.impressions)}</td>
                              <td className="text-right tabular-nums">{q.position.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
                <Panel icon="layers" title="Pages trouvées dans Google">
                  <BarList items={s.pages.map((p) => ({ key: p.page, label: p.page, value: p.impressions, display: `${fmtNumber(p.clicks)} clic(s) · ${fmtNumber(p.impressions)} vues` }))} empty="Aucune page encore affichée." />
                </Panel>
              </div>
              <p className="t-small -mt-1">La Search Console compte toutes les recherches Google (sans bandeau cookies), avec deux à trois jours de retard. Propriété lue : {s.site}.</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
