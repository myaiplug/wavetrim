"use client";

import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { useProStore } from "@/store/proStore";

export function Pricing() {
  const isPro = useProStore((s) => s.isPro);
  const unlock = useProStore((s) => s.unlock);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,240,255,0.03)] to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold metallic mb-3">Simple pricing</h2>
          <p className="text-[var(--text-secondary)]">
            Free core stays free. Pro is one-time — same philosophy as Liminal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8 border border-[var(--border-subtle)]"
          >
            <div className="text-sm font-medium text-[var(--text-muted)] mb-1">Free</div>
            <div className="text-3xl font-bold mb-1">$0</div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Forever. No account.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Waveform with progressive color",
                "Click-drag region selection",
                "Play / pause / zoom",
                "Trim & export WAV",
                "Mobile responsive",
                "100% local processing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[var(--cyan)] mt-0.5 shrink-0" />
                  <span className="text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>
            <MagneticButton
              variant="secondary"
              className="w-full"
              onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start free
            </MagneticButton>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative glass-neon rounded-2xl p-6 md:p-8 overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-[var(--gold)] to-transparent text-[10px] font-semibold uppercase tracking-wider text-[#0A0A0F] rounded-bl-lg">
              Recommended
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-[var(--gold)]" />
              <span className="text-sm font-medium text-[var(--gold)]">Pro</span>
            </div>
            <div className="text-3xl font-bold mb-1">$29</div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">One-time · Lifetime</p>

            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Producer Tag watermark + metadata",
                "Bulk multi-file processing",
                "Priority format options",
                "Lifetime updates",
                "Matches Liminal billing model",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                  <span className="text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="w-full py-3 text-center rounded-xl bg-[rgba(0,240,255,0.12)] text-[var(--cyan)] font-medium text-sm">
                Pro unlocked on this device
              </div>
            ) : (
              <MagneticButton
                variant="gold"
                className="w-full"
                onClick={() => {
                  window.open("https://gumroad.com/l/nodaw-wavetrim-pro", "_blank");
                  unlock();
                }}
              >
                Unlock on Gumroad
              </MagneticButton>
            )}

            <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
              Also available via Shopify store · Instant digital delivery
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
