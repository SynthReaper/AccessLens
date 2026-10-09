'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye } from 'lucide-react';

interface SplitViewComparisonProps {
  imageSrc: string;
  hasUncertainties: boolean;
}

export const SplitViewComparison: React.FC<SplitViewComparisonProps> = ({
  imageSrc,
  hasUncertainties
}) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoom(1);

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-zinc-200">Source Notice Reference</span>
          {hasUncertainties && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Check Flagged Areas
            </span>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-zinc-800/80 rounded-md p-0.5 border border-zinc-700">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] text-zinc-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset Zoom"
            className="p-1 hover:bg-zinc-700 rounded text-zinc-300 hover:text-white border-l border-zinc-700 ml-0.5"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Image display canvas */}
      <div className="relative flex-1 min-h-[420px] max-h-[640px] overflow-auto flex items-center justify-center p-4 bg-zinc-950/80">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 flex items-center justify-center max-w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Source Campus Poster"
            className="max-h-[580px] w-auto rounded-lg shadow-2xl border border-zinc-800 object-contain select-none"
          />
        </div>
      </div>

      <div className="px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Always verify critical deadlines with the source text</span>
        <span className="font-mono text-zinc-400">Side-by-side Verification</span>
      </div>
    </div>
  );
};
