/**
 * Briques de l'admin, au design du site : cartes blanches à bord fin,
 * pastilles, puces d'icône ambre, titres compacts de l'espace auteur, panneau bleu nuit, courbes et barres.
 */

import type { Tone } from "@/lib/admin/format";
import AIcon, { type AdminIconName } from "./icons";

const TONES: Record<Tone, string> = {
  ok: "pill pill-green",
  wait: "pill pill-amber",
  bad: "pill bg-[#fbeae6] text-[var(--danger)]",
  muted: "pill pill-neutral",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={TONES[tone]}>{children}</span>;
}

/** En-tête d'une rubrique, au gabarit de l'espace auteur : un titre net, une ligne de contexte. */
export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--amber-ink)]">{eyebrow}</p>}
        <h1 className={`text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold leading-[1.1] tracking-[-0.03em] ${eyebrow ? "mt-1.5" : ""}`}>{title}</h1>
        {children && <div className="mt-2 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-2)]">{children}</div>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, icon, action, children, className = "", id }: { title?: React.ReactNode; icon?: AdminIconName; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card scroll-mt-40 p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 className="t-heading flex items-center gap-3">
              {icon && <span className="chip-icon !h-9 !w-9"><AIcon name={icon} size={18} /></span>}
              <span className="min-w-0">{title}</span>
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
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
    <span className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[12.5px] font-bold tabular-nums ${good ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[var(--danger)]"}`}>
      <AIcon name={pct > 0 ? "up" : "down"} size={12} />
      {pct > 0 ? "+" : ""}
      {pct} %
    </span>
  );
}

export function Stat({ label, value, hint, icon, tone = "neutral", delta }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon: AdminIconName; tone?: "neutral" | "amber" | "green" | "red"; delta?: React.ReactNode }) {
  const chip = tone === "amber" ? "chip-icon" : tone === "green" ? "chip-icon !bg-[var(--success-soft)] !text-[var(--success)]" : tone === "red" ? "chip-icon !bg-[#fbeae6] !text-[var(--danger)]" : "chip-icon chip-icon-neutral";
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-bold text-[var(--ink-2)]">{label}</p>
        <span className={`${chip} !h-8 !w-8`}><AIcon name={icon} size={16} /></span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[28px] font-extrabold leading-none tracking-[-0.035em] tabular-nums">
        {value}
        {delta}
      </p>
      {hint && <p className="t-small mt-1.5">{hint}</p>}
    </div>
  );
}

/** Le grand panneau bleu nuit de l'espace auteur, pour les chiffres du jour. */
export function NightPanel({ title, children, action }: { title: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] bg-[var(--night)] p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[var(--amber)]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Un chiffre dans le panneau bleu nuit. */
export function NightFigure({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: React.ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-[13.5px] font-semibold text-white/70">{label}</p>
      <p className="mt-1.5 text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-white">{value}</p>
      {hint && <p className="mt-1.5 text-[13.5px] text-white/60">{hint}</p>}
    </>
  );
  return href ? (
    <a href={href} className="block rounded-[18px] bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.1]">{body}</a>
  ) : (
    <div className="rounded-[18px] bg-white/[0.06] p-4">{body}</div>
  );
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
            <stop offset="0" stopColor="var(--amber)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - 8 - f * (H - 28)} y2={H - 8 - f * (H - 28)} stroke="var(--line-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#admin-area)" />
        <path d={line} fill="none" stroke="var(--amber-display)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
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
        <li key={i.key ?? n} className="relative overflow-hidden rounded-[12px] px-3 py-2 text-[15px]">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 rounded-[12px] bg-[var(--amber-wash)]" style={{ width: `${Math.max(2, (i.value / max) * 100)}%` }} />
          <span className="relative flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">{i.label}</span>
            <b className="shrink-0 tabular-nums">{i.display ?? i.value.toLocaleString("fr-FR")}</b>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Un choix de période, en liens (la page reste rendue côté serveur). */
export function Segmented({ options, value }: { options: Array<{ value: string; label: string; href: string }>; value: string }) {
  return (
    <div role="tablist" className="inline-flex rounded-[14px] border border-[var(--line)] bg-white p-1">
      {options.map((o) => (
        <a
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          href={o.href}
          className={`rounded-[10px] px-3.5 py-1.5 text-[14.5px] font-bold transition-colors ${o.value === value ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}
        >
          {o.label}
        </a>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(110px,40%)_1fr] gap-3 border-b border-[var(--line-soft)] py-3 text-[16px] last:border-0">
      <dt className="text-[var(--ink-3)]">{label}</dt>
      <dd className="min-w-0 break-words font-semibold">{children ?? "—"}</dd>
    </div>
  );
}

/** Un texte long (transcript, prompt, chapitre) replié par défaut. */
export function Fold({ summary, children, open = false, mono = false, meta }: { summary: React.ReactNode; children: React.ReactNode; open?: boolean; mono?: boolean; meta?: React.ReactNode }) {
  return (
    <details open={open} className="group overflow-hidden rounded-[18px] border border-[var(--line)] bg-white">
      <summary className="flex cursor-pointer select-none list-none items-center gap-3 px-4 py-3.5 text-[16px] font-bold hover:bg-[var(--canvas)] [&::-webkit-details-marker]:hidden">
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
  return <p className="t-small rounded-[18px] bg-[var(--canvas)] px-4 py-6 text-center">{children}</p>;
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[14px] bg-[var(--amber-soft)] font-extrabold text-[var(--amber-deep)]" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

/** Barre d'avancement d'une phase. */
export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={`${v} %`}>
      <span className="block h-full rounded-full bg-[var(--amber)]" style={{ width: `${v}%` }} />
    </span>
  );
}
