"use client";

import { Hero } from "@/components/Hero";
import { WaveformEditor } from "@/components/WaveformEditor";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { Funnel } from "@/components/Funnel";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />

      {/* The Tool */}
      <section id="tool" className="py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic mb-2">The tool</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Drop a file. Drag the selection. Export. That is the entire free experience.
          </p>
        </div>
        <WaveformEditor onNeedPro={() => {}} />
      </section>

      <Features />
      <Pricing />
      <Funnel />
      <Footer />
    </main>
  );
}
