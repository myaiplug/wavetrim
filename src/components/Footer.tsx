"use client";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--cyan)] to-[var(--magenta)] flex items-center justify-center">
            <span className="text-[#0A0A0F] font-bold text-xs">N</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">NoDAW Labs</span>
            <span className="text-[var(--text-muted)]"> · WaveTrim</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Built with ♥ in Louisville, KY · Local-first · One-time over subscriptions
        </p>

        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <a href="#" className="hover:text-[var(--cyan)] transition">
            Privacy
          </a>
          <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--cyan)] transition">
            Gumroad
          </a>
          <a href="#" className="hover:text-[var(--cyan)] transition">
            Shopify
          </a>
        </div>
      </div>
    </footer>
  );
}
