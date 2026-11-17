import type { Tone } from "@/lib/admin/format";

const TONES: Record<Tone, string> = {
  ok: "bg-[var(--success-soft)] text-[var(--success)]",
  wait: "bg-[var(--amber-soft)] text-[var(--amber-deep)]",
  bad: "bg-[#fbeae6] text-[var(--danger)]",
  muted: "bg-[var(--surface-2)] text-[var(--ink-3)]",
};

export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${TONES[tone]}`}>{children}</span>;
}

export function Panel({ title, action, children, className = "" }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[18px] border border-[var(--line)] bg-white p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          {title && <h2 className="text-[18px] font-extrabold tracking-[-0.01em]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-white p-5">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">{label}</p>
      <p className="mt-1 text-[30px] font-extrabold leading-tight tracking-[-0.02em]">{value}</p>
      {hint && <p className="mt-1 text-[14px] text-[var(--ink-3)]">{hint}</p>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(120px,38%)_1fr] gap-3 border-b border-[var(--line-soft)] py-2 text-[15px] last:border-0">
      <dt className="text-[var(--ink-3)]">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{children ?? "—"}</dd>
    </div>
  );
}

/** Un texte long (transcript, prompt, chapitre) replié par défaut. */
export function Fold({ summary, children, open = false, mono = false }: { summary: React.ReactNode; children: React.ReactNode; open?: boolean; mono?: boolean }) {
  return (
    <details open={open} className="group rounded-[12px] border border-[var(--line)] bg-[var(--canvas)]">
      <summary className="cursor-pointer select-none list-none px-4 py-2.5 text-[15px] font-semibold marker:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
        {summary}
      </summary>
      <div className={`border-t border-[var(--line)] px-4 py-3 ${mono ? "font-mono text-[13px] leading-relaxed" : "text-[15px] leading-relaxed"} whitespace-pre-wrap break-words`}>
        {children}
      </div>
    </details>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-[var(--ink-3)]">{children}</p>;
}
