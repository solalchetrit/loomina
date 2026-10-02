import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Base = { label: string; hint?: string; error?: string };

export function Input({ label, hint, error, id, className = "", ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? rest.name ?? label;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input id={inputId} className={`field ${className}`} aria-invalid={error ? true : undefined} {...rest} />
      {(error || hint) && (
        <p className={`mt-2 font-sans text-[13px] ${error ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, hint, error, id, className = "", ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? rest.name ?? label;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <textarea id={inputId} className={`field ${className}`} aria-invalid={error ? true : undefined} {...rest} />
      {(error || hint) && (
        <p className={`mt-2 font-sans text-[13px] ${error ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
