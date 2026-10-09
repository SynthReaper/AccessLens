'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { SplitViewComparison } from '@/components/SplitViewComparison';
import { StructuredResultCard } from '@/components/StructuredResultCard';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Edition */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#a73400] text-white flex items-center justify-center font-display font-black text-lg border-2 border-[#1e1b19] shadow-press-sm rotate-[-2deg]">
              AL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-[#1e1b19] tracking-tight">
                  AccessLens
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#c8ecca] text-[#03210c] border border-[#46664b] font-bold rotate-1">
                  ZINE v1.0
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#594139] hidden sm:block">
                Campus Notice Workbench • Google Gemma 4 Spatial Vision
              </p>
            </div>
          </div>

          {/* Quick Tape Selector */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <span className="text-[#a73400] font-bold">📌 Sample Tapes:</span>
            {SAMPLE_POSTERS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectDirectSample(s)}
                className={`px-3 py-1 rounded text-[11px] font-bold border-2 border-[#1e1b19] shadow-press-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  i === 0
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
          <div className="flex items-center gap-2 font-mono text-xs">
            <a
              href="https://github.com/accesslens/accesslens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ffffff] hover:bg-[#faf2ee] border-2 border-[#1e1b19] text-[#1e1b19] font-bold rounded shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#a73400]" />
              <span className="hidden sm:inline">Public Repo</span>
            </a>

            {selectedImage && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#a73400] hover:bg-[#cb4914] text-white font-bold rounded border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
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
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                      focusMode === 'full'
                        ? 'bg-[#a73400] text-white -rotate-1'
                        : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#f4ece8]'
                    }`}
                  >
                    Full Notice + Markers
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('event_only')}
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                      focusMode === 'event_only'
                        ? 'bg-[#a73400] text-white rotate-1'
                        : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#f4ece8]'
                    }`}
                  >
                    Logistics Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('deadlines_only')}
                    className={`px-3 py-1.5 rounded font-bold border-2 border-[#1e1b19] shadow-press-sm transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                      focusMode === 'deadlines_only'
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

      {/* Footer Strip */}
      <footer className="border-t-2 border-[#1e1b19] bg-[#faf2ee] py-5 mt-10 font-mono text-xs text-[#594139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1e1b19]">AccessLens</span>
            <span>•</span>
            <span>Warm Autumn Zine Edition</span>
            <span>•</span>
            <span>Hacktoberfest 2026 × MUJ</span>
          </div>
          <div>
            <span>Powered by Google Gemma 4 (Gemini API) • Open-Source MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
