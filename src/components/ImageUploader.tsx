'use client';

import React, { useRef, useState } from 'react';
import { Camera, FolderOpen } from 'lucide-react';
import { SAMPLE_POSTERS } from '@/lib/sample-data';
import { SamplePoster } from '@/lib/types';

interface ImageUploaderProps {
  onImageSelected: (base64: string, previewUrl: string, sampleData?: SamplePoster) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedSampleId(null);
      onImageSelected(base64, URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SamplePoster) => {
    setSelectedSampleId(sample.id);
    fetch(sample.thumbnailPath)
      .then((res) => res.text())
      .then((svgText) => {
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
        onImageSelected(base64, sample.thumbnailPath, sample);
      })
      .catch(() => {
        onImageSelected('', sample.thumbnailPath, sample);
      });
  };

  return (
    <div className="space-y-6">
      {/* Tactile Pinned Drop Deck */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border-2 border-[#1e1b19] rounded-xl p-8 sm:p-10 text-left cursor-pointer transition-all bg-[#faf2ee] shadow-press-lg ${
          dragActive
            ? 'bg-[#ffdbcf]/50 scale-[1.005]'
            : 'hover:bg-[#fff8f5]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Washi tape header */}
        <div className="absolute -top-3.5 left-8 px-3.5 py-1 washi-tape-secondary -rotate-2 rounded-xs border-2 border-[#1e1b19] flex items-center justify-center shadow-press-sm pointer-events-none whitespace-nowrap z-10">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#03210c] font-bold">
            DROP &amp; PIN APERTURE
          </span>
        </div>

        {/* Pushpins */}
        <div className="absolute top-3 right-4 pushpin-primary" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#a73400] uppercase tracking-wider">
              <span>🍁 Stage 01: Capture Campus Physical Paper</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-[#1e1b19] tracking-tight">
              Snap a notice photo, or drop poster scan
            </h3>
            <p className="font-serif text-sm text-[#594139] max-w-lg leading-relaxed">
              Whiteboard scribbles, taped elevator circulars, or quad fest flyers.
              Gemma 4 projects highlighters directly onto the paper with zero hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#ffffff] hover:bg-[#f4ece8] border-2 border-[#1e1b19] text-[#1e1b19] font-bold rounded-lg shadow-press active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <FolderOpen className="w-4 h-4 text-[#a73400]" />
              <span>Browse File</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#a73400] hover:bg-[#cb4914] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hand-Drawn Washi Sample Tapes */}
      <div className="border-2 border-[#1e1b19] bg-[#ffffff] rounded-xl shadow-press overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[#1e1b19] flex items-center justify-between bg-[#faf2ee]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#1e1b19]">
            <span className="text-[#a73400] text-sm">📌</span>
            <span className="font-bold">VERIFIED SAMPLE TAPES</span>
            <span className="text-[#8d7168] hidden sm:inline">• 1-click test posters from around campus</span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 bg-[#c8ecca] text-[#03210c] border border-[#46664b] rounded shadow-press-sm -rotate-1">
            Gemma 4 Benchmark
          </span>
        </div>

        <div className="divide-y-2 divide-[#1e1b19]">
          {SAMPLE_POSTERS.map((sample, idx) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#ffdbcf]/40 border-l-4 border-l-[#a73400]'
                    : 'hover:bg-[#faf2ee]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-sm font-bold text-[#a73400] mt-0.5 bg-[#faf2ee] w-8 h-8 rounded-lg border-2 border-[#1e1b19] flex items-center justify-center shrink-0 shadow-press-sm">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-base text-[#1e1b19]">
                        {sample.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#fff8f5] border border-[#1e1b19] text-[#594139] shadow-press-sm">
                        {sample.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-serif text-sm text-[#594139] mt-1 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <span className="px-2 py-1 bg-[#faf2ee] border border-[#1e1b19] rounded text-[11px] text-[#594139] font-bold shadow-press-sm">
                    🎯 {sample.cachedResult.hotspots.length} Markers
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ffffff] hover:bg-[#a73400] hover:text-white border-2 border-[#1e1b19] rounded-lg font-bold shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#1e1b19]"
                  >
                    <span>Inspect Notice</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
