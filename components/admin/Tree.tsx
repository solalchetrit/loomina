/**
 * Un arbre de parcours : chaque nœud est une action (de qui, quoi) et ce
 * qu'elle produit. Les branches se replient.
 */

export type Actor = "client" | "offreur" | "site" | "stripe" | "twilio" | "voix" | "ia" | "base" | "sms" | "loomina";

export interface TreeNode {
  /** Qui agit. */
  who: Actor;
  /** L'action, en une ligne. */
  label: string;
  /** Une précision, facultative. */
  detail?: string;
  /** Ce que l'action produit. */
  effects?: string[];
  /** Où c'est dans le code. */
  code?: string;
  children?: TreeNode[];
  /** Nœud replié au départ. */
  closed?: boolean;
}

export const ACTORS: Record<Actor, { label: string; className: string }> = {
  client: { label: "Client", className: "bg-[#e6eefb] text-[#1f4a8a]" },
  offreur: { label: "Offreur", className: "bg-[#efe6fb] text-[#5a2f8a]" },
  site: { label: "Site", className: "bg-[var(--surface-2)] text-[var(--ink-2)]" },
  stripe: { label: "Stripe", className: "bg-[#ece9fe] text-[#4b3bb8]" },
  twilio: { label: "Twilio", className: "bg-[#fde8ea] text-[#a3263a]" },
  voix: { label: "Serveur vocal", className: "bg-[var(--amber-soft)] text-[var(--amber-deep)]" },
  ia: { label: "IA", className: "bg-[#e3f3f1] text-[#1d5e57]" },
  base: { label: "Base", className: "bg-[var(--success-soft)] text-[var(--success)]" },
  sms: { label: "SMS", className: "bg-[#fde8ea] text-[#a3263a]" },
  loomina: { label: "Équipe Loomina", className: "bg-[var(--ink)] text-white" },
};

function NodeBody({ n }: { n: TreeNode }) {
  const a = ACTORS[n.who];
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] ${a.className}`}>{a.label}</span>
        <span className="text-[16px] font-bold leading-snug">{n.label}</span>
      </div>
      {n.detail && <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-2)]">{n.detail}</p>}
      {n.effects && n.effects.length > 0 && (
        <ul className="mt-1.5 grid gap-1">
          {n.effects.map((e) => (
            <li key={e} className="flex gap-2 text-[15px] leading-relaxed text-[var(--ink-2)]">
              <span aria-hidden className="text-[var(--amber-ink)]">→</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      )}
      {n.code && <p className="mt-1 font-mono text-[12px] text-[var(--ink-3)]">{n.code}</p>}
    </div>
  );
}

function Branch({ n }: { n: TreeNode }) {
  if (!n.children?.length) {
    return (
      <li className="relative pl-4 sm:pl-6 before:absolute before:left-0 before:top-5 before:h-px before:w-3 sm:before:w-4 before:bg-[var(--line)]">
        <div className="rounded-[14px] border border-[var(--line)] bg-white px-4 py-3">
          <NodeBody n={n} />
        </div>
      </li>
    );
  }
  return (
    <li className="relative pl-4 sm:pl-6 before:absolute before:left-0 before:top-5 before:h-px before:w-3 sm:before:w-4 before:bg-[var(--line)]">
      <details open={!n.closed} className="group">
        <summary className="cursor-pointer list-none rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 marker:hidden">
          <div className="flex gap-2">
            <span aria-hidden className="mt-0.5 inline-block text-[18px] leading-none text-[var(--ink-3)] transition-transform group-open:rotate-90">›</span>
            <NodeBody n={n} />
          </div>
        </summary>
        <ul className="ml-2 sm:ml-3 mt-2 grid gap-2 border-l border-[var(--line)] pb-1">
          {n.children.map((c, i) => (
            <Branch key={i} n={c} />
          ))}
        </ul>
      </details>
    </li>
  );
}

export default function Tree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="grid gap-2 border-l border-[var(--line)]">
      {nodes.map((n, i) => (
        <Branch key={i} n={n} />
      ))}
    </ul>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(ACTORS) as Actor[]).map((k) => (
        <span key={k} className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em] ${ACTORS[k].className}`}>{ACTORS[k].label}</span>
      ))}
    </div>
  );
}
