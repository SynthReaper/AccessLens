'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink, X } from 'lucide-react';
import { matchCampusVenue, MujCampusLocation } from '@/lib/campus-directory';

interface CampusMapModalProps {
  venueText: string | null;
  onClose: () => void;
}

export const CampusMapModal: React.FC<CampusMapModalProps> = ({
  venueText,
  onClose
}) => {
  const location: MujCampusLocation | null = matchCampusVenue(venueText);

  if (!location) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1b19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#faf2ee] border-3 border-[#1e1b19] rounded-2xl shadow-press-xl overflow-hidden flex flex-col font-sans">
        {/* Washi tape header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#1e1b19] bg-[#ffffff]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#46664b]" />
            <span className="font-mono text-xs font-bold text-[#1e1b19] uppercase tracking-wider">
              MUJ Campus Wayfinder &bull; Indoor Pin
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg border border-[#1e1b19] bg-[#faf2ee] hover:bg-[#e9e1dd] text-[#1e1b19]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          {/* Target venue banner */}
          <div className="p-3.5 bg-[#c8ecca]/30 border-2 border-[#1e1b19] rounded-xl shadow-press-xs">
            <span className="font-mono text-[10px] text-[#46664b] uppercase font-bold block">
              Parsed Venue From Notice
            </span>
            <h3 className="font-display font-extrabold text-lg text-[#1e1b19]">
              {venueText || 'Manipal University Jaipur'}
            </h3>
          </div>

          {/* Matched building details */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#a73400] w-24 shrink-0">BUILDING:</span>
              <span className="text-[#1e1b19] font-medium">{location.building}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#a73400] w-24 shrink-0">FLOOR / WING:</span>
              <span className="text-[#1e1b19] font-medium">{location.floor}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#a73400] w-24 shrink-0">LANDMARKS:</span>
              <span className="text-[#1e1b19] font-medium">{location.landmarks}</span>
            </div>
          </div>

          {/* Visual Campus Floorplan Representation */}
          <div className="p-4 bg-[#fff8f5] border-2 border-dashed border-[#1e1b19] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#46664b] text-white flex items-center justify-center font-bold text-sm shadow-press-xs">
                {location.code.slice(0, 3)}
              </div>
              <div>
                <p className="font-bold text-xs text-[#1e1b19]">{location.name}</p>
                <p className="font-mono text-[10px] text-[#8d7168]">Manipal University Jaipur, RJ 303007</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-4 border-t-2 border-[#1e1b19] bg-[#ffffff] flex items-center justify-between gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#faf2ee] hover:bg-[#e9e1dd] text-[#1e1b19] font-bold rounded-lg border border-[#1e1b19]"
          >
            Close
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.googleMapsQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#46664b] hover:bg-[#345239] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
