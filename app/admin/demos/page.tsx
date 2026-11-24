import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listDemos } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber } from "@/lib/admin/format";
import type { Tone } from "@/lib/admin/format";
import { Badge, Panel, Empty, PageHeader, Fold } from "@/components/admin/ui";
import { DEMO_STORY_DAYS } from "@/lib/loomina/demo-story";

export const metadata = { title: "Démos" };

const STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "En cours d’écriture", tone: "wait" },
  written: { label: "Récit écrit", tone: "ok" },
  unusable: { label: "Pas assez de matière", tone: "muted" },
  refused: { label: "SMS refusé", tone: "muted" },
  failed: { label: "Échec d’écriture", tone: "bad" },
  no_sms: { label: "Fixe ou masqué : son seul", tone: "muted" },
};

function words(text: unknown): number {
  return String(text ?? "").split(/\s+/).filter(Boolean).length;
}

/** Les mots du narrateur seulement (lignes « User: »), pour juger la matière. */
function narratorWords(transcript: unknown): number {
  return String(transcript ?? "")
    .split("\n")
    .filter((l) => l.startsWith("User:"))
    .reduce((n, l) => n + words(l.slice(5)), 0);
}

export default async function AdminDemos() {
  await requireAdmin();
  const demos = await listDemos();

  return (
    <div>
      <PageHeader eyebrow="Démos" title={`${demos.length} démonstration${demos.length > 1 ? "s" : ""}`}>
        Les appels d’essai de cinq minutes, du plus récent au plus ancien : l’enregistrement audio, le transcript, le récit envoyé, le SMS et l’e-mail. Tout est effacé au bout de {DEMO_STORY_DAYS} jours.
      </PageHeader>
      <Panel>
        {demos.length === 0 ? (
          <Empty>Aucune démonstration ces {DEMO_STORY_DAYS} derniers jours.</Empty>
        ) : (
          <ul className="grid gap-4">
            {demos.map((d) => {
              const s = STATUS[String(d.status)] ?? { label: String(d.status), tone: "muted" as Tone };
              return (
                <li key={String(d.id)} className="rounded-[10px] border border-[var(--line)] bg-[var(--adm-bg)] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[14px]">
                    <b>{fmtDate(d.created_at)}</b>
                    <span className="text-[var(--ink-3)]">
                      · {d.first_name ? String(d.first_name) : "prénom inconnu"} · {fmtDuration(d.duration_seconds)} · <span className="tabular-nums">{String(d.phone ?? "numéro masqué")}</span>
                    </span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                    {d.sms_sent_at ? <Badge tone="ok">SMS envoyé</Badge> : null}
                    {d.email ? <Badge tone="ok">E-mail : {String(d.email)}{Number(d.email_count) > 1 ? ` (×${String(d.email_count)})` : ""}</Badge> : null}
                    {d.promo_code ? <Badge>Code {String(d.promo_code)}</Badge> : null}
                  </div>
                  <p className="mt-2 text-[13.5px] text-[var(--ink-2)]">
                    {d.title ? <><b>« {String(d.title)} »</b> · </> : null}
                    Le narrateur a dit {fmtNumber(narratorWords(d.transcript))} mots, le récit en compte {fmtNumber(words(d.content))}.
                    {d.status === "written" && d.token ? <> · <Link href={`/recit/${String(d.token)}`} className="font-semibold underline" target="_blank">Voir la page du récit</Link></> : null}
                  </p>
                  {d.error ? <p className="mt-2 text-[13.5px] text-[var(--danger)]">Erreur : {String(d.error)}</p> : null}
                  {d.recording_sid ? <audio controls preload="none" src={`/api/admin/recordings/${String(d.id)}?demo=1`} className="mt-3 w-full" /> : null}
                  <div className="mt-3 grid gap-2">
                    {d.content ? <Fold summary="Récit envoyé">{String(d.content)}</Fold> : null}
                    {d.transcript ? <Fold summary="Transcript de l’appel" mono>{String(d.transcript)}</Fold> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
