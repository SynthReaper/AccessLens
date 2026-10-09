'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  GitBranch,
  Layers,
  Crosshair
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">AccessLens</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-sky-400 border border-zinc-700">
                  Gemma 4 Spatial Vision
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Interactive Spatial Notice Intelligence • Hacktoberfest 2026 × MUJ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/accesslens/accesslens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Public Repo</span>
            </a>
            {selectedImage && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Intro Banner when no image selected */}
        {!selectedImage && (
          <div className="max-w-3xl mx-auto text-center space-y-3 pt-4 pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/40 border border-sky-800/60 text-sky-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Gemma 4 Track • 2D Spatial Grounding</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-100">
              Campus signs transformed into clickable hotspots.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Snap any physical poster or circular. Gemma 4 detects 2D bounding coordinates over dates, rooms, and deadlines—floating interactive action buttons directly on the photo.
            </p>

            {/* Mode Selector */}
            <div className="flex items-center justify-center gap-2 pt-2 text-xs">
              <span className="text-zinc-400 font-mono">Focus Mode:</span>
              <button
                type="button"
                onClick={() => setFocusMode('full')}
                className={`px-3 py-1 rounded-md border transition-colors ${
                  focusMode === 'full'
                    ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Full Notice + Spatial Boxes
              </button>
              <button
                type="button"
                onClick={() => setFocusMode('event_only')}
                className={`px-3 py-1 rounded-md border transition-colors ${
                  focusMode === 'event_only'
                    ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Event Logistics Only
              </button>
              <button
                type="button"
                onClick={() => setFocusMode('deadlines_only')}
                className={`px-3 py-1 rounded-md border transition-colors ${
                  focusMode === 'deadlines_only'
                    ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Urgent Deadlines
              </button>
            </div>
          </div>
        )}

        {/* Upload / Selection View */}
        {!selectedImage && (
          <div className="max-w-4xl mx-auto">
            <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />
          </div>
        )}

        {/* Loading State Overlay */}
        {isLoading && (
          <div className="p-12 rounded-xl border border-zinc-800 bg-zinc-900/60 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-100">
                Gemma 4 is localizing 2D spatial coordinates...
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Multimodal bounding box calculation [ymin, xmin, ymax, xmax] via Gemini API
              </p>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/30 text-rose-200 text-sm flex items-start gap-3 max-w-2xl mx-auto">
            <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold">Analysis Notice</div>
              <p className="text-xs text-rose-300">{error}</p>
              <p className="text-[11px] text-zinc-400 mt-2">
                Tip: If running without a live GEMINI_API_KEY, use the instant campus presets on the homepage to explore verified test samples.
              </p>
            </div>
          </div>
        )}

        {/* Split Screen View with Interactive Spatial Overlay */}
        {selectedImage && analysisResult && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Interactive Spatial Canvas + Grounded Extraction</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                <span>Hover or click any box on the photo to trigger actions</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Interactive Poster with Hotspot Bounding Boxes */}
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

              {/* Right Column: Structured Extracted Knowledge & Hotspot Navigator */}
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

      {/* Footer & Hackathon Attribution */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">AccessLens</span>
            <span>• Built for Hacktoberfest 2026 × MUJ</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Model: Google Gemma 4 Spatial Vision (Gemini API)</span>
            <span>•</span>
            <span>License: MIT</span>
            <span>•</span>
            <a
              href="https://ai.google.dev/gemma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline"
            >
              Gemma Open Weights
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
