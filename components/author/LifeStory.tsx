"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { ProjectOverview } from "./types";

type Family = ProjectOverview["family"];

/**
 * Ajouter soi-même une personne : un « + » discret, le prénom et le rôle.
 * Loomina la retient et demandera qui elle est lors d'un prochain appel.
 */
function AddPerson({ onAdded, onUnauthorized }: { onAdded: (family: Family, openQuestions: string[]) => void; onUnauthorized: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, relation }),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "L’ajout n’a pas abouti. Réessayez.");
      onAdded(data.family, data.openQuestions);
      setMessage({ ok: true, text: `${name.trim()} est ajouté(e). Loomina vous en parlera lors d’un prochain appel.` });
      setName("");
      setRelation("");
      setOpen(false);
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "L’ajout n’a pas abouti. Réessayez." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setMessage(null);
        }}
        aria-expanded={open}
        aria-label="Ajouter une personne"
        title="Ajouter une personne"
        className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[22px] font-semibold leading-none text-[var(--ink-3)] shadow-[inset_0_0_0_1px_var(--line)] hover:text-[var(--ink)] hover:shadow-[inset_0_0_0_1px_var(--ink)]"
      >
        <span aria-hidden="true">{open ? "×" : "+"}</span>
      </button>
      {(open || message) && (
        <div className="basis-full">
          {open && (
            <form onSubmit={submit} className="mt-4 space-y-3 rounded-[18px] bg-[var(--canvas)] p-4">
              <div>
                <label htmlFor="personne-prenom" className="field-label">
                  Prénom
                </label>
                <input id="personne-prenom" className="field" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Par exemple : Simone" autoFocus />
              </div>
              <div>
                <label htmlFor="personne-role" className="field-label">
                  Qui est-ce pour vous ?
                </label>
                <input id="personne-role" className="field" maxLength={80} value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Par exemple : ma marraine" />
              </div>
              <Button type="submit" loading={saving} disabled={name.trim().length < 2 || relation.trim().length < 2}>
                Ajouter
              </Button>
            </form>
          )}
          {message && (
            <p role="status" className={`mt-3 text-[15px] font-semibold ${message.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {message.text}
            </p>
          )}
        </div>
      )}
    </>
  );
}

/** Ce que Loomina a retenu de votre vie : la frise, les proches, les thèmes. Tiré du contexte du projet. */
export default function LifeStory({
  project,
  onPersonAdded,
  onUnauthorized,
}: {
  project: ProjectOverview;
  onPersonAdded: (family: Family, openQuestions: string[]) => void;
  onUnauthorized: () => void;
}) {

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="card p-6 md:p-8" aria-labelledby="frise">
        <h2 id="frise" className="t-heading">
          Votre frise de vie
        </h2>
        <p className="t-body mt-1">Les repères que Loomina a retenus. Une date fausse ? Corrigez-la au prochain appel.</p>
        {project.timeline.length ? (
          <ol className="relative mt-6 space-y-5 border-l-2 border-[var(--line)] pl-6">
            {project.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span aria-hidden="true" className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[var(--amber)]" />
                <b className="block text-[15px] font-extrabold text-[var(--amber-ink)]">{t.year ?? "Date à préciser"}</b>
                <span className="text-[17px] leading-snug">{t.event}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="t-small mt-6">Pas encore de dates : elles viendront au fil des appels.</p>
        )}
      </section>

      <div className="flex flex-col gap-4">
        <section className="card p-6 md:p-8" aria-labelledby="proches">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 id="proches" className="t-heading min-w-0 flex-1 basis-0">
              Les personnes de votre histoire
            </h2>
            <AddPerson onAdded={onPersonAdded} onUnauthorized={onUnauthorized} />
          </div>
          {project.family.length ? (
            <ul className="mt-5 space-y-3">
              {project.family.map((f) => (
                <li key={f.name} className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[16px] font-extrabold text-[var(--amber-deep)]">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <b className="block text-[16px] leading-tight">{f.name}</b>
                    <span className="text-[14px] text-[var(--ink-3)]">
                      {f.relation}
                      {f.deceased ? " · disparu(e)" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="t-small mt-4">Elles apparaîtront quand vous les évoquerez. Vous pouvez aussi en ajouter une avec le +.</p>
          )}
        </section>

        {project.themes.length > 0 && (
          <section className="card p-6 md:p-8" aria-labelledby="themes-abordes">
            <h2 id="themes-abordes" className="t-heading">
              Déjà racontés
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.themes.map((t) => (
                <li key={t} className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[14px] font-semibold">
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
