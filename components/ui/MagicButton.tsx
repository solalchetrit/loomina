"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

interface MagicButtonProps extends HTMLMotionProps<"button"> {
  href?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
}

const springConfig = { stiffness: 260, damping: 20, mass: 0.6 };

function MagicButtonContent({ children, glow, className = "", variant = "primary", ...rest }: Omit<MagicButtonProps, "href">) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const variantClasses = useMemo(
    () =>
      variant === "primary"
        ? "bg-[var(--loomina-forest)] text-white shadow-[0_25px_60px_-38px_rgba(31,51,40,0.55)] border border-[var(--loomina-outline-strong)] hover:bg-[var(--loomina-forest)]/95"
        : "bg-[var(--loomina-surface)] text-[var(--loomina-ink)] border border-[var(--loomina-outline)] shadow-md hover:bg-[var(--loomina-surface-muted)]",
    [variant]
  );

  const buttonClasses = useMemo(
    () =>
      `group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--loomina-amber-strong)] focus-visible:ring-offset-[var(--loomina-surface)] ${variantClasses} ${className}`,
    [className, variantClasses]
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const relativeX = clientX - (rect.left + rect.width / 2);
    const relativeY = clientY - (rect.top + rect.height / 2);
    x.set(relativeX * 0.12);
    y.set(relativeY * 0.12);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  const shineOpacity = hovered ? 1 : 0;

  return (
    <motion.button
      type="button"
      className={buttonClasses}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -left-1/2 top-0 h-full w-full rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        initial={{ x: "-120%" }}
        animate={{ x: hovered ? ["-120%", "120%"] : "-120%" }}
        transition={{ duration: 0.8, ease: "easeInOut", repeat: hovered ? Infinity : 0 }}
        style={{ opacity: glow ? shineOpacity : 0.65 * shineOpacity }}
      />
      <span className="relative flex items-center gap-2">
        {children}
        <span className="pointer-events-none absolute inset-0 rounded-full border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]" aria-hidden />
      </span>
    </motion.button>
  );
}

export default function MagicButton({ href, children, glow = true, className, variant = "primary", ...rest }: MagicButtonProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex">
        <MagicButtonContent className={className} glow={glow} variant={variant} {...rest}>
          {children}
        </MagicButtonContent>
      </Link>
    );
  }

  return (
    <MagicButtonContent className={className} glow={glow} variant={variant} {...rest}>
      {children}
    </MagicButtonContent>
  );
}
