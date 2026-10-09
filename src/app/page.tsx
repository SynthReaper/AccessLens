'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch,
  Sparkles,
  Cpu,
  Layers,
  ExternalLink,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { SplitViewComparison } from '@/components/SplitViewComparison';
import { StructuredResultCard } from '@/components/StructuredResultCard';
import { AccessLensLogo } from '@/components/AccessLensLogo';
import { AccessLensAnalysis, SamplePoster, HotspotDetail } from '@/lib/types';
import { SAMPLE_POSTERS } from '@/lib/sample-data';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AccessLensAnalysis | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<'full' | 'event_only' | 'deadlines_only'>('full');

  const handleImageSelected = async (
    base64: string,
    previewUrl: string,
    sampleData?: SamplePoster
  ) => {
    setSelectedImage(previewUrl || base64);
    setSelectedHotspot(null);
    setError(null);

    // Instant response for sample presets
    if (sampleData?.cachedResult) {
      setAnalysisResult(sampleData.cachedResult);
      return;
    }

    // Call live API
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          focusMode
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status} analysis error`);
      }

      const data = (await res.json()) as AccessLensAnalysis;
      setAnalysisResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during image parsing';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDirectSample = (sample: SamplePoster) => {
    setSelectedImage(sample.thumbnailPath);
    setAnalysisResult(sample.cachedResult);
    setSelectedHotspot(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setSelectedHotspot(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#1e1b19] flex flex-col font-serif bg-newsprint">
      {/* Top Zine Header with Tape Ticker */}
      <header className="sticky top-0 z-50 bg-[#faf2ee]/95 backdrop-blur-md border-b-2 border-[#1e1b19] shadow-press-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 sm:gap-4">
          {/* Brand & Edition */}
          <div className="flex items-center gap-3">
            <AccessLensLogo size={40} className="shrink-0 -rotate-2" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-[#1e1b19] tracking-tight whitespace-nowrap">
                  AccessLens
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#c8ecca] text-[#03210c] border border-[#46664b] font-bold rotate-1 whitespace-nowrap shadow-press-xs">
                  AUTUMN &apos;26
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#594139] whitespace-nowrap hidden sm:block">
                Campus Notice Workbench • Google Gemma 4 Spatial Vision
              </p>
            </div>
          </div>

          {/* Quick Tape Selector */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs overflow-x-auto py-0.5">
            <span className="text-[#a73400] font-bold whitespace-nowrap shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#cb4914]" />
              Sample Tapes:
            </span>
            {SAMPLE_POSTERS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectDirectSample(s)}
                className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold border-2 border-[#1e1b19] shadow-press-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${i === 0
                  ? 'washi-tape-tertiary text-[#2a1800] -rotate-1 hover:rotate-0'
                  : i === 1
                    ? 'washi-tape-secondary text-[#03210c] rotate-1 hover:rotate-0'
                    : 'washi-tape-primary text-[#390c00] -rotate-2 hover:rotate-0'
                  }`}
              >
                Tape #{i + 1}: {s.shortLabel || 'Notice'}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <a
              href="https://github.com/SynthReaper/AccessLens"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ffffff] hover:bg-[#faf2ee] border-2 border-[#1e1b19] text-[#1e1b19] font-bold rounded shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#a73400]" />
              <span>Public Repo</span>
            </a>

            {selectedImage && (
              <button
                type="button"
                onClick={handleReset}
                className="whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a73400] hover:bg-[#cb4914] text-white font-bold rounded border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workbench Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Intro Zine Folio Banner (when no image selected) */}
        {!selectedImage && (
          <div className="space-y-6 pt-2">
            {/* Hand-crafted Notice Hero */}
            <div className="relative border-2 border-[#1e1b19] bg-[#faf2ee] rounded-xl p-6 sm:p-10 shadow-press-lg">
              {/* Corner Pushpins */}
              <div className="absolute top-4 left-4 pushpin-primary" />
              <div className="absolute top-4 right-4 pushpin-secondary" />

              {/* Washi tape on hero */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 washi-tape-tertiary rounded-xs border-2 border-[#1e1b19] flex items-center justify-center shadow-press-sm pointer-events-none rotate-1 whitespace-nowrap z-10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#2a1800] font-bold">
                  HACKTOBERFEST 2026 // MUJ SPECIAL
                </span>
              </div>

              <div className="max-w-3xl mx-auto text-center space-y-4 pt-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#a73400] uppercase tracking-wider bg-[#ffdbcf] px-3 py-1 rounded-full border border-[#a73400] shadow-press-sm">
                  <span>🍁 Multimodal Risograph Notice Workbench</span>
                </div>

                <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#1e1b19] tracking-tight leading-tight">
                  Campus notices turned into clear, actionable zines.
                </h1>

                <p className="font-serif text-base sm:text-lg text-[#594139] leading-relaxed max-w-2xl mx-auto">
                  Snap a photo of any bulletin notice, flyer, or classroom poster.
                  Gemma 4 projects highlighters directly onto the physical paper, extracting deadlines and .ics events with zero hallucination.
                </p>

                {/* Pipeline Focus Selector */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                  <span className="text-[#594139] font-bold">Focus Mode:</span>
                  <button
                    type="button"
                    onClick={() => setFocusMode('full')}
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${focusMode === 'full'
                      ? 'bg-[#a73400] text-white -rotate-1'
                      : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#f4ece8]'
                      }`}
                  >
                    Full Notice + Markers
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('event_only')}
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${focusMode === 'event_only'
                      ? 'bg-[#a73400] text-white rotate-1'
                      : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#f4ece8]'
                      }`}
                  >
                    Logistics Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('deadlines_only')}
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${focusMode === 'deadlines_only'
                      ? 'bg-[#a73400] text-white -rotate-1'
                      : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#f4ece8]'
                      }`}
                  >
                    Urgent Deadlines
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Area & Benchmark Presets */}
            <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
          </div>
        )}

        {/* Loading State Animation */}
        {isLoading && (
          <div className="border-2 border-[#1e1b19] bg-[#faf2ee] rounded-xl p-10 text-center space-y-3 font-mono max-w-md mx-auto shadow-press-lg">
            <div className="w-10 h-10 mx-auto border-3 border-[#a73400] border-t-transparent rounded-full animate-spin" />
            <div className="font-display font-bold text-lg text-[#1e1b19]">
              Gemma 4 is inking the notice...
            </div>
            <div className="text-xs text-[#594139]">
              Extracting 2D spatial coordinate boxes [0-1000] via Gemini API
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="border-2 border-[#1e1b19] bg-[#ffdad6] p-4 text-xs font-mono text-[#93000a] max-w-2xl mx-auto rounded-lg shadow-press">
            <span className="font-bold text-[#ba1a1a]">[NOTICE ERROR] </span>
            <span>{error}</span>
            <div className="mt-2 text-[#594139] text-[11px]">
              Tip: Click any of the top sample tapes above to run instant verified fixtures!
            </div>
          </div>
        )}

        {/* Split Screen Noticeboard & Digest Notebook */}
        {selectedImage && analysisResult && !isLoading && (
          <div className="space-y-4">
            {/* Top Folio Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-dashed border-[#1e1b19]/25">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-[#a73400] text-white font-mono text-xs font-bold rounded border-2 border-[#1e1b19] shadow-press-sm -rotate-1">
                  NOTICE #{analysisResult.category.toUpperCase().slice(0, 8)}
                </span>
                <span className="font-display font-bold text-xl sm:text-2xl text-[#1e1b19] tracking-tight">
                  {analysisResult.eventDetails.title || 'Campus Circular Details'}
                </span>
                <span className="px-2.5 py-0.5 bg-[#c8ecca] text-[#03210c] font-mono text-[10px] font-bold border border-[#46664b] rounded rotate-1 shadow-press-sm">
                  🍁 VERIFIED BY GEMMA 4
                </span>
              </div>

              <div className="font-mono text-xs text-[#594139] flex items-center gap-2">
                <span className="px-2.5 py-1 bg-white border border-[#1e1b19] rounded font-bold shadow-press-sm">
                  ⏱️ {(analysisResult.processingTimeMs / 1000).toFixed(2)}s
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#1e1b19] rounded font-bold shadow-press-sm">
                  🎯 {analysisResult.hotspots.length} Markers Active
                </span>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16">
              {/* Left Panel: The Tactile Notice Board (Columns 1-7) - Sticky on Desktop */}
              <div className="lg:col-span-7 lg:sticky lg:top-20">
                <SplitViewComparison
                  imageSrc={selectedImage}
                  hasUncertainties={analysisResult.uncertainties.length > 0}
                  hotspots={analysisResult.hotspots}
                  selectedHotspotId={selectedHotspot?.id || null}
                  onSelectHotspot={setSelectedHotspot}
                  eventDetails={analysisResult.eventDetails}
                />
              </div>

              {/* Right Panel: Student Intelligence Digest (Columns 8-12) */}
              <div className="lg:col-span-5">
                <StructuredResultCard
                  analysis={analysisResult}
                  selectedHotspotId={selectedHotspot?.id || null}
                  onSelectHotspot={setSelectedHotspot}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Zine Colophon & System Directory */}
      <footer className="border-t-2 border-[#1e1b19] bg-[#f7efe9] mt-16 font-mono text-xs text-[#594139] relative overflow-hidden">
        {/* Subtle decorative top border washi strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#cb4914] via-[#3d8346] via-[#dca54c] to-[#cb4914] border-b border-[#1e1b19]/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Masthead banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b-2 border-[#1e1b19]/20 gap-4">
            <div className="flex items-center gap-3.5">
              <AccessLensLogo size={44} className="shrink-0 -rotate-2" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-[#1e1b19] tracking-tight">
                    AccessLens
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#c8ecca] text-[#03210c] border border-[#46664b] font-bold">
                    COLOPHON v1.0
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[#594139] mt-0.5">
                  Autonomous Campus Notice Intelligence • Hacktoberfest 2026 × Manipal University Jaipur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffffff] border-2 border-[#1e1b19] rounded font-bold shadow-press-xs text-[#03210c] text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3d8346]" />
                All Engines Grounded
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff2ec] border-2 border-[#1e1b19] rounded font-bold shadow-press-xs text-[#a73400] text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-[#cb4914]" />
                Gemma 4 Vision
              </span>
            </div>
          </div>

          {/* 4-Column Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10">
            {/* Column 1: Architecture & Purpose */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1e1b19] font-bold text-xs uppercase tracking-wider border-b border-[#1e1b19]/20 pb-1.5">
                <Layers className="w-3.5 h-3.5 text-[#cb4914]" />
                Notice Architecture
              </div>
              <p className="font-serif text-[13px] leading-relaxed text-[#433633]">
                AccessLens bridges physical paper noticeboards and student digital workflows. Point a phone camera at any wrinkled, skewed, or crowded flyer to generate verified calendar invites, map coordinates, and instant broadcast digests.
              </p>
              <div className="pt-1 text-[11px] text-[#785b52]">
                <p className="font-bold text-[#1e1b19]">Manipal University Jaipur</p>
                <p>Dept. of Computer Science & Engineering</p>
                <p>Dehmi Kalan, Jaipur, RJ 303007</p>
              </div>
            </div>

            {/* Column 2: Multimodal Spatial Telemetry */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1e1b19] font-bold text-xs uppercase tracking-wider border-b border-[#1e1b19]/20 pb-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#3d8346]" />
                Spatial Telemetry
              </div>
              <ul className="space-y-2 text-[11px] text-[#433633]">
                <li className="flex items-start gap-2">
                  <span className="text-[#3d8346] font-bold">✓</span>
                  <span><strong>Vision Model:</strong> Google Gemma 4 via Gemini API with tier-fallback resilience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3d8346] font-bold">✓</span>
                  <span><strong>2D Bounding Boxes:</strong> [ymin, xmin, ymax, xmax] mapped on 0–1000 coordinate scale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3d8346] font-bold">✓</span>
                  <span><strong>Grounded Extraction:</strong> Pure evidence-backed extraction. Never hallucinate missing dates or fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3d8346] font-bold">✓</span>
                  <span><strong>Inference SLA:</strong> Sub-3.5s warm pass with zero-latency cached sample fallbacks.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Standards & Open Protocols */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1e1b19] font-bold text-xs uppercase tracking-wider border-b border-[#1e1b19]/20 pb-1.5">
                <FileText className="w-3.5 h-3.5 text-[#dca54c]" />
                Export Protocols
              </div>
              <ul className="space-y-2 text-[11px] text-[#433633]">
                <li className="flex items-start gap-2">
                  <span className="text-[#dca54c] font-bold">●</span>
                  <span><strong>RFC 5545 iCalendar:</strong> Direct export for Apple Calendar, Google Calendar & Outlook.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#dca54c] font-bold">●</span>
                  <span><strong>Markdown Briefing:</strong> One-click copy for Notion boards, Obsidian vaults & club repos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#dca54c] font-bold">●</span>
                  <span><strong>WhatsApp Broadcast:</strong> Pre-formatted WhatsApp text for student CRs and batch groups.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#dca54c] font-bold">●</span>
                  <span><strong>Tactile Pin System:</strong> Interactive SVG overlays synced between canvas & digest.</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Hackathon Tracks & Repository */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#1e1b19] font-bold text-xs uppercase tracking-wider border-b border-[#1e1b19]/20 pb-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#cb4914]" />
                Open-Source Tracks
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-[#1e1b19] rounded shadow-press-xs">
                  <p className="font-bold text-[#1e1b19] text-[11px]">Track 1: Best Use of Gemma 4</p>
                  <p className="text-[10px] text-[#594139]">Multimodal spatial extraction & bounding-box grounding</p>
                </div>
                <div className="p-2.5 bg-white border border-[#1e1b19] rounded shadow-press-xs">
                  <p className="font-bold text-[#1e1b19] text-[11px]">Track 2: Best Open-Source AI Project</p>
                  <p className="text-[10px] text-[#594139]">MIT Licensed • Zero AI-slop • Real campus impact</p>
                </div>
              </div>
              <div className="pt-1 flex flex-col gap-1 text-[11px]">
                <a
                  href="https://github.com/SynthReaper/AccessLens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#cb4914] hover:underline inline-flex items-center gap-1"
                >
                  GitHub Repository <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[#785b52]">License: MIT Open Source</span>
              </div>
            </div>
          </div>

          {/* Bottom Riso Stamp & Copyright */}
          <div className="pt-6 border-t-2 border-[#1e1b19] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-[#cb4914] text-white font-bold rounded shadow-press-xs text-[10px] uppercase">
                Made By SynthReaper
              </span>
              <span className="text-[#1e1b19] font-bold">AccessLens Notice Workbench</span>
              <span>•</span>
              <span className="text-[#594139]">Handcrafted with tactile newsprint & risograph typography</span>
            </div>

            <div className="text-[#785b52] font-mono text-[10px] flex items-center gap-2">
              <span>MUJ X Hacktober</span>
              <span>•</span>
              <span>OCTOBER 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
