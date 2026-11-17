"use client";

import AIcon from "./icons";

/** Déplie ou replie d'un coup toutes les étapes d'un arbre. */
export default function TreeControls({ target }: { target: string }) {
  const setAll = (open: boolean) => {
    document.querySelectorAll<HTMLDetailsElement>(`#${target} details`).forEach((d) => {
      d.open = open;
    });
  };
  const btn = "inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-[14px] font-semibold text-[var(--ink-2)] hover:border-[var(--ink)] hover:text-[var(--ink)]";
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={btn} onClick={() => setAll(true)}><AIcon name="expand" size={15} /> Tout déplier</button>
      <button type="button" className={btn} onClick={() => setAll(false)}><AIcon name="collapse" size={15} /> Tout replier</button>
    </div>
  );
}
