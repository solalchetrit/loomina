import { Badge, Fold } from "@/components/admin/ui";
import { fmtDate, fmtDuration, INTERVIEW_STATUS } from "@/lib/admin/format";
import { fmtEur, type CallCost } from "@/lib/admin/costs";
import type { ReviewRow } from "@/lib/admin/ecoute";

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const sec = (n: number | null | undefined) => (n == null ? "?" : `${n.toLocaleString("fr-FR")} s`);

/**
 * Un appel sur la fiche client (refonte du 24/11/2026) : le son, l'écoute
 * (ce qui cloche), le coût poste par poste, puis le transcript.
 */
export default function CallCard({ profileId, interview, cost, review, chapterNumber, firstName }: {
  profileId: string;
  interview: Record<string, unknown>;
  cost?: CallCost;
  review?: ReviewRow;
  chapterNumber?: number;
  firstName: string;
}) {
  const i = interview;
  const s = INTERVIEW_STATUS[String(i.processing_status)] ?? { label: String(i.processing_status), tone: "muted" as const };
  const r = review?.status === "done" ? review.report : null;
  const t = r?.timing;
  const running = review?.status === "running" && !review.stale;

  return (
    <li className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-5 text-[14px] sm:px-6">
        <b className="text-[15px]">{fmtDate(i.created_at)}</b>
        <span className="text-[var(--ink-3)]">· {fmtDuration(i.duration_seconds)}</span>
        <Badge tone={s.tone}>{s.label}</Badge>
        {chapterNumber ? <Badge tone="ok">Récit n° {chapterNumber}</Badge> : null}
        {cost && <span className="ml-auto text-[14px] font-semibold tabular-nums">{fmtEur(cost.totalTtc)} TTC</span>}
      </div>
      {i.topics_summary ? <p className="px-5 pt-2 text-[14px] text-[var(--ink-2)] sm:px-6">{String(i.topics_summary)}</p> : null}

      {cost?.recordingEventId && (
        <div className="px-5 pt-4 sm:px-6">
          <audio controls preload="none" src={`/api/admin/recordings/${cost.recordingEventId}`} className="w-full" />
        </div>
      )}

      {/* L'écoute */}
      <div className="mx-5 mt-4 rounded-[10px] bg-[var(--canvas)] p-4 sm:mx-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14.5px] font-semibold">Écoute de l’appel</p>
          {cost?.recordingEventId && !running && (
            <form action={`/api/admin/clients/${profileId}/ecoute`} method="post">
              <input type="hidden" name="interview" value={String(i.id)} />
              <button className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--surface)] px-3.5 text-[13.5px] font-semibold shadow-[0_0_0_1px_var(--line)]">
                {review ? "Réécouter" : "Écouter l’appel"}
              </button>
            </form>
          )}
        </div>
        {!cost?.recordingEventId ? (
          <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Pas d’enregistrement pour cet appel.</p>
        ) : running ? (
          <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">En cours, une à deux minutes. Rechargez la page.</p>
        ) : review?.status === "failed" ? (
          <p className="mt-1 text-[13.5px] text-[var(--danger)]">L’écoute a échoué : {review.error}</p>
        ) : !r ? (
          <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Pas encore écouté. L’écoute réécoute la voix de {firstName}, la compare au transcript du direct et relève ce qui cloche.</p>
        ) : (
          <div className="mt-2 grid gap-4">
            {r.verdict && <p className="text-[14.5px] leading-relaxed">{r.verdict}</p>}
            {t && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Loomina coupée" value={String(t.cuts.length)} hint="a parlé pendant une pause" bad={t.cuts.length > 5} />
                <Metric label={`Pauses de ${firstName}`} value={sec(t.narratorPauses.p90)} hint={`9 sur 10 plus courtes · médiane ${sec(t.narratorPauses.median)}`} />
                <Metric label="Loomina attend" value={sec(t.loominaWait.median)} hint={t.suggestedWait ? `il faudrait ~${sec(t.suggestedWait)}` : "avant de répondre"} bad={!!t.suggestedWait && (t.loominaWait.median ?? 0) < t.suggestedWait} />
                <Metric label={`${firstName} parle`} value={`${Math.round(t.narratorShare * 100)} %`} hint="objectif : 75 %" bad={t.narratorShare < 0.6} />
              </div>
            )}
            {r.mal_entendus.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Mal compris par le direct ({r.mal_entendus.length})</p>
                <ul className="mt-1 grid gap-1.5 text-[14px]">
                  {r.mal_entendus.map((m, n) => (
                    <li key={n}>
                      <s className="text-[var(--ink-3)]">{m.entendu}</s> → <b>{m.dit}</b>
                      {m.consequence ? <span className="text-[var(--ink-3)]"> · {m.consequence}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.erreurs_loomina.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Erreurs de Loomina ({r.erreurs_loomina.length})</p>
                <ul className="mt-1 grid gap-1.5 text-[14px]">
                  {r.erreurs_loomina.map((e, n) => (
                    <li key={n}><span className="tabular-nums text-[var(--ink-3)]">{e.moment}</span> {e.quoi} <span className="text-[var(--ink-3)]">· {e.pourquoi}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {r.regles.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Règles non tenues</p>
                <ul className="mt-1 grid gap-1.5 text-[14px]">
                  {r.regles.map((g, n) => (
                    <li key={n}><b>{g.regle}</b>{g.fois ? ` (${g.fois} fois)` : ""}{g.exemples?.length ? <span className="text-[var(--ink-3)]"> · « {g.exemples.slice(0, 2).join(" », « ")} »</span> : null}</li>
                  ))}
                </ul>
              </div>
            )}
            {r.conseils.length > 0 && (
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">À changer</p>
                <ol className="mt-1 list-decimal pl-5 text-[14px]">{r.conseils.map((c, n) => <li key={n}>{c}</li>)}</ol>
              </div>
            )}
            {t && t.cuts.length > 0 && (
              <p className="text-[13.5px] text-[var(--ink-3)]">
                Moments où Loomina s’est fait couper : {t.cuts.map((c) => `${mmss(c.at)} (après ${c.pause} s)`).join(", ")}. Écoutez-les dans le lecteur ci-dessus.
              </p>
            )}
            <Fold summary={`Ce que dit vraiment ${firstName} (réécoute)`}>{r.reecoute}</Fold>
            <p className="text-[13px] text-[var(--ink-3)]">Écouté le {fmtDate(r.at)} · {r.cost.minutes} min de voix réécoutées · {fmtEur(r.cost.totalUsd * 0.92)} HT</p>
          </div>
        )}
      </div>

      {/* Le coût */}
      {cost && (
        <div className="mx-5 mt-3 sm:mx-6">
          <Fold summary="Ce que cet appel a coûté" meta={`${fmtEur(cost.total)} HT`}>
            <table className="w-full text-left text-[13.5px] [font-family:inherit]">
              <tbody>
                {cost.items.map((x, n) => (
                  <tr key={n} className="border-t border-[var(--line-soft)] first:border-t-0 align-top">
                    <td className="py-2 pr-3 font-semibold text-[var(--ink-3)]">{x.provider}</td>
                    <td className="py-2 pr-3"><b>{x.label}</b><br /><span className="text-[13px] text-[var(--ink-3)]">{x.detail}</span></td>
                    <td className="py-2 pr-3"><Badge tone={x.source === "réel" ? "ok" : x.source === "tarif" ? "muted" : "wait"}>{x.source}</Badge></td>
                    <td className="py-2 text-right font-semibold tabular-nums">{fmtEur(x.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[var(--line)]">
                  <td colSpan={3} className="py-2 font-semibold">Total</td>
                  <td className="py-2 text-right tabular-nums"><b>{fmtEur(cost.total)} HT</b><br /><span className="text-[13px] text-[var(--ink-3)]">{fmtEur(cost.totalTtc)} TTC</span></td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-[13px] text-[var(--ink-3)]">« réel » : prix lu chez Twilio ou jetons comptés × prix OpenAI. « tarif » : minutes × tarif public. « estimé » : forfait. Les abonnements fixes (Render, Vercel, Supabase) ne sont pas répartis par appel.</p>
          </Fold>
        </div>
      )}

      <div className="mx-5 mb-5 mt-3 grid gap-2 sm:mx-6">
        {i.transcript ? <Fold summary="Transcript du direct" mono>{String(i.transcript)}</Fold> : null}
        {i.ai_analysis_log && Object.keys(i.ai_analysis_log as object).length > 0 ? <Fold summary="Analyse du Directeur" mono>{JSON.stringify(i.ai_analysis_log, null, 2)}</Fold> : null}
      </div>
    </li>
  );
}

function Metric({ label, value, hint, bad }: { label: string; value: string; hint: string; bad?: boolean }) {
  return (
    <div className="rounded-[8px] bg-[var(--surface)] p-3">
      <p className="text-[13px] font-semibold text-[var(--ink-3)]">{label}</p>
      <p className={`mt-0.5 text-[22px] font-semibold tabular-nums tracking-[-0.02em] ${bad ? "text-[var(--danger)]" : ""}`}>{value}</p>
      <p className="text-[12.5px] leading-snug text-[var(--ink-3)]">{hint}</p>
    </div>
  );
}
