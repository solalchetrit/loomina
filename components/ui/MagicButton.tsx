"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface MagicButtonProps extends HTMLMotionProps<"button"> {
  href?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

function MagicButtonContent({
  children,
  glow = true,
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}: Omit<MagicButtonProps, "href">) {
  const variantClasses: Record<NonNullable<MagicButtonProps["variant"]>, string> = {
    primary:
      "bg-[var(--loomina-ink)] text-white border border-[var(--loomina-ink)] hover:bg-black/90 active:bg-black",
    secondary:
      "bg-white text-[var(--loomina-ink)] border border-[var(--loomina-ink)] hover:bg-[var(--loomina-cloud)] active:bg-[var(--loomina-sand)]",
    ghost:
      "bg-transparent text-[var(--loomina-ink)] border border-transparent hover:border-[var(--loomina-ink)]/40 hover:bg-[var(--loomina-cloud)]",
  };

  const sizeClasses: Record<NonNullable<MagicButtonProps["size"]>, string> = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-3.5 text-lg",
  };

  const glowClasses = glow ? "shadow-[0_15px_40px_-28px_rgba(0,0,0,0.35)]" : "shadow-sm";
  const baseClasses =
    "group inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--loomina-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  return (
    <motion.button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export default function MagicButton({ href, children, glow = true, className, ...rest }: MagicButtonProps) {
  const wrapperClassName = className?.includes("w-full") ? "inline-flex w-full" : "inline-flex";

  if (href) {
    return (
      <Link href={href} className={wrapperClassName}>
        <MagicButtonContent className={className} glow={glow} {...rest}>
          {children}
        </MagicButtonContent>
      </Link>
    );
  }

  return (
    <MagicButtonContent className={className} glow={glow} {...rest}>
      {children}
    </MagicButtonContent>
  );
}
