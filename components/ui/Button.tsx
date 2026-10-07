"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
}

/**
 * Trois boutons, un seul dessin : rectangle à coins doux, pas d'ombre, pas d'icône.
 * Hauteur minimale 48 px (cible tactile confortable pour tous les âges).
 */
export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  disabled = false,
  type = "button",
  loading = false,
}: ButtonProps) {
  const sizeClasses = {
    sm: "h-11 px-4 text-[15px]",
    md: "h-12 px-6 text-[16px]",
    lg: "h-14 px-8 text-[17px]",
  }[size];

  const variantClasses = {
    primary: "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)] disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:opacity-50",
    ghost: "bg-transparent text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4 hover:decoration-[var(--gold)]",
  }[variant];

  const base = `press inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold tracking-[-0.005em] cursor-pointer select-none whitespace-nowrap ${
    fullWidth ? "w-full" : ""
  } ${sizeClasses} ${variantClasses} ${className}`;

  if (href && !disabled) {
    const external = href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
    if (external) {
      return (
        <a href={href} className={base}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={base} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading && <span className={`spinner ${variant === "primary" ? "spinner-light" : ""}`} aria-hidden="true" />}
      {children}
    </button>
  );
}
