"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
}

export function MagneticButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 280, mass: 0.6 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.28);
    y.set((e.clientY - centerY) * 0.28);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary:
      "bg-[var(--cyan)] text-[#0A0A0F] font-semibold shadow-[var(--glow-cyan)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)]",
    secondary:
      "glass border border-[var(--border-neon)] text-[var(--cyan)] hover:bg-[rgba(0,240,255,0.08)]",
    ghost:
      "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5",
    gold:
      "bg-gradient-to-r from-[var(--gold)] to-[#E8D5A3] text-[#0A0A0F] font-semibold shadow-[var(--glow-gold)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-deep)]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
