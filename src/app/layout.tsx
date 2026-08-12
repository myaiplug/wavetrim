import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaveTrim by NoDAW Labs — Precision Audio Trim with Color",
  description:
    "Free cinematic waveform trimmer. Click-drag selection, progressive color build, mobile-first. Unlock producer tags & bulk with Pro. Funnel into the full NoDAW suite.",
  keywords: [
    "audio trimmer",
    "waveform editor",
    "NoDAW",
    "free audio tool",
    "producer watermark",
    "bulk audio process",
  ],
  openGraph: {
    title: "WaveTrim — NoDAW Labs",
    description: "Super simple, premium waveform trim with color that builds as it plays. Free forever core. Pro unlocks tags + bulk.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--bg-deep)] text-[var(--text-primary)] antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-neon)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
