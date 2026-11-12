import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Base = { label: string; hint?: string; error?: string };

/** Champ : étiquette au-dessus, aide ou erreur en dessous, reliées par aria-describedby. */
export function Input({ label, hint, error, id, className = "", ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? rest.name ?? label;
  const descId = `${inputId}-desc`;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`field ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? descId : undefined}
        {...rest}
      />
      {(error || hint) && (
        <p id={descId} className={`mt-2 font-sans text-[15px] leading-snug ${error ? "font-medium text-[var(--danger)]" : "text-[var(--ink-3)]"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({ label, hint, error, id, className = "", ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? rest.name ?? label;
  const descId = `${inputId}-desc`;
  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`field ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? descId : undefined}
        {...rest}
      />
      {(error || hint) && (
        <p id={descId} className={`mt-2 font-sans text-[15px] leading-snug ${error ? "font-medium text-[var(--danger)]" : "text-[var(--ink-3)]"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
