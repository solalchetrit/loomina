"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

interface MagicButtonProps extends HTMLMotionProps<"button"> {
  href?: string;
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

const springConfig = { stiffness: 260, damping: 20, mass: 0.6 };

function MagicButtonContent({ children, glow, className = "", ...rest }: Omit<MagicButtonProps, "href">) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const background = useMemo(
    () =>
      "bg-gradient-to-r from-[#0c1021] via-[#0c142c] to-[#0b0e1c] text-white shadow-[0_25px_70px_-45px_rgba(0,0,0,0.95)] border border-white/10",
    []
  );

  const glowGradient = useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.28), rgba(236,72,153,0.12), transparent 60%)`;

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const centerRelativeX = clientX - (rect.left + rect.width / 2);
    const centerRelativeY = clientY - (rect.top + rect.height / 2);
    x.set(centerRelativeX * 0.12);
    y.set(centerRelativeY * 0.12);
    mouseX.set(clientX - rect.left);
    mouseY.set(clientY - rect.top);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  const shineOpacity = hovered ? 1 : 0;

  return (
    <motion.button
      type="button"
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${background} ${className}`}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: glowGradient, mixBlendMode: "screen" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -left-1/2 top-0 h-full w-full rotate-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        initial={{ x: "-120%" }}
        animate={{ x: hovered ? ["-120%", "120%"] : "-120%" }}
        transition={{ duration: 0.9, ease: "easeInOut", repeat: hovered ? Infinity : 0 }}
        style={{ opacity: glow ? shineOpacity : 0.7 * shineOpacity }}
      />
      <span className="relative flex items-center gap-2">
        {children}
        <span className="pointer-events-none absolute inset-0 rounded-full border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]" aria-hidden />
      </span>
    </motion.button>
  );
}

export default function MagicButton({ href, children, glow = true, className, ...rest }: MagicButtonProps) {
  if (href) {
    return (
      <Link href={href} className="inline-flex">
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
