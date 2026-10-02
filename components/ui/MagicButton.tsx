"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Conservé pour compatibilité : même apparence que <Button />.
 * Encre + retour tactile (scale 0.97), transitions explicites.
 */
interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  target?: string;
  rel?: string;
}

const variantClasses: Record<NonNullable<MagicButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--ink)] text-[var(--loomina-void)] hover:bg-[var(--ink-soft)] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-12px_rgba(26,24,21,0.45)]",
  secondary:
    "bg-[var(--paper)] text-[var(--ink)] border border-[var(--hairline-strong)] hover:border-[var(--loomina-gold)] hover:text-[var(--gold-ink)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--loomina-slate)]/60",
};

const sizeClasses: Record<NonNullable<MagicButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm gap-2",
  md: "h-11 px-6 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export default function MagicButton({
  href,
  children,
  className = "",
  variant = "primary",
  size = "md",
  as,
  target,
  rel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glow,
  ...rest
}: MagicButtonProps) {
  const classes = `press inline-flex items-center justify-center rounded-full font-sans font-semibold tracking-[-0.01em] whitespace-nowrap select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (as === "a" && href) {
    return (
      <a href={href} className={classes} target={target} rel={rel}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
