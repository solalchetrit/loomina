import { requireAdmin } from "@/lib/admin/auth";
import TechTabs from "@/components/admin/TechTabs";
import { aiCatalog, editablePrompts } from "@/lib/admin/prompts";
import { refreshPrompts, promptText, editedKeys, templateVars } from "@/lib/loomina/prompt-store";
import { Fold, PageHeader } from "@/components/admin/ui";
import AIcon, { type AdminIconName } from "@/components/admin/icons";

export const metadata = { title: "Les IA" };

const AI_ICONS: Record<string, AdminIconName> = { voix: "phone", demo: "gift", directeur: "route", ecrivain: "pen", editeur: "book", periodes: "layers", photos: "spark", secours: "alert" };

export default async function AdminAis({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { fait, erreur } = await searchParams;
  // Les versions réécrites ici sont relues avant d'afficher : la page montre ce qui tourne.
  await refreshPrompts(true);
  const ais = aiCatalog();
  const editable = editablePrompts();
  const edited = editedKeys();

  return (
    <div>
      <TechTabs value="ia" />
      <PageHeader eyebrow="Les IA" title={`Les ${ais.length} IA de Loomina`}>
        Ce que fait chacune, quand elle agit, ce qu’elle lit et écrit, et ses prompts exacts. Vous pouvez réécrire un prompt sous « Modifier » : il est pris en compte dans la minute, et « Revenir au texte d’origine » annule tout.
      </PageHeader>
        {(fait || erreur) && (
          <p role="status" className={`mb-5 rounded-[10px] px-4 py-3 text-[14px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{fait ?? erreur}</p>
        )}
        <div className="mb-5 flex flex-wrap gap-2">
          {ais.map((ai) => (
            <a key={ai.key} href={`#${ai.key}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[13.5px] font-semibold hover:border-[var(--ink)]"><AIcon name={AI_ICONS[ai.key] ?? "spark"} size={14} />{ai.name}</a>
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
                  <div key={k} className="rounded-[8px] bg-[var(--surface)] px-3.5 py-2.5 text-[13.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                    <dt className="text-[12px] font-medium text-[var(--ink-3)]">{k}</dt>
                    <dd className="mt-0.5 leading-relaxed">{v}</dd>
                  </div>
                ))}
                <div className="rounded-[8px] bg-[var(--surface)] px-3.5 py-2.5 text-[13.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                  <dt className="text-[12px] font-medium text-[var(--ink-3)]">Code</dt>
                  <dd className="mt-0.5 font-mono text-[12.5px] [overflow-wrap:anywhere]">{ai.file}</dd>
                </div>
              </dl>
              <p className="mt-5 text-[12px] font-medium text-[var(--ink-3)]">{ai.prompts.length > 1 ? `${ai.prompts.length} prompts` : "Prompt"}</p>
              <div className="mt-2 grid gap-2">
                {ai.prompts.map((p) => (
                  <Fold key={p.title} summary={p.title} meta={`${Math.round(p.text.length / 100) / 10} k car.`} mono>{p.text}</Fold>
                ))}
              </div>
              {editable.some((e) => e.ai === ai.key) && (
                <>
                  <p className="mt-5 text-[12px] font-medium text-[var(--ink-3)]">Modifier</p>
                  <div className="mt-2 grid gap-2">
                    {editable.filter((e) => e.ai === ai.key).map((e) => {
                      const isEdited = edited.has(e.key);
                      const vars = templateVars(e.original);
                      return (
                        <details key={e.key} id={`modifier-${e.key}`} className="rounded-[10px] bg-[var(--surface)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
                          <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3 text-[14px] font-semibold">
                            <AIcon name="pen" size={14} /> {e.title}
                            {isEdited && <span className="pill pill-amber">Modifié</span>}
                          </summary>
                          <div className="border-t border-[var(--line-soft)] p-4">
                            <form action="/api/admin/prompts" method="post">
                              <input type="hidden" name="key" value={e.key} />
                              <textarea name="content" defaultValue={promptText(e.key, e.original)} rows={Math.min(28, Math.max(8, Math.round(e.original.length / 110)))} spellCheck={false} className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--canvas)] p-3 font-mono text-[13px] leading-relaxed" />
                              <p className="mt-2 text-[13px] text-[var(--ink-3)]">
                                {vars.length > 0 ? `À garder tels quels : ${vars.map((v) => `{{${v}}}`).join(", ")}${e.original.includes("##END_CALL##") ? ", ##END_CALL##" : ""}. ` : e.original.includes("##END_CALL##") ? "À garder tel quel : ##END_CALL##. " : ""}
                                S’il en manque un, l’enregistrement est refusé.
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button name="action" value="enregistrer" className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--btn)] px-4 text-[13.5px] font-semibold text-[var(--on-btn)]">Enregistrer</button>
                                {isEdited && <button name="action" value="origine" className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--surface)] px-4 text-[13.5px] font-semibold text-[var(--ink)] shadow-[0_0_0_1px_var(--line)]">Revenir au texte d’origine</button>}
                              </div>
                            </form>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
    </div>
  );
}
