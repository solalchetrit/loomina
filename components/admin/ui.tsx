/**
 * Briques de l'admin, au design du site : cartes blanches à bord fin,
 * pastilles, puces d'icône ambre, titres t-display / t-title / t-heading.
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

export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
        <h1 className={`t-display ${eyebrow ? "mt-3" : ""}`}>{title}</h1>
        {children && <div className="t-lead mt-4 max-w-2xl">{children}</div>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, icon, action, children, className = "", id }: { title?: React.ReactNode; icon?: AdminIconName; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card scroll-mt-40 p-5 sm:p-7 md:p-8 ${className}`}>
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 className="t-heading flex items-center gap-3">
              {icon && <span className="chip-icon"><AIcon name={icon} size={20} /></span>}
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

export function Stat({ label, value, hint, icon, tone = "neutral" }: { label: string; value: React.ReactNode; hint?: string; icon: AdminIconName; tone?: "neutral" | "amber" | "green" | "red" }) {
  const chip = tone === "amber" ? "chip-icon" : tone === "green" ? "chip-icon !bg-[var(--success-soft)] !text-[var(--success)]" : tone === "red" ? "chip-icon !bg-[#fbeae6] !text-[var(--danger)]" : "chip-icon chip-icon-neutral";
  return (
    <div className="card p-5 sm:p-6">
      <span className={chip}><AIcon name={icon} size={20} /></span>
      <p className="mt-4 text-[34px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">{value}</p>
      <p className="mt-2 text-[15px] font-bold">{label}</p>
      {hint && <p className="t-small mt-0.5">{hint}</p>}
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
