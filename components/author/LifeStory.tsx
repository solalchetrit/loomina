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
        className="press inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3.5 text-[14px] font-bold text-[var(--ink-2)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
      >
        {open ? (
          "Annuler"
        ) : (
          <>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter
          </>
        )}
      </button>
      {(open || message) && (
        <div className="basis-full">
          {open && (
            <form onSubmit={submit} className="mt-3 space-y-2.5 rounded-[16px] bg-[var(--canvas)] p-3.5">
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
            <p role="status" className={`mt-2 text-[14px] font-semibold ${message.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
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

  const head = "text-[18px] font-extrabold leading-tight tracking-[-0.02em]";
  return (
    <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <section className="card px-5 py-4 md:px-6 md:py-5" aria-labelledby="frise">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 id="frise" className={head}>
            Votre frise de vie
          </h2>
          <p className="text-[14px] text-[var(--ink-3)]">Une date fausse ? Corrigez-la au prochain appel.</p>
        </div>
        {project.timeline.length ? (
          <ol className="mt-3 gap-x-8 sm:columns-2">
            {project.timeline.map((t, i) => (
              <li key={i} className="grid break-inside-avoid grid-cols-[3.1rem_minmax(0,1fr)] items-baseline gap-x-2 border-t border-[var(--line-soft)] py-2">
                <b className="text-[14px] font-extrabold tabular-nums text-[var(--amber-ink)]">{t.year ?? "?"}</b>
                <span className="text-[15px] leading-snug">{t.event}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-[14px] text-[var(--ink-3)]">Pas encore de dates : elles viendront au fil des appels.</p>
        )}
      </section>

      <div className="flex flex-col gap-3">
        <section className="card px-5 py-4 md:px-6 md:py-5" aria-labelledby="proches">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="proches" className={`${head} min-w-0 flex-1 basis-0`}>
              Les personnes de votre histoire
            </h2>
            <AddPerson onAdded={onPersonAdded} onUnauthorized={onUnauthorized} />
          </div>
          {project.family.length ? (
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {project.family.map((f) => (
                <li key={f.name} className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[14px] font-extrabold text-[var(--amber-deep)]">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[15px] leading-tight">{f.name}</b>
                    <span className="block truncate text-[13px] leading-tight text-[var(--ink-3)]">
                      {f.relation}
                      {f.deceased ? " · disparu(e)" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] leading-snug text-[var(--ink-3)]">Elles apparaîtront quand vous les évoquerez. Vous pouvez aussi en ajouter une vous-même.</p>
          )}
        </section>

        {project.themes.length > 0 && (
          <section className="card px-5 py-4 md:px-6 md:py-5" aria-labelledby="themes-abordes">
            <h2 id="themes-abordes" className={head}>
              Déjà racontés
            </h2>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {project.themes.map((t) => (
                <li key={t} className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[13.5px] font-semibold">
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
