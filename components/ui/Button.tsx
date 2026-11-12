import type { ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "accent" | "ghost";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[var(--ink)] text-white hover:bg-[var(--ink-soft)]",
  secondary: "border border-[var(--rule-strong)] bg-white text-[var(--ink)] hover:border-[var(--ink)]",
  accent: "bg-[var(--amber)] text-[var(--ink)] hover:bg-[#f4ac4b]",
  ghost: "text-[var(--ink)] underline decoration-[var(--amber-line)] decoration-2 underline-offset-4 hover:decoration-[var(--amber)]",
};

const SIZES = {
  md: "min-h-12 px-5 text-[16px]",
  lg: "min-h-14 px-7 text-[17px]",
};

/** Quatre boutons, un seul dessin : coins doux, pas d'ombre. Cible tactile de 48 px minimum. */
export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  loading = false,
}: ButtonProps) {
  const cls = `press inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] py-2 text-center font-bold sm:whitespace-nowrap tracking-[-0.01em] select-none disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  if (href && !disabled) {
    const external = /^(tel:|mailto:|https?:)/.test(href);
    return external ? (
      <a href={href} className={cls}>
        {children}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading && <span className={`spinner ${variant === "primary" ? "spinner-light" : ""}`} aria-hidden="true" />}
      {children}
    </button>
  );
}
