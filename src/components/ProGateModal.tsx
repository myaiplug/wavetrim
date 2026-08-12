"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, ExternalLink } from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { useProStore } from "@/store/proStore";

interface ProGateModalProps {
  open: boolean;
  feature: "tag" | "bulk";
  onClose: () => void;
}

export function ProGateModal({ open, feature, onClose }: ProGateModalProps) {
  const unlock = useProStore((s) => s.unlock);

  const featureCopy = {
    tag: {
      title: "Producer Tag",
      desc: "Stamp your name or brand on every export. Metadata write + optional short audio watermark so the world knows who made it.",
    },
    bulk: {
      title: "Bulk Processing",
      desc: "Queue dozens of tracks. Apply the same relative or absolute trim. Batch download as ZIP. Built for beat packs and sample kits.",
    },
  };

  const handleUnlock = () => {
    unlock();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-neon rounded-2xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--gold)] via-[var(--cyan)] to-[var(--magenta)]" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[#E8D5A3] flex items-center justify-center shadow-[var(--glow-gold)]">
                <Crown className="w-5 h-5 text-[#0A0A0F]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Unlock {featureCopy[feature].title}</h3>
                <p className="text-xs text-[var(--text-muted)]">One-time Pro · No subscription</p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              {featureCopy[feature].desc}
            </p>

            <ul className="space-y-2.5 mb-7">
              {[
                "Producer Tag watermark & metadata",
                "Bulk multi-file processing",
                "Priority export formats",
                "Lifetime updates · matching Liminal model",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[var(--cyan)] mt-0.5 shrink-0" />
                  <span className="text-[var(--text-secondary)]">{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <MagneticButton
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => {
                  window.open("https://gumroad.com/l/nodaw-wavetrim-pro", "_blank");
                  handleUnlock();
                }}
              >
                Unlock Pro — $29 one-time
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </MagneticButton>

              <p className="text-center text-[11px] text-[var(--text-muted)]">
                Also available on Shopify · Instant unlock after purchase · Matches Liminal & CoProducer one-time philosophy
              </p>

              <button
                onClick={handleUnlock}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--cyan)] transition py-1"
              >
                (Demo: unlock locally to preview Pro UI)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
