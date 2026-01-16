"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

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

function MagicButtonContent({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}: Omit<MagicButtonProps, "href" | "as">) {
  const variantClasses: Record<NonNullable<MagicButtonProps["variant"]>, string> = {
    primary:
      "bg-gradient-to-r from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)] text-[var(--loomina-void)] shadow-lg shadow-[var(--loomina-gold)]/20",
    secondary:
      "bg-transparent text-[var(--text-secondary)] border border-[var(--loomina-mist)] hover:border-[var(--loomina-gold)] hover:text-[var(--loomina-gold)]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--loomina-mist)]/30",
  };

  const sizeClasses: Record<NonNullable<MagicButtonProps["size"]>, string> = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const baseClasses =
    "group inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--loomina-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--loomina-void)]";

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

export default function MagicButton({ href, children, className, as, target, rel, ...rest }: MagicButtonProps) {
  const wrapperClassName = className?.includes("w-full") ? "inline-flex w-full" : "inline-flex";

  // Case 1: External Link (as="a")
  if (as === "a" && href) {
    return (
      <a href={href} className={wrapperClassName} target={target} rel={rel}>
        <MagicButtonContent className={className} {...rest}>
          {children}
        </MagicButtonContent>
      </a>
    );
  }

  // Case 2: Internal Link (default behavior if href exists)
  if (href) {
    return (
      <Link href={href} className={wrapperClassName}>
        <MagicButtonContent className={className} {...rest}>
          {children}
        </MagicButtonContent>
      </Link>
    );
  }

  // Case 3: Button (default behavior if no href)
  return (
    <button className={wrapperClassName} {...rest}>
      <MagicButtonContent className={className} {...rest}>
        {children}
      </MagicButtonContent>
    </button>
  );
}
