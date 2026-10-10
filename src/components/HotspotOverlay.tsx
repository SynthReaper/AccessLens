'use client';

import React from 'react';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Copy,
  AlertTriangle,
  Check,
  Tag,
  QrCode
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
      {hotspots.map((hs, idx) => {
        const [ymin, xmin, ymax, xmax]: Box2D = hs.box2d;
        const top = `${ymin / 10}%`;
        const left = `${xmin / 10}%`;
        const height = `${Math.max(3, (ymax - ymin) / 10)}%`;
        const width = `${Math.max(5, (xmax - xmin) / 10)}%`;

        const isSelected = selectedHotspotId === hs.id;
        const isHovered = hoveredHotspotId === hs.id;
        const isInspection = hs.actionType === 'inspect';
        const isQr = hs.actionType === 'link' || hs.label.toLowerCase().includes('qr') || hs.label.toLowerCase().includes('link');

        // Warm Autumn Zine Highlighter Palette
        let borderClass = 'border-[#a73400] bg-[#ffdbcf]/30 text-[#390c00]';
        let badgeBg = 'bg-[#a73400] text-white';
        let rotation = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';

        if (isInspection) {
          borderClass = 'border-[#805200] border-dashed bg-[#ffddb6]/35 text-[#2a1800]';
          badgeBg = 'bg-[#805200] text-white';
          rotation = 'rotate-2';
        } else if (hs.actionType === 'calendar') {
          borderClass = 'border-[#46664b] bg-[#c8ecca]/30 text-[#03210c]';
          badgeBg = 'bg-[#46664b] text-white';
          rotation = '-rotate-1';
        } else if (hs.actionType === 'map') {
          borderClass = 'border-[#46664b] bg-[#c8ecca]/30 text-[#03210c]';
          badgeBg = 'bg-[#46664b] text-white';
          rotation = 'rotate-1';
        } else if (hs.actionType === 'link') {
          borderClass = 'border-[#a73400] bg-[#ffdbcf]/30 text-[#390c00]';
          badgeBg = 'bg-[#a73400] text-white';
          rotation = '-rotate-2';
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
            className={`absolute pointer-events-auto cursor-pointer rounded-xs transition-all duration-150 border-2 ${borderClass} ${
              isSelected
                ? 'ring-2 ring-[#1e1b19] z-30 scale-[1.02] shadow-press'
                : isHovered
                ? 'z-20 scale-[1.01] shadow-press-sm'
                : 'z-10 opacity-90 hover:opacity-100'
            }`}
          >
            {/* Hand-marked Zine Tag Chip */}
            <div
              className={`absolute -top-5 left-2 px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold tracking-tight shadow-press-sm flex items-center gap-1 ${badgeBg} ${rotation}`}
            >
              {hs.actionType === 'calendar' && <Calendar className="w-2.5 h-2.5" />}
              {hs.actionType === 'map' && <MapPin className="w-2.5 h-2.5" />}
              {isQr ? <QrCode className="w-2.5 h-2.5" /> : hs.actionType === 'link' ? <ExternalLink className="w-2.5 h-2.5" /> : null}
              {hs.actionType === 'inspect' && <AlertTriangle className="w-2.5 h-2.5" />}
              {hs.actionType === 'copy' && <Tag className="w-2.5 h-2.5" />}
              <span>{hs.label}</span>
            </div>
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
  const isQr = hotspot.actionType === 'link' || hotspot.label.toLowerCase().includes('qr') || hotspot.value.toLowerCase().includes('http');

  const handleCopy = () => {
    navigator.clipboard.writeText(hotspot.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg p-4 shadow-press-lg space-y-3">
      {/* Tape header decoration */}
      <div className="absolute -top-3 left-6 px-3 py-0.5 washi-tape-tertiary rounded-xs border border-[#1e1b19] font-mono text-[9px] font-bold uppercase tracking-wider text-[#2a1800] -rotate-1 shadow-press-sm">
        FIELD NOTE // {hotspot.actionType.toUpperCase()}
      </div>

      <div className="flex items-start justify-between gap-2 pt-1 border-b border-dashed border-[#e1bfb5] pb-2">
        <div className="font-display font-bold text-base text-[#1e1b19] flex items-center gap-1.5">
          {isQr && <QrCode className="w-4 h-4 text-[#a73400]" />}
          <span>{hotspot.label}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#594139] hover:text-[#1e1b19] text-xs font-mono px-1.5 py-0.5 rounded hover:bg-[#e9e1dd]"
        >
          ✕
        </button>
      </div>

      <p className="font-serif text-sm text-[#1e1b19] bg-[#ffffff] p-3 rounded border border-[#e1bfb5] leading-relaxed shadow-sm break-all">
        {hotspot.value || '<Empty region>'}
      </p>

      {hotspot.note && (
        <div className="text-xs font-mono text-[#805200] flex items-start gap-1.5 bg-[#ffddb6]/40 border border-[#805200]/40 p-2 rounded">
          <AlertTriangle className="w-3.5 h-3.5 text-[#805200] shrink-0 mt-0.5" />
          <span>{hotspot.note}</span>
        </div>
      )}

      {/* Tactile Action Buttons */}
      <div className="flex items-center gap-2 pt-1 font-mono text-xs">
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#f4ece8] hover:bg-[#e9e1dd] text-[#1e1b19] font-bold border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#46664b]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {hotspot.actionType === 'calendar' && onAddCalendar && (
          <button
            type="button"
            onClick={() => onAddCalendar(hotspot.label, hotspot.value)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#a73400] hover:bg-[#cb4914] text-white font-bold border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Add to Cal</span>
          </button>
        )}

        {(hotspot.actionType === 'link' || isQr) && (
          <a
            href={hotspot.value.startsWith('http') ? hotspot.value : `https://${hotspot.value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#46664b] hover:bg-[#345239] text-white font-bold border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link</span>
          </a>
        )}
      </div>
    </div>
  );
};
