# WaveTrim by NoDAW Labs

**Awwwards-caliber free waveform trimmer** — progressive color build, one-gesture click-drag selection, fully mobile responsive, premium cyber-HUD / Chromatic Nihilism aesthetic.

Free core forever. Producer Tag + Bulk gated behind a one-time Pro unlock that matches the Liminal / NoDAW one-time payment philosophy. Sold via Gumroad (primary) and Shopify.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + custom brand tokens
- Framer Motion for magnetic buttons, entrances, theme morph
- WaveSurfer.js + Regions plugin for the actual interactive waveform
- Zustand (persisted) for Pro unlock state
- Sonner toasts
- Lucide icons

## Design system

Dark foundation `#0A0A0F` with electric cyan `#00F0FF` and magenta `#FF00AA` neon accents, soft gold for Pro. Glassmorphism panels, HUD corner accents, metallic bevel headings, anti-gravity micro-motion on key elements, light/dark toggle with localStorage.

## Features delivered

### Free
- Drag-and-drop or click-to-load audio
- Progressive color fill on the waveform as playback advances
- Single-region click-drag (or touch) selection with live time readout
- Play / pause / zoom
- Instant trim + WAV export (browser-side)
- Fully responsive + large touch targets

### Pro (gated)
- Producer Tag input + apply (watermark / metadata stamp)
- Bulk multi-file selection & queue
- One-time $29 unlock via Gumroad (soft local unlock included for UI testing)
- Matches the "no subscription, lifetime" model used across Liminal / NoDAW products

### Funnel
- Clear path from free tool → Pro unlock → full NoDAW Labs suite (Liminal stems, desktop tools, VSTs)

## Project structure

```
src/
  app/
    layout.tsx          # Theme + metadata
    page.tsx            # Assembled experience
    globals.css         # Brand tokens, glass, neon, grain, HUD
  components/
    Hero.tsx
    WaveformEditor.tsx  # Core interactive tool
    ProGateModal.tsx
    Features.tsx
    Pricing.tsx
    Funnel.tsx
    Footer.tsx
    MagneticButton.tsx
    ThemeProvider.tsx
    ThemeToggle.tsx
  store/
    proStore.ts         # Persisted Pro flag
  lib/
    utils.ts
```

## Notes for production

- Replace the Gumroad URL with your real product link.
- For true MP3 export and server-side bulk + watermark burning, add a lightweight API route or edge function. Current export is pure client-side WAV for zero-backend free experience.
- Producer tag currently shows success toast; wire it to actual metadata write or a short generated audio stamp when you add backend.
- The soft "Demo: unlock locally" button lets you preview gated UI without purchasing.

## Brand credit

Built for NoDAW Labs / the beat mob. Prefer "bZ" in product credits.

---

Local-first. One-time over subs. Color that builds.
