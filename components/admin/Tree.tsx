/**
 * Un arbre de parcours : des grandes étapes numérotées, puis le fil des
 * actions de chaque étape. Chaque action dit qui agit (couleur et icône),
 * ce qu'il fait, et ce que ça produit. Les branches se replient.
 */

import AIcon, { type AdminIconName } from "./icons";
import TreeControls from "./TreeControls";

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

export const ACTORS: Record<Actor, { label: string; color: string; soft: string; text: string; icon: AdminIconName }> = {
  client: { label: "Client", color: "#2f6fd6", soft: "#e8effc", text: "#1f4a8a", icon: "user" },
  offreur: { label: "Offreur", color: "#8a4fd6", soft: "#f1e9fc", text: "#5a2f8a", icon: "gift" },
  site: { label: "Site", color: "#5c5c55", soft: "#efeee9", text: "#3b3b37", icon: "globe" },
  stripe: { label: "Stripe", color: "#635bff", soft: "#ecebff", text: "#3f37c9", icon: "card" },
  twilio: { label: "Twilio", color: "#e0303f", soft: "#fde9eb", text: "#a3263a", icon: "phone" },
  voix: { label: "Serveur vocal", color: "#e08a14", soft: "#fdf0dc", text: "#7a4706", icon: "server" },
  ia: { label: "IA", color: "#14917f", soft: "#e2f4f1", text: "#11594f", icon: "spark" },
  base: { label: "Base", color: "#2f8a4a", soft: "#e5f3e8", text: "#265233", icon: "database" },
  sms: { label: "SMS", color: "#e0303f", soft: "#fde9eb", text: "#a3263a", icon: "message" },
  loomina: { label: "Équipe Loomina", color: "#161616", soft: "#ecebe6", text: "#161616", icon: "star" },
};

function Who({ who }: { who: Actor }) {
  const a = ACTORS[who];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-bold uppercase leading-none tracking-[0.06em]" style={{ background: a.soft, color: a.text }}>
      {a.label}
    </span>
  );
}

function Effects({ effects }: { effects: string[] }) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-1.5 rounded-[12px] bg-[#faf9f6] px-3 py-2.5 sm:px-3.5 sm:py-3">
      {effects.map((e) => (
        <li key={e} className="flex gap-2.5 text-[14.5px] leading-relaxed text-[var(--ink-2)]">
          <AIcon name="arrow" size={14} className="mt-[5px] text-[var(--amber)]" />
          <span className="min-w-0 [overflow-wrap:anywhere]">{e}</span>
        </li>
      ))}
    </ul>
  );
}

function Body({ n }: { n: TreeNode }) {
  return (
    <div className="min-w-0 flex-1">
      <Who who={n.who} />
      <p className="mt-1.5 text-[16px] font-bold leading-snug [overflow-wrap:anywhere] tracking-[-0.01em] text-[var(--ink)]">{n.label}</p>
      {n.detail && <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ink-2)]">{n.detail}</p>}
      {n.effects && n.effects.length > 0 && <Effects effects={n.effects} />}
      {n.code && <p className="mt-2 font-mono text-[11.5px] text-[var(--ink-3)] [overflow-wrap:anywhere]">{n.code}</p>}
    </div>
  );
}

/** Pastille de l'acteur, posée sur le fil. */
function Dot({ who }: { who: Actor }) {
  const a = ACTORS[who];
  return (
    <span className="absolute left-0 top-3 z-[1] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white" style={{ background: a.color, color: "#fff" }}>
      <AIcon name={a.icon} size={15} />
    </span>
  );
}

function Step({ n }: { n: TreeNode }) {
  const card = "rounded-[16px] border border-black/[0.07] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(20,20,10,0.04)]";
  if (!n.children?.length) {
    return (
      <li className="relative min-w-0 pl-10 sm:pl-12">
        <Dot who={n.who} />
        <div className={card}><Body n={n} /></div>
      </li>
    );
  }
  return (
    <li className="relative min-w-0 pl-10 sm:pl-12">
      <Dot who={n.who} />
      <details open={!n.closed} className="group/d">
        <summary className={`${card} flex cursor-pointer list-none gap-3 transition-colors hover:border-black/20 [&::-webkit-details-marker]:hidden`}>
          <Body n={n} />
          <span className="mt-0.5 flex h-7 shrink-0 items-center gap-1 self-start rounded-full bg-[var(--surface-2)] px-2.5 text-[12.5px] font-semibold text-[var(--ink-2)]">
            {n.children.length}
            <AIcon name="chevron" size={14} className="transition-transform group-open/d:rotate-90" />
          </span>
        </summary>
        <Flow nodes={n.children} nested />
      </details>
    </li>
  );
}

function Flow({ nodes, nested = false }: { nodes: TreeNode[]; nested?: boolean }) {
  return (
    <ul className={`relative grid grid-cols-1 gap-3 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-[2px] before:rounded-full before:bg-[#e4e2da] ${nested ? "mt-3 sm:ml-4" : ""}`}>
      {nodes.map((c, i) => (
        <Step key={i} n={c} />
      ))}
    </ul>
  );
}

/** Une grande étape du parcours : numéro, titre, puis le fil de ses actions. */
function Stage({ n, index, anchor }: { n: TreeNode; index: number; anchor: string }) {
  return (
    <section id={anchor} className="scroll-mt-24">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--ink)] text-[17px] font-extrabold text-[var(--amber)] tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <Who who={n.who} />
          <h3 className="mt-1.5 text-[21px] font-extrabold leading-tight tracking-[-0.02em] [text-wrap:balance]">{n.label}</h3>
          {n.detail && <p className="mt-1 max-w-[70ch] text-[15px] leading-relaxed text-[var(--ink-2)]">{n.detail}</p>}
          {n.effects && n.effects.length > 0 && <div className="max-w-[80ch]"><Effects effects={n.effects} /></div>}
        </div>
      </div>
      {n.children?.length ? (
        <div className="mt-5 sm:pl-[60px]">
          <Flow nodes={n.children} />
        </div>
      ) : null}
    </section>
  );
}

export default function Tree({ nodes, id }: { nodes: TreeNode[]; id: string }) {
  return (
    <div id={id}>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {nodes.map((n, i) => (
            <li key={i} className="flex items-center gap-1">
              <a href={`#${id}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white py-1.5 pl-1.5 pr-3.5 text-[14px] font-semibold hover:border-[var(--ink)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ink)] text-[12px] font-extrabold text-[var(--amber)]">{i + 1}</span>
                {n.label}
              </a>
              {i < nodes.length - 1 && <AIcon name="chevron" size={14} className="text-[var(--ink-3)]" />}
            </li>
          ))}
        </ol>
        <TreeControls target={id} />
      </div>
      <div className="grid grid-cols-1 gap-12">
        {nodes.map((n, i) => (
          <Stage key={i} n={n} index={i} anchor={`${id}-${i}`} />
        ))}
      </div>
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(ACTORS) as Actor[]).map((k) => {
        const a = ACTORS[k];
        return (
          <span key={k} className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[13px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: a.color }}><AIcon name={a.icon} size={12} /></span>
            {a.label}
          </span>
        );
      })}
    </div>
  );
}
