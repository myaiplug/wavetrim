"use client";

import { motion } from "framer-motion";
import { MousePointer2, Smartphone, Palette, Zap, Shield, Layers } from "lucide-react";

const features = [
  {
    icon: MousePointer2,
    title: "Click-drag selection",
    desc: "One region. Drag the handles or the whole block. Instant. No menus, no complexity.",
  },
  {
    icon: Palette,
    title: "Color that builds",
    desc: "Waveform progress fills with electric cyan into magenta. Visual feedback that feels alive.",
  },
  {
    icon: Smartphone,
    title: "Mobile first",
    desc: "Touch handles sized for thumbs. Bottom controls. Works on phone the same way it does on desktop.",
  },
  {
    icon: Zap,
    title: "Zero friction export",
    desc: "Trim and download in one tap. WAV or MP3. No account required for the free core.",
  },
  {
    icon: Shield,
    title: "Local & private",
    desc: "Everything stays in your browser. No upload to our servers. Your beats never leave the device.",
  },
  {
    icon: Layers,
    title: "Pro: Tag + Bulk",
    desc: "Producer watermark and multi-file batch processing. Gated cleanly. One-time unlock.",
  },
];

export function Features() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold metallic mb-3">Designed for speed</h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Every interaction optimized so producers spend seconds, not minutes, cutting the part they need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="glass rounded-2xl p-5 md:p-6 border border-[var(--border-subtle)] hover:border-[var(--border-neon)] transition-colors duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,240,255,0.1)] flex items-center justify-center mb-4 group-hover:shadow-[var(--glow-cyan)] transition-shadow">
                <f.icon className="w-5 h-5 text-[var(--cyan)]" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
