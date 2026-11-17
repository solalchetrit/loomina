"use client";

/**
 * La carte de Loomina : un seul schéma, tout le projet sur un écran.
 * Colonnes par domaine, cases reliées de haut en bas, zoom et déplacement,
 * filtres par colonne, légende, mini-carte, et une vue Liste.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MapGroup, MapNode, MapRoot } from "@/lib/admin/map";
import AIcon from "./icons";

// ---- Mesures de la carte (en pixels, avant zoom) ----
const NW = 176; // largeur d'une case
const NH = 46; // hauteur d'une case
const CG = 24; // entre deux sous-colonnes
const RH = 66; // d'une rangée à la suivante
const PAD = 16; // marge intérieure d'une colonne
const HEAD = 40; // hauteur de l'en-tête de colonne
const HEAD_GAP = 26;
const GG = 28; // entre deux colonnes
const TOP = 200; // place réservée aux cases du haut
const RW = 220; // largeur d'une case du haut
const EDGE = 24; // marge autour de la carte

interface Placed {
  node: MapNode;
  group: string;
  x: number;
  y: number;
  col: number;
  row: number;
}

interface GroupBox {
  group: MapGroup;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  width: number;
  height: number;
  boxes: GroupBox[];
  placed: Map<string, Placed>;
  roots: Array<{ root: MapRoot; x: number; y: number }>;
}

function layout(groups: MapGroup[], roots: MapRoot[]): Layout {
  const placed = new Map<string, Placed>();
  const boxes: GroupBox[] = [];
  let x = EDGE;
  let maxH = 0;

  for (const group of groups) {
    const taken: Array<Set<number>> = [];
    const local = new Map<string, { col: number; row: number }>();
    let lastMain: string | null = null;

    for (const node of group.nodes) {
      const col = node.col ?? 0;
      const from = node.from === undefined ? (col === 0 ? lastMain : lastMain) : node.from;
      const parents = (Array.isArray(from) ? from : from ? [from] : []).map((id) => local.get(id)).filter(Boolean) as Array<{ col: number; row: number }>;
      // Sous le parent s'il est dans la même sous-colonne, à sa hauteur sinon.
      let row = parents.length ? Math.max(...parents.map((p) => (p.col === col ? p.row + 1 : p.row))) : 0;
      if (col === 0 && node.from === undefined && lastMain) row = Math.max(row, local.get(lastMain)!.row + 1 + (node.gap ?? 0));
      taken[col] ??= new Set();
      while (taken[col].has(row)) row++;
      taken[col].add(row);
      local.set(node.id, { col, row });
      if (col === 0) lastMain = node.id;
    }

    const cols = Math.max(1, taken.length);
    const rows = Math.max(...[...local.values()].map((p) => p.row)) + 1;
    const w = PAD * 2 + cols * NW + (cols - 1) * CG;
    const h = HEAD + HEAD_GAP + rows * RH - (RH - NH) + PAD;
    boxes.push({ group, x, y: TOP, w, h });
    for (const node of group.nodes) {
      const p = local.get(node.id)!;
      placed.set(node.id, { node, group: group.key, col: p.col, row: p.row, x: x + PAD + p.col * (NW + CG), y: TOP + HEAD + HEAD_GAP + p.row * RH });
    }
    x += w + GG;
    maxH = Math.max(maxH, h);
  }

  const rootsPlaced = roots.map((root) => {
    const over = boxes.filter((b) => root.over.includes(b.group.key));
    const left = Math.min(...over.map((b) => b.x));
    const right = Math.max(...over.map((b) => b.x + b.w));
    return { root, x: (left + right) / 2 - RW / 2, y: root.row === 0 ? 24 : 104 };
  });

  return { width: x - GG + EDGE, height: TOP + maxH + EDGE, boxes, placed, roots: rootsPlaced };
}

/** Trait d'une case à la suivante : droit si elles sont alignées, courbe sinon. */
function link(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): string {
  const ax = a.x + a.w / 2;
  const bx = b.x + b.w / 2;
  if (b.y >= a.y + a.h) {
    const y1 = a.y + a.h;
    const y2 = b.y;
    if (Math.abs(ax - bx) < 1) return `M${ax} ${y1} V${y2}`;
    const m = (y1 + y2) / 2;
    return `M${ax} ${y1} C${ax} ${m} ${bx} ${m} ${bx} ${y2}`;
  }
  // Même hauteur (ou plus haut) : d'un côté à l'autre.
  const right = b.x > a.x;
  const x1 = right ? a.x + a.w : a.x;
  const x2 = right ? b.x : b.x + b.w;
  const y1 = a.y + a.h / 2;
  const y2 = b.y + b.h / 2;
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
}

