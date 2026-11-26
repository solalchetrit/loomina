import { requireAdmin } from "@/lib/admin/auth";
import { listPromos, type PromoRow } from "@/lib/admin/promo";
import { fmtDate } from "@/lib/admin/format";
import { Badge, Empty, PageHeader, Panel } from "@/components/admin/ui";
import { SITE } from "@/config/site";

export const metadata = { title: "Codes promo" };
export const dynamic = "force-dynamic";

const input = "h-10 w-full rounded-[8px] border border-[var(--line)] bg-transparent px-3 text-[14px] outline-none focus:border-[var(--amber)]";
const label = "mb-1.5 block text-[12.5px] font-medium text-[var(--ink-3)]";

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-[12px] font-medium text-[var(--ink-3)]">{children}</th>;
}

/**
 * Le générateur de codes promo (Solal, 26/11/2026) : un code par situation,
 * difficile à deviner, créé dans Stripe en un clic.
 */
export default async function AdminCodes({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { fait, erreur } = await searchParams;
  let rows: PromoRow[] = [];
  let failed = false;
  try {
    rows = await listPromos();
  } catch {
    failed = true;
  }
  const active = rows.filter((r) => r.active);
  const past = rows.filter((r) => !r.active).slice(0, 20);
  const created = fait?.match(/^Code créé : ([A-Z0-9-]+)$/)?.[1];
  const host = SITE.url.replace(/\/$/, "");

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader title="Codes promo">Créez un code pour une personne ou une occasion. Il est généré au hasard, donc impossible à deviner.</PageHeader>

      {created ? (
        <div role="status" className="rounded-[8px] bg-[var(--success-soft)] px-4 py-3.5 text-[var(--success)]">
          <p className="text-[13.5px] font-medium">Code créé. À copier et à envoyer :</p>
          <p className="mt-1.5 select-all font-mono text-[22px] font-semibold tracking-[0.04em]">{created}</p>
          <p className="mt-1.5 select-all break-all text-[13px]">Lien avec le code déjà appliqué : {host}/order?code={created}</p>
        </div>
      ) : (
        (fait || erreur) && (
          <p role="status" className={`rounded-[8px] px-4 py-2.5 text-[13.5px] font-medium ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
            {fait ?? erreur}
          </p>
        )
      )}

      <Panel title="Nouveau code">
        <form action="/api/admin/codes" method="post" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-6">
            <label className={label} htmlFor="note">Pour qui, pour quoi</label>
            <input id="note" name="note" required maxLength={120} className={input} placeholder="Ex. : cadeau pour tante Monique, partenariat résidence Les Tilleuls" />
          </div>
          <div className="lg:col-span-1">
            <label className={label} htmlFor="valeur">Réduction</label>
            <input id="valeur" name="valeur" type="number" min={1} max={1000} required defaultValue={10} className={input} />
          </div>
          <div className="lg:col-span-1">
            <label className={label} htmlFor="type">En</label>
            <select id="type" name="type" defaultValue="percent" className={input}>
              <option value="percent">% du prix</option>
              <option value="amount">euros</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className={label} htmlFor="utilisations">Utilisations</label>
            <input id="utilisations" name="utilisations" type="number" min={1} max={1000} required defaultValue={1} className={input} />
          </div>
          <div className="lg:col-span-1">
            <label className={label} htmlFor="jours">Valable (jours)</label>
            <input id="jours" name="jours" type="number" min={1} max={365} defaultValue={30} className={input} placeholder="Sans fin" />
          </div>
          <div className="lg:col-span-2">
            <label className={label} htmlFor="mot">Mot au début (facultatif)</label>
            <input id="mot" name="mot" maxLength={10} className={input} placeholder="LOOM" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-2 lg:col-span-6">
            <button className="adm-btn">Générer le code</button>
            <p className="text-[13px] text-[var(--ink-3)]">100 % = livre gratuit. Le code s’ajoute au prix du jour, offre de lancement comprise.</p>
          </div>
        </form>
      </Panel>

      <Panel title={`Codes utilisables (${active.length})`} flush>
        {failed ? (
          <div className="p-4"><Empty>Stripe ne répond pas pour l’instant.</Empty></div>
        ) : active.length === 0 ? (
          <div className="p-4"><Empty>Aucun code utilisable.</Empty></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13.5px]">
              <thead>
                <tr className="border-b border-[var(--line)]"><Th>Code</Th><Th>Pour</Th><Th>Réduction</Th><Th>Utilisé</Th><Th>Fin</Th><Th> </Th></tr>
              </thead>
              <tbody>
                {active.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--line-soft)] last:border-0">
                    <td className="select-all whitespace-nowrap px-4 py-3 font-mono font-medium">{r.code}</td>
                    <td className="px-4 py-3 text-[var(--ink-2)]">{r.note || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.discount === "-100 %" ? <Badge tone="wait">gratuit</Badge> : r.discount}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.used}{r.max != null ? ` sur ${r.max}` : ""}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--ink-2)]">{r.expires ? fmtDate(r.expires.toISOString()) : "sans fin"}</td>
                    <td className="px-4 py-2 text-right">
                      <form action="/api/admin/codes" method="post">
                        <input type="hidden" name="couper" value={r.id} />
                        <button className="adm-btn adm-btn-sec">Couper</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {past.length > 0 && (
        <Panel title="Codes terminés" flush>
          <ul>
            {past.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--line-soft)] px-4 py-2.5 text-[13.5px] text-[var(--ink-3)] last:border-0">
                <span className="font-mono">{r.code}</span>
                <span>{r.note || "—"}</span>
                <span className="ml-auto">{r.discount} · utilisé {r.used} fois</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
