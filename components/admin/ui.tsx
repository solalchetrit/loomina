/**
 * Briques de l'admin (habillage du 24/11/2026) : panneaux plats à bord d'un
 * pixel, pastilles à point, chiffres en texte, courbes et barres. Les
 * couleurs viennent des jetons de app/admin/admin.css.
 */

import type { Tone } from "@/lib/admin/format";
import AIcon, { type AdminIconName } from "./icons";

const TONES: Record<Tone, string> = {
  ok: "pill pill-green",
  wait: "pill pill-amber",
  bad: "pill bg-[var(--danger-soft)] text-[var(--danger)]",
  muted: "pill pill-neutral",
};

/** Pastille d'état : un point de couleur et un mot. */
export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={TONES[tone]}>
      {tone !== "muted" && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** En-tête d'une page : un titre net, une ligne de contexte, l'action principale à droite. */
export function PageHeader({ title, children, action }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="mb-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 max-w-3xl">
        <h1 className="text-balance text-[26px] font-semibold leading-[1.15] tracking-[-0.025em]">{title}</h1>
        {children && <div className="mt-1.5 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">{children}</div>}
      </div>
      {action}
    </header>
  );
}

/** Un panneau : un titre sur une ligne réglée, puis le contenu. `flush` colle le contenu aux bords (tableaux, listes). */
export function Panel({ title, action, children, className = "", id, flush = false }: { title?: React.ReactNode; icon?: AdminIconName; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string; flush?: boolean }) {
  return (
    <section id={id} className={`card min-w-0 scroll-mt-20 ${className}`}>
      {(title || action) && (
        <div className="flex min-h-[46px] flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-[var(--line)] px-4 py-2">
          {title && <h2 className="t-heading min-w-0">{title}</h2>}
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

/** Variation par rapport à la période d'avant : flèche verte ou rouge, en %. */
export function Delta({ now, before, invert = false }: { now: number; before: number; invert?: boolean }) {
  if (!before && !now) return null;
  if (!before) return <span className="pill pill-green !text-[12.5px]">nouveau</span>;
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return <span className="pill pill-neutral !text-[12.5px]">stable</span>;
  const good = invert ? pct < 0 : pct > 0;
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[12.5px] font-medium tracking-normal tabular-nums ${good ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
      <AIcon name={pct > 0 ? "up" : "down"} size={12} />
      {pct > 0 ? "+" : ""}
      {pct} %
    </span>
  );
}

/** Un chiffre : son nom, sa valeur en grand, une ligne d'explication. Du texte, pas une tuile à icône. */
export function Stat({ label, value, hint, tone = "neutral", delta }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: AdminIconName; tone?: "neutral" | "amber" | "green" | "red"; delta?: React.ReactNode }) {
  return (
    <div className="card px-[18px] py-4">
      <p className="text-[12.5px] text-[var(--ink-3)]">{label}</p>
      <p className={`mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums ${tone === "red" ? "text-[var(--danger)]" : ""}`}>
        {value}
        {delta}
      </p>
      {hint && <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--ink-2)]">{hint}</p>}
    </div>
  );
}

/** Une bande de chiffres réglée (ex-panneau bleu nuit) : les chiffres clés d'une page côte à côte. */
export function NightPanel({ title, children, action }: { title: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-heading">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Un chiffre de la bande. Dans une grille `adm-figs`, il se règle tout seul. */
export function NightFigure({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: React.ReactNode; href?: string }) {
  const body = (
    <>
      <span className="block text-[12.5px] text-[var(--ink-3)]">{label}</span>
      <span className="mt-1.5 block text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[var(--ink)]">{value}</span>
      {hint && <span className="mt-1.5 block text-[12.5px] leading-snug text-[var(--ink-2)]">{hint}</span>}
    </>
  );
  return href ? <a href={href} className="adm-fig">{body}</a> : <div className="adm-fig">{body}</div>;
}

/** Courbe d'une série (visites par jour…), en SVG, avec la dernière valeur et le maximum. */
export function AreaChart({ data, label, height = 160, format = (n: number) => n.toLocaleString("fr-FR") }: { data: Array<{ x: string; y: number }>; label: string; height?: number; format?: (n: number) => string }) {
  if (!data.length) return null;
  const W = 640;
  const H = height;
  const max = Math.max(1, ...data.map((d) => d.y));
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const pts = data.map((d, i) => [i * step, H - 8 - (d.y / max) * (H - 28)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const peak = data.reduce((b, d, i) => (d.y > data[b].y ? i : b), 0);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-[160px] w-full" role="img" aria-label={`${label} : ${data.map((d) => `${d.x} ${format(d.y)}`).join(", ")}`} style={{ height }}>
        <defs>
          <linearGradient id="admin-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--amber)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - 8 - f * (H - 28)} y2={H - 8 - f * (H - 28)} stroke="var(--line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#admin-area)" />
        <path d={line} fill="none" stroke="var(--amber-display)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mt-2 flex justify-between gap-3 text-[13px] tabular-nums text-[var(--ink-3)]">
        <span>{data[0].x}</span>
        <span>
          Pic : <b className="text-[var(--ink-2)]">{format(data[peak].y)}</b> le {data[peak].x}
        </span>
        <span>{data[data.length - 1].x}</span>
      </figcaption>
    </figure>
  );
}

/** Une liste classée avec une barre proportionnelle (pages, sources, recherches…). */
export function BarList({ items, empty = "Rien pour l’instant." }: { items: Array<{ label: React.ReactNode; value: number; display?: React.ReactNode; key?: string }>; empty?: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="grid gap-1.5">
      {items.map((i, n) => (
        <li key={i.key ?? n} className="relative overflow-hidden rounded-[6px] px-2.5 py-1.5 text-[13.5px]">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-[6px] bg-[var(--amber-wash)]" style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          <span className="relative flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">{i.label}</span>
            <b className="shrink-0 font-medium tabular-nums">{i.display ?? i.value.toLocaleString("fr-FR")}</b>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Un choix de période, en liens (la page reste rendue côté serveur). */
export function Segmented({ options, value }: { options: Array<{ value: string; label: string; href: string }>; value: string }) {
  return (
    <div role="tablist" className="inline-flex gap-0.5 rounded-[9px] border border-[var(--line)] bg-[var(--adm-bg)] p-[3px]">
      {options.map((o) => (
        <a
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          href={o.href}
          className={`whitespace-nowrap rounded-[6px] px-2.5 py-1 text-[12.5px] font-medium transition-colors ${o.value === value ? "bg-[var(--sel)] text-[var(--ink)] shadow-[0_0_0_1px_var(--rule-strong)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}
        >
          {o.label}
        </a>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(110px,40%)_1fr] gap-3 border-b border-[var(--line-soft)] py-2.5 text-[13.5px] last:border-0">
      <dt className="text-[var(--ink-3)]">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children ?? "—"}</dd>
    </div>
  );
}

/** Un texte long (transcript, prompt, chapitre) replié par défaut. */
export function Fold({ summary, children, open = false, mono = false, meta }: { summary: React.ReactNode; children: React.ReactNode; open?: boolean; mono?: boolean; meta?: React.ReactNode }) {
  return (
    <details open={open} className="group overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--surface)]">
      <summary className="flex cursor-pointer select-none list-none items-center gap-3 px-4 py-3 text-[13.5px] font-medium hover:bg-[var(--canvas)] [&::-webkit-details-marker]:hidden">
        <AIcon name="chevron" size={16} className="text-[var(--ink-3)] transition-transform group-open:rotate-90" />
        <span className="min-w-0 flex-1">{summary}</span>
        {meta && <span className="t-small shrink-0">{meta}</span>}
      </summary>
      <div
        className={`max-h-[70vh] overflow-auto border-t border-[var(--line-soft)] px-4 py-4 sm:px-6 sm:py-5 ${
          mono ? "bg-[var(--canvas)] font-mono text-[13px] leading-[1.7] text-[var(--ink-soft)]" : "book-text !text-left"
        } whitespace-pre-wrap break-words`}
      >
        {children}
      </div>
    </details>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="t-small rounded-[8px] border border-dashed border-[var(--line)] px-4 py-6 text-center">{children}</p>;
}

/** Les initiales d'une personne, sur une teinte pâle qui lui est propre (tirée de son nom, donc stable). */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  let hue = 0;
  for (const ch of name) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
  const s = Math.min(size, 34);
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[8px] font-semibold" style={{ width: s, height: s, fontSize: s * 0.38, background: `hsl(${hue} 42% 50% / 0.18)`, color: `color-mix(in srgb, hsl(${hue} 55% 55%) 70%, var(--ink))` }}>
      {initials}
    </span>
  );
}

/** Barre d'avancement d'une phase. */
export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={`${v} %`}>
      <span className="block h-full rounded-full bg-[var(--amber)]" style={{ width: `${v}%` }} />
    </span>
  );
}