const STATUS = {
  todo: { label: "À faire", dot: "#d4513b" },
  partial: { label: "À surveiller", dot: "#ee9b2d" },
} as const;

type Filter = "all" | "todo" | string;

export default function MapTree({ groups, roots, links }: { groups: MapGroup[]; roots: MapRoot[]; links: Array<{ from: string; to: string; label: string }> }) {
  const L = useMemo(() => layout(groups, roots), [groups, roots]);
  const frame = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ z: 0.4, x: 0, y: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [mode, setMode] = useState<"schema" | "liste">("schema");
  const [selected, setSelected] = useState<string | null>(null);
  const [legend, setLegend] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  // Les mouvements demandés (boutons, filtres, flèches) glissent en douceur ; le doigt et la molette suivent sans délai.
  const [anim, setAnim] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const smooth = useCallback(() => {
    setAnim(true);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setAnim(false), 300);
  }, []);
  const pop = useRef<HTMLElement>(null);
  const [popH, setPopH] = useState(0);

  const all = useMemo(() => groups.flatMap((g) => g.nodes), [groups]);
  const counts = useMemo(() => ({ total: all.length, todo: all.filter((n) => n.status === "todo").length, partial: all.filter((n) => n.status === "partial").length }), [all]);

  /** Cadre la vue sur une zone de la carte. */
  const fit = useCallback(
    (box?: { x: number; y: number; w: number; h: number }, maxZoom = 1) => {
      const el = frame.current;
      if (!el) return;
      const b = box ?? { x: 0, y: 0, w: L.width, h: L.height };
      const z = Math.min(maxZoom, (el.clientWidth - 32) / b.w, (el.clientHeight - 32) / b.h);
      smooth();
      setView({ z, x: (el.clientWidth - b.w * z) / 2 - b.x * z, y: Math.max(16, (el.clientHeight - b.h * z) / 2) - b.y * z });
    },
    [L, smooth]
  );

  /** Toute la carte, cadrée sur la largeur (on fait défiler vers le bas). */
  const fitWidth = useCallback(() => {
    const el = frame.current;
    if (!el) return;
    const z = Math.min(1, (el.clientWidth - 24) / L.width);
    smooth();
    setView({ z, x: (el.clientWidth - L.width * z) / 2, y: 12 });
  }, [L, smooth]);

  useEffect(() => {
    if (mode !== "schema") return;
    const g = L.boxes.find((b) => b.group.key === filter);
    if (g) fit({ x: g.x - 24, y: g.y - 24, w: g.w + 48, h: g.h + 48 }, 1.1);
    else fitWidth();
  }, [filter, mode, fit, fitWidth, L]);

  const zoom = (factor: number) => {
    const el = frame.current;
    if (!el) return;
    smooth();
    setView((v) => {
      const z = Math.max(0.2, Math.min(1.6, v.z * factor));
      const cx = el.clientWidth / 2;
      const cy = el.clientHeight / 2;
      return { z, x: cx - ((cx - v.x) / v.z) * z, y: cy - ((cy - v.y) / v.z) * z };
    });
  };

  // La taille du cadre, pour la mini-carte.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  // Zoom autour du pointeur : Ctrl ou ⌘ + molette, ou pincement sur le pavé tactile.
  // Le pas suit la force du geste (un pincement donne de petits pas, une molette de plus grands),
  // au lieu d'un pas fixe qui faisait sauter le zoom.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const zoomAt = (factor: number, clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      const cx = clientX - r.left;
      const cy = clientY - r.top;
      setAnim(false);
      setView((v) => {
        const z = Math.max(0.2, Math.min(1.6, v.z * factor));
        return { z, x: cx - ((cx - v.x) / v.z) * z, y: cy - ((cy - v.y) / v.z) * z };
      });
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-Math.max(-80, Math.min(80, dy)) * 0.006), e.clientX, e.clientY);
    };
    // Safari envoie le pincement comme un « geste » : sans ça, c'est toute la page qui zoome.
    type Gesture = Event & { scale: number; clientX: number; clientY: number };
    let last = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      last = 1;
    };
    const onGestureChange = (e: Event) => {
      const g = e as Gesture;
      e.preventDefault();
      zoomAt(g.scale / last, g.clientX, g.clientY);
      last = g.scale;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGestureStart);
    el.addEventListener("gesturechange", onGestureChange);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("gesturestart", onGestureStart);
      el.removeEventListener("gesturechange", onGestureChange);
    };
  }, [mode]);

  // ---- Flèches du clavier : passer d'une case à sa voisine ----
  const dimmedNow = useCallback((p: Placed) => (filter === "todo" ? !p.node.status : filter !== "all" && p.group !== filter), [filter]);

  /** Les cases qu'on peut atteindre (celles que le filtre n'estompe pas), avec leur rectangle. */
  const reachable = useCallback(() => {
    const out: Array<{ id: string; x: number; y: number; w: number; h: number }> = [];
    for (const p of L.placed.values()) if (!dimmedNow(p)) out.push({ id: p.node.id, x: p.x, y: p.y, w: NW, h: NH });
    for (const r of L.roots) out.push({ id: r.root.id, x: r.x, y: r.y, w: RW, h: NH });
    return out;
  }, [L, dimmedNow]);

  const neighbour = useCallback(
    (id: string, dir: string) => {
      const all = reachable();
      const ok = (i: string) => all.find((o) => o.id === i) ?? null;
      const c = ok(id);
      if (!c) return null;
      const rt = L.roots.find((r) => r.root.id === id);
      const pl = L.placed.get(id);
      if (rt && dir === "ArrowDown") {
        // D'un point de départ : son point de départ du dessous, sinon la première case de sa première colonne.
        const kid = L.roots.find((r) => r.root.from === id);
        if (kid && ok(kid.root.id)) return ok(kid.root.id);
        for (const k of rt.root.over) {
          const first = groups.find((g) => g.key === k)?.nodes.find((n) => ok(n.id));
          if (first) return ok(first.id);
        }
      }
      if (rt && dir === "ArrowUp" && rt.root.from) return ok(rt.root.from);
      if (rt && (dir === "ArrowLeft" || dir === "ArrowRight")) {
        const s = dir === "ArrowRight" ? 1 : -1;
        const r = L.roots.filter((o) => o.root.row === rt.root.row && (o.x - rt.x) * s > 1).sort((a, b) => (a.x - b.x) * s)[0];
        if (r) return ok(r.root.id);
      }
      if (pl && dir === "ArrowUp" && !all.some((o) => { const q = L.placed.get(o.id); return q && q.group === pl.group && q.y < pl.y; })) {
        // En haut d'une colonne : on remonte au point de départ qui la coiffe.
        const r = L.roots.filter((o) => o.root.over.includes(pl.group)).sort((a, b) => b.root.row - a.root.row)[0];
        if (r) return ok(r.root.id);
      }
      // Sinon : la case la plus proche dans la direction, en préférant celles qui sont bien alignées.
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      let best: (typeof all)[number] | null = null;
      let bs = Infinity;
      for (const o of all) {
        if (o.id === id) continue;
        const dx = o.x + o.w / 2 - cx;
        const dy = o.y + o.h / 2 - cy;
        let main: number;
        let side: number;
        if (dir === "ArrowDown") { if (dy <= 1) continue; main = dy; side = Math.abs(dx); }
        else if (dir === "ArrowUp") { if (dy >= -1) continue; main = -dy; side = Math.abs(dx); }
        else if (dir === "ArrowRight") { if (dx <= 1) continue; main = dx; side = Math.abs(dy); }
        else { if (dx >= -1) continue; main = -dx; side = Math.abs(dy); }
        const s = main + side * 3;
        if (s < bs) { bs = s; best = o; }
      }
      return best;
    },
    [L, groups, reachable]
  );

  /** Ramène la case à l'écran (le détail s'ouvre à côté), et zoome si la carte est trop petite pour lire. */
  const reveal = useCallback(
    (id: string) => {
      const el = frame.current;
      const o = reachable().find((i) => i.id === id);
      if (!el || !o) return;
      const fw = el.clientWidth;
      const fh = el.clientHeight;
      const right = fw - 16;
      const bottom = fh - 70;
      smooth();
      setView((v) => {
        const z = v.z < 0.55 ? 0.8 : v.z;
        const sx = o.x * z + v.x;
        const sy = o.y * z + v.y;
        if (z === v.z && sx >= 16 && sx + o.w * z <= right && sy >= 16 && sy + o.h * z <= bottom) return v;
        return { z, x: (16 + right) / 2 - (o.x + o.w / 2) * z, y: (16 + bottom) / 2 - (o.y + o.h / 2) * z };
      });
    },
    [reachable, smooth]
  );

  const go = useCallback(
    (id: string | null) => {
      setSelected(id);
      if (id) reveal(id);
    },
    [reveal]
  );

  useEffect(() => {
    if (mode !== "schema") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return setSelected(null);
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const fr = frame.current?.getBoundingClientRect();
      if (fr && (fr.top < 0 || fr.bottom > window.innerHeight)) frame.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const next = selected ? neighbour(selected, e.key) : reachable().find((o) => o.id === roots[0]?.id);
      if (next) go(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, selected, neighbour, reachable, roots, go]);

  // La hauteur du détail, pour qu'il ne dépasse pas du cadre.
  useLayoutEffect(() => {
    const h = pop.current?.offsetHeight ?? 0;
    if (h !== popH) setPopH(h);
    // Taille du cadre, au cas où l'observateur ne l'a pas encore donnée.
    const el = frame.current;
    if (el && (el.clientWidth !== size.w || el.clientHeight !== size.h)) setSize({ w: el.clientWidth, h: el.clientHeight });
  }, [selected, popH, size.w, size.h]);

  const sel = selected ? L.placed.get(selected) : null;
  const selRoot = selected ? L.roots.find((r) => r.root.id === selected) : null;
  const linked = new Set<string>();
  if (selected) {
    linked.add(selected);
    for (const p of L.placed.values()) {
      const f = p.node.from;
      const parents = Array.isArray(f) ? f : f ? [f] : [];
      if (p.node.id === selected) parents.forEach((id) => linked.add(id));
      if (parents.includes(selected)) linked.add(p.node.id);
    }
    links.forEach((l) => {
      if (l.from === selected) linked.add(l.to);
      if (l.to === selected) linked.add(l.from);
    });
  }

  const dimmed = (p: Placed) => (filter === "todo" ? !p.node.status : filter !== "all" && p.group !== filter);

  // ---- Traits ----
  const edges: Array<{ d: string; key: string; hot: boolean; faint: boolean }> = [];
  for (const box of L.boxes) {
    if (box.group.flat) continue;
    let lastMain: string | null = null;
    for (const node of box.group.nodes) {
      const p = L.placed.get(node.id)!;
      const from = node.from === undefined ? lastMain : node.from;
      const parents = Array.isArray(from) ? from : from ? [from] : [];
      if (!parents.length && p.col === 0 && p.row === 0) {
        edges.push({ key: `h-${node.id}`, d: `M${p.x + NW / 2} ${box.y + HEAD} V${p.y}`, hot: false, faint: dimmed(p) });
      }
      for (const id of parents) {
        const a = L.placed.get(id);
        if (!a) continue;
        edges.push({ key: `${id}-${node.id}`, d: link({ x: a.x, y: a.y, w: NW, h: NH }, { x: p.x, y: p.y, w: NW, h: NH }), hot: selected === id || selected === node.id, faint: dimmed(p) });
      }
      if ((node.col ?? 0) === 0) lastMain = node.id;
    }
  }
  const rootEdges: string[] = [];
  for (const r of L.roots) {
    if (r.root.from) {
      const a = L.roots.find((o) => o.root.id === r.root.from)!;
      rootEdges.push(link({ x: a.x, y: a.y, w: RW, h: NH }, { x: r.x, y: r.y, w: RW, h: NH }));
    }
    if (r.root.row === 1) {
      for (const b of L.boxes.filter((bx) => r.root.over.includes(bx.group.key))) {
        rootEdges.push(link({ x: r.x, y: r.y, w: RW, h: NH }, { x: b.x + PAD, y: b.y, w: NW, h: HEAD }));
      }
    }
  }
  const cross = links
    .map((l) => {
      const a = L.placed.get(l.from);
      const b = L.placed.get(l.to);
      if (!a || !b) return null;
      const right = b.x > a.x;
      const x1 = right ? a.x + NW : a.x;
      const x2 = right ? b.x : b.x + NW;
      const y1 = a.y + NH / 2;
      const y2 = b.y + NH / 2;
      const m = Math.max(60, Math.abs(x2 - x1) / 2);
      return { key: `${l.from}>${l.to}`, d: `M${x1} ${y1} C${x1 + (right ? m : -m)} ${y1} ${x2 - (right ? m : -m)} ${y2} ${x2} ${y2}`, hot: selected === l.from || selected === l.to };
    })
    .filter(Boolean) as Array<{ key: string; d: string; hot: boolean }>;

  const chip = (key: Filter, label: React.ReactNode, extra = "") => (
    <button
      key={key}
      type="button"
      onClick={() => {
        setFilter(key);
        setSelected(null);
      }}
      aria-pressed={filter === key}
      className={`press whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-bold ${filter === key ? "bg-[var(--ink)] text-white" : `bg-white text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--rule-strong)] ${extra}`}`}
    >
      {label}
    </button>
  );

  const nodeClass = (n: MapNode) => {
    if (n.status === "todo") return "border-dashed border-[#d4513b] bg-[#fff6f4] text-[var(--ink)]";
    if (n.kind === "end") return "border-transparent bg-[var(--success-soft)] text-[var(--success)]";
    if (n.kind === "q") return "border-[var(--rule-strong)] bg-white text-[var(--ink)]";
    return "border-[var(--line)] bg-white text-[var(--ink)]";
  };

  const detail = sel ?? null;

  // Le détail s'ouvre à côté de la case : à droite, ou à gauche s'il n'y a pas la place.
  // Sur un écran étroit, il se pose en bas du cadre.
  const target = sel ? { x: sel.x, y: sel.y, w: NW } : selRoot ? { x: selRoot.x, y: selRoot.y, w: RW } : null;
  let popStyle: React.CSSProperties = {};
  if (target && size.w) {
    const pw = Math.min(340, size.w - 24);
    if (size.w < 640) popStyle = { left: 12, right: 12, bottom: 12, maxHeight: "55%" };
    else {
      const sx = target.x * view.z + view.x;
      const sy = target.y * view.z + view.y;
      const sw = target.w * view.z;
      let left = sx + sw + 14;
      if (left + pw > size.w - 12) left = sx - 14 - pw;
      left = Math.max(12, Math.min(size.w - 12 - pw, left));
      const top = Math.max(12, Math.min(size.h - 12 - popH, sy - 10));
      popStyle = { left, top, width: pw, maxHeight: size.h - 24, transition: anim ? "left .28s cubic-bezier(.2,.7,.2,1), top .28s cubic-bezier(.2,.7,.2,1)" : "none" };
    }
  }
  const detailGroup = detail ? groups.find((g) => g.key === detail.group) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {chip("all", "Tout voir")}
          {groups.map((g) => chip(g.key, g.label))}
          {chip(
            "todo",
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#d4513b]" aria-hidden /> Ce qui manque ({counts.todo + counts.partial})
            </span>
          )}
        </div>
        <div className="inline-flex rounded-full bg-[var(--surface-2)] p-1">
          {(["schema", "liste"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-full px-4 py-1.5 text-[15px] font-bold ${mode === m ? "bg-white text-[var(--ink)] shadow-[var(--shadow-bar)]" : "text-[var(--ink-3)]"}`}>
              {m === "schema" ? "Schéma" : "Liste"}
            </button>
          ))}
        </div>
      </div>

      {mode === "schema" ? (
        <div
          ref={frame}
          className="relative left-1/2 mt-5 h-[78vh] min-h-[480px] w-[calc(100vw-24px)] max-w-[2200px] -translate-x-1/2 touch-none select-none overflow-hidden rounded-[24px] border border-[var(--line)] bg-white"
          style={{ backgroundImage: "radial-gradient(var(--rule-strong) 1px, transparent 1px)", backgroundSize: `${22 * view.z}px ${22 * view.z}px`, backgroundPosition: `${view.x}px ${view.y}px`, cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-ui]")) return;
            setAnim(false);
            drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y, moved: false };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.px;
            const dy = e.clientY - d.py;
            if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) {
              d.moved = true;
              setDragging(true);
            }
            if (d.moved) setView((v) => ({ ...v, x: d.x + dx, y: d.y + dy }));
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            drag.current = null;
            setDragging(false);
            if (d && !d.moved) {
              // Un clic sans déplacement : la case sous le pointeur, s'il y en a une.
              const id = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-node]")?.dataset.node;
              setSelected(id ?? null);
            }
          }}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: L.width, height: L.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, transition: anim ? "transform .28s cubic-bezier(.2,.7,.2,1)" : "none" }}>
            {L.boxes.map((b) => (
              <div key={b.group.key} className="absolute rounded-[22px] border border-[var(--line)] bg-white/70 transition-opacity" style={{ left: b.x, top: b.y - 10, width: b.w, height: b.h + 10, opacity: filter !== "all" && filter !== "todo" && filter !== b.group.key ? 0.3 : 1 }} />
            ))}

            <svg width={L.width} height={L.height} className="pointer-events-none absolute left-0 top-0" fill="none">
              {rootEdges.map((d, i) => (
                <path key={i} d={d} stroke="#c9c7bf" strokeWidth={1.5} />
              ))}
              {cross.map((e) => (
                <path key={e.key} d={e.d} stroke={e.hot ? "#ee9b2d" : "#e2c9a0"} strokeWidth={e.hot ? 2.5 : 1.5} strokeDasharray="5 5" opacity={selected && !e.hot ? 0.35 : 0.9} />
              ))}
              {edges.map((e) => (
                <path key={e.key} d={e.d} stroke={e.hot ? "#161616" : "#bdbbb2"} strokeWidth={e.hot ? 2.5 : 1.5} opacity={e.faint ? 0.25 : 1} />
              ))}
            </svg>

            {L.roots.map((r) => (
              <div
                key={r.root.id}
                data-node={r.root.id}
                className={`absolute flex items-center justify-center rounded-[14px] border px-3 text-center text-[13.5px] font-bold leading-tight ${r.root.row === 0 ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--rule-strong)] bg-white"} ${selected === r.root.id ? "ring-4 ring-[var(--amber-soft)]" : ""}`}
                style={{ left: r.x, top: r.y, width: RW, height: NH }}
              >
                {r.root.kind === "q" ? "◦ " : ""}
                {r.root.label}
              </div>
            ))}

            {L.boxes.map((b) => (
              <div
                key={`h-${b.group.key}`}
                className="absolute flex items-center justify-center rounded-[12px] bg-[var(--amber)] px-3 text-center text-[14px] font-extrabold leading-tight text-[var(--ink)] transition-opacity"
                style={{ left: b.x + PAD, top: b.y, width: b.w - PAD * 2, height: HEAD, opacity: filter !== "all" && filter !== "todo" && filter !== b.group.key ? 0.3 : 1 }}
              >
                {b.group.label}
              </div>
            ))}

            {[...L.placed.values()].map((p) => {
              const st = p.node.status ? STATUS[p.node.status] : null;
              const off = dimmed(p);
              return (
                <div
                  key={p.node.id}
                  data-node={p.node.id}
                  className={`absolute flex items-center justify-center rounded-[12px] border px-2.5 text-center text-[12.5px] font-semibold leading-[1.25] transition-[opacity,box-shadow] ${nodeClass(p.node)} ${selected === p.node.id ? "shadow-[0_0_0_4px_var(--amber-soft)] !border-[var(--ink)]" : linked.has(p.node.id) ? "!border-[var(--ink)]" : ""}`}
                  style={{ left: p.x, top: p.y, width: NW, height: NH, opacity: off ? 0.25 : 1 }}
                >
                  {st && <span className="absolute -left-1 -top-1 h-3 w-3 rounded-[4px] border-2 border-white" style={{ background: st.dot }} aria-label={st.label} />}
                  <span>
                    {p.node.kind === "q" ? "◦ " : ""}
                    {p.node.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Détail de la case choisie */}
          {(detail || selRoot) && (
            <aside ref={pop} data-ui className="card absolute z-10 cursor-auto select-text overflow-auto p-5 shadow-[var(--shadow-float)]" style={popStyle} aria-live="polite">
              <div className="flex items-start justify-between gap-3">
                <span className="pill pill-amber">{detailGroup?.label ?? "Point de départ"}</span>
                <button type="button" onClick={() => setSelected(null)} aria-label="Fermer" className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-[20px] leading-none text-[var(--ink-3)] hover:bg-[var(--surface-2)]">×</button>
              </div>
              <p className="mt-3 text-[19px] font-extrabold leading-tight tracking-[-0.02em]">{detail?.node.label ?? selRoot?.root.label}</p>
              {detail?.node.status && (
                <p className="mt-2 inline-flex items-center gap-2 text-[14px] font-bold" style={{ color: STATUS[detail.node.status].dot }}>
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: STATUS[detail.node.status].dot }} /> {STATUS[detail.node.status].label}
                </p>
              )}
              {(detail?.node.d ?? selRoot?.root.d) && <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{detail?.node.d ?? selRoot?.root.d}</p>}
              {detail?.node.code && <p className="mt-3 font-mono text-[12px] text-[var(--ink-3)] [overflow-wrap:anywhere]">{detail.node.code}</p>}
              {detail &&
                links
                  .filter((l) => l.from === detail.node.id || l.to === detail.node.id)
                  .map((l) => {
                    const other = L.placed.get(l.from === detail.node.id ? l.to : l.from);
                    const og = groups.find((g) => g.key === other?.group);
                    return (
                      <button key={l.from + l.to} type="button" onClick={() => go(other?.node.id ?? null)} className="mt-3 block w-full rounded-[12px] bg-[var(--amber-soft)] px-3 py-2 text-left text-[14px] font-semibold text-[var(--amber-deep)]">
                        {l.from === detail.node.id ? "→" : "←"} {og?.label} · {other?.node.label} <span className="font-normal">({l.label})</span>
                      </button>
                    );
                  })}
            </aside>
          )}

          {/* Mini-carte */}
          <div data-ui className="absolute bottom-3 left-3 hidden rounded-[14px] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-bar)] sm:block">
            <div className="relative" style={{ width: 150, height: L.height * (150 / L.width) }}>
              {L.boxes.map((b) => (
                <span key={b.group.key} className="absolute rounded-[3px] bg-[var(--amber-soft)]" style={{ left: b.x * (150 / L.width), top: b.y * (150 / L.width), width: b.w * (150 / L.width), height: b.h * (150 / L.width) }} />
              ))}
              {size.w > 0 && (
                <span className="absolute rounded-[3px] border-2 border-[var(--ink)]" style={{ left: (-view.x / view.z) * (150 / L.width), top: (-view.y / view.z) * (150 / L.width), width: (size.w / view.z) * (150 / L.width), height: (size.h / view.z) * (150 / L.width) }} />
              )}
            </div>
          </div>

          {/* Légende et zoom */}
          <div data-ui className="absolute bottom-3 right-3 flex cursor-auto items-end gap-2">
            {legend && (
              <div className="card mb-12 w-[250px] p-4 text-[13.5px] shadow-[var(--shadow-float)] sm:mb-0">
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2"><span className="h-5 w-8 rounded-[6px] bg-[var(--amber)]" /> Un domaine</li>
                  <li className="flex items-center gap-2"><span className="h-5 w-8 rounded-[6px] border border-[var(--line)] bg-white" /> Une étape</li>
                  <li className="flex items-center gap-2"><span className="flex h-5 w-8 items-center justify-center rounded-[6px] border border-[var(--rule-strong)] bg-white text-[11px]">◦</span> Une question, un aiguillage</li>
                  <li className="flex items-center gap-2"><span className="h-5 w-8 rounded-[6px] bg-[var(--success-soft)]" /> Un résultat enregistré ou envoyé</li>
                  <li className="flex items-center gap-2"><span className="h-5 w-8 rounded-[6px] border border-dashed border-[#d4513b] bg-[#fff6f4]" /> À faire : pas dans le code</li>
                  <li className="flex items-center gap-2"><span className="ml-2.5 mr-2.5 h-3 w-3 rounded-[4px] bg-[#ee9b2d]" /> À surveiller : incomplet</li>
                  <li className="flex items-center gap-2"><svg width="32" height="8"><path d="M0 4 H32" stroke="#e2c9a0" strokeWidth="2" strokeDasharray="5 5" /></svg> Lien d’un domaine à l’autre</li>
                </ul>
              </div>
            )}
            <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-bar)]">
              <button type="button" onClick={() => setLegend((v) => !v)} aria-pressed={legend} className="rounded-full px-3 py-1.5 text-[14px] font-bold hover:bg-[var(--surface-2)]">Légende</button>
              <button type="button" onClick={() => zoom(0.85)} aria-label="Dézoomer" className="h-9 w-9 rounded-full text-[18px] font-bold hover:bg-[var(--surface-2)]">−</button>
              <span className="w-12 text-center text-[14px] font-bold tabular-nums">{Math.round(view.z * 100)} %</span>
              <button type="button" onClick={() => zoom(1.18)} aria-label="Zoomer" className="h-9 w-9 rounded-full text-[18px] font-bold hover:bg-[var(--surface-2)]">+</button>
              <button type="button" onClick={fitWidth} aria-label="Voir toute la carte" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--surface-2)]"><AIcon name="expand" size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {groups
            .filter((g) => filter === "all" || filter === "todo" || filter === g.key)
            .map((g) => {
              const nodes = g.nodes.filter((n) => filter !== "todo" || n.status);
              if (!nodes.length) return null;
              return (
                <section key={g.key} className="rounded-[24px] bg-[var(--canvas)] p-5 sm:p-6">
                  <h3 className="t-heading">{g.label}</h3>
                  <p className="t-small mt-1">{g.about}</p>
                  <ul className="mt-4 grid gap-2">
                    {nodes.map((n) => (
                      <li key={n.id} className={`rounded-[14px] border px-4 py-3 ${n.status === "todo" ? "border-dashed border-[#d4513b] bg-[#fff6f4]" : "border-[var(--line)] bg-white"}`}>
                        <p className="flex flex-wrap items-center gap-2 text-[16px] font-bold">
                          {n.kind === "q" ? "◦ " : ""}
                          {n.label}
                          {n.status && <span className="pill" style={{ background: n.status === "todo" ? "#fbe6e2" : "var(--amber-soft)", color: n.status === "todo" ? "#9a3524" : "var(--amber-deep)" }}>{STATUS[n.status].label}</span>}
                        </p>
                        {n.d && <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-2)]">{n.d}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>
      )}

      <p className="t-small mt-4">
        {counts.total} cases · {counts.todo} à faire · {counts.partial} à surveiller. Faites glisser pour vous déplacer, Ctrl ou ⌘ + molette pour zoomer, cliquez sur une case pour son détail, puis passez à la voisine avec les flèches du clavier.
      </p>
    </div>
  );
}
