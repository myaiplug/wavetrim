"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { MagneticButton } from "./MagneticButton";
import { ArrowDown, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <header className="relative pt-6 pb-12 md:pt-10 md:pb-20 overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--cyan)] opacity-[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[var(--magenta)] opacity-[0.06] blur-[90px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 flex items-center justify-between mb-12 md:mb-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--cyan)] to-[var(--magenta)] flex items-center justify-center shadow-[var(--glow-cyan)]">
            <span className="text-[#0A0A0F] font-bold text-sm">N</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">NoDAW Labs</span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">WaveTrim</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden sm:inline text-sm text-[var(--text-secondary)] hover:text-[var(--cyan)] transition"
          >
            Pro
          </a>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            Free forever core · Pro for tags & bulk
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-5">
            <span className="metallic">Trim with color</span>
            <br />
            <span className="text-neon-cyan">that builds</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed">
            The simplest, most beautiful waveform trimmer for producers.
            Click. Drag. Export. Color progresses with every beat.
            Mobile-first. Zero friction. Built under NoDAW Labs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <MagneticButton
              size="lg"
              variant="primary"
              onClick={() => {
                document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Open the tool
              <ArrowDown className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton
              size="lg"
              variant="secondary"
              onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              See Pro
            </MagneticButton>
          </div>
        </motion.div>

        {/* Floating micro visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-14 md:mt-20 relative h-16 md:h-20 max-w-lg mx-auto"
        >
          <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-4">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 20 + Math.sin(i * 0.35) * 28 + (i % 7) * 2;
              const delay = i * 0.02;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 4 }}
                  animate={{ height: h }}
                  transition={{
                    delay,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex-1 rounded-full max-w-[6px]"
                  style={{
                    background: `linear-gradient(to top, #00F0FF, ${
                      i > 24 ? "#FF00AA" : "#00B8C4"
                    })`,
                    opacity: 0.55 + (i / 48) * 0.45,
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
