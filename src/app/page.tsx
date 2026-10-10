'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch,
  SlidersHorizontal,
  Activity
} from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { SplitViewComparison } from '@/components/SplitViewComparison';
import { StructuredResultCard } from '@/components/StructuredResultCard';
import { AccessLensAnalysis, SamplePoster, HotspotDetail } from '@/lib/types';

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

    // If it's a sample and pre-cached, provide instant response while allowing live re-run
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

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setSelectedHotspot(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] text-[#f8fafc] flex flex-col font-sans canvas-grid">
      {/* Precision Instrument Header */}
      <header className="border-b border-[#1e2230] bg-[#0e1017]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#f97316] flex items-center justify-center font-mono text-[11px] font-black text-black">
                AL
              </div>
              <span className="font-bold text-sm tracking-tight text-white font-mono">
                ACCESSLENS / SPATIAL-CORE
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 border-l border-[#1e2230] pl-4 font-mono text-[11px] text-[#64748b]">
              <span className="text-[#38bdf8]">GEMMA-4-31B</span>
              <span>•</span>
              <span>2D BOUNDING COORDINATES [0-1000]</span>
              <span>•</span>
              <span>HACKTOBERFEST MUJ</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <a
              href="https://github.com/accesslens/accesslens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141724] hover:bg-[#1a1f30] border border-[#1e2230] text-[#94a3b8] hover:text-white transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>GitHub</span>
            </a>

            {selectedImage && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f97316] hover:bg-[#ea580c] text-black font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Canvas</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Compact Instrument Controller (When no image selected) */}
        {!selectedImage && (
          <div className="space-y-6 pt-2">
            <div className="border border-[#1e2230] bg-[#0e1017] p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#38bdf8] uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Physical Campus Notice to Structured Action Matrix</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Multimodal 2D Spatial Grounding for Real-World Signs &amp; Posters
                </h1>
                <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                  Extracts confirmed logistics, RFC 5545 calendar entries, and urgent deadlines directly from raw imagery.
                  Coordinates ($ymin, xmin, ymax, xmax$) project interactive hotspot targets directly onto the original photo.
                </p>
              </div>

              {/* Focus Selector */}
              <div className="space-y-2 shrink-0 font-mono text-xs">
                <div className="text-[10px] uppercase text-[#64748b] tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-[#f97316]" />
                  <span>Pipeline Focus Filter</span>
                </div>
                <div className="inline-flex border border-[#1e2230] bg-[#121520] p-0.5">
                  <button
                    type="button"
                    onClick={() => setFocusMode('full')}
                    className={`px-3 py-1 text-xs transition-colors ${
                      focusMode === 'full'
                        ? 'bg-[#f97316] text-black font-bold'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Full Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('event_only')}
                    className={`px-3 py-1 text-xs transition-colors ${
                      focusMode === 'event_only'
                        ? 'bg-[#f97316] text-black font-bold'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Logistics Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFocusMode('deadlines_only')}
                    className={`px-3 py-1 text-xs transition-colors ${
                      focusMode === 'deadlines_only'
                        ? 'bg-[#f97316] text-black font-bold'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    Deadlines
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Area & Presets */}
            <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
          </div>
        )}

        {/* Loading Telemetry Bar */}
        {isLoading && (
          <div className="border border-[#1e2230] bg-[#0e1017] p-8 text-center space-y-3 font-mono max-w-lg mx-auto">
            <div className="w-8 h-8 mx-auto border-2 border-[#f97316] border-t-transparent animate-spin" />
            <div className="text-sm font-bold text-white">
              ANALYZING MULTIMODAL SPATIAL TOKENS...
            </div>
            <div className="text-xs text-[#64748b]">
              Gemma 4 resolving 2D coordinate boxes [0-1000] via Google GenAI SDK
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="border border-[#dc2626] bg-[#2a0e10] p-4 text-xs font-mono text-[#fca5a5] max-w-2xl mx-auto flex items-start gap-3">
            <span className="font-bold text-[#ef4444]">[API ERROR]</span>
            <div className="space-y-1">
              <div>{error}</div>
              <div className="text-[#94a3b8] text-[11px]">
                Switch to verified campus samples to inspect complete offline fixtures.
              </div>
            </div>
          </div>
        )}

        {/* Studio Split-Screen Inspection Matrix */}
        {selectedImage && analysisResult && !isLoading && (
          <div className="space-y-3">
            {/* Viewport Status Header */}
            <div className="border border-[#1e2230] bg-[#0e1017] px-4 py-2 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="font-bold text-white">SPATIAL EXTRACTION ACTIVE</span>
                <span className="text-[#64748b] hidden sm:inline">|</span>
                <span className="text-[#38bdf8] hidden sm:inline">{analysisResult.hotspots.length} DETECTED HOTSPOTS</span>
              </div>

              <div className="flex items-center gap-4 text-[#94a3b8]">
                <span>LATENCY: {(analysisResult.processingTimeMs / 1000).toFixed(2)}s</span>
                <span>MODEL: {analysisResult.modelUsed.split(' ')[0]}</span>
              </div>
            </div>

            {/* Split View Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Left Column: Interactive Spatial Canvas */}
              <div className="h-full">
                <SplitViewComparison
                  imageSrc={selectedImage}
                  hasUncertainties={analysisResult.uncertainties.length > 0}
                  hotspots={analysisResult.hotspots}
                  selectedHotspotId={selectedHotspot?.id || null}
                  onSelectHotspot={setSelectedHotspot}
                  eventDetails={analysisResult.eventDetails}
                />
              </div>

              {/* Right Column: Structured Knowledge Extraction Deck */}
              <div className="h-full">
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

      {/* Technical Footer */}
      <footer className="border-t border-[#1e2230] bg-[#0a0b0f] py-4 mt-8 font-mono text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">ACCESSLENS</span>
            <span>•</span>
            <span>HACKTOBERFEST 2026 × MANIPAL UNIVERSITY JAIPUR</span>
          </div>
          <div>
            <span>OPEN WEIGHTS MULTIMODAL INFERENCE VIA GEMINI API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
