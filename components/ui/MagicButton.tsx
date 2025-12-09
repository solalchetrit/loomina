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
}

const springConfig = { stiffness: 260, damping: 20, mass: 0.6 };

function MagicButtonContent({ children, glow, className = "", ...rest }: Omit<MagicButtonProps, "href">) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const background = useMemo(
    () =>
      "bg-black text-white hover:bg-neutral-800 border border-transparent",
    []
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
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-base font-medium tracking-wide transition-all duration-300 ${background} ${className}`}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <span className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`} />
      <span className="relative flex items-center gap-2 z-10">{children}</span>
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
