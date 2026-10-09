'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye, Layers } from 'lucide-react';
import { HotspotDetail, EventDetails } from '@/lib/types';
import { HotspotOverlayLayer, HotspotPopoverCard } from './HotspotOverlay';
import { downloadIcsFile } from '@/lib/calendar-export';

interface SplitViewComparisonProps {
  imageSrc: string;
  hasUncertainties: boolean;
  hotspots?: HotspotDetail[];
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: HotspotDetail | null) => void;
  eventDetails?: EventDetails;
}

export const SplitViewComparison: React.FC<SplitViewComparisonProps> = ({
  imageSrc,
  hasUncertainties,
  hotspots = [],
  selectedHotspotId = null,
  onSelectHotspot,
  eventDetails
}) => {
  const [zoom, setZoom] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<HotspotDetail | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setZoom(1);

  const handleHotspotClick = (hs: HotspotDetail) => {
    setActiveHotspot(hs);
    if (onSelectHotspot) {
      onSelectHotspot(hs);
    }
  };

  const handleAddCalendar = (_label: string, textValue?: string) => {
    if (eventDetails) {
      downloadIcsFile(eventDetails, textValue);
    }
  };

  return (
    <div className="relative flex flex-col h-full rounded-xl border border-[#252a38] bg-[#11131a] overflow-hidden shadow-sm">
      {/* Precision Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#252a38] bg-[#161922] text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-zinc-200">Interactive Spatial Canvas</span>
          {hasUncertainties && (
            <span className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Torn / Unclear Regions
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Overlay Toggle */}
          {hotspots.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOverlay(!showOverlay)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                showOverlay
                  ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                  : 'bg-[#1d212d] border-[#252a38] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3 h-3 text-sky-400" />
              <span>{showOverlay ? 'Hotspots Active' : 'Show Hotspots'}</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#1d212d] rounded p-0.5 border border-[#252a38]">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:bg-[#252a38] rounded text-zinc-300 hover:text-white"
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
              className="p-1 hover:bg-[#252a38] rounded text-zinc-300 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom"
              className="p-1 hover:bg-[#252a38] rounded text-zinc-300 hover:text-white border-l border-[#252a38] ml-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Image display canvas with Hotspots */}
      <div className="relative flex-1 min-h-[580px] max-h-[720px] overflow-auto flex items-center justify-center p-6 bg-[#090a0f] bg-grid-dots">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="relative transition-transform duration-150 inline-flex flex-col items-center justify-center max-w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Source Campus Poster"
            className="w-auto h-auto max-h-[640px] max-w-full min-w-[320px] sm:min-w-[420px] rounded-lg shadow-2xl border border-[#252a38] object-contain select-none block"
          />

          {/* 2D Hotspot Overlays */}
          {showOverlay && hotspots.length > 0 && (
            <HotspotOverlayLayer
              hotspots={hotspots}
              selectedHotspotId={selectedHotspotId || activeHotspot?.id || null}
              hoveredHotspotId={hoveredHotspotId}
              onSelectHotspot={handleHotspotClick}
              onHoverHotspot={setHoveredHotspotId}
            />
          )}
        </div>

        {/* Selected Hotspot Popover Detail */}
        {activeHotspot && (
          <HotspotPopoverCard
            hotspot={activeHotspot}
            onClose={() => {
              setActiveHotspot(null);
              if (onSelectHotspot) onSelectHotspot(null);
            }}
            onAddCalendar={handleAddCalendar}
          />
        )}
      </div>

      {/* Technical Footer bar */}
      <div className="px-4 py-2 bg-[#161922] border-t border-[#252a38] text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Click any highlighted region on the poster to inspect and trigger actions</span>
        <span className="font-mono text-sky-400">Gemma 2D Spatial Grounding</span>
      </div>
    </div>
  );
};
