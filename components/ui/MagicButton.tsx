"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";

interface MagicButtonProps extends HTMLMotionProps<"button"> {
  href?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const springConfig = { stiffness: 260, damping: 20, mass: 0.6 };

function MagicButtonContent({
  children,
  glow = true,
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}: Omit<MagicButtonProps, "href">) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const variantClasses: Record<NonNullable<MagicButtonProps["variant"]>, string> = {
    primary:
      "bg-[var(--loomina-black)] text-white border border-transparent hover:bg-black/90 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.55)]",
    secondary:
      "bg-white text-[var(--loomina-black)] border border-neutral-200 hover:border-[var(--loomina-black)]/25 hover:bg-neutral-50 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]",
    ghost:
      "bg-transparent text-[var(--loomina-black)] border border-[var(--loomina-black)]/15 hover:bg-[var(--loomina-gray-light)]",
  };

  const sizeClasses: Record<NonNullable<MagicButtonProps["size"]>, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const glowClasses = glow ? "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]" : "shadow-none";

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
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full font-sans font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--loomina-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${className}`}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <span className={`absolute inset-0 bg-white/15 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`} />
      <span className="relative flex items-center gap-2 z-10">{children}</span>
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
