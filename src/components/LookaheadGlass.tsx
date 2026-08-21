"use client";

import { useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import { formatTime } from "@/lib/utils";

/** Glass lookahead: magnified transparent preview of the selected region only. */
function LookaheadGlass({
  buffer,
  selection,
  sampleRate,
}: {
  buffer: AudioBuffer | null;
  selection: { start: number; end: number } | null;
  sampleRate: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer || !selection) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 8 || h < 8) return;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const startSample = Math.max(0, Math.floor(selection.start * sampleRate));
    const endSample = Math.min(buffer.length, Math.floor(selection.end * sampleRate));
    const len = Math.max(1, endSample - startSample);
    const ch0 = buffer.getChannelData(0);
    const mid = h / 2;

    ctx.fillStyle = "rgba(126, 203, 255, 0.06)";
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    ctx.strokeStyle = "rgba(126, 203, 255, 0.85)";
    ctx.lineWidth = 1.25;
    const step = Math.max(1, Math.floor(len / w));
    for (let x = 0; x < w; x++) {
      const i = startSample + Math.floor((x / w) * len);
      let min = 1;
      let max = -1;
      for (let s = 0; s < step && i + s < endSample; s++) {
        const v = ch0[i + s] ?? 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const y1 = mid + min * mid * 0.92;
      const y2 = mid + max * mid * 0.92;
      if (x === 0) ctx.moveTo(x, y1);
      else ctx.lineTo(x, y1);
      ctx.lineTo(x, y2);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
  }, [buffer, selection, sampleRate]);

  if (!selection) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[rgba(126,203,255,0.28)] bg-[rgba(11,16,24,0.55)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(167,139,255,0.12)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[rgba(126,203,255,0.85)]">
          <Eye className="h-3 w-3" />
          Lookahead
        </span>
        <span className="font-mono text-[10px] text-[var(--text-muted)]">
          {formatTime(selection.start)} → {formatTime(selection.end)} ·{" "}
          {formatTime(selection.end - selection.start)}
        </span>
      </div>
      <canvas ref={canvasRef} className="mt-1 h-16 w-full touch-none md:h-20" aria-hidden />
    </div>
  );
}

export { LookaheadGlass };
