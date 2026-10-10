'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Sliders } from 'lucide-react';
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
  const [isDeskewEnhanced, setIsDeskewEnhanced] = useState(false);
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
    <div className="relative flex flex-col rounded-xl border-2 border-[#1e1b19] bg-[#f4ece8] shadow-press-lg overflow-hidden">
      {/* Zine Canvas Utility Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1e1b19] bg-[#faf2ee] text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-4 h-4 pushpin-primary shrink-0" />
          <span className="font-display font-bold text-sm text-[#1e1b19]">Notice Bulletin Board</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded washi-tape-tertiary text-[#2a1800] border border-[#1e1b19] font-bold shadow-press-sm -rotate-1">
            FOLIO #08
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded washi-tape-primary text-[#390c00] border border-[#1e1b19] font-bold shadow-press-sm rotate-1">
            🍁 PINNED FLYER
          </span>
          {hasUncertainties && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#ffddb6] text-[#2a1800] border border-[#805200] font-bold rotate-1">
              🍂 Physical Anomaly Noted
            </span>
          )}
        </div>

        {/* Stationery Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* De-skew / Perspective Enhance Toggle */}
          <button
            type="button"
            onClick={() => setIsDeskewEnhanced(!isDeskewEnhanced)}
            className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] font-bold border-2 border-[#1e1b19] shadow-press-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              isDeskewEnhanced
                ? 'bg-[#cb4914] text-white'
                : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#faf2ee]'
            }`}
            title="Auto-contrast & scan clarity enhance"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Enhance [{isDeskewEnhanced ? 'ON' : 'OFF'}]</span>
          </button>

          {/* Highlighter Toggle */}
          {hotspots.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOverlay(!showOverlay)}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] font-bold border-2 border-[#1e1b19] shadow-press-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                showOverlay
                  ? 'bg-[#c8ecca] text-[#03210c]'
                  : 'bg-[#faf2ee] text-[#594139] hover:bg-[#e9e1dd]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pins [{showOverlay ? 'ON' : 'OFF'}]</span>
            </button>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-[#ffffff] rounded border-2 border-[#1e1b19] shadow-press-sm p-0.5 shrink-0">
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
          <div className="w-4 h-4 pushpin-secondary shrink-0 hidden sm:block ml-1" />
        </div>
      </div>

      {/* Pinned Poster Board (Heavy Newsprint Canvas) */}
      <div className="relative flex-1 min-h-[580px] max-h-[760px] overflow-auto flex items-center justify-center p-6 sm:p-8 bg-[#fff8f5] bg-newsprint">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="relative transition-transform duration-150 inline-block max-w-full my-3"
        >
          {/* Diagonal Corner Washi Tapes Fastening the Flyer to Corkboard */}
          <div className="absolute -top-2.5 -left-2.5 w-10 h-3.5 washi-tape-primary border border-[#1e1b19] -rotate-45 shadow-press-sm z-30 pointer-events-none" />
          <div className="absolute -top-2.5 -right-2.5 w-10 h-3.5 washi-tape-secondary border border-[#1e1b19] rotate-45 shadow-press-sm z-30 pointer-events-none" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Source Campus Poster"
            style={{
              filter: isDeskewEnhanced ? 'contrast(1.22) brightness(1.05) saturate(1.1)' : 'none'
            }}
            className="w-auto h-auto max-w-full max-h-[640px] rounded-lg border-2 border-[#1e1b19] shadow-press-xl object-contain select-none block bg-white mx-auto transition-all"
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
