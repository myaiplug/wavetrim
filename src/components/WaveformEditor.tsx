"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import {
  Play,
  Pause,
  Scissors,
  Upload,
  Tag,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { MagneticButton } from "./MagneticButton";
import { useProStore } from "@/store/proStore";
import { ProGateModal } from "./ProGateModal";

interface WaveformEditorProps {
  onNeedPro: (feature: "tag" | "bulk") => void;
}

export function WaveformEditor({ onNeedPro }: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [exportFormat, setExportFormat] = useState<"wav" | "mp3">("wav");
  const [showProModal, setShowProModal] = useState(false);
  const [proFeature, setProFeature] = useState<"tag" | "bulk">("tag");
  const [producerTag, setProducerTag] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);

  const isPro = useProStore((s) => s.isPro);

  const initWaveSurfer = useCallback(() => {
    if (!containerRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(0, 240, 255, 0.35)",
      progressColor: "#00F0FF",
      cursorColor: "#FF00AA",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 128,
      normalize: true,
      backend: "WebAudio",
      plugins: [regions],
      interact: true,
      dragToSeek: true,
    });

    wavesurferRef.current = ws;

    ws.on("ready", () => {
      setIsReady(true);
      setIsLoading(false);
      setDuration(ws.getDuration());
      const d = ws.getDuration();
      if (d > 0.5) {
        const region = regions.addRegion({
          start: 0.1,
          end: Math.min(d - 0.1, d * 0.85),
          color: "rgba(0, 240, 255, 0.18)",
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

    return () => {
      ws.destroy();
    };
  }, []);

  useEffect(() => {
    const cleanup = initWaveSurfer();
    return cleanup;
  }, [initWaveSurfer]);

  useEffect(() => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.zoom(zoom);
    }
  }, [zoom, isReady]);

  const loadFile = async (file: File) => {
    if (!wavesurferRef.current) return;
    setIsLoading(true);
    setFileName(file.name);
    setSelection(null);
    try {
      await wavesurferRef.current.loadBlob(file);
      toast.success(`Loaded ${file.name}`);
    } catch (err) {
      toast.error("Failed to load audio. Try WAV, MP3, or FLAC.");
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      loadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const togglePlay = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.playPause();
  };

  const exportTrimmed = async () => {
    if (!wavesurferRef.current || !selection) {
      toast.error("Select a region first by dragging on the waveform");
      return;
    }

    const ws = wavesurferRef.current;
    const originalBuffer = await ws.getDecodedData();
    if (!originalBuffer) {
      toast.error("No audio data");
      return;
    }

    const sampleRate = originalBuffer.sampleRate;
    const startSample = Math.floor(selection.start * sampleRate);
    const endSample = Math.floor(selection.end * sampleRate);
    const length = endSample - startSample;

    const trimmed = new AudioContext().createBuffer(
      originalBuffer.numberOfChannels,
      length,
      sampleRate
    );

    for (let ch = 0; ch < originalBuffer.numberOfChannels; ch++) {
      const channelData = originalBuffer.getChannelData(ch).slice(startSample, endSample);
      trimmed.copyToChannel(channelData, ch);
    }

    const wavBlob = bufferToWav(trimmed);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName?.replace(/\.[^/.]+$/, "") || "trimmed"}_wavetrim.wav`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Trimmed audio downloaded");
  };

  function bufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

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
    <div className="w-full max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {!fileName ? (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative group"
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-neon hud-corner rounded-2xl p-10 md:p-16 text-center cursor-pointer transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,240,255,0.25)] border-dashed border-2 border-[rgba(0,240,255,0.25)] hover:border-[var(--cyan)]"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(0,240,255,0.1)] mb-6"
              >
                <Upload className="w-7 h-7 text-[var(--cyan)]" />
              </motion.div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 metallic">
                Drop audio or click to load
              </h3>
              <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-md mx-auto">
                WAV · MP3 · FLAC · OGG · M4A — color builds as the wave appears. Drag to select. Done.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[var(--cyan)] shadow-[var(--glow-cyan)] animate-pulse" />
                <span className="text-sm md:text-base font-medium truncate max-w-[200px] md:max-w-xs">
                  {fileName}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {formatTime(duration)}
                </span>
              </div>
              <button
                onClick={() => {
                  setFileName(null);
                  setIsReady(false);
                  setSelection(null);
                  if (wavesurferRef.current) {
                    wavesurferRef.current.empty();
                  }
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--magenta)] transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> New file
              </button>
            </div>

            <div className="relative glass rounded-2xl p-3 md:p-4 overflow-hidden border border-[var(--border-subtle)]">
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[var(--cyan)] opacity-60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--cyan)] opacity-60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[var(--magenta)] opacity-50 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[var(--magenta)] opacity-50 pointer-events-none" />

              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-deep)]/70 backdrop-blur-sm rounded-2xl">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[var(--text-secondary)]">Building waveform…</span>
                  </div>
                </div>
              )}

              <div
                ref={containerRef}
                className="w-full rounded-xl overflow-hidden min-h-[128px] touch-none"
              />

              <div className="mt-3 flex items-center justify-between text-xs font-mono text-[var(--text-muted)] px-1">
                <span>{formatTime(currentTime)}</span>
                {selection && (
                  <span className="text-[var(--cyan)]">
                    Selection {formatTime(selection.start)} → {formatTime(selection.end)} (
                    {formatTime(selection.end - selection.start)})
                  </span>
                )}
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-3 md:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MagneticButton
                  size="sm"
                  variant="primary"
                  onClick={togglePlay}
                  disabled={!isReady}
                  className="!px-4 !py-2.5"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
                </MagneticButton>

                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(10, z - 20))}
                    className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--cyan)] transition"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.min(200, z + 20))}
                    className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--cyan)] transition"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "wav" | "mp3")}
                  className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan)]"
                >
                  <option value="wav">WAV</option>
                  <option value="mp3">MP3</option>
                </select>

                <MagneticButton
                  size="sm"
                  variant="secondary"
                  onClick={exportTrimmed}
                  disabled={!selection}
                  className="!px-4"
                >
                  <Scissors className="w-4 h-4" />
                  <span className="hidden sm:inline">Trim & Export</span>
                  <span className="sm:hidden">Export</span>
                </MagneticButton>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 border border-[var(--border-subtle)] relative overflow-hidden">
                {!isPro && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--gold)] bg-[rgba(212,175,55,0.12)] px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" /> Pro
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[var(--magenta)]" />
                  <span className="text-sm font-medium">Producer Tag</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Stamp your name or tag on every export. Metadata + optional audio watermark.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. produced by bZ"
                    value={producerTag}
                    onChange={(e) => setProducerTag(e.target.value)}
                    className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--magenta)] placeholder:text-[var(--text-muted)]"
                  />
                  <MagneticButton size="sm" variant="secondary" onClick={handleProducerTag}>
                    Apply
                  </MagneticButton>
                </div>
              </div>

              <div className="glass rounded-xl p-4 border border-[var(--border-subtle)] relative overflow-hidden">
                {!isPro && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--gold)] bg-[rgba(212,175,55,0.12)] px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" /> Pro
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[var(--cyan)]" />
                  <span className="text-sm font-medium">Bulk Process</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Drop multiple tracks. Same selection relative or absolute. Batch export.
                </p>
                <MagneticButton size="sm" variant="secondary" onClick={handleBulk} className="w-full">
                  {bulkFiles.length > 0 ? `${bulkFiles.length} files ready` : "Select multiple files"}
                </MagneticButton>
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={onBulkSelect}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProGateModal
        open={showProModal}
        feature={proFeature}
        onClose={() => setShowProModal(false)}
      />
    </div>
  );
}
