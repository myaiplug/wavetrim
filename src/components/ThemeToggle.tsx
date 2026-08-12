"use client";

import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative w-11 h-11 rounded-full glass flex items-center justify-center border border-[var(--border-subtle)] hover:border-[var(--border-neon)] transition-colors duration-300 group"
    >
      <motion.span
        key={theme}
        initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0.4, rotate: 90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="text-xl select-none"
      >
        {theme === "dark" ? "🌙" : "🌞"}
      </motion.span>
      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[var(--glow-cyan)]" />
    </button>
  );
}
