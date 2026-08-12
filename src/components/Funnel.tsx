"use client";

import { MagneticButton } from "./MagneticButton";
import { ArrowRight } from "lucide-react";

const tools = [
  { name: "Liminal / StemSplit", desc: "6+ stem AI separation · 100% local", href: "https://liminal.plus" },
  { name: "NoDAW Suite", desc: "TrimIt · ScrewIt · FXit · full desktop toolkit", href: "https://github.com/myaiplug/nodaw-launcher" },
  { name: "VST Suite", desc: "EQ Forge · Saturation Core · Pitch Helix · DeGloss", href: "#" },
];

export function Funnel() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-neon rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--magenta)] opacity-[0.08] blur-[80px]" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[var(--cyan)] opacity-[0.08] blur-[70px]" />

          <h2 className="text-2xl md:text-3xl font-bold metallic mb-3 relative">
            WaveTrim is the doorway
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8 relative">
            You came for a clean trim. Stay for the full NoDAW Labs ecosystem —
            local-first tools built by a producer who got tired of the cloud.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 relative">
            {tools.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-xl p-4 text-left border border-[var(--border-subtle)] hover:border-[var(--border-neon)] transition group"
              >
                <div className="text-sm font-medium mb-1 group-hover:text-[var(--cyan)] transition">
                  {t.name}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{t.desc}</div>
              </a>
            ))}
          </div>

          <MagneticButton
            variant="primary"
            size="lg"
            onClick={() => window.open("https://thebeatmob.com", "_blank")}
          >
            Explore the full suite
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
