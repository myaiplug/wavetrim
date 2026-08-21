"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import {
  Play, Pause, Scissors, Upload, Tag, Layers, ZoomIn, ZoomOut, RotateCcw, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { MagneticButton } from "./MagneticButton";
import { useProStore } from "@/store/proStore";
import { ProGateModal } from "./ProGateModal";
import { LookaheadGlass } from "./LookaheadGlass";

interface WaveformEditorProps {
  onNeedPro: (feature: "tag" | "bulk") => void;
}

export function WaveformEditor({ onNeedPro }: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const decodedRef = useRef<AudioBuffer | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [sampleRate, setSampleRate] = useState(44100);
  const [showProModal, setShowProModal] = useState(false);
  const [proFeature, setProFeature] = useState<"tag" | "bulk">("tag");
  const [producerTag, setProducerTag] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const isPro = useProStore((s) => s.isPro);

  const initWaveSurfer = useCallback(() => {
    if (!containerRef.current) return;
    if (wavesurferRef.current) wavesurferRef.current.destroy();

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(126, 203, 255, 0.35)",
      progressColor: "#7ecbff",
      cursorColor: "#a78bff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 140,
      normalize: true,
      backend: "WebAudio",
      plugins: [regions],
      interact: true,
      dragToSeek: true,
    });
    wavesurferRef.current = ws;

    ws.on("ready", async () => {
      setIsReady(true);
      setIsLoading(false);
      const d = ws.getDuration();
      setDuration(d);
      try {
        const decoded = await ws.getDecodedData();
        if (decoded) {
          decodedRef.current = decoded;
          setSampleRate(decoded.sampleRate);
        }
      } catch { /* ignore */ }
      if (d > 0.5) {
        regions.clearRegions();
        const region = regions.addRegion({
          start: 0.05,
          end: Math.min(d - 0.05, d * 0.85),
          color: "rgba(126, 203, 255, 0.16)",
          drag: true,
          resize: true,
        });
        setSelection({ start: region.start, end: region.end });
      }
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (t) => setCurrentTime(t));
    ws.on("finish", () => setIsPlaying(false));

    regions.on("region-updated", (region) => {
      setSelection({ start: region.start, end: region.end });
    });
    regions.on("region-created", (region) => {
      regions.getRegions().forEach((r) => {
        if (r.id !== region.id) r.remove();
      });
      setSelection({ start: region.start, end: region.end });
    });

    regions.enableDragSelection({ color: "rgba(126, 203, 255, 0.16)" });

    return () => { ws.destroy(); };
  }, []);

  useEffect(() => {
    const cleanup = initWaveSurfer();
    return cleanup;
  }, [initWaveSurfer]);

  useEffect(() => {
    if (wavesurferRef.current && isReady) wavesurferRef.current.zoom(zoom);
  }, [zoom, isReady]);

  const loadFile = async (file: File) => {
    if (!wavesurferRef.current) return;
    setIsLoading(true);
    setFileName(file.name);
    setSelection(null);
    decodedRef.current = null;
    try {
      await wavesurferRef.current.loadBlob(file);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Failed to load audio. Try WAV, MP3, or FLAC.");
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) loadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    if (selection && !isPlaying) {
      wavesurferRef.current.play(selection.start, selection.end);
      return;
    }
    wavesurferRef.current.playPause();
  };

  const exportTrimmed = async () => {
    if (!wavesurferRef.current || !selection) {
      toast.error("Drag on the waveform to select a region first");
      return;
    }
    const originalBuffer = decodedRef.current || (await wavesurferRef.current.getDecodedData());
    if (!originalBuffer) {
      toast.error("No audio data");
      return;
    }
    const sr = originalBuffer.sampleRate;
    const startSample = Math.floor(selection.start * sr);
    const endSample = Math.floor(selection.end * sr);
    const length = endSample - startSample;
    const trimmed = new AudioContext().createBuffer(originalBuffer.numberOfChannels, length, sr);
    for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
      trimmed.copyToChannel(originalBuffer.getChannelData(ch).slice(startSample, endSample), ch);
    }
    const numChannels = trimmed.numberOfChannels;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = trimmed.length * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrayBuffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataLength, true);
    let offset = 44;
    for (let i = 0; i < trimmed.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, trimmed.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    const url = URL.createObjectURL(new Blob([arrayBuffer], { type: "audio/wav" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.replace(/\.[^/.]+$/, "") || "trimmed"}_wavetrim.wav`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Trimmed audio downloaded");
  };

  const handleProducerTag = () => {
    if (!isPro) {
      setProFeature("tag");
      setShowProModal(true);
      onNeedPro("tag");
      return;
    }
    if (!producerTag.trim()) {
      toast.message("Enter your producer tag first");
      return;
    }
    toast.success(`Producer tag "${producerTag}" will be applied on export (Pro)`);
  };

  const handleBulk = () => {
    if (!isPro) {
      setProFeature("bulk");
      setShowProModal(true);
      onNeedPro("bulk");
      return;
    }
    bulkInputRef.current?.click();
  };

  const onBulkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBulkFiles(files);
    toast.success(`${files.length} files queued for bulk trim (Pro)`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <AnimatePresence mode="wait">
        {!fileName ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="group relative"
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-neon hud-corner cursor-pointer rounded-2xl border-2 border-dashed border-[rgba(126,203,255,0.25)] p-10 text-center transition-all duration-500 hover:border-[var(--cyan)] hover:shadow-[0_0_50px_rgba(126,203,255,0.25)] md:p-16"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(126,203,255,0.1)]"
              >
                <Upload className="h-7 w-7 text-[var(--cyan)]" />
              </motion.div>
              <h3 className="metallic mb-2 text-xl font-semibold md:text-2xl">Drop audio or click to load</h3>
              <p className="mx-auto max-w-md text-sm text-[var(--text-secondary)] md:text-base">
                WAV · MP3 · FLAC · OGG · M4A. Click and drag to select. Zoom in. Glass lookahead shows the cut.
              </p>
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--cyan)] shadow-[var(--glow-cyan)]" />
                <span className="max-w-[200px] truncate text-sm font-medium md:max-w-xs md:text-base">{fileName}</span>
                <span className="font-mono text-xs text-[var(--text-muted)]">{formatTime(duration)}</span>
              </div>
              <button
                onClick={() => {
                  setFileName(null);
                  setIsReady(false);
                  setSelection(null);
                  decodedRef.current = null;
                  wavesurferRef.current?.empty();
                }}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--magenta)]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> New file
              </button>
            </div>

            <LookaheadGlass buffer={decodedRef.current} selection={selection} sampleRate={sampleRate} />

            <div className="glass relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-3 md:p-4">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--bg-deep)]/70 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--cyan)] border-t-transparent" />
                </div>
              )}
              <div ref={containerRef} className="min-h-[140px] w-full touch-none overflow-hidden rounded-xl" />
              <div className="mt-3 flex items-center justify-between px-1 font-mono text-xs text-[var(--text-muted)]">
                <span>{formatTime(currentTime)}</span>
                {selection && (
                  <span className="text-[var(--cyan)]">
                    Glass region {formatTime(selection.start)} → {formatTime(selection.end)} ({formatTime(selection.end - selection.start)})
                  </span>
                )}
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 md:p-4">
              <div className="flex items-center gap-2">
                <MagneticButton size="sm" variant="primary" onClick={togglePlay} disabled={!isReady} className="!px-4 !py-2.5">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play region"}</span>
                </MagneticButton>
                <div className="ml-1 flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-1">
                  <button onClick={() => setZoom((z) => Math.max(10, z - 25))} className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--cyan)]" aria-label="Zoom out">
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button onClick={() => setZoom(50)} className="min-w-[3rem] px-1 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--cyan)]" aria-label="Fit">
                    {zoom}×
                  </button>
                  <button onClick={() => setZoom((z) => Math.min(400, z + 25))} className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--cyan)]" aria-label="Zoom in">
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <MagneticButton size="sm" variant="secondary" onClick={exportTrimmed} disabled={!selection} className="!px-4">
                <Scissors className="h-4 w-4" />
                <span className="hidden sm:inline">Trim & Export</span>
              </MagneticButton>
            </div>

            <p className="px-1 text-xs text-[var(--text-muted)]">
              Drag on the wave to set the glass region. Handles resize edges. Zoom for tight edits. Lookahead shows only the cut.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="glass relative overflow-hidden rounded-xl border border-[var(--border-subtle)] p-4">
                {!isPro && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[rgba(212,175,55,0.12)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--gold)]">
                    <Lock className="h-3 w-3" /> Pro
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[var(--magenta)]" />
                  <span className="text-sm font-medium">Producer Tag</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="e.g. produced by bZ" value={producerTag} onChange={(e) => setProducerTag(e.target.value)} className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm focus:border-[var(--magenta)] focus:outline-none" />
                  <MagneticButton size="sm" variant="secondary" onClick={handleProducerTag}>Apply</MagneticButton>
                </div>
              </div>
              <div className="glass relative overflow-hidden rounded-xl border border-[var(--border-subtle)] p-4">
                {!isPro && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[rgba(212,175,55,0.12)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--gold)]">
                    <Lock className="h-3 w-3" /> Pro
                  </div>
                )}
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--cyan)]" />
                  <span className="text-sm font-medium">Bulk Process</span>
                </div>
                <MagneticButton size="sm" variant="secondary" onClick={handleBulk} className="w-full">
                  {bulkFiles.length > 0 ? `${bulkFiles.length} files ready` : "Select multiple files"}
                </MagneticButton>
                <input ref={bulkInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={onBulkSelect} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProGateModal open={showProModal} feature={proFeature} onClose={() => setShowProModal(false)} />
    </div>
  );
}
