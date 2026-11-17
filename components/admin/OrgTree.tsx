"use client";

/**
 * Arbre de parcours en organigramme, du haut vers le bas, une étape à la fois.
 * Une case = une action ; un clic dessus affiche ce qu'elle produit.
 * `branch` : les suites possibles côte à côte ; sinon, les étapes l'une sous l'autre.
 */

import { useEffect, useRef, useState } from "react";
import AIcon from "./icons";
import { ACTORS, type TreeNode } from "./tree-types";
import s from "./org.module.css";

function Who({ who, onDark = false }: { who: TreeNode["who"]; onDark?: boolean }) {
  const a = ACTORS[who];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[11.5px] font-bold uppercase leading-none tracking-[0.05em]"
      style={onDark ? { background: "rgba(255,255,255,0.12)", color: "#fff" } : { background: a.soft, color: a.text }}
    >
      <AIcon name={a.icon} size={12} />
      {a.label}
    </span>
  );
}

function Node({ n, root, selected, onSelect }: { n: TreeNode; root?: boolean; selected: TreeNode; onSelect: (n: TreeNode) => void }) {
  const info = (n.effects?.length ?? 0) + (n.detail ? 1 : 0);
  return (
    <div className={s.node}>
      <button type="button" className={`${s.box} ${root ? s.root : ""}`} aria-pressed={selected === n} onClick={() => onSelect(n)}>
        <Who who={n.who} onDark={root} />
        <span className={s.label}>{n.label}</span>
        {info > 0 && <span className={s.more}>{n.effects?.length ? `${n.effects.length} effet${n.effects.length > 1 ? "s" : ""} →` : "Voir le détail →"}</span>}
      </button>
      {n.children?.length ? (
        n.branch ? (
          <div className={s.branch}>
            {n.children.map((c, i) => (
              <div key={i} className={s.col}>
                <Node n={c} selected={selected} onSelect={onSelect} />
              </div>
            ))}
          </div>
        ) : (
          n.children.map((c, i) => (
            <div key={i} className={s.node}>
              <span className={s.down} aria-hidden />
              <Node n={c} selected={selected} onSelect={onSelect} />
            </div>
          ))
        )
      ) : null}
    </div>
  );
}

function Detail({ n }: { n: TreeNode }) {
  return (
    <div>
      <Who who={n.who} />
      <p className="mt-3 text-[20px] font-extrabold leading-tight tracking-[-0.02em]">{n.label}</p>
      {n.detail && <p className="t-body mt-2">{n.detail}</p>}
      {n.effects?.length ? (
        <>
          <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Ce que ça produit</p>
          <ul className="mt-2 grid gap-2">
            {n.effects.map((e) => (
              <li key={e} className="flex gap-2.5 text-[16px] leading-relaxed text-[var(--ink-2)]">
                <AIcon name="arrow" size={15} className="mt-[6px] text-[var(--amber)]" />
                <span className="min-w-0">{e}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {n.code && (
        <>
          <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Dans le code</p>
          <p className="mt-1 font-mono text-[13px] text-[var(--ink-2)] [overflow-wrap:anywhere]">{n.code}</p>
        </>
      )}
    </div>
  );
}

export default function OrgTree({ stages }: { stages: TreeNode[] }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<TreeNode>(stages[0]);
  const go = (i: number) => {
    setStep(i);
    setSelected(stages[i]);
  };
  const stage = stages[step];
  const scroller = useRef<HTMLDivElement>(null);
  // Une étape plus large que l'écran s'ouvre centrée sur sa case de départ.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [step]);

  return (
    <div>
      {/* Les étapes, dans l'ordre */}
      <ol className="flex flex-wrap gap-2">
        {stages.map((st, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === step ? "step" : undefined}
              className={`press inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[15px] font-bold ${
                i === step ? "bg-[var(--ink)] text-white" : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${i === step ? "bg-[var(--amber)] text-[var(--ink)]" : "bg-white text-[var(--ink)]"}`}>{i + 1}</span>
              {st.label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-[24px] bg-[var(--canvas)]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <p className="t-eyebrow">Étape {step + 1} sur {stages.length}</p>
            <div className="flex gap-2">
              <button type="button" disabled={step === 0} onClick={() => go(step - 1)} className="press inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-[14px] font-bold disabled:opacity-40">
                <AIcon name="chevron" size={15} className="rotate-180" /> Précédente
              </button>
              <button type="button" disabled={step === stages.length - 1} onClick={() => go(step + 1)} className="press inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 text-[14px] font-bold text-white disabled:opacity-40">
                Suivante <AIcon name="chevron" size={15} />
              </button>
            </div>
          </div>
          <div ref={scroller} className="overflow-x-auto px-2 pb-2 pt-6">
            <div className={s.chart}>
              <Node n={stage} root selected={selected} onSelect={setSelected} />
            </div>
          </div>
        </div>
        <aside className="card self-start p-6 xl:sticky xl:top-28" aria-live="polite">
          <Detail n={selected} />
          <p className="t-small mt-6 border-t border-[var(--line-soft)] pt-4">Cliquez sur une case de l’arbre pour voir son détail.</p>
        </aside>
      </div>
    </div>
  );
}

/** La légende des acteurs. */
export function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(ACTORS) as Array<keyof typeof ACTORS>).map((k) => (
        <Who key={k} who={k} />
      ))}
    </div>
  );
}
