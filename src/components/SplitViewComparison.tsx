'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers } from 'lucide-react';
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
    <div className="relative flex flex-col h-full rounded-xl border-2 border-[#1e1b19] bg-[#f4ece8] shadow-press-lg overflow-hidden">
      {/* Top Washi Tape Strips (Physical Adhesives) */}
      <div className="absolute -top-2 left-12 w-32 h-6 washi-tape-tertiary -rotate-2 rounded-xs shadow-press-sm z-30 pointer-events-none flex items-center justify-center">
        <span className="font-mono text-[9px] text-[#2a1800] tracking-widest uppercase font-bold">WASHI TAPE // #08</span>
      </div>
      <div className="absolute -top-2 right-16 w-36 h-6 washi-tape-primary rotate-3 rounded-xs shadow-press-sm z-30 pointer-events-none flex items-center justify-center">
        <span className="font-mono text-[9px] text-[#390c00] tracking-widest uppercase font-bold">AUTUMN NOTICE POST</span>
      </div>

      {/* Zine Canvas Utility Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1e1b19] bg-[#faf2ee] text-xs pt-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a73400] inline-block animate-pulse" />
          <span className="font-display font-bold text-sm text-[#1e1b19]">Notice Bulletin Board</span>
          {hasUncertainties && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#ffddb6] text-[#2a1800] border border-[#805200] font-bold rotate-1">
              🍂 Torn Corner Noted
            </span>
          )}
        </div>

        {/* Stationery Controls */}
        <div className="flex items-center gap-2">
          {/* Highlighter Toggle */}
          {hotspots.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOverlay(!showOverlay)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[11px] font-bold border-2 border-[#1e1b19] shadow-press-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                showOverlay
                  ? 'bg-[#c8ecca] text-[#03210c]'
                  : 'bg-[#faf2ee] text-[#594139] hover:bg-[#e9e1dd]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Highlighters [{showOverlay ? 'ON' : 'OFF'}]</span>
            </button>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-[#ffffff] rounded border-2 border-[#1e1b19] shadow-press-sm p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 hover:bg-[#f4ece8] rounded text-[#1e1b19]"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-bold text-[#1e1b19]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 hover:bg-[#f4ece8] rounded text-[#1e1b19]"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Zoom"
              className="p-1 hover:bg-[#f4ece8] rounded text-[#1e1b19] border-l border-[#1e1b19] ml-0.5"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Poster Board (Heavy Newsprint Canvas) */}
      <div className="relative flex-1 min-h-[580px] max-h-[740px] overflow-auto flex items-center justify-center p-8 bg-[#fff8f5] bg-newsprint">
        {/* Pushpins in corners */}
        <div className="absolute top-4 left-4 pushpin-primary z-20" />
        <div className="absolute top-4 right-4 pushpin-secondary z-20" />

        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="relative transition-transform duration-150 inline-flex flex-col items-center justify-center max-w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Source Campus Poster"
            className="w-auto h-auto max-h-[640px] max-w-full min-w-[320px] sm:min-w-[420px] rounded-lg border-2 border-[#1e1b19] shadow-press-xl object-contain select-none block bg-white"
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

      {/* Sticky Note Footer Strip */}
      <div className="px-4 py-2.5 bg-[#faf2ee] border-t-2 border-[#1e1b19] flex items-center justify-between text-xs font-mono text-[#594139]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#a73400] font-bold">📌 Pinned Memo:</span>
          <span>Click any marker to reveal verified data &amp; export links.</span>
        </div>
        <span className="px-2 py-0.5 bg-[#c8ecca] text-[#03210c] border border-[#46664b] font-bold rounded -rotate-1">
          Gemma 4 Spatial Vision
        </span>
      </div>
    </div>
  );
};
