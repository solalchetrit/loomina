import { requireAdmin } from "@/lib/admin/auth";
import { aiCatalog } from "@/lib/admin/prompts";
import { Fold, PageHeader } from "@/components/admin/ui";
import AIcon, { type AdminIconName } from "@/components/admin/icons";

export const metadata = { title: "Les IA" };

const AI_ICONS: Record<string, AdminIconName> = { voix: "phone", demo: "gift", directeur: "route", ecrivain: "pen", editeur: "book", periodes: "layers", photos: "spark", secours: "alert" };

export default async function AdminAis() {
  await requireAdmin();
  const ais = aiCatalog();

  return (
    <div>
      <PageHeader eyebrow="Les IA" title={`Les ${ais.length} IA de Loomina`}>
        Ce que fait chacune, quand elle agit, ce qu’elle lit et écrit, et ses prompts exacts. Les prompts sont lus directement dans le code : ce que vous voyez ici est ce qui tourne en ligne.
      </PageHeader>
        <div className="mb-5 flex flex-wrap gap-2">
          {ais.map((ai) => (
            <a key={ai.key} href={`#${ai.key}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[14px] font-semibold hover:border-[var(--ink)]"><AIcon name={AI_ICONS[ai.key] ?? "spark"} size={14} />{ai.name}</a>
          ))}
        </div>
        <div className="grid gap-4">
          {ais.map((ai) => (
            <article key={ai.key} id={ai.key} className="scroll-mt-40 rounded-[24px] bg-[var(--canvas)] p-5 sm:p-7">
              <div className="flex flex-wrap items-start gap-4">
                <span className="chip-icon"><AIcon name={AI_ICONS[ai.key] ?? "spark"} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="t-heading">{ai.name}</h3>
                  <p className="mt-1 max-w-[75ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">{ai.role}</p>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {([["Modèle", ai.model], ["Où", ai.where], ["Quand", ai.when], ["Lit", ai.reads], ["Écrit", ai.writes]] as const).map(([k, v]) => (
                  <div key={k} className="rounded-[12px] bg-white px-3.5 py-2.5 text-[14.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">{k}</dt>
                    <dd className="mt-0.5 leading-relaxed">{v}</dd>
                  </div>
                ))}
                <div className="rounded-[12px] bg-white px-3.5 py-2.5 text-[14.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                  <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Code</dt>
                  <dd className="mt-0.5 font-mono text-[12.5px] [overflow-wrap:anywhere]">{ai.file}</dd>
                </div>
              </dl>
              <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{ai.prompts.length > 1 ? `${ai.prompts.length} prompts` : "Prompt"}</p>
              <div className="mt-2 grid gap-2">
                {ai.prompts.map((p) => (
                  <Fold key={p.title} summary={p.title} meta={`${Math.round(p.text.length / 100) / 10} k car.`} mono>{p.text}</Fold>
                ))}
              </div>
            </article>
          ))}
        </div>
    </div>
  );
}
