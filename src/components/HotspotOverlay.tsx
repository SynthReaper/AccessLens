'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  AlertTriangle,
  Check,
  Crosshair
} from 'lucide-react';
import { HotspotDetail, Box2D } from '@/lib/types';

interface HotspotOverlayLayerProps {
  hotspots: HotspotDetail[];
  selectedHotspotId: string | null;
  hoveredHotspotId: string | null;
  onSelectHotspot: (hotspot: HotspotDetail) => void;
  onHoverHotspot: (id: string | null) => void;
}

export const HotspotOverlayLayer: React.FC<HotspotOverlayLayerProps> = ({
  hotspots,
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hotspots.map((hs) => {
        const [ymin, xmin, ymax, xmax]: Box2D = hs.box2d;
        const top = `${ymin / 10}%`;
        const left = `${xmin / 10}%`;
        const height = `${Math.max(2.5, (ymax - ymin) / 10)}%`;
        const width = `${Math.max(4.5, (xmax - xmin) / 10)}%`;

        const isSelected = selectedHotspotId === hs.id;
        const isHovered = hoveredHotspotId === hs.id;
        const isInspection = hs.actionType === 'inspect';

        // Intentional typographic & border palette without neon glow slop
        let borderClass = 'border-sky-400/90 bg-sky-500/10 text-sky-200';
        let badgeBg = 'bg-sky-600 text-white';

        if (isInspection) {
          borderClass = 'border-amber-400/90 bg-amber-500/15 text-amber-200 border-dashed';
          badgeBg = 'bg-amber-600 text-white';
        } else if (hs.actionType === 'calendar') {
          borderClass = 'border-emerald-400/90 bg-emerald-500/10 text-emerald-200';
          badgeBg = 'bg-emerald-600 text-white';
        } else if (hs.actionType === 'map') {
          borderClass = 'border-violet-400/90 bg-violet-500/10 text-violet-200';
          badgeBg = 'bg-violet-600 text-white';
        } else if (hs.actionType === 'link') {
          borderClass = 'border-cyan-400/90 bg-cyan-500/10 text-cyan-200';
          badgeBg = 'bg-cyan-600 text-white';
        }

        return (
          <div
            key={hs.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHotspot(hs);
            }}
            onMouseEnter={() => onHoverHotspot(hs.id)}
            onMouseLeave={() => onHoverHotspot(null)}
            style={{ top, left, width, height }}
            className={`absolute pointer-events-auto cursor-pointer rounded-sm transition-all duration-150 border-[1.5px] ${borderClass} ${
              isSelected
                ? 'ring-2 ring-white z-30 scale-[1.01]'
                : isHovered
                ? 'z-20 scale-[1.005] brightness-110'
                : 'z-10 opacity-85 hover:opacity-100'
            }`}
          >
            {/* Tag Badge */}
            <div
              className={`absolute -top-5 left-0 px-1.5 py-0.5 rounded-[3px] text-[9.5px] font-mono font-medium tracking-tight whitespace-nowrap shadow flex items-center gap-1 ${badgeBg} ${
                isSelected ? 'scale-105' : ''
              }`}
            >
              {hs.actionType === 'calendar' && <Calendar className="w-2.5 h-2.5" />}
              {hs.actionType === 'map' && <MapPin className="w-2.5 h-2.5" />}
              {hs.actionType === 'link' && <ExternalLink className="w-2.5 h-2.5" />}
              {hs.actionType === 'inspect' && <AlertTriangle className="w-2.5 h-2.5" />}
              {hs.actionType === 'copy' && <Copy className="w-2.5 h-2.5" />}
              <span>{hs.label}</span>
            </div>

            {/* Corner Crosshair Anchors */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-[1.5px] border-l-[1.5px] border-white" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-[1.5px] border-r-[1.5px] border-white" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-[1.5px] border-l-[1.5px] border-white" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-[1.5px] border-r-[1.5px] border-white" />
          </div>
        );
      })}
    </div>
  );
};

interface HotspotPopoverCardProps {
  hotspot: HotspotDetail;
  onClose: () => void;
  onAddCalendar?: (title: string, dateText?: string) => void;
}

export const HotspotPopoverCard: React.FC<HotspotPopoverCardProps> = ({
  hotspot,
  onClose,
  onAddCalendar
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hotspot.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-84 z-40 bg-[#161922] border border-[#252a38] rounded-lg p-3.5 shadow-2xl space-y-2.5 backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 border-b border-[#252a38] pb-2">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-semibold text-zinc-100">{hotspot.label}</span>
          <span className="text-[10px] font-mono text-zinc-400 capitalize">({hotspot.actionType})</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-[#1d212d]"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-zinc-200 font-mono break-words leading-relaxed bg-[#0e1017] p-2.5 rounded border border-[#1f2430]">
        {hotspot.value || '<Empty text region>'}
      </p>

      {hotspot.note && (
        <div className="text-[11px] text-amber-300 flex items-start gap-1.5 bg-amber-950/40 border border-amber-900/60 p-2 rounded">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>{hotspot.note}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1d212d] hover:bg-[#252a38] text-zinc-200 text-xs font-medium border border-[#252a38] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        {hotspot.actionType === 'calendar' && onAddCalendar && (
          <button
            type="button"
            onClick={() => onAddCalendar(hotspot.label, hotspot.value)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Add to Cal
          </button>
        )}

        {hotspot.actionType === 'link' && (
          <a
            href={hotspot.value.startsWith('http') ? hotspot.value : `https://${hotspot.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Link
          </a>
        )}
      </div>
    </div>
  );
};
