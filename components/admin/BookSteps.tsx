import { CLIENT_STEPS, STAGE_ORDER, STAGE_ADMIN, nextTeamStep, previousTeamStep, type Fulfillment } from "@/lib/loomina/fulfillment";
import { fmtDate } from "@/lib/admin/format";

/** Combien de jours depuis une date (arrondi vers le bas). */
function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

/**
 * Le livre après « terminé », dans l'admin : les cinq étapes, la date de
 * chacune, et le bouton de l'étape suivante. `retour` : la page où revenir.
 */
export default function BookSteps({ profileId, f, hasAddress, retour, completedAt = null, compact = false }: { profileId: string; f: Fulfillment; hasAddress: boolean; retour: "livre" | "fiche" | "livres"; completedAt?: string | null; compact?: boolean }) {
  const reached = STAGE_ORDER.indexOf(f.stage);
  const dates: Record<string, string | null> = { completed: null, reviewed: f.reviewedAt, printing: f.printedAt, shipped: f.shippedAt, delivered: f.deliveredAt };
  const next = nextTeamStep(f.stage);
  const undo = previousTeamStep(f.stage);
  const action = `/api/admin/clients/${profileId}/etape?retour=${retour}`;
  const blocked = next === "printing" && !hasAddress;

  return (
    <div className="grid gap-4">
      <ol className="grid grid-cols-5 gap-1.5" aria-label="Étapes du livre">
        {CLIENT_STEPS.map((s) => {
          const done = STAGE_ORDER.indexOf(s.stage) <= reached;
          const current = s.stage === f.stage;
          return (
            <li key={s.stage} className="min-w-0" aria-current={current ? "step" : undefined}>
              <span className={`block h-1.5 rounded-full ${done ? "bg-[var(--amber)]" : "bg-[var(--line)]"}`} />
              <span className={`mt-1.5 block truncate text-[13px] ${current ? "font-semibold text-[var(--ink)]" : done ? "font-semibold text-[var(--ink-2)]" : "text-[var(--ink-3)]"}`}>{s.label}</span>
              {!compact && dates[s.stage] && <span className="block text-[12.5px] tabular-nums text-[var(--ink-3)]">{fmtDate(dates[s.stage], false)}</span>}
            </li>
          );
        })}
      </ol>

      {f.tracking && (f.stage === "shipped" || f.stage === "delivered") && (
        <p className="text-[13.5px] text-[var(--ink-2)]">
          Suivi : <b className="tabular-nums text-[var(--ink)]">{f.tracking.number}</b> ·{" "}
          <a href={f.tracking.url} target="_blank" rel="noreferrer" className="font-semibold underline">ouvrir le suivi</a>
        </p>
      )}

      {next && (
        <form action={action} method="post" className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="etape" value={next} />
          {next === "shipped" && (
            <>
              <input name="suivi" required autoComplete="off" placeholder="Numéro de suivi" aria-label="Numéro de suivi" className="h-9 w-[200px] rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[14px]" />
              {!compact && <input name="lien" type="url" autoComplete="off" placeholder="Lien de suivi (sinon La Poste)" aria-label="Lien de suivi, facultatif" className="h-9 w-[260px] rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[14px]" />}
            </>
          )}
          <button disabled={blocked} className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--btn)] px-4 text-[14px] font-semibold text-[var(--on-btn)] disabled:opacity-40">
            {STAGE_ADMIN[f.stage].action}
          </button>
          {!compact && next !== "delivered" && !blocked && <span className="text-[13px] text-[var(--ink-3)]">Le client est prévenu par SMS et par e-mail.</span>}
          {blocked && <span className="text-[13px] font-semibold text-[var(--danger)]">L’auteur n’a pas encore donné son adresse.</span>}
        </form>
      )}

      {!compact && f.stage === "completed" && <PromiseNote completedAt={completedAt} />}

      {undo && !compact && (
        <form action={action} method="post">
          <input type="hidden" name="annuler" value="1" />
          <button className="text-[13px] font-semibold text-[var(--ink-3)] underline underline-offset-4 hover:text-[var(--ink)]">Annuler « {STAGE_ADMIN[undo].label} » (sans message au client)</button>
        </form>
      )}
    </div>
  );
}

/** L'auteur a reçu la promesse d'une version complète sous une semaine. */
export function PromiseNote({ completedAt }: { completedAt: string | null }) {
  const d = daysSince(completedAt);
  if (d === null) return <p className="text-[13px] text-[var(--ink-3)]">Promis à l’auteur : sa version complète relue d’ici une semaine après la fin.</p>;
  const left = 7 - d;
  return (
    <p className={`text-[13px] font-semibold ${left <= 1 ? "text-[var(--danger)]" : "text-[var(--ink-3)]"}`}>
      Terminé il y a {d} jour{d > 1 ? "s" : ""}. {left > 0 ? `Version relue promise d’ici ${left} jour${left > 1 ? "s" : ""}.` : "La semaine promise est passée."}
    </p>
  );
}

export { daysSince };
