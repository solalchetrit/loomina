import type { Tone } from "@/lib/admin/format";
import AIcon, { type AdminIconName } from "./icons";

const TONES: Record<Tone, { chip: string; dot: string }> = {
  ok: { chip: "bg-[#e6f2e8] text-[#265233]", dot: "bg-[#3c9a57]" },
  wait: { chip: "bg-[#fcefd9] text-[#7a4706]", dot: "bg-[#ee9b2d]" },
  bad: { chip: "bg-[#fbe6e2] text-[#9a3524]", dot: "bg-[#d4513b]" },
  muted: { chip: "bg-[#efeee9] text-[#5c5c55]", dot: "bg-[#a3a29a]" },
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold leading-none ${t.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} aria-hidden />
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-[var(--amber-ink)]">{eyebrow}</p>}
        <h1 className="mt-1 text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] [text-wrap:balance] sm:text-[36px]">{title}</h1>
        {children && <div className="mt-2 text-[16px] leading-relaxed text-[var(--ink-2)]">{children}</div>}
      </div>
      {action}
    </header>
  );
}

export function Panel({ title, icon, action, children, className = "", id }: { title?: React.ReactNode; icon?: AdminIconName; action?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,10,0.04),0_8px_24px_-12px_rgba(20,20,10,0.08)] sm:p-7 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 className="flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.015em]">
              {icon && (
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--surface-2)] text-[var(--ink-2)]">
                  <AIcon name={icon} size={16} />
                </span>
              )}
              {title}
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
  const chip = {
    neutral: "bg-[var(--surface-2)] text-[var(--ink-2)]",
    amber: "bg-[var(--amber-soft)] text-[var(--amber-deep)]",
    green: "bg-[#e6f2e8] text-[#265233]",
    red: "bg-[#fbe6e2] text-[#9a3524]",
  }[tone];
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,10,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[var(--ink-3)]">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${chip}`}><AIcon name={icon} size={17} /></span>
      </div>
      <p className="mt-2 text-[32px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-[13.5px] text-[var(--ink-3)]">{hint}</p>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(110px,40%)_1fr] gap-3 border-b border-[var(--line-soft)] py-2.5 text-[15px] last:border-0">
      <dt className="text-[var(--ink-3)]">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children ?? "—"}</dd>
    </div>
  );
}

/** Un texte long (transcript, prompt, chapitre) replié par défaut. */
export function Fold({ summary, children, open = false, mono = false, meta }: { summary: React.ReactNode; children: React.ReactNode; open?: boolean; mono?: boolean; meta?: React.ReactNode }) {
  return (
    <details open={open} className="group overflow-hidden rounded-[14px] border border-[var(--line)] bg-white open:shadow-[0_6px_20px_-12px_rgba(20,20,10,0.2)]">
      <summary className="flex cursor-pointer select-none list-none items-center gap-2.5 px-4 py-3 text-[15px] font-semibold hover:bg-[var(--canvas)] [&::-webkit-details-marker]:hidden">
        <AIcon name="chevron" size={16} className="text-[var(--ink-3)] transition-transform group-open:rotate-90" />
        <span className="min-w-0 flex-1">{summary}</span>
        {meta && <span className="shrink-0 text-[13px] font-medium text-[var(--ink-3)]">{meta}</span>}
      </summary>
      <div
        className={`max-h-[70vh] overflow-auto border-t border-[var(--line)] px-4 py-4 sm:px-5 ${
          mono ? "bg-[#fbfaf7] font-mono text-[12.5px] leading-[1.7] text-[var(--ink-soft)]" : "font-serif text-[17px] leading-[1.7]"
        } whitespace-pre-wrap break-words`}
      >
        {children}
      </div>
    </details>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[14px] bg-[var(--canvas)] px-4 py-6 text-center text-[15px] text-[var(--ink-3)]">{children}</p>;
}

const AVATAR_TINTS = ["#fcebd2", "#e6eefb", "#e3f3f1", "#efe6fb", "#fde8ea", "#e6f2e8"];

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  const tint = AVATAR_TINTS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-[var(--ink)]" style={{ width: size, height: size, background: tint, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

/** Barre d'avancement d'une phase. */
export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" role="img" aria-label={`${v} %`}>
      <span className="block h-full rounded-full bg-[var(--amber)]" style={{ width: `${v}%` }} />
    </span>
  );
}
