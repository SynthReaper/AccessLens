'use client';

import React from 'react';

interface AccessLensLogoProps {
  className?: string;
  size?: number;
}

export const AccessLensLogo: React.FC<AccessLensLogoProps> = ({
  className = '',
  size = 40
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Physical Pressed Drop-Shadow Tile */}
        <rect x="7" y="7" width="34" height="34" rx="8" fill="#1e1b19" />

        {/* Paper Tile Surface */}
        <rect
          x="5"
          y="5"
          width="34"
          height="34"
          rx="8"
          fill="#faf2ee"
          stroke="#1e1b19"
          strokeWidth="2.5"
        />

        {/* Folded Notice Slip (Vermilion Risograph Paper) */}
        <path
          d="M12 11 H32 C33.1 11 34 11.9 34 13 V31 C34 32.1 33.1 33 32 33 H14 L12 30 V11 Z"
          fill="#ffdbcf"
          stroke="#1e1b19"
          strokeWidth="2"
        />

        {/* Spatial Bounding Corner Brackets [0-1000 Coordinate Reticle] */}
        <path
          d="M15 15 H18 V18"
          stroke="#a73400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 15 H28 V18"
          stroke="#a73400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 29 H18 V26"
          stroke="#a73400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 29 H28 V26"
          stroke="#a73400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Optical Magnifying Lens Aperture */}
        <circle cx="23" cy="22" r="7.5" fill="#ffffff" stroke="#a73400" strokeWidth="2.5" />

        {/* Spatial Crosshair Center */}
        <line x1="23" y1="18" x2="23" y2="26" stroke="#1e1b19" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="19" y1="22" x2="27" y2="22" stroke="#1e1b19" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="23" cy="22" r="1.5" fill="#a73400" />

        {/* Lens Handle */}
        <path d="M28.5 27.5 L33 32" stroke="#1e1b19" strokeWidth="2.5" strokeLinecap="round" />

        {/* Autumn Botanical Sage Leaf Pin */}
        <path
          d="M10 32 C11 29 14 29 16 32 C15 34 12 34 10 32 Z"
          fill="#46664b"
          stroke="#1e1b19"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
